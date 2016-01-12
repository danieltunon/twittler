$(document).ready(function () {
  var $stream = $('article.stream');
  //$stream.html('<h2>Your stream</h2>');

  var index = streams.home.length - 1;
  while (index >= 0) {
    var tweet = streams.home[index];
    var $tweet = $('<div class="tweet well"></div>');
    $tweet.html('<a href="#">@' + tweet.user + '</a>:<p>' + tweet.message + '</p>');
    $tweet.appendTo($stream);
    index -= 1;
  }

});