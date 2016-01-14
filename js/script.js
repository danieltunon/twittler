/*global moment*/
// Begin /tweetFormatter/ utility function
// Purpose: produces the properly formatted html for each tweet
// Arguments:
//   * user - the user who tweeted the message
//   * message - the actual message text
//   * time - the timestamp when the tweet was created
// Returns: nothing
// Actions: 
//   * formats time into readable form
//   * inserts arguments into proper place in template HTML
//
function tweetFormatter(user, message, time) {
  return (
    '<header>' +
      '<a class="user" href="#">@' + user + '</a>:' +
      '<span class="timestamp">' + moment(time).fromNow() + '</span>' +
    '</header>' +
    '<p class="message">' + message + '</p>'
  );
}

// Begin /displayTweets/ DOM method
// Purpose: add tweets to stream
// Arguments:
//   * start - the first new tweet in streams.home
//   * end - the current final tweet in streams.home
//   * target - the DOM element where tweets are added
// Returns: nothing
// Actions: 
//   * iterates through array of tweets if new tweets have been
//     created but not displayed
//   * creates a new <div> element for each new tweet
//   * calls /tweetFormatter/ to populate the <div> with the
//     filled in template
//   * prepends the finished element to the DOM target so new
//     tweets are displayed at the top of the stream
//
function displayTweets(start, end, target) {
  for ( var i = start; i < end; i++ ) {
    var tweet = streams.home[i];
    var $tweet = $('<div class="tweet well" data-timestamp="'
      + tweet.created_at +'"></div>');
    $tweet.html( 
      tweetFormatter(tweet.user, tweet.message, tweet.created_at) 
    );
    $tweet.hide().prependTo(target).fadeIn("slow");
  }
}

// Begin /document.ready/ event listener
$(document).ready(function () {
  var $stream = $('section.stream');
  //$stream.html('<h2>Your stream</h2>');

  var tweetsDisplayed = 0;
  var totalTweets = streams.home.length;
  
  // call /displayTweets/ on page ready to initially populate stream
  displayTweets(tweetsDisplayed, totalTweets, $stream);
  tweetsDisplayed = totalTweets;
  
  // create new interval timer to update stream with new tweets
  setInterval(function updateStream() {
    totalTweets = streams.home.length;
    displayTweets(tweetsDisplayed, totalTweets, $stream);
    tweetsDisplayed = totalTweets;
  }, 1000);
  
  // create new interval to update timestamp
  setInterval( function updateTimeStamp () {
    $( ".timestamp" ).each( function () {
      var time = $( this ).parents( ".tweet" ).data( "timestamp" );
      $( this ).text( moment( time ).fromNow() );
    });
  }, 30000);
});