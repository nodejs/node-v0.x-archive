// Stolen from StackOverflow. Find all </code><pre><code> 
// elements on the page and add the "prettyprint" style. If at least one 
// prettyprint element was found, call the Google Prettify prettyPrint() API.
//http://sstatic.net/so/js/master.js?v=6523
function styleCode() 
{
    if (typeof disableStyleCode != "undefined") 
    {
        return;
    }

    var a = false;

    $("pre code").parent().each(function() 
    {
        if (!$(this).hasClass("prettyprint")) 
        {
            $(this).addClass("prettyprint");
            a = true
        }
    });
    
    if (a) { prettyPrint() } 
}