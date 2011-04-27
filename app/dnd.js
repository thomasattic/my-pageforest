
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
  var bus = [];

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
  function snapToHome(cur) {
    console.warn("snap to home");
    $(myconf.phantom).removeClass().hide();
    $(myconf.container).children(myconf.child).removeClass("invisible");
    var $li = $(myconf.container).children("[" + myconf.attrid + "='"+ cur.appid + "']");

    if ($li.length === 0) {
      $li = $("ul#replacement").children("[" + myconf.attrid + "='"+ cur.appid + "']");
    }
    var size = {height: $li.height(), width: $li.width()};

    $li.css({position: "relative", top: "", left: ""});
    var offset = $li.offset();
    var top, left;
    if (offset) {
      top  = cur.clientY - offset.top - Math.floor(size.height/2);
      left = cur.clientX - offset.left - Math.floor(size.height/2);
      $li.css({position: "relative", top: top, left: left});
      $li.animate({top: "", left: ""}, 500);
    }
  }
  function snapToMouse() {
    var $phantom = $(myconf.phantom);
    $phantom.show().addClass("active");

    var $el = $(myconf.container).children("[" + myconf.attrid + "='"+ picked + "']");
    $phantom.css('background-image', $el.find(".icon").css('background-image'));
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
  function moveElement(ended) {
    if (!picked) {
      return;
    }
    if (lastClientX !== clientX || lastClientY !== clientY) {
      var newrank = findRankFromMousePosition();
      if (newrank !== picked) {
        for (var i=0, len=bus.length; i<len; i++) {
          if (bus[i].appid === picked) {
            Arrays.remove(bus, i);
            break;
          }
        }
        bus.push({appid: picked, clientX: clientX, clientY: clientY});
        myconf.onMove(picked, newrank, function() {
          lastClientX = clientX;
          lastClientY = clientY;
          rank = newrank;
        });
      } else {
        if (ended) {
          snapToHome({appid: picked, clientX: clientX, clientY: clientY});
        }
      }
    } else {
      snapToHome({appid: picked, clientX: clientX, clientY: clientY});
    }
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
  function translateGestureEvent(gesture) {
    return {
      target: gesture.target,
      preventDefault: function() {},
      originalEvent: {
        target: gesture.target,
        preventDefault: function() {},
        clientX: gesture.clientX, clientY: gesture.clientY,
        changedTouches: [{clientX: gesture.clientX, clientY: gesture.clientY}],
        touches: [{clientX: gesture.clientX, clientY: gesture.clientY}]
      }
    };
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

      snapToMouse();
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
    e.preventDefault();
    if (!picked) {
      return;
    }
    updateMousePosition(e.originalEvent);
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function() {
      moveElement();
    }, 125);
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
    $(myconf.phantom).hide();
    gt(document).on('taphold', function(gesture) {
      measureBounds();
      touchStart(translateGestureEvent(gesture));
    }, {retain: myconf.tapholdThreshold});

    if (active) {
      active = undefined;
      $(document).unbind(START_EVENT, touchStart);
      $(document).unbind(END_EVENT, touchEnd);
      $(document).unbind(MOVE_EVENT, touchMove);

    }
    picked = undefined;
  };
  function refresh() {
    if (active) {
      measureBounds();
    }
    if (!picked) {
      var b = bus;
      bus = [];
      var i, len;
      for (i=0, len=b.length; i<len; i++) {
        snapToHome(b[i]);
      }
    }
  };

  $(document).ready(function() {
    stop();
  });

  var pub = {
      start: start,
      stop: stop,
      refresh: refresh
  };
  return pub;
};
