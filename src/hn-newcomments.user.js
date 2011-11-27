// ==UserScript==
// @name          Hacker News: New Comments
// @namespace     http://mschade.me/userscripts
// @description   Make new comments on Hacker News more noticeable. Created by Michael Schade (@michaelschade, http://mschade.me/)
// @match         http://news.ycombinator.com/item?id=*
// @include       http://news.ycombinator.com/item?id=*
// ==/UserScript==

// URL to jQuery Library
var jqURL = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";

function main() {
    /* Options */
    var NEW_COMMENT_HIGHLIGHT = 'yellow';

    /* Add ability to compute difference between two arrays.

       Snippet via http://stackoverflow.com/q/4026828
     */
    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return !(a.indexOf(i) > -1);});
    };

    /* Strips the prefix of query string to retrieve the intended id. */
    function getId(s) {
        return s.replace("item", "").replace("?id=", "");
    }

    /* Makes text plural only if count is not one. For example:

       pluralizeText("new post", 0) => "0 new posts"
       pluralizeText("new post", 1) => "1 new post"
       pluralizeText("new post", 2) => "2 new posts"
     */
    function pluralizeText(text, count) {
        var ntext  = count ? count : "No";
        ntext     += ' ' + text;
        if (count != 1) {
            ntext += 's';
        }
        return ntext;
    }

    /* Processes the comments on page to determine which, if any, are new,
       marking the new comments accordingly.
     */
    function processComments() {
        var   post        = getId(window.location.search)
            , comments    = []
            , oldComments = []
            , comheads    = {}
            ;

        // Populate comments
        $(".comhead a:last-child").each(function(index) {
            var cid = getId($(this).attr('href'));
            comments.push(cid);
            comheads[cid] = $(this).parent();
        });

        // Try to retrieve existing set of comments for this page
        if (post in localStorage) {
            oldComments = JSON.parse(localStorage.getItem(post));

            // Determine new comments and mark them visually
            var newComments = comments.diff(oldComments);
            $.each(newComments, function(index, cid) {
                comheads[cid].css('background-color', NEW_COMMENT_HIGHLIGHT);
            });

            /* Update top of page to reflect number of new comments. */
            var nspot = $("center > table > tbody > tr > td > br:first");
            var ntext = '<div style="margin-left: 25px; color: black;">'
                      + '<p><strong>'
                      + pluralizeText("new comment", newComments.length)
                      + '</strong></p></div>'
                      ;
            nspot.replaceWith(ntext);
        }

        // Save to browser storage
        localStorage.setItem(post, JSON.stringify(comments));
    }

    function processPosts() {
    }

    processComments();
}

/* Injects jQuery into the page and makes useable from the below Greasemonkey
   script.

   Snippet via
   http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
 */
function addJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", jqURL);
    script.addEventListener('load', function() {
            var script = document.createElement("script");
            script.textContent = "(" + callback.toString() + ")();";
            document.body.appendChild(script);
            }, false);
    document.body.appendChild(script);
}

addJQuery(main);
