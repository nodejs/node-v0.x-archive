// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

module.exports = Stream;

var EE = require('events').EventEmitter;
var util = require('util');
var debug = util.debuglog('stream');

util.inherits(Stream, EE);
Stream.Readable = require('_stream_readable');
Stream.Writable = require('_stream_writable');
Stream.Duplex = require('_stream_duplex');
Stream.Transform = require('_stream_transform');
Stream.PassThrough = require('_stream_passthrough');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);

  // note that we can't necessarily
  // count on these attributes to be present
  // on all streams -- some folk might subclass
  // incorrectly.
  this._nextStreams = [];
  this._prevStreams = [];
  this._errorHandlers = [];
}

Stream.prototype.next = function() {
  if (!this._nextStreams) {
    return [];
  }
  return this._nextStreams.slice();
};

Stream.prototype.prev = function() {
  if (!this._prevStreams) {
    return [];
  }
  return this._prevStreams.slice();
};

Stream.prototype.nextAll = function() {
  return iterateStream(this, '_nextStreams');
};

Stream.prototype.prevAll = function() {
  return iterateStream(this, '_prevStreams');
};

Stream.prototype.removePipelineErrorHandler = function(fn) {
  if (!this._errorHandlers) return;

  for (var i = 0, len = this._errorHandlers.length; i < len; ++i) {
    if (this._errorHandlers[i].handler === fn) {
      this._errorHandlers[i].uninstall();

      return;
    }
  }
};

Stream.prototype.addPipelineErrorHandler = function(fn) {
  if (!this._errorHandlers) {
    this._errorHandlers = [];
  }

  var isHandling = true;
  var installedOnStreams = [];

  // Using a WeakSet + array pair to speed up
  // membership lookups. Could be accomplished
  // with just the array.
  var installedMembership = new WeakSet;
  var source = this;

  install(this);
  this.prevAll().forEach(install);

  var installedIdx = this._errorHandlers.push({
    handler: fn,
    uninstall: uninstallAll
  }) - 1;

  return this;

  function install(stream, idx, all) {
    if (installedMembership.has(stream)) {
      return;
    }

    installedOnStreams.push(stream);
    installedMembership.add(stream);
    stream.on('_preError', onPreError);
    stream.on('unpipe', onunpipe);
    stream.on('pipe', onpipe);

    if (EE.listenerCount(stream, 'error') === 0) {
      stream.on('error', _defaultPipelineErrorHandler);
    }
  }

  function onpipe(newSrc) {
    this.removeListener('error', _defaultPipelineErrorHandler);
    install(newSrc);
    newSrc.prevAll().forEach(install);
  }

  function onunpipe() {
    uninstallAll();
    source.addPipelineErrorHandler(fn);
  }

  function onPreError(err, handled) {
    handled.handled = maybePropagate(this, err);
  }

  function uninstall(stream) {
    stream.removeListener('_preError', onPreError);
    stream.removeListener('error', _defaultPipelineErrorHandler);
    stream.removeListener('pipe', onpipe);
    stream.removeListener('unpipe', onunpipe);
    installedMembership.delete(stream);

    if (!stream._errorHandlers) return;
    if (stream !== source) return;
    if (installedIdx === null) return;

    stream._errorHandlers.splice(installedIdx, 1);
    installedIdx = null;
  }

  function uninstallAll() {
    installedOnStreams.forEach(uninstall);
    installedOnStreams.length = 0;
  }
};

// the default pipeline error handler exists because
// streams2+ do not add an error handler to Readables on ".pipe".
// this catches any error that would otherwise be emitted.
function _defaultPipelineErrorHandler(err) {
  var handled = {handled: false};
  this.emit('_preError', err, handled);

  if (handled.handled) {
    return;
  }

  if (EE.listenerCount(this, 'error') === 1) {
    this.removeListener('error', _defaultPipelineErrorHandler);
    this.emit('error', err);
  }
}

function maybePropagate(stream, error) {
  var errorEvent = error._errorEvent;
  var wasCreated = !errorEvent;
  errorEvent = error._errorEvent = errorEvent ||
      new PipelineErrorEvent(error, stream);

  if (wasCreated) {
    if (visit(stream)) {
      return true;
    }

    return stream.nextAll().some(visit);
  }

  return errorEvent.isHandled();

  function visit(xs, idx) {
    if (!xs._errorHandlers) return;
    if (!xs._errorHandlers.length) return;

    return xs._errorHandlers.some(function(handlerPair) {

      handlerPair.handler.call(xs, errorEvent);

      return errorEvent.isHandled();
    });
  }
}

function iterateStream(stream, attr) {
  var visited = new WeakSet;
  var current = stream;
  var stack = [stream];
  var out = [];

  while (stack.length) {
    current = stack.pop();

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    out.push(current);
    var children = attr in current ? current[attr] : [];
    children = children || [];

    for (var i = children.length - 1; i > -1; --i) {
      stack.push(children[i]);
    }
  }

  return out.slice(1);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  source._nextStreams = source._nextStreams || [];
  dest._prevStreams = dest._prevStreams || [];

  var nextIdx = source._nextStreams.push(dest) - 1;
  var prevIdx = dest._prevStreams.push(source) - 1;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (util.isFunction(dest.destroy)) dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    var handled = {handled: false};
    this.emit('_preError', er, handled);

    if (handled.handled) {
      return;
    }

    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);

    if (nextIdx !== null) {
      source._nextStreams.splice(nextIdx, 1);
      nextIdx = null;
    }

    if (prevIdx !== null) {
      dest._prevStreams.splice(prevIdx, 1);
      prevIdx = null;
    }
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

var pipelineErrorState = new WeakMap;

function PipelineErrorEvent(err, sourceStream, unpipe) {
  this.error = err;
  this.stream = sourceStream;
  pipelineErrorState.set(this, {
    'isHandled': false
  });
}


PipelineErrorEvent.prototype.handleError = function() {
  debug('handleError', this.error);
  pipelineErrorState.set(this, {
    'isHandled': true
  });
};


PipelineErrorEvent.prototype.isHandled = function() {
  var state = pipelineErrorState.get(this) || {};
  return Boolean(state.isHandled);
};
