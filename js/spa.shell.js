/*
 * spa.shell.js
 * Shell module for SPA
 */

spa.shell = (function () {
  //---------------- BEGIN MODULE SCOPE VARIABLES ----------------
  var
    configMap = {
      anchor_schema_map: {
        stream: {
          home: true
        }
      },

      main_html: String() +
        '<header>' +
          '<nav class="navbar navbar-default navbar-fixed-top">' +
           ' <div class="container">' +
              '<div class="navbar-header">' +
                '<a class="navbar-brand" href="#stream=home">Twittler</a>' +
              '</div>' +
              '<div class="navbar-nav navbar-right dropdown">' +
                '<button id="login" class="btn btn-default navbar-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '<i class="glyphicon glyphicon-off"></i> <b>Login</b>' +
                '</button>' +
                '<form action="" class="dropdown-menu">' +
                  '<div class="text-right">' +
                    '<label for="input-username">User Name</label>' +
                    '<input type="text" class="form-control" id="input-username" placeholder="Your Name">' +
                    '<button id="login-submit" class="btn btn-primary" type="submit">Submit</button>' +
                  '</form>' +
                '</div>' +
              '</div>' +
              '<button id="logout" class="btn btn-default navbar-btn navbar-right">' +
                '<i class="glyphicon glyphicon-off"></i> <b>Logout</b>' +
              '</button>' +
            '</div>' +
          '</nav>' +
        '</header>' +
        '<main class="container spa-shell">' +
          '<div class="row">' +
            '<article class="col-md-6 col-md-offset-3">' +
              '<header class="spa-shell-header">' +
                '<h2><span class="spa-shell-title"></span></h2>' +
                '<button class="spa-shell-writeTweet btn btn-default">' +
                  '<i class="glyphicon glyphicon-edit"></i> Tweet!' +
                '</button>' +
              '</header>' +
              '<section class="spa-shell-newTweet">' +
                '<div class="well">' +
                  '<header>' +
                    '<p><span class="spa-shell-newTweet-user">@dummyuser</span>:</p>' +
                    '<button type="button" class="close" data-dismiss="" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                  '</header>' +
                  '<form action="">' +
                    '<div class="input-group">' +
                      '<input type="text" id="spa-shell-newTweet-message" class="form-control" placeholder="What\'s on your mind..." aria-label="message">' +
                      '<span class="input-group-btn">' +
                        '<button id="post" class="btn btn-primary" type="submit">Post</button>' +
                      '</span>' +
                    '</div>' +
                  '</form>' +
                '</div>' +
              '</section>' +
              '<section class="spa-shell-stream"></section>' +
            '</article>' +
          '</div>' +
        '</main>',

      notLoggedInAlert_html: String() +
        '<div class="alert alert-danger" role="alert" style="clear:both;">' +
          '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
          '<p><strong>Whoops!</strong> You need to log in before you can submit a tweet.</p>' +
        '</div>'
    },

    stateMap = {
      $container: null,
      anchor_map: {},
      stream: 'home',
      tweetsDisplayed: 0,
      totalTweets: 0,
      updateStreamID: null,
      loginAlertDisplayed: false
    },

    jqueryMap = {},

    copyAnchorMap, formatTweet, newLogInToTweetAlert,
    displayTweets, updateTimestamp,
    changeAnchorPart, setJqueryMap, toggleStream,
    onHashchange, onShowLogin, onLogin, onLogout,
    showNewTweet, hideNewTweet, onPost,
    extendAnchorMap, initModule;
  //-------------------- END SCOPE VARIABLES --------------------

  //------------------- BEGIN UTILITY METHODS -------------------
  // Returns copy of stored anchor map; minimizes overhead
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };
  // End utility function /copyAnchorMap/

  // Begin /formatTweet/ utility function
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
  formatTweet = function ( user, message, time ) {
    return (
      '<header>' +
        '<a class="spa-shell-stream-tweet-user" href="#stream=' + user + '">' +
        '@' + user + '</a>:' +
        '<span class="spa-shell-stream-tweet-timestamp">' +
        moment(time).fromNow() +
        '</span>' +
      '</header>' +
      '<p class="spa-shell-stream-tweet-message">' + message + '</p>'
    );
  };
  // End utility function /formatTweet/

  //-------------------- END UTILITY METHODS --------------------

  //--------------------- BEGIN DOM METHODS ---------------------
  // Begin DOM method /displayTweets/
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
  //   * calls /formatTweet/ to populate the <div> with the
  //     filled in template
  //   * prepends the finished element to the DOM target so new
  //     tweets are displayed at the top of the stream
  // End DOM method /displayTweets/
  displayTweets = function ( source, start, end, target ) {
    var i = start;
    for ( i; i < end; i++ ) {
      var tweet = source[i];
      var $tweet = $('<div class="spa-shell-stream-tweet well" data-timestamp="' +
        tweet.created_at.toISOString() +'"></div>');
      $tweet.html(
        formatTweet(tweet.user, tweet.message, tweet.created_at)
      );
      $tweet.hide().prependTo(target).fadeIn("slow");
    }
  };
  // End DOM method /displayTweets/

  // Begin DOM method /updateTimestamp/
  // create new interval timer to update timestamp
  updateTimestamp = function () {
    $( ".spa-shell-stream-tweet-timestamp" ).each( function () {
      var time = $( this ).parents( ".spa-shell-stream-tweet" )
                          .data( "timestamp" );
      $( this ).text( moment( time ).fromNow() );
    });
  };
  // End DOM method /updateTimestamp/

  // Begin DOM method /toggleStream/
  // Purpose: to reset the stream with the appropriate content
  // Arguments:
  //   * user - the name of the user who's stream will be displayed
  //            'home' will be passed to display tweets from everyone
  // Returns: none
  // Actions:
  //   * Removes previous update stream interval timer if present
  //   * Resets tweet counts and current stream stateMap properties
  //   * Clears stream container contents
  //   * Resets title to appropriate name
  //   * Populates container with currently available tweets
  //   * Sets new interval timer to update stream with new tweets
  //
  toggleStream = function ( user ) {
    // convenience variable to point to correct stream array
    var displayedStream;
    displayedStream = ( user === 'home' ? streams[user] : streams.users[user] );

    if ( stateMap.updateStreamID ) {
      clearInterval( stateMap.updateStreamID );
    }

    stateMap.stream = displayedStream;
    stateMap.tweetsDisplayed = 0;
    stateMap.totalTweets = displayedStream.length;

    jqueryMap.$stream.html('');
    jqueryMap.$title.text( (user === 'home' ? 'My' : user + "'s") +
                           ' babbling brook' );
    jqueryMap.$container.scrollTop(0);

    displayTweets( displayedStream,
                   stateMap.tweetsDisplayed,
                   stateMap.totalTweets,
                   jqueryMap.$stream );
    stateMap.tweetsDisplayed = stateMap.totalTweets;

    stateMap.updateStreamID = setInterval( function () {
      stateMap.totalTweets = displayedStream.length;
      displayTweets( displayedStream,
                     stateMap.tweetsDisplayed,
                     stateMap.totalTweets,
                     jqueryMap.$stream );
      stateMap.tweetsDisplayed = stateMap.totalTweets;
    }, 1000);
  };
  // End DOM method /toggleStream/

  // Begin DOM method /changeAnchorPart/
  // Purpose: Changes part of the URI anchor component
  // Arguments:
  //   * arg_map - The map describing what part of the URI anchor
  //               we want changed
  // Returns: boolean
  //   * true - the Anchor portion of the URI was updated
  //   * false - the Anchor portion of the URI could not be updated
  // Action:
  //   The current anchor rep stored in stateMap.anchor_map.
  //   See uriAnchor for a discussion of encoding.
  // This method
  //   * Creates a copy of this map using copyAnchorMap().
  //   * Modifies the key-values using arg_map.
  //   * Manages the distinction between independent
  //     and dependent values in the encoding.
  //   * Attempts to change the URI using uriAnchor.
  //   * Returns true on success, false on failure.
  //
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    // Begin merge changes into anchor map
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name )) {

        // skip dependent keys during iteration
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        // update matching dependent key
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // End merge changes into anchor map

    // Begin attempt to update URI; revert if not successful
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // replace URI with existing state
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
      bool_return = false;
    }
    // End attempt to update URI...

    return bool_return;
  };
  // End DOM method /changeAnchorPart/

  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container,
      $stream: $container.find( '.spa-shell-stream' ),
      $title: $container.find( '.spa-shell-title' ),
      $login_btn: $container.find( '#login' ),
      $logout_btn: $container.find( '#logout' ),
      $submitLogin_btn: $container.find( '#login-submit' ),
      $username: $container.find( '#input-username' ),
      $writeTweet: $container.find( '.spa-shell-writeTweet' ),
      $newTweet: $container.find( '.spa-shell-newTweet' ),
      $newTweetUser: $container.find( '.spa-shell-newTweet-user'),
      $newTweetMsg: $container.find( '#spa-shell-newTweet-message' ),
      $newTweetClose: $container.find( '.close' ),
      $post_btn: $container.find( '#post' )
    };
  };
  // End DOM method /setJqueryMap/

  //---------------------- END DOM METHODS ----------------------

  //-------------------- BEGIN EVENT HANDLERS -------------------
  // Begin Event handler /onHashchange/
  // Purpose: Handles the hashchange event
  // Arguments:
  //   * event - jQuery event object
  // Settings: none
  // Returns: false
  // Action:
  //   * Parses the URI anchor component
  //   * Compares proposed application state to current state
  //   * Adjust the application only where proposed state
  //     differs from existing
  //
  onHashchange = function ( event ) {
    var
      anchor_map_previous = copyAnchorMap(),
      anchor_map_proposed,
      _s_stream_previous, _s_stream_proposed,
      s_stream_proposed;

    // attempt to parse anchor
    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // convenience vars
    _s_stream_previous = anchor_map_previous._s_stream;
    _s_stream_proposed = anchor_map_proposed._s_stream;

    // Begin adjust stream component if changed
    if ( ! anchor_map_previous || _s_stream_previous !== _s_stream_proposed ) {
      s_stream_proposed = anchor_map_proposed.stream;
      toggleStream( s_stream_proposed || 'home' );
    }
    // End adjust stream component if changed

    return false;
  };
  // End Event handler /onHashchange/

  // Begin Event handler /onShowLogin/
  //
  onShowLogin = function  ( event ) {
    $(this).parents('.dropdown').toggleClass('open');
    jqueryMap.$username.focus();
    return false;
  };
  //

  // Begin Event handler /onLogin/
  //
  onLogin = function ( event ) {
    if ( jqueryMap.$username.val() === '' ) {
      $(this).parents('.dropdown').toggleClass('open');
      return false;
    }

    $('.spa-shell-header > .alert').remove();

    window.visitor = jqueryMap.$username.val();
    streams.users[visitor] = [];

    jqueryMap.$newTweetUser.text( '@' + visitor );

    $(this).parents('.dropdown').toggleClass('open');

    jqueryMap.$login_btn.hide();
    jqueryMap.$logout_btn.show();

    return false;
  };
  // End Event handler /onLogin/

  // Begin Event handler /onLogout/
  //
  onLogout = function ( event ) {
    hideNewTweet ( event );

    window.visitor = undefined;
    jqueryMap.$username.val( '' );

    jqueryMap.$login_btn.show();
    jqueryMap.$logout_btn.hide();

    return false;
  };
  // End Event handler /onLogout/

  // Begin Event handler /showNewTweet/
  //
  showNewTweet = function ( event ) {
    jqueryMap.$submitLogin_btn.parents('.dropdown').removeClass('open');

    if ( window.visitor === undefined ) {
      if ( $('.spa-shell-header > .alert').length === 0 ) {
        $('.spa-shell-header').append( configMap.notLoggedInAlert_html );
      }

      return false;
    }

    jqueryMap.$newTweet.slideDown('fast');
    jqueryMap.$newTweetMsg.focus();

    return false;
  };
  // End Event handler /showNewTweet/

  // Begin Event handler /hideNewTweet/
  //
  hideNewTweet = function ( event ) {
    jqueryMap.$newTweet.slideUp('fast');
    jqueryMap.$newTweetMsg.val('');

    return false;
  };
  // End Event handler /hideNewTweet/

  // Begin Event handler /onPost/
  //
  onPost = function ( event ) {
    var message = jqueryMap.$newTweetMsg.val();

    if ( message === '' ) {
      hideNewTweet( event );
      return false;
    }

    writeTweet( message );
    hideNewTweet( event );
    jqueryMap.$newTweetMsg.val( '' );

    return false;
  };
  // End Event handler /onPost/

  //--------------------- END EVENT HANDLERS --------------------

  //-------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /extendAnchorMap/
  // Purpose: extend the given anchor schema map key
  //          with the given values
  extendAnchorMap = function ( values ) {
    values.forEach( function ( value ) {
      if ( configMap.anchor_schema_map.stream[value] === undefined ) {
        configMap.anchor_schema_map.stream[value] = true;
      }
    });
  };
  // End Public method /extendAnchorMap/

  // Begin Public method /initModule/
  initModule = function ( $container ) {
    // set config map
    extendAnchorMap( window.users );

    // set state map
    stateMap.$container = $container;
    stateMap.totalTweets = streams.home.length;

    // load HTML
    $container.html( configMap.main_html );

    // map jQuery collections
    setJqueryMap();

    // configure uriAnchor to use our schema
    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    // Handle URI anchor change events.
    // This is done /after/ all feature modules are configured
    // and initialized, otherwise they will not be ready to handle
    // the trigger event, which is used to ensure the anchor
    // is considered on-load
    //
    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );

    jqueryMap.$login_btn.click( onShowLogin );
    jqueryMap.$submitLogin_btn.click( onLogin );
    jqueryMap.$logout_btn.click( onLogout );
    jqueryMap.$writeTweet.click( showNewTweet );
    jqueryMap.$newTweetClose.click( hideNewTweet );
    jqueryMap.$post_btn.click( onPost );

    toggleStream( 'home' );
    setInterval( updateTimestamp, 30000 );

  };
  // End Public method /initModule/

  return { initModule: initModule };
  //--------------------- END PUBLIC METHODS --------------------
}());
