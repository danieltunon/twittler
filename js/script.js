function tweetFormatter (user, message, time) {
  return (
    '<header>' +
      '<a class="user" href="#">@' + user + '</a>:' +
      // time + ' ago' +
    '</header>' +
    '<p class="message">' + message + '</p>'
  );
}

$(document).ready(function () {
  var $stream = $('article.stream');
  //$stream.html('<h2>Your stream</h2>');

  var index = streams.home.length - 1;
  while (index >= 0) {
    var tweet = streams.home[index];
    var $tweet = $('<div class="tweet well"></div>');
    $tweet.html( tweetFormatter(tweet.user, tweet.message) );
    $tweet.appendTo($stream);
    index -= 1;
  }

});