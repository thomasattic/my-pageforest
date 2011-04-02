if (jQTSettings.inputguard) {
  var root = "#jqt ul li";
  var $knowninput = $(root).find(jQTSettings.inputtypes.join(", "));
  var $allli = $knowninput.closest("li");
  $allli.addClass("input");

  var arrayapply = function(fn, items) {
    var result = [];
    for (var i = 0; i < items.length; ++i) {
      result[i] = fn(items[i]);
    }
    return result;
  };

  var scrollinput = function(e) {
    var target = e.target;
    var offsetTop = target.offsetTop;
    var offsetLeft = target.offsetLeft;
    var $wrapper = $('#jqt > .current .s-scrollwrapper, #jqt > .current .s-innerscrollwrapper');
    var scroll = $wrapper.data(KEY_ISCROLL_OBJ);
    if (scroll !== undefined && scroll !== null) {
      /* scroll.scrollToElement(target, '0'); */
      var y = Math.min(0, -(offsetTop - 22));
      var org = scroll.getPosition(); 
      scroll.scrollTo(0, y, '0');
      console.log("scrollto: " + y);

      var diffY = org.y - y;
      var ee = event;
      console.log("b4 pageY: " + ee.pageY + " clientY: " + ee.clientY + " screenY: " + ee.screenY + " y: " + ee.y);
      console.log("diffY: " + diffY);
      /*
      ee.pageY = ee.pageY - diffY;
      ee.clientY = ee.clientY - diffY;
      ee.screenY = ee.screenY - diffY;
      ee.y = ee.y - diffY;
       */

      event.preventDefault();

      setTimeout(function() {
      var ev = document.createEvent('MouseEvents');
        ev.initMouseEvent('click', true, true, ee.view, 1,
          ee.screenX, ee.screenY - diffY, ee.clientX, ee.clientY - diffY,
          ee.ctrlKey, ee.altKey, ee.shiftKey, ee.metaKey,
          0, null);
        ev._fake = true;
        target.dispatchEvent(ev);
      }, 200);

      console.log("af pageY: " + ee.pageY + " clientY: " + ee.clientY + " screenY: " + ee.screenY + " y: " + ee.y);

      //window.scrollTo(0, 0);
      var oldvalue = target.value; 
      //target.value = oldvalue + " ";
      //target.value = oldvalue;
      setTimeout(function() {
        console.log("scrolling after focus delay");
        var end = target.value.length;
        // target.setSelectionRange(end, end);
        //target.value = oldvalue;
      }, 100);
      /*
      var currents = arrayapply(function(item) {
        return item + ":focus";
      }, jQTSettings.inputtypes).join(", ");
      var $currents = $(currents);
      if ($currents.length > 0) {
        var thattop = $currents[0].offsetTop;
        var thatleft = $currents[0].offsetLeft;

        //window.scrollTo(0, thattop - offsetTop);
        //console.log("window.scroll: " + thattop + "/" + offsetTop + " " + (thattop - offsetTop));
      }*/
      //console.log("window.scrollY: " + (window.scrollY - 44));
      //window.scrollTo(0, +44);
    }
  };

  var touchcount = 0;
  $allli.bind(START_EVENT, touchstart);
  $allli.bind("tap", function(e) {
    touchcount++;
    console.log("tap: " + touchcount);
    scrollinput(e);
    setTimeout(function() {
    }, 50);
    console.log("end tap: " + touchcount);
  });
  $allli.bind("click", function(e) {
    console.log("click: " + touchcount);
    var ee = event;
    console.log("ck pageY: " + ee.pageY + " clientY: " + ee.clientY + " screenY: " + ee.screenY + " y: " + ee.y);

    var targets = $(e.target).find(jQTSettings.inputtypes.join(", ")).first();
    targets[0].focus();
    console.log("end click: " + touchcount);
  });

  $knowninput.bind("blur", function(e) {
    console.log("blur: " + touchcount);
  });
  $knowninput.bind("focus", function(e) {
    console.log("focus: " + touchcount);
    var ee = event;
    console.log("fc pageY: " + ee.pageY + " clientY: " + ee.clientY + " screenY: " + ee.screenY + " y: " + ee.y);

    // window.scrollTo(0, 0);
    setTimeout(function() {
      //scrollinput(e.target);
      /*
      var oldvalue = e.target.value;
      e.target.value = e.target.value + " ";
      setTimeout(function() {
        e.target.value = oldvalue;
      }, 50);*/                  
    }, 0);
    console.log("end focus: " + touchcount);
  });
  $knowninput.bind("click", function(e) {
    console.log("click: " + touchcount);
    // scrollinput(e);
    /*
    var scrollX = window.pageXOffset;
    var scrollY = window.pageYOffset;
    console.log("pageX/Y: " + scrollX + "/" + scrollY +  " scrollX/Y: " + window.scrollX + "/" + window.scrollY + " screenX/Y: " + window.screenX + "/" + window.screenY);
    count++;
    console.log("after focus: " + count);
    setTimeout(function() {
      console.log("scrolling after focus delay");
      window.scrollTo(0, 1);                  
    }, 500);
     */
  });
  /*
  $allli.bind("click", function(e) {
    console.log("li.clicked");
    var $this = $(this);
    var focuses = $this.closest("ul").find("li input:focus").first();
    var targets = $this.find(jQTSettings.inputtypes.join(", ")).first();
    
    targets[0].focus();
  }); */
  /*
  each(function(i, input) {
    console.log("adding listener for: " + input.id);
    input.addEventListener("touchstart", function(e) {
      touchcount++;
      setTimeout(function() {
        console.log("touchstart");
      }, 50);
    });
    input.addEventListener("touchend", function(e) {
      setTimeout(function() {
        console.log("touchstart");
      }, 50);
    });
  });*/
  /*
  $knowninput.bind("blur", function(e) {
    var scrollX = window.pageXOffset;
    var scrollY = window.pageYOffset;
    console.log("pageX/Y: " + scrollX + "/" + scrollY +  
        " scrollX/Y: " + window.scrollX + "/" + window.scrollY + " screenX/Y: " + window.screenX + "/" + window.screenY);
    console.log("before blur: " + count);
    count--;
    setTimeout(function() {
      console.log("scrolling after blur delay");
      window.scrollTo(0, 1);                  
    }, 500);
    window.scrollTo(0, 1);
    return false;
  });
    */
  var KEY_ISCROLL_OBJ = 'iscroll_object';
  /*
  window.addEventListener('scroll', function(){
    window.scrollTo(0, 0);
  }, false);
  setTimeout(function() {
    console.log("scrolling after blur delay");
    window.scrollTo(0, 0);                  
  }, 250);
  */
}
