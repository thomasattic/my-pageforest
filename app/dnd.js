
function DragAndDropHandler(conf) {
  var IS_TOUCH = 'ontouchstart' in window;
  var START_EVENT = IS_TOUCH? 'touchstart' : 'mousedown';
  var MOVE_EVENT = IS_TOUCH? 'touchmove' : 'mousemove';
  var END_EVENT = IS_TOUCH? 'touchend' : 'mouseup';
  var CANCEL_EVENT = IS_TOUCH? 'touchcancel' : 'mouseout'; // mouseout on document

  var active, picked, rank;
  var lastClientX, lastClientY, clientX, clientY;
  var bounds, phantoms = {};
  var moveTimer, tapholdTimer;
  var bus = [];

  // 'conf': {
  //      container: '<<jquery-selector>>',
  //      phantomContainer: 'optional <<jquery-selector for phantom dom>>',
  //      phantom: 'optional <<jquery-selector for phantom dom>>'
  //      attrid: 'optional <<attribute name of the item id>>',
  //      child: 'optional <<jquery-selector>>',
  //      margin: 'optional <<number>>' //@TODO - to be rid of
  // }
  var myconf = $.extend({
    attrid: "data-id",
    phantomContainer: "body",
    phantom: ".phantom",
    activateOnTaphold: false,
    tapholdThreshold: 1250,
    margin: 0,
    webkit: true,
    onMove: function() {},
    onDragStarted: function() {},
    onDragEnded: function() {}
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
  function checkBound() {
    var i, len;
    var before, item;

    var slot;
    for (i=0, len=bounds.length; i<len; i++) {
      b = bounds[i];
      if (clientX <= b.right && clientY <= b.bottom) {
        slot = b.appid;
        break;
      }
    }
    return slot === picked;
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
  function getPhantom(appid) {
    var $div = phantoms[appid];
    if (!$div) {
      $div = $("<div>").addClass("phantom");
      $(myconf.phantomContainer).append($div);
      phantoms[appid] = $div;
    }
    return $div;
  }
  function snapToHome(cur) {
    var $phantom = getPhantom(cur.appid);
    var $li = $(myconf.container).children("[" + myconf.attrid + "='"+ cur.appid + "']");
    if ($li.length === 0) {
      $li = $("ul#replacement").children("[" + myconf.attrid + "='"+ cur.appid + "']");
    }
    var size = {height: $li.height(), width: $li.width()};

    $li.css({position: "relative", top: "", left: ""});
    var offset = $li.offset();
    var top, left;
    if (offset) {
      top  = cur.clientY - offset.top - size.height;
      left = cur.clientX - offset.left - size.width;
      $li.css({position: "relative", top: top, left: left});
      $li.removeClass("invisible");
      $phantom.removeClass("active").hide();
      $li.animate({top: "", left: ""}, 250);
    }
    if (bus.length === 0) {
      myconf.onDragEnded();
    }
  }
  function snapToMouse() {
    var $phantom = getPhantom(picked);
    $phantom.show().addClass("active");

    var $el = $(myconf.container).children("[" + myconf.attrid + "='"+ picked + "']");
    $phantom.css('background-image', $el.find(".icon").css('background-image'));
  }
  function updateMousePosition(e) {
    var touch = IS_TOUCH? e.changedTouches[0]: e;
    var $body = $("body");
    var offset = $body.offset();
    var $phantom = getPhantom(picked);
    var size = {height: $phantom.height(), width: $phantom.width()};
    var top, left;

    clientX = touch.clientX;
    clientY = touch.clientY;

    top = clientY - offset.top - Math.floor(size.height * 0.75);
    left = clientX - offset.left - Math.floor(size.width / 2);

    $phantom.css('top', top + 'px').css("left", left + 'px');
  }
  function moveElement(ended) {
    if (!picked) {
      return;
    }
    //@TODO -- detect no move and snap right back.
    if (lastClientX !== clientX || lastClientY !== clientY) {
      var newrank = findRankFromMousePosition();
      if (newrank !== picked) {
        var withinBound = checkBound(picked);
        if (!withinBound) {
          pushMove({appid: picked, clientX: clientX, clientY: clientY});
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
        if (ended) {
          snapToHome({appid: picked, clientX: clientX, clientY: clientY});
        }
      }
    } else {
      if (ended) {
        snapToHome({appid: picked, clientX: clientX, clientY: clientY});
      }
    }
  }
  function pushMove(cur) {
    for (var i=0, len=bus.length; i<len; i++) {
      if (bus[i].appid === cur.appid) {
        Arrays.remove(bus, i);
        break;
      }
    }
    bus.push(cur);
  }
  function measureBounds() {
    var oldPhantoms = phantoms;
    bounds = [];
    phantoms = {};
    $(myconf.container).children(myconf.child).each(function(i, li) {
      var $li = $(li);
      var offset = $li.offset();
      var appid = $li.attr(myconf.attrid);
      var margin = myconf.margin;
      var item = {appid: appid, top: offset.top - margin, left: offset.left - margin,
          bottom: offset.top + $li.height() + margin, right: offset.left + $li.width() + margin};
      bounds.push(item);
      phantoms[appid] = oldPhantoms[appid];
      delete oldPhantoms[appid];
    });
    for (var cur in oldPhantoms) {
      $(oldPhantoms[cur]).remove();
      delete oldPhantoms[cur];
    }
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
      $("ul#replacement").children("[" + myconf.attrid + "='"+ picked + "']")

      updateMousePosition(e.originalEvent);

      clearTimeout(moveTimer);
      moveTimer = setTimeout(function() {
        moveElement();
      }, 50);

      snapToMouse();
      myconf.onDragStarted();
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
    for (var cur in phantoms) {
      $(phantoms[cur]).remove();
      delete phantoms[cur];
    }

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
      myconf.onDragEnded();
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
