
function DragAndDropHandler(conf) {
  var isTouch = 'ontouchstart' in window;

  var myconf = $.extend({
    onMove: function() {}
  }, conf);

  var picked;
  var moveTimer;
  var lastClientX, lastClientY, clientX, clientY, startX, startY;
  var bounds;
  var active;
  function findElement(x, y) {
    var result;
    var i, len;
    var matchX, matchY, item;
    var before = false;
    console.warn("finding x: " + x + " y: " + y + " bounds.length " + bounds.length);

    for (i=0, len=bounds.length; i<len; i++) {
      b = bounds[i];
      matchX = startX >= b.left && startX < b.right;
      matchY = startY >= b.top && startY < b.bottom;

      if (matchX && matchY) {
        if (x < b.right && y > b.bottom) {
          before = true;
        }
        break;
      }
    }

    if (!before) {
      x = x - 124;
    }
    for (i=0, len=bounds.length; i<len; i++) {
      b = bounds[i];
      matchX = x >= b.left && x < b.right;
      matchY = y >= b.top && y < b.bottom;
      if (matchX && matchY) {
        result = b.appid;
        break;
      }
    }
    return result;
  }
  function updatePoint(e, $el) {
    var touch = isTouch ? e.touches[0] : e;
    var $body = $("body");
    var offset = $body.offset();
    var $phantom = $("#phantom");
    var size = {height: $phantom.height(), width: $phantom.width()};

    var top = touch.clientY - offset.top - Math.floor(size.height/2);
    var left = touch.clientX - offset.left - Math.floor(size.width/2);

    $phantom
       .css('top', top + 'px')
       .css("left", left + 'px');
    if ($el !== undefined) {
      $phantom.css('background-image', $el.find(".icon").css('background-image'));
    }

    clientX = touch.clientX;
    clientY = touch.clientY;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function() {
      if (picked && (lastClientX !== clientX || lastClientY !== clientY)) {
        var after = findElement(clientX, clientY);
        if (after !== id) {
          var id = $(picked).attr(myconf.attrid);
          myconf.onMove(id, after, function() {
            lastClientX = clientX;
            lastClientY = clientY;
            startX = clientX;
            startY = clientY;
            tickleBounds();
          });
        }
      }
    }, 250);
  }
  function tickleBounds() {
    bounds = [];
    $(myconf.div).each(function(i, li) {

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
    var $el = $(e.target);
    if (!$el.is(myconf.div)) {
      $el = $(e.target).closest(myconf.div);
    }
    var appid = $el.attr(myconf.attrid);
    picked = myconf.div + "[" + myconf.attrid + "='" + appid + "']";

    var $body = $("body");
    if ($el.length > 0) {
      //e.preventDefault();
      $el.addClass("invisible");
      $body.addClass("dragmode");

      var touch = isTouch ? e.touches[0] : e;
      clientX = touch.clientX;
      clientY = touch.clientY;

      updatePoint(e, $el);

      tickleBounds();
    }
  }
  function touchEnd(e) {
    var $body = $("body");
    $body.removeClass("dragmode");
    $(picked).removeClass("invisible");
    $(myconf.div).removeClass("invisible");
    if (picked) {
      e.preventDefault();
    }
    clearTimeout(moveTimer);
    picked = undefined;
  }
  function touchMove(e) {
    if (!picked) {
      return;
    }
    e.preventDefault();
    updatePoint(e);
  }

  var pub = {};
  pub.start = function() {
    if (!active) {
      active = true;
      $(document).bind("touchstart mousedown", touchStart);
      $(document).bind("touchend mouseup", touchEnd);
      $(document).bind("touchmove mousemove", touchMove);
    }
  };
  pub.stop = function() {
    if (active) {
      active = undefined;
      $(document).unbind("touchstart mousedown", touchStart);
      $(document).unbind("touchend mouseup", touchEnd);
      $(document).unbind("touchmove mousemove", touchMove);
    }

    picked = undefined;
  };
  return pub;
};
