
function DragAndDropHandler(conf) {
  var IS_TOUCH = 'ontouchstart' in window;
  var START_EVENT = IS_TOUCH? 'touchstart' : 'mousedown';
  var MOVE_EVENT = IS_TOUCH? 'touchmove' : 'mousemove';
  var END_EVENT = IS_TOUCH? 'touchend' : 'mouseup';
  var CANCEL_EVENT = IS_TOUCH? 'touchcancel' : 'mouseout'; // mouseout on document

  var active, picked, rank;
  var lastClientX, lastClientY, clientX, clientY;
  var bounds;
  var moveTimer, tapholdTimer;

  // 'conf': {
  //      container: '<<jquery-selector>>',
  //      phantom: 'optional <<jquery-selector for phantom dom>>'
  //      attrid: 'optional <<attribute name of the item id>>',
  //      child: 'optional <<jquery-selector>>',
  //      margin: 'optional <<number>>' //@TODO - to be rid of
  // }
  var myconf = $.extend({
    attrid: "data-id",
    phantom: "#phantom",
    onMove: function() {},
    activateOnTaphold: false,
    tapholdThreshold: 1250,
    margin: 0
  }, conf);

  function findRankFromMousePosition() {
    var result;
    var i, len;
    var before, item;

    // Assume layout that flow from
    //   left to right and top to bottom, either row or column
    before = true;
    result = bounds.length >= 1? bounds[bounds.length-1].appid: undefined;
    for (i=0, len=bounds.length; i<len; i++) {
      b = bounds[i];
      if (clientX <= b.right && clientY <= b.bottom) {
        if (!before) {
          result = b.appid;
        } else if (i > 0) {
          result = bounds[i-1].appid;
        } else {
          result = undefined;
        }
        break;
      }
      if (b.appid === picked) {
        before = false;
      }
    }
    return result;
  }
  function findRankInBounds() {
    var result;
    var i, len, cur;
    for (i=0, len=bounds.length; i<len; i++) {
      if (bounds[i].appid === picked) {
        cur = i-1;
        break;
      }
    }
    result = cur >= 0? bounds[cur]: undefined;
    return result;
  }
  function snapToHome() {
    $(myconf.phantom).hide();
    $(myconf.container).children(myconf.child).removeClass("invisible");
  }
  function moveElement(ended) {
    if (!picked) {
      return;
    }
    if (lastClientX !== clientX || lastClientY !== clientY) {
      var newrank = findRankFromMousePosition();
      if (newrank !== picked) {
        myconf.onMove(picked, newrank, function() {
          lastClientX = clientX;
          lastClientY = clientY;
          rank = newrank;
        });
      } else {
        if (ended) {
          snapToHome();
        }
      }
    } else {
      snapToHome();
    }
  }
  function updateMousePosition(e) {
    var touch = IS_TOUCH? e.changedTouches[0]: e;
    var $body = $("body");
    var offset = $body.offset();
    var $phantom = $(myconf.phantom);
    var size = {height: $phantom.height(), width: $phantom.width()};
    var top, left;

    clientX = touch.clientX;
    clientY = touch.clientY;

    top = clientY - offset.top - Math.floor(size.height/2);
    left = clientX - offset.left - Math.floor(size.width/2);

    $phantom.css('top', top + 'px').css("left", left + 'px');
  }
  function measureBounds() {
    bounds = [];
    $(myconf.container).children(myconf.child).each(function(i, li) {
      var $li = $(li);
      var offset = $li.offset();
      var appid = $li.attr(myconf.attrid);
      var margin = myconf.margin;
      var item = {appid: appid, top: offset.top - margin, left: offset.left - margin,
          bottom: offset.top + $li.height() + margin, right: offset.left + $li.width() + margin};
      bounds.push(item);
    });
  }
  function touchStart(e) {
    e.preventDefault();
    var $el = $(e.target);
    var item = myconf.container + " > " + (myconf.child || "*");
    if (!$el.is(item)) {
      $el = $(e.target).closest(item);
    }

    if ($el.length > 0) {
      picked = $el.attr(myconf.attrid);
      rank = findRankInBounds();
      $el.addClass("invisible");

      updateMousePosition(e.originalEvent);
      
      clearTimeout(moveTimer);
      moveTimer = setTimeout(function() {
        moveElement();
      }, 50);

      var $phantom = $(myconf.phantom);
      $phantom.show();
      $phantom.css('background-image', $el.find(".icon").css('background-image'));
    }
  }
  function touchEnd(e) {
    if (picked) {
      e.preventDefault();
      
      updateMousePosition(e.originalEvent);
      clearTimeout(moveTimer);
      moveElement(true);
      picked = undefined;
    }
  }
  function touchMove(e) {
    if (!picked) {
      return;
    }
    e.preventDefault();
    updateMousePosition(e.originalEvent);
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function() {
      moveElement();
    }, 125);
  }
  function installTapholdActivator() {
    function clearTapholdTimeout() {
      clearTimeout(tapholdTimer);
      tapholdTimer = undefined;
    }
    function tapholdActivator(e) {
      var evt = e.originalEvent;
      var startEvent = {
          target: e.target,
          preventDefault: function() {},
          originalEvent: {
            target: evt.target,
            preventDefault: function() {},
            clientX: evt.clientX, clientY: evt.clientY,
            changedTouches: evt.changedTouches, touches: evt.touches
          }
      };

      $(document).one(END_EVENT, clearTapholdTimeout);
      tapholdTimer = setTimeout(function() {
        clearTapholdTimeout();
        $(document).unbind(END_EVENT, clearTapholdTimeout);
        measureBounds();
        touchStart(startEvent);
      }, myconf.tapholdThreshold);
    }
    if (myconf.activateOnTaphold) {
      $(document).unbind(END_EVENT, clearTapholdTimeout);
      $(document).one(START_EVENT, tapholdActivator);
    }
  }
  function start() {
    if (!active) {
      active = true;
      $(document).bind(START_EVENT, touchStart);
      $(document).bind(END_EVENT, touchEnd);
      $(document).bind(MOVE_EVENT, touchMove);
      refresh();
    }
  };
  function stop() {
    if (active) {
      active = undefined;
      $(document).unbind(START_EVENT, touchStart);
      $(document).unbind(END_EVENT, touchEnd);
      $(document).unbind(MOVE_EVENT, touchMove);

      installTapholdActivator();
    }
    picked = undefined;
  };
  function refresh() {
    if (active) {
      measureBounds();
    }
    if (!picked) {
      snapToHome();
    }
  };

  $(document).ready(function() {
    $(myconf.phantom).hide();
    installTapholdActivator();
  });

  var pub = {
      start: start,
      stop: stop,
      refresh: refresh
  };
  return pub;
};
