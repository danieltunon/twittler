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
            '<div class="container">' +
              '<div class="navbar-header">' +
                '<a class="navbar-brand" href="#home">Twittler</a>' +
              '</div>' +
            '</div>' +
          '</nav>' +
        '</header>' +
        '<main class="container">' +
          '<div class="row">' +
            '<article class="col-md-6 col-md-offset-3">' +
              '<h2><span class="spa-shell-title">Your stream</span></h2>' +
              '<section class="spa-shell-stream"></section>' +
            '</article>' +
          '</div>' +
        '</main>'
    },

    stateMap = {
      $container: null,
      anchor_map: {},
      stream: 'home',
      tweetsDisplayed: 0,
      totalTweets: 0
    },

    jqueryMap = {},

    copyAnchorMap, formatTweet,
    displayTweets, changeAnchorPart, setJqueryMap, toggleStream,
    onHashchange, onClickStream,
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
  function formatTweet ( user, message, time ) {
    return (
      '<header>' +
        '<a class="spa-shell-stream-tweet-user" href="#' + user + '">' +
        '@' + user + '</a>:' +
        '<span class="spa-shell-stream-tweet-timestamp">' +
        moment(time).fromNow() +
        '</span>' +
      '</header>' +
      '<p class="spa-shell-stream-tweet-message">' + message + '</p>'
    );
  }
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
  function displayTweets ( start, end, target ) {
    var i = start;
    for ( i; i < end; i++ ) {
      var tweet = streams.home[i];
      var $tweet = $('<div class="spa-shell-stream-tweet well" data-timestamp="' +
        tweet.created_at.toISOString() +'"></div>');
      $tweet.html(
        formatTweet(tweet.user, tweet.message, tweet.created_at)
      );
      $tweet.hide().prependTo(target).fadeIn("slow");
    }
  }
  // End DOM method /displayTweets/

  // Begin DOM method /updateStream/


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
  //     and dependent vallues in the encoding.
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
      $stream: $container.find( '.spa-shell-stream' )
    };
  };
  // End DOM method /setJqueryMap/

  // Begin DOM method /toggleStream/
  // Purpose: extends or retracts chat slider
  // Arguments:
  //   * do_extend - if true, extends slider; if false retracts
  //   * callback - optional fuction to execute at end of animation
  // Settings:
  //   * chat_extend_time,chat_retract_time
  //   * chat_extend_height, chat_retract_height
  // Returns: boolean
  //   * true - slider animation activated
  //   * false - slider animation not activated
  // State: sets stateMap.is_chat_retracted
  //   * true - slider is retracted
  //   * false - slider is extended
  //
  toggleStream = function (  ) {

  };
  // End DOM method /toggleStream/

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

    // Begin adjust chat component if changed
    if ( ! anchor_map_previous || _s_stream_previous !== _s_stream_proposed ) {
      s_stream_proposed = anchor_map_proposed.stream;
      switch ( s_stream_proposed ) {
        case 'open' :
          toggleChat( true );
          break;
        case 'closed' :
          toggleChat( false );
          break;
        default :
          toggleChat( false );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true);
      }
    }
    // End adjust chat component if changed

    return false;
  };
  // End Event handler /onHashchange/

  // Begin Event handler /onClickStream/
  onClickStream = function ( event ) {
    changeAnchorPart({
      stream: event.data.user
      });
    return false;
  };
  // End Event handler /onClickChat/
  //--------------------- END EVENT HANDLERS --------------------

  //-------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /extendAnchorMap/
  // Purpose: extend the given anchor schema map key
  //          with the given values
  extendAnchorMap = function ( key, values ) {
    values.forEach( function ( value ) {
      if ( configMap.anchor_schema_map[key][value] === undefined ) {
        configMap.anchor_schema_map[key][value] = true;
      }
    });
  };
  // End Public method /extendAnchorMap/

  // Begin Public method /initModule/
  initModule = function ( $container ) {
    // set config map
    extendAnchorMap( 'stream', window.users );

    // set state map
    stateMap.$container = $container;
    stateMap.totalTweets = streams.home.length;

    // load HTML
    $container.html( configMap.main_html );

    //map jQuery collections
    setJqueryMap();

    // initialize chat slider and bind click handler
    //stateMap.is_chat_retracted = true;
    //jqueryMap.$chat
      //.attr( 'title', configMap.chat_retracted_title )
      //.click( onClickChat );

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

    displayTweets(stateMap.tweetsDisplayed, stateMap.totalTweets, jqueryMap.$stream);

  };
  // End Public method /initModule/

  return { initModule: initModule };
  //--------------------- END PUBLIC METHODS --------------------
}());
