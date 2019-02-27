/*
 * This script REQUIRES access to e621 to work (for obvious reasons)
 *   Access-Control-Allow-Origin: https://e621.net
 * 
 * Terminology:
 *  Page - the page to get inside the pool json request
 *  Post - the actual post with all the needed content
 *  Index - the post index inside the pool to be displayed
 *  Relative Index - the post index relative to the current page
 *
 * TODO:
 * 
 * Maybe add dates to the post and comments
 * comments dont support BBcode styling
 */

/*
 * Element Defenitions
 */
var mImageView = "mImageView"

var mButtonFirst = "mButtonFirst"
var mButtonPrevious = "mButtonPrevious"
var mButtonNext = "mButtonNext"
var mButtonLast = "mButtonLast"
var mButtonOriginalPost = "mButtonOriginalPost"
var mButtonPostList = "mButtonPostList"
var mButtonNotifyHide = "mButtonNotifyHide"

var mTextDescription = "mTextDescription"
var mValueUpvotes = "mValueUpvotes"

var mDivNotifyBar = "mDivNotifyBar"
var mTextNotifyDescription = "mTextNotifyDescription"

var mListComments = "mListComments"
var mTextCommentLimit = "mTextCommentLimit"

/*
 * Comments Layout
 */
var commentLayout = '\
<li class="comment_body" id="comment_%ID">\
    <h5 class="comment_username">%USERNAME</h5>\
    <p class="comment_content">%BODY</p>\
    <h6 class="comment_upvotes">Upvotes: <b class="comment_upvotes_counter">%VOTES</b></h6>\
</li>\
'


/*
 * Variables
 */

// Please dont change this, as these constants are set by e621
const pageLimit = 24
const commentLimit = 25

// Other variables
var poolObject = {} // Contains the JSON data of the current pool
var page = 0 // Contains the current page
var poolId = 0 // Contains the current pool Id
var postId = 0 // Contains the current post Id
var index = 0 // Contains the current index of the entire pool (absolute position)
var poolCount = 0 // Contains the amount of posts inside the current pool
var shouldUpdatePool = true // Contains wether the pool should be updated



/*
 * Functions
 */

// TEST CORS REQ
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    setRequestHeader("Access-Control-Allow-Origin", "*"); // Attempt at CORS
    if ("withCredentials" in xhr) {
        // Most browsers.
        xhr.open(method, url, true);
        
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*"); // Attempt at CORS
        xhr.setRequestHeader("Access-Control-Allow-Headers");
    } else if (typeof XDomainRequest != "undefined") {
        // IE8 & IE9
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
        console.log("Cors is not supported in this browser")
    }
    return xhr;
};


// Asyncronus http GET request
function httpGetAsync(url, callback) {
//     var xmlHttp = new XMLHttpRequest();
    
//     // Define the action for when the data has been recieved
//     xmlHttp.onreadystatechange = function() { 
//         if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
//             // Callback the recieved data
//             callback(xmlHttp.responseText);
//         } else if (xmlHttp.status != 200 && xmlHttp.status != 0) {
//             // Report any errors to the user
//             console.log("Error " + xmlHttp.status + "\n" + xmlHttp.responseText + " \n\nUrl:  " + url);
//             notificationShow("Error " + xmlHttp.status + "\n" + xmlHttp.responseText)            
//         }
//     }
    
//     xmlHttp.open("GET", url, true); // true for asynchronous
//     xmlHttp.send(null);
    
    ////////TEST/////
    var method = 'GET';
    var xhr = createCORSRequest(method, url);

//     xhr.onload = function() {
//       // Success code goes here.
//     };

//     xhr.onerror = function() {
//       // Error code goes here.
//     };
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Callback the recieved data
            callback(xhr.responseText);
        } else if (xhr.status != 200 && xhr.status != 0) {
            // Report any errors to the user
            console.log("Error " + xhr.status + "\n" + xhr.responseText + " \n\nUrl:  " + url);
            notificationShow("Error " + xhr.status + "\n" + xhr.responseText)            
        }
    }
    
    xhr.send();
}

// A simple function to clamp a value (num) between two values (min, max)
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

// Gets the right page and relative index (Returns an Array of two values)
function getRelativeIndex(_index, _poolCount) {
    var clampedIndex = clamp(_index, 0, _poolCount - 1)
    var page = Math.floor(clampedIndex / pageLimit) + 1
    var rIndex = clampedIndex % pageLimit
    return [page, rIndex]
}

// Pool Loader - Will update pool if needed, otherwise load post
function poolLoader(_poolId, _index, _reload) {
    // Getting posts in pool has a limit of 24 posts per page, get page by calculating post index divided by page limit (eg. '5/24')
    index = _index
    var [newPage, relativeIndex] = getRelativeIndex(_index, poolCount);
    
    console.log(newPage != page, shouldUpdatePool, _reload)
    
    if (poolCount <= 0) {
        // If the current post count is 0 (usually when this page has just been loaded), load the pool without a specific page
        console.log("InitPool")
        
        httpGetAsync("https://e621.net/pool/show.json?id=" + _poolId, function(responseText) {
            poolCount = JSON.parse(responseText).post_count;
            var [newPage, relativeIndex] = getRelativeIndex(_index, poolCount);
            
            shouldUpdatePool = false
            page = newPage
            
            // if succeeded: try loading the desired page
            asyncPoolUpdate(_poolId, newPage, _index)
        })
    } else if (newPage != page || shouldUpdatePool || _reload) { 
        // Load the pool at specified page
        console.log("UpdatePool")
        
        shouldUpdatePool = false
        page = newPage
        
        asyncPoolUpdate(_poolId, newPage, _index)        
    } else {
        // Just load the post
        console.log("PoolAdvance", index, relativeIndex)
        postLoader(relativeIndex)
    }
}

// Update the pool at specified page and show the specified post at index
function asyncPoolUpdate(_poolId, _page, _index) {
    httpGetAsync("https://e621.net/pool/show.json?id=" + _poolId + "&page=" + _page, function(responseText) {
        // Decode JSON
        poolObject = JSON.parse(responseText);
        poolCount = poolObject.post_count
        
        var [newPage, relativeIndex] = getRelativeIndex(_index, poolCount);
        
        // Load post
        postLoader(relativeIndex)
    })
}

// Attempt to load post at index # inside the current pool
function postLoader(_rIndex) {
    updateUrlParameters(index)
    
    // Check if there are any posts in the current page
    if (poolObject.posts.length > 0) {
        try {
            // Try updating the page
            postId = poolObject.posts[_rIndex].id
            document.getElementById(mImageView).src = poolObject.posts[_rIndex].file_url
            document.getElementById(mTextDescription).innerHTML = poolObject.posts[_rIndex].description
            document.getElementById(mValueUpvotes).innerHTML = poolObject.posts[_rIndex].score
            document.getElementById(mButtonOriginalPost).href = "https://e621.net/post/show/" + postId
            document.getElementById(mButtonPostList).href = "https://e621.net/pool/show/" + poolId
        
            // Update comments
            commentLoader(poolObject.posts[_rIndex].id);
        } catch (e) {
            // Show an error
            console.log(e)
            notificationShow(e)
        }
    } else {
        // Show an error
        notificationShow("This pool exists, but page " + page + " is empty!")
    }
}


// Hides the current notificatation
function notificationHide() {
    document.getElementById(mDivNotifyBar).style.display = 'none'
}

// Show an notification with the specified text
function notificationShow(text) {
    document.getElementById(mDivNotifyBar).style.display = 'block'
    document.getElementById(mTextNotifyDescription).innerHTML = text
}

// Reflect the given data to the url without leaving the page
function updateUrlParameters(_index) {
    var url = new URL(window.location);
    var params = new URLSearchParams(url.search);
    
    // get the url without the parameters
    var baseUrl = /.*?\?/gm.exec(window.location)[0]
    
    // Set desired poolId and index
    //params.get("poolid")
    params.set("index", _index)
    
    // finally update the url
    window.history.pushState("object or string", "Title", baseUrl + params.toString())
}

// Load and show the comments
function commentLoader(_postId) {
    document.getElementById(mListComments).innerHTML = "";
    
    // Note: Im using /search.json here instead of /list.json because list only shows the latest ones, search gives me more granularity in options
    httpGetAsync("https://e621.net/comment/search.json?order=date_asc&post_id=" + _postId, function(responseText) {
        // Decode JSON
        var cObject = JSON.parse(responseText);
        var list = document.getElementById(mListComments);
        
        for (var i = 0; i < cObject.length; i++) {            
            var element = commentLayout
            
            // Construct layout
            element = element.replace("%ID", i)
            element = element.replace("%USERNAME", cObject[i].creator)
            element = element.replace("%BODY", cObject[i].body)
            element = element.replace("%VOTES", cObject[i].score)
            
            // Append comment
            list.innerHTML += element
        }
        
        // if true: comment limit has been reached! Let the user know at the end of the page
        if (cObject.length >= commentLimit) {
            document.getElementById(mTextCommentLimit).style.display = 'block'
        }
    })
}

function postNext() {
    index += 1
    poolLoader(poolId, index, false);
}

function postPrevious() {
    index -= 1
    poolLoader(poolId, index, false);
}

function postFirst() {
    poolLoader(poolId, 0, false);
}

function postLast() {
    poolLoader(poolId, poolCount, false);
}


// The Main Starter
function main() {
    // Parse Parameters
    var url = new URL(window.location);
    var params = new URLSearchParams(url.search);
    
    // Get desired poolId and index
    poolId = parseInt(params.get("poolid"))
    index = parseInt(params.get("index"))
    
    // Check if the pool-id is specified
    if (!isNaN(poolId)) {
        // Load the pool at the specified post index (Defaults to 0)
        if (!isNaN(index)) {
            poolLoader(poolId, index, false)
        } else {
            poolLoader(poolId, 0, false)
        }
    } else {
        window.alert("No Pool Id Specified!")
        window.location = './index.html';
    }
}

/*
 * Init
 */

main()
