
function DragAndDropHandler(conf) {
  var IS_TOUCH = 'ontouchstart' in window;

  var picked;
  var moveTimer;
  var lastClientX, lastClientY, clientX, clientY, startX, startY;
  var bounds;
  var active;

  // 'conf': {
  //      container: '<<jquery-selector>>',
  //      attrid: 'optional <<attribute name of the item id>>',
  //      child: 'optional <<jquery-selector>>'
  // }
  var myconf = $.extend({
    attrid: "data-id",
    onMove: function() {}
  }, conf);

  $(document).ready(function() {
    $("#phantom").hide();
  });

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
  function moveElement(e) {
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
  function updateMousePosition(e, $el) {
    var touch = IS_TOUCH? e.touches[0]: e;
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
      $phantom.show();
      $phantom.css('background-image', $el.find(".icon").css('background-image'));
    }

    clientX = touch.clientX;
    clientY = touch.clientY;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function() {
      moveElement(e);
    }, 250);
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
    console.warn("bounds: " + JSON.stringify(bounds));
  }
  function touchStart(e) {
    var $el = $(e.target);
    var item = myconf.container + " > " + (myconf.child || "*");
    if (!$el.is(item)) {
      $el = $(e.target).closest(item);
    }

    if ($el.length > 0) {
      picked = $el.attr(myconf.attrid);
      $el.addClass("invisible");

      updateMousePosition(e, $el);
    }
  }
  function touchEnd(e) {
    if (picked) {
      //$(myconf.container).children("[" + myconf.attrid + "='" + picked + "']").removeClass("invisible");
      e.preventDefault();
    }
    clearTimeout(moveTimer);
    moveElement(e);
    picked = undefined;
  }
  function touchMove(e) {
    if (!picked) {
      return;
    }
    e.preventDefault();
    updateMousePosition(e);
  }

  var pub = {};
  pub.start = function() {
    console.warn("dnd started");
    if (!active) {
      active = true;
      $(document).bind("touchstart mousedown", touchStart);
      $(document).bind("touchend mouseup", touchEnd);
      $(document).bind("touchmove mousemove", touchMove);
      pub.refresh();
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
  pub.refresh = function() {
    if (active) {
      tickleBounds();
    }
    if (!picked) {
      $("#phantom").hide();
      $(myconf.container).children(myconf.child).removeClass("invisible");
    }
  };
  return pub;
};
