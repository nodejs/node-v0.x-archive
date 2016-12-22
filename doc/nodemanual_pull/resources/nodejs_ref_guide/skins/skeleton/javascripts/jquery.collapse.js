/*!
 * Collapse plugin for jQuery
 * http://github.com/danielstocks/jQuery-Collapse/
 *
 * @author Daniel Stocks (http://webcloud.se)
 * @version 0.9.1
 * @updated 17-AUG-2010
 * 
 * Copyright 2010, Daniel Stocks
 * Released under the MIT, BSD, and GPL Licenses.
 */
 
(function($) {
    
    // Use a cookie counter to allow multiple instances of the plugin
    var cookieCounter = 0;
    
    $.fn.extend({
        collapse: function(options) {
            
            var defaults = {
                head : "h3",
                group : "div, ul",
                cookieName : "collapse",
                // Default function for showing content
                show: function() { 
                    this.show();
                },
                // Default function for hiding content
                hide: function() { 
                    this.hide();
                }
            };
            var op = $.extend(defaults, options);
            
            // Default CSS classes
            var active = "active",
                inactive = "inactive";
            
            return this.each(function() {
                
                // Increment coookie counter to ensure cookie name integrity
                cookieCounter++;
                var obj = $(this),
                    // Find all headers and wrap them in <a> for accessibility.
                    sections = obj.find(op.head).wrapInner('<a href="#"></a>'),
                    l = sections.length,
                    cookie = op.cookieName + "_" + cookieCounter;
                    // Locate all panels directly following a header
                    var panel = obj.find(op.head).map(function() {
                        var head = $(this)
                        if(!head.hasClass(active)) {
                            return head.next(op.group).hide()[0];
                        }
                        return head.next(op.group)[0];
                    });
    
                // Bind event for showing content
                obj.bind("show", function(e, bypass) {
                    var obj = $(e.target);
                    // ARIA attribute
                    obj.attr('aria-hidden', false)
                        .prev()
                        .removeClass(inactive)
                        .addClass(active);
                    // Bypass method for instant display
                    if(bypass) {
                        obj.show();
                    } else {
                        op.show.call(obj);
                    }
                });

                // Bind event for hiding content
                obj.bind("hide", function(e, bypass) {
                    var obj = $(e.target);
                    obj.attr('aria-hidden', true)
                        .prev()
                        .removeClass(active)
                        .addClass(inactive);
                    if(bypass) {
                        obj.hide();
                    } else {
                        op.hide.call(obj);
                    }
                });
                
                // Look for existing cookies
                if(cookieSupport) {
                    for (var c=0;c<=l;c++) {
                        var val = $.cookie(cookie + c);
                        // Show content if associating cookie is found
                        if ( val == c + "open" ) {
                            panel.eq(c).trigger('show', [true]);
                        // Hide content
                        } else if ( val == c + "closed") {
                            panel.eq(c).trigger('hide', [true]);
                        }
                    }
                }
                
                // Delegate click event to show/hide content.
                obj.bind("click", function(e) {
                    var t = $(e.target);
                    // Check if header was clicked
                    if(!t.is(op.head)) {
                        // What about link inside header.
                        if ( t.parent().is(op.head) ) {
                            t = t.parent();
                        } else {
                            return;
                        }
                        e.preventDefault();
                    }
                    // Figure out what position the clicked header has.
                    var num = sections.index(t),
                        cookieName = cookie + num,
                        cookieVal = num,
                        content = t.next(op.group);
                    // If content is already active, hide it.
                    if(t.hasClass(active)) {
                        content.trigger('hide');
                        cookieVal += 'closed';
                        if(cookieSupport) {
                            $.cookie(cookieName, cookieVal, { path: '/', expires: 10 });
                        }
                        return;
                    }
                    // Otherwise show it.
                    content.trigger('show');
                    cookieVal += 'open';
                    if(cookieSupport) {
                        $.cookie(cookieName, cookieVal, { path: '/', expires: 10 });
                    }
                });
            });
        }
    });

    // Make sure can we eat cookies without getting into trouble.
    var cookieSupport = (function() {
        try {
            $.cookie('x', 'x', { path: '/', expires: 10 });
            $.cookie('x', null);
        }
        catch(e) {
            return false;
        }
        return true;
    })();
})(jQuery);