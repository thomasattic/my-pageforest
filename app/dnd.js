
function DragAndDropHandler(conf) {
  var IS_TOUCH = 'ontouchstart' in window;
  var START_EVENT = IS_TOUCH? 'touchstart' : 'mousedown';
  var MOVE_EVENT = IS_TOUCH? 'touchmove' : 'mousemove';
  var END_EVENT = IS_TOUCH? 'touchend' : 'mouseup';
  var CANCEL_EVENT = IS_TOUCH? 'touchcancel' : 'mouseout'; // mouseout on document

  var active, picked;
  var moveTimer;
  var lastClientX, lastClientY, clientX, clientY, startX, startY;
  var bounds;

  // 'conf': {
  //      container: '<<jquery-selector>>',
  //      phantom: 'optional <<jquery-selector for phantom dom>>'
  //      attrid: 'optional <<attribute name of the item id>>',
  //      child: 'optional <<jquery-selector>>'
  // }
  var myconf = $.extend({
    attrid: "data-id",
    phantom: "#phantom",
    onMove: function() {}
  }, conf);

  $(document).ready(function() {
    $(myconf.phantom).hide();
  });

  function findElement(x, y) {
    var result;
    var i, len;
    var before, item;

    // Assume layout that flow from
    //   left to right and top to bottom, either row or column
    before = true;
    result = bounds[bounds.length-1].appid;
    for (i=0, len=bounds.length; i<len; i++) {
      b = bounds[i];
      if (x <= b.right && y <= b.bottom) {
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
  function moveElement() {
    if (picked && (lastClientX !== clientX || lastClientY !== clientY)) {
      var after = findElement(clientX, clientY);
      if (after !== picked) {
        myconf.onMove(picked, after, function() {
          lastClientX = clientX;
          lastClientY = clientY;
          startX = clientX;
          startY = clientY;
        });
      }
    }
  }
  function updateMousePosition(e) {
    var touch = IS_TOUCH? e.changedTouches[0]: e;
    var $body = $("body");
    var offset = $body.offset();
    var $phantom = $(myconf.phantom);
    var size = {height: $phantom.height(), width: $phantom.width()};

    var top = touch.clientY - offset.top - Math.floor(size.height/2);
    var left = touch.clientX - offset.left - Math.floor(size.width/2);

    $phantom
      .css('top', top + 'px')
      .css("left", left + 'px');

    clientX = touch.clientX;
    clientY = touch.clientY;
  }
  function tickleBounds() {
    bounds = [];
    $(myconf.container).children(myconf.child).each(function(i, li) {

      var $li = $(li);
      var offset = $li.offset();
      var appid = $li.attr(myconf.attrid);
      var margin = 30; //@TODO -- hardcode px!
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
      $el.addClass("invisible");

      updateMousePosition(e.originalEvent);
      clearTimeout(moveTimer);
      moveTimer = setTimeout(function() {
        moveElement(e);
      }, 50);

      var $phantom = $(myconf.phantom);
      $phantom.show();
      $phantom.css('background-image', $el.find(".icon").css('background-image'));
    }
  }
  function touchEnd(e) {
    if (picked) {
      e.preventDefault();
    }

    clearTimeout(moveTimer);
    moveElement();

    picked = undefined;
  }
  function touchMove(e) {
    if (!picked) {
      return;
    }
    e.preventDefault();
    updateMousePosition(e.originalEvent);
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function() {
      moveElement(e);
    }, 50);
  }

  var pub = {};
  pub.start = function() {
    if (!active) {
      active = true;
      $(document).bind(START_EVENT, touchStart);
      $(document).bind(END_EVENT, touchEnd);
      $(document).bind(MOVE_EVENT, touchMove);
      pub.refresh();
    }
  };
  pub.stop = function() {
    if (active) {
      active = undefined;
      $(document).unbind(START_EVENT, touchStart);
      $(document).unbind(END_EVENT, touchEnd);
      $(document).unbind(MOVE_EVENT, touchMove);
    }

    picked = undefined;
  };
  pub.refresh = function() {
    if (active) {
      tickleBounds();
    }
    if (!picked) {
      $(myconf.phantom).hide();
      $(myconf.container).children(myconf.child).removeClass("invisible");
    }
  };
  return pub;
};
