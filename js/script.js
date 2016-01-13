function tweetFormatter (user, message, time) {
  var readableTime = moment(time).format('MMM D, YYYY h:mm A')
  return (
    '<header>' +
      '<a class="user" href="#">@' + user + '</a>:' +
      '<span class="timestamp">' + readableTime + '</span>' +
    '</header>' +
    '<p class="message">' + message + '</p>'
  );
}

function displayTweets (start, end, target) {
  for ( var i = start; i < end; i++ ) {
    var tweet = streams.home[i];
    var $tweet = $('<div class="tweet well"></div>');
    $tweet.html( 
      tweetFormatter(tweet.user, tweet.message, tweet.created_at) 
    );
    $tweet.prependTo(target);
  }
}

$(document).ready(function () {
  var $stream = $('section.stream');
  //$stream.html('<h2>Your stream</h2>');

  var tweetsDisplayed = 0;
  var totalTweets = streams.home.length;
  
  displayTweets(tweetsDisplayed, totalTweets, $stream);
  
  setInterval(function() {
    totalTweets = streams.home.length;
    displayTweets(tweetsDisplayed, totalTweets, $stream);
    tweetsDisplayed = totalTweets;
  }, 1000);
});