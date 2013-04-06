NODE_LOCAL_JS_LIBRARY_FILES := \
	src/node.js \
	lib/_debugger.js \
	lib/_linklist.js \
	lib/_stream_duplex.js \
	lib/_stream_passthrough.js \
	lib/_stream_readable.js \
	lib/_stream_transform.js \
	lib/_stream_writable.js \
	lib/assert.js \
	lib/buffer.js \
	lib/child_process.js \
	lib/cluster.js \
	lib/console.js \
	lib/constants.js \
	lib/crypto.js \
	lib/dgram.js \
	lib/dns.js \
	lib/domain.js \
	lib/events.js \
	lib/freelist.js \
	lib/fs.js \
	lib/http.js \
	lib/https.js \
	lib/module.js \
	lib/net.js \
	lib/os.js \
	lib/path.js \
	lib/punycode.js \
	lib/querystring.js \
	lib/readline.js \
	lib/repl.js \
	lib/stream.js \
	lib/string_decoder.js \
	lib/sys.js \
	lib/timers.js \
	lib/tls.js \
	lib/tty.js \
	lib/url.js \
	lib/util.js \
	lib/vm.js \
	lib/zlib.js \
	config.android \
	src/macros.py

PATH_LOCAL_JS_LIBRARY_FILES := $(addprefix $(LOCAL_PATH)/, $(NODE_LOCAL_JS_LIBRARY_FILES))

# FIXME: Copy js2c.py to intermediates directory and invoke there to avoid generating
# jsmin.pyc in the source directory
#JS2C_PY := $(intermediates)/js2c.py $(intermediates)/jsmin.py
#$(JS2C_PY): $(intermediates)/%.py : $(LOCAL_PATH)/tools/%.py | $(ACP)
#	@echo "Copying $@"
#	$(copy-file-to-target)

# Generate node_natives.h
jsnatives := $(intermediates)/src/node_natives.h
$(jsnatives): SCRIPT := $(LOCAL_PATH)/tools/js2c.py
$(jsnatives): $(PATH_LOCAL_JS_LIBRARY_FILES) $(JS2C_PY)
	@echo "Building node_natives.h"
	@mkdir -p $(dir $@)
	python $(SCRIPT) $(jsnatives) $(PATH_LOCAL_JS_LIBRARY_FILES)
