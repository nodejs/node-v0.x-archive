$(function () {
    'use strict';

    var baseTitle = document.title, // base (general) part of title
    pathName = window.location.pathname,
    fileName = pathName.substring(window.location.pathname.lastIndexOf("/") + 1);
  
    if(window.addEventListener)
        window.addEventListener('load', loadCallback, true);
    else
        window.attachEvent('load', loadCallback, true);

    if (pathName.indexOf("nodejs_ref_guide") >= 0)
        $('li#node_js_ref').addClass("active");
    else if (pathName.indexOf("nodejs_dev_guide") >= 0)
        $('li#nodejs_dev_guide').addClass("active");
    else if (pathName.indexOf("js_doc") >= 0)
        $('li#js_doc').addClass("active");
            
    function loadCallback(evt){
        var form = document.getElementById("searchbox");
        var input = form.query;
        form.onsubmit = function (evt) {
            var query = input.value;
            if (query) {
                input.value = "";
                input.blur();
                var currentVersion = $('#currentVersion').text();
                var url = "https://www.google.com/search?q=" + encodeURIComponent("site:nodemanual.org/" + currentVersion + " " + query);
                window.open(url);
            }
            return false;
        };
    }

    var fileNameRE = new RegExp("^" + fileName, "i");

    $('a.menuLink').each(function(index) {
        if ($(this).attr("href").match(fileNameRE))
        {
            $(this).addClass("currentItem");
            return false;
        }
    });

//    function getTitle($article) {
//        var title = [baseTitle];
//
//        if ($article.data('title')) {
//            title.push($article.data('title'));
//        }
//
//        return title.join(' | ');
//    }

//    function eachParent($item, callback) {
//        var $parent = $item.data('ndoc.parent');
//        if ($parent && $parent.length) {
//            eachParent($parent, callback);
//            callback($parent);
//        }
//    }

    // activates item (used upon scrolling)
//    function activate($article, expandParents) {
//        var $item;
//
//        if ($active) {
//            $item = $active.data('ndoc.item') || $empty;
//            $item.removeClass('current');
//            eachParent($item, function ($parent) {
//                $parent.removeClass('current-parent');
//            });
//        }
//
//        // set new active article
//        $active = $article;
//
//        // update title
//        document.title = getTitle($article);
//
//        $item = $active.data('ndoc.item') || $empty;
//        $item.addClass('current');
//        eachParent($item, function ($parent) {
//            $parent.addClass('current-parent');
//            if (expandParents) {
//                $parent.data('ndoc.childs')
//                .data('ndoc.collapsed', false)
//                .animate({
//                    height: 'show',
//                    opacity: 'show'
//                });
//            }
//        });
//    }


//    function processScroll(evt, expandParents) {
//        var scrollTop = $window.scrollTop() + 10,
//        i = targets.length;
//    
//        while (i--) {
//            if ($active !== targets[i].article && scrollTop >= targets[i].offset
//                && (!targets[i + 1] || scrollTop <= targets[i + 1].offset)) {
//                activate(targets[i].article, expandParents)
//                return;
//            }
//        }
//    }

    // init articles
//    $('article.article').each(function () {
//        var $article = $(this);
//
//        targets.push({
//            article: $article,
//            offset: $article.offset().top
//        });
//    });

    // init menu items
//    $items.each(function () {
//        var $item = $(this),
//        $childs = $item.parent().next(),
//        $parent = $item.parents('ul').eq(0).prev().children(),
//        $article = $('[id="' + $item.attr('href').slice(1) + '"]');
//
//        // cross-refs
//        $item.data('ndoc.parent', $parent);
//        $item.data('ndoc.childs', $childs);
//        $article.data('ndoc.item', $item);
//
//        // bind activator
//        $item.on('click', function () {
//            if ($item.hasClass('current') && !$childs.data('ndoc.collapsed')) {
//                $childs.data('ndoc.collapsed', true).animate({
//                    height: 'hide',
//                    opacity: 'hide'
//                });
//                return false;
//            }
//
//            activate($article);
//
//            $item.data('ndoc.childs').data('ndoc.collapsed', false).animate({
//                height: 'show',
//                opacity: 'show'
//            });
//        });
//
//        // collapse all 2nd levels
//        if (0 != $parent.length) {
//            $childs.data('ndoc.collapsed', true).hide();
//        }
//    });

//    function updateSearchResults() {
//        $results.empty();
//
//        if ('' == this.value) {
//            $results.hide();
//            return;
//        }
//
//        $results.show();
//
//        $items.filter('[data-id*="' + this.value + '"]').each(function () {
//            var $item = $(this);
//            $('<div class="menu-item">').append(
//                $item.clone(false)
//                .text($item.data('id'))
//                .on('click', function () {
//                    $item.trigger('click');
//                })
//                ).appendTo($results);
//        });
//    }

    // init search
    $('#search')
    // prevent from form submit
    .on('submit', function () {
        return false;
    })
    .find('input')
    //.on('keyup', $.throttle(250, updateSearchResults))
    // click - cuz i don't know what event fied on input clear in Chrome
    //.on('change click', updateSearchResults);

    // init scrollspy
    //$window.on('scroll', $.throttle(250, processScroll));

    // initial jump (required for FF only - Chrome don't need it)
    //processScroll(null, true);

    // init prettyprint
    $('pre > code').addClass('prettyprint');
    prettyPrint();
  
    //set the height of the sidebar
//    var sidebarHeight = $('#sidebar').height(),
//        contentHeight = $('.container .content .span11').height();

//    if(contentHeight > sidebarHeight)
//        $('#sidebar').height(contentHeight);
//    else
//        $('#sidebar').height(sidebarHeight + 10);
    
//    function isScrolledIntoView(elem) {
//        var docViewTop = $(window).scrollTop();
//        var docViewBottom = docViewTop + $(window).height();
//
//        var elemTop = $(elem).offset().top;
//        var elemBottom = elemTop + $(elem).height() -60;
//
//        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
//    }
//    
//    $('#sidebar').height($(window).height() - $('#overview').outerHeight() - 25 + ($('html').scrollTop() <= 85 ? $('html').scrollTop() : 85 ))
    var bgHeightSet = false,
//        $sidebar       = $('#sidebar'),
        $pagination    = $('.members'),
//        $paginationBackground = $('.membersBackground'),
        $paginationContent = $('.membersContent'),
        $tabs = $('.tabs'),
        $topSection = $('#topSection');
        
    function handleScroll() {
        var s, sx;
        
        // scrolling offset calculation via www.quirksmode.org
        if (window.pageYOffset || window.pageXOffset) {
            s = window.pageYOffset;
            sx = window.pageXOffset;
        }
        else if (document.documentElement 
          && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
            s = document.documentElement.scrollTop;
            sx = document.documentElement.scrollLeft;
        }
        else if (document.body) {
            s = document.body.scrollTop;
            sx = document.body.scrollLeft;
        }

        if (document.documentElement.offsetWidth < 1010) {
            if (sx <= 0) sx = 0;
            else if (sx + document.documentElement.offsetWidth > 1010) 
                sx = 1010 - document.documentElement.offsetWidth;
        }
        else
            sx = 0;

        $topSection.css({'left': -1 * sx});
        
        if (s > 163) { //header_offset - 35) {
            $paginationContent.css('left', -1 * sx);
            
            if (bgHeightSet)
                return;
            
//            $sidebar.css({
//                'position': 'fixed',
//                'top': 41,
//                'padding':0
//            });
//            if(!bgHeightSet) {
                
//                $paginationBackground.css('display', 'block')//.stop().animate({'height': 44, 'opacity':1}, 'normal', 'linear');
//            }
            
//            var leftPos = $paginationContent.outerWidth() + $paginationContent.position().left > $(window).width() 
//                            ? $(window).width()- $paginationContent.outerWidth() 
//                            : $paginationContent.offset().left - $('html').scrollLeft()

//            $paginationContent.css('left', leftPos);
            $paginationContent.css('top', 0);
            //$paginationContent.stop().animate({'top': 0}, 300);
            
            $pagination
//            .css({'background': 'white'})
            .addClass('shadow')
            .stop().css({height: 31})
            /*animate({'height': 31}, {
                duration : 300, 
                complete : function(){
//                    $pagination.css({'background': ''});
                }
            })*/
//            .next().css({'padding-top': $pagination.outerHeight()})
            .closest('.content').addClass('srolled')
//            setTimeout(function(){
//                    $pagination.css({'background': ''});
//            }, 300);
            $tabs.addClass('tabsSansBorder');
            
            bgHeightSet = true;
        }
        else {
            if (!bgHeightSet)
                return;
            
//            $sidebar.css({
//                'position': 'relative',
//                'top': 0,
//                'padding-top':25
//            });

            $paginationContent.stop().css({top:11});//animate({'top': 11}, 300);
            $pagination.css({'position': 'absolute', 'top': 193});
            $pagination.stop()
              .removeClass('shadow')
              .css({height: 42})
              //.animate({'background': 'transparant'}, 300);
              
            $paginationContent.css('left', 0);
              
              setTimeout(function(){
              $pagination
//              .animate({'height': 42}, {
//                'complete' : function(){
                    $paginationContent.css({'top': ''});
                    $pagination.css({'position': '', 'top': ''});
                    $paginationContent.css('left', 0);
                    $pagination.closest('.content').removeClass('srolled')
                    $tabs.removeClass('tabsSansBorder');
//                }
//              }, 300);
            }, 300);

            bgHeightSet = false;
//            $paginationBackground.stop().css({'display': 'none'});
        }
    }
    
//    function handleWinSize(){
//        if($(window).width() < 1000)
//            $('body').addClass('small_win');
//        else
//            $('body').removeClass('small_win');
//    }
    
    $(window)
    .scroll(function(){//auto kanei to header na metakinhtai kai na einai panta visible;
        handleScroll();
    }).resize(function(){
       //handleWinSize(); 
    });
    handleScroll();
    //handleWinSize();
});

$(document).ready(function(){
    var d = 'a.menu, .dropdown-toggle'
    function clearMenus() {
        $(d).parent('li').each(function(){
            $(this).removeClass('open')
        });
    }
    
    $('span.methodClicker, article.article, h3.methodClicker').each(function(){
        var a = $(this);
        var constructorPos = a.attr("id").indexOf("new ");

        var objName = a.attr("id");
        if (constructorPos >= 0)
        {
            objName = objName.substring(constructorPos + 4);
            objName += ".new";  
        }
       
        a.attr("id", "js_" + objName);
    });
    
    $('.brand').parent('.dropdown').hover(
        function(){
            $(this).addClass('open');
        }, 
        function(){
            clearMenus();
        });
    
    $('.versions').hover(
        function(){
            $(this).addClass('open');
        }, 
        function(){
            clearMenus();
        });

    function showMethodContent(){
        if(!location.hash)
            return;

        var $clickerEl = $('span#js_' + location.hash.replace(/^#/,'').replace(/\./g, '\\.'));
        if ($clickerEl.length > 0 && $clickerEl.hasClass('methodClicker')) {
            var p = $clickerEl.parent();
            p[0].force = true;
            p.trigger('click');
            p[0].force = false;
        }
    }
    
    if (location.hash) {
        showMethodContent();
        var data = location.hash;
        scrollTo(null, data.substr(1));
    }
    
    window.onhashchange = function(){
        showMethodContent();
    }
    
    //$('#content article:last').css('padding-bottom', 50);
});

function scrollTo(el, data){
    if (!data) {
        data = el.getAttribute("data-id");
        location.hash = data;
    }
    var el = $("span#js_" + data.replace(/\./g, "\\."))[0];
    if (!el) return;
    
    var article = $(el).closest('.article')[0];

    var top = article.offsetTop - 100;

    if (document.body.scrollTop > top 
      || document.body.scrollTop != top && document.body.scrollTop 
        + (window.innerHeight || document.documentElement.offsetHeight) <
          top + article.offsetHeight) {
        //document.body.scrollTop = top;
         $('body').animate({scrollTop : top}, {
             duration: 200,
             easing : "swing"
         });
    }
}