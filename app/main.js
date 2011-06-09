<!DOCTYPE html>
<html>
<!--<html manifest="app.manifest">-->
  <head>
  <title>Pageforest</title>
  <link rel="icon" type="image/png" href="/images/icon.png" />
  <link rel="apple-touch-icon" href="/images/touch.png" />
  <link rel="stylesheet" type="text/css" href="/lib/beta/css/client.css" />
  <style type="text/css" media="screen">@import "./jslib/jqtouch/jqtouch/jqtouch.css";</style>
  <style type="text/css" media="screen">@import "./jslib/jqtouch/themes/apple/theme.css";</style>
  <style type="text/css" media="screen">
    html, body {
       min-height: 100%;
    }

    body {
       -webkit-box-shadow: inset 1px 1px 10px rgba(127, 127, 127, 0.75);
       background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #AAA), color-stop(0.5, #999), color-stop(0.5, #999), color-stop(1, #666));
       background-image: -moz-linear-gradient(top, #AAA, #999 50%, #999 50%, #666);
       background-repeat: repeat-x;
       background-color: darkgrey;
    }

    #jqt > div#z-launcherpane, #jqt > form, #jqt > div {
       background-image: none;
       background-color: transparent;
    }

    #jqt > #z-launcherpane ul.grid {
       display: block;
       background-image: none;
       background-colo: transparent;
    }

    #jqt > #z-launcherpane ul.grid li {
       display: block;
       float: left;
       -moz-user-select: none;
       -moz-user-select: -moz-none;
       -webkit-user-drag: none;
       -webkit-transform: translate(0,0); -moz-transform: translate(0,0); -o-transform: translate(0,0);
    }
    #jqt > #z-launcherpane ul.grid li.start {
       -webkit-transition-property: -webkit-transform; -moz-transition-property: -moz-transform; -o-transition-property: -o-transform;
       -webkit-transition-duration: 500ms; -moz-transition-duration: 500ms; -o-transition-duration: 500ms;
       -webkit-transition-timing-function: linear; -moz-transition-timing-function: linear; -o-transition-timing-function: linear;
    }
    #jqt > #z-launcherpane ul.grid li > a {
      display: block;
      -moz-user-select: none;
      -moz-user-select: -moz-none;
      -webkit-user-drag: none;
    }

    #jqt > #z-launcherpane ul.grid li .icon {
       background-color: #EEE;
    }

    body #phantom, body .phantom {
      display: block; position: absolute;
      width: 64px; height: 64px;
      background-color: rgba(255, 255, 255, 0.5);
      -webkit-border-radius: 8px; -moz-border-radius: 8px; border-radius: 8px;
      -webkit-user-drag: none;
      cursor: pointer;
      z-index: 5; opacity: 0.7;
      background-repeat: no-repeat;
      -webkit-background-size: contain;
      background-size: contain;
      background-position: 50% 50%;
      -webkit-background-origin: content-box;
      -webkit-transition-duration: 150ms;
      -webkit-transition-timing-function: linear;
      -webkit-transition-property: width, height;
    }

    body #phantom.active, body .phantom.active {
      width: 68px; height: 68px;
    }

    .invisible {
      visibility: hidden;
    }

    @media only screen and (min-device-width: 768px) {
      #jqt > #z-launcherpane ul.grid li .icon {
         width: 64px;
         height: 64px;
      }
      #jqt > #z-launcherpane ul.grid li {
         margin: 30px;
      }
      #jqt > #z-launcherpane ul.grid li .icon .mask {
         background-image: -webkit-gradient(radial, 50% -58%, 35, 50% -35%, 190, from(rgba(255, 255, 255, 0.347656)), color-stop(0.03, rgba(255, 255, 255, 0.296875)), color-stop(0.22, rgba(239, 239, 239, 0)), color-stop(0.22, rgba(31, 31, 31, 0.199219)), color-stop(0.35, rgba(127, 127, 127, 0.0976563)), color-stop(0.38, rgba(239, 239, 239, 0.0976563)), to(rgba(255, 255, 255, 0)));
      }
    }

    .buttonbar {
      position: fixed;
      top: 0; left: 0;
      height: 35px;
      -webkit-border-radius: 0 0 6px 6px; -moz-border-radius: 0 0 6px 6px; border-radius: 0 0 6px 6px;
      background-image: -webkit-gradient(linear, left top, left bottom,
        from(#EEFDE9), color-stop(0.05, #EEFDE9), color-stop(0.5, #BAF2A8), color-stop(0.5, #B3E8A0), to(#AAEE95));
      background-image: -moz-linear-gradient(top, #EEFDE9, #E4FBDD 5%, #BAF2A8 50%, #B3E8A0 50%, #AAEE95);
      background-color: #AAEE95;
      font-family: Verdana, Arial, san-serif;
      font-size: 14px;
      margin-left: 16px;
      padding: 0 5px;
      z-index: 2;
    }

    .buttonbar.shifted {
      left: 60px;
    }

    body:not(.debug) .buttonbar.shifted {
      display: none;
    }

    .buttonbar span {
      box-sizing: border-box;
      margin: 4px;
      line-height: 27px;
      float: left;
      color: #464646;
    }

    .buttonbar span:hover, .buttonbar span:active {
      color: #000;
      background-color: #D2E6B3;
      cursor: pointer;
    }

    body:not(.editmode) .buttonbar {
      display: none;
    }

    #jqt:not(.initstate) .showoninit {
       display: none;
    }

    #jqt:not(.nouserstate) .showonnouser {
       display: none;
    }

    #pfSave,
    .nonpage,
    .hidden,
    .hidden > * {
       display: none;
    }

    #jqt .emboss {
      display: block; position: relative;
      -webkit-box-sizing: border-box;
      width: 100%; line-height: 20px;
      padding: 15px; padding-top: 20% !important;
      border-top: 1px solid rgba(76, 86, 108, .3);
      color: rgb(76, 76, 76);
      font-size: 16px; font-weight: bold; text-shadow: rgba(255,255,255,.8) 0 1px 0;
      text-align: center;
    }
  </style>

  <script>
    // For offline - capable applications
    function handleAppCache() {
      if (typeof applicationCache == 'undefined') {
          return;
      }
      if (applicationCache.status == applicationCache.UPDATEREADY) {
          applicationCache.swapCache();
          location.reload();
          return;
      }
      applicationCache.addEventListener('updateready', handleAppCache, false);
    }

    //handleAppCache();
  </script>
  <!--
     These scripts provide access to the standard Client library
     for Pageforest apps.  jQuery and JSON, are also required
     by the Client library.

     Note that the "beta" versions of the library are used.  These
     are the most up to date versions.  You can change "beta" to
     "0.6" if you want the latest frozen version of the libraries.

     API reference: http://code.google.com/p/pageforest/wiki/ClientLibrary
    -->
  <script src="/lib/beta/js/pf-client.js" type="application/x-javascript" charset="utf-8"></script>

  <script src="./jslib/lib/jquery.tmpl.min.js" type="application/x-javascript" charset="utf-8"></script>
  <script src="./jslib/beedesk/utilities.js" type="application/x-javascript" charset="utf-8"></script>

  <script src="./jslib/jqtouch/jqtouch/jqtouch.js" type="application/x-javascript" charset="utf-8"></script>
  <script src="./dnd.js" type="application/x-javascript" charset="utf-8"></script>
  <script src="./jslib/touchlayer/src/gestures.js" type="application/x-javascript" charset="utf-8"></script>
  <script src="./jslib/lib/jquery.quicksand.js" type="application/x-javascript" charset="utf-8"></script>

  <script src="model.js" type="text/javascript"></script>

  <script type="text/javascript">
  namespace.lookup('com.pageforest.my.controller').defineOnce(function (ns) {
    var my = namespace.lookup("com.pageforest.my");

    var IS_TOUCH = 'ontouchstart' in window;

    var conf = {
      tapholdThreshold: 1000
    }

    // Setup jQTouch with options
    jqt = $.jQTouch({
      updatehash: false,
      hashquery: true,
      clearInitHash: false
    });

    // Call the onReady function of the application when the page is loaded.
    $(document).ready(my.onReady);

    // If user has logged in and then logoff, we refresh the page to avoid any
    // leftover data from previous session.
    var loggedin;
    my.loggedin.push(function() {
      loggedin = true;
    });
    my.loggedout.push(function() {
      if (loggedin) window.location.reload();
    });

    // <Application Adding>
    // Add application should wait until setDoc() is first called
    var modelReadyLatch = Threads.latchbinder();
    my.modelReady.push(modelReadyLatch.latch);
    function addApp(appid, options, fn, err) {
      // ajax on that:
      var itemjson = {};
      var apppath = '/mirror/' + appid + '/app.json';
      $.ajax({
        type: 'GET',
        url: apppath,
        dataType: 'json',
        beforeSend: function(xhr) {},
        success: function(appjson) {
          var iconurl = '/static/images/icon.png';
          if (appjson.icon) {
              iconurl = '/mirror/' + appid + '/' + appjson.icon;
          }

          itemjson.icon = iconurl;
          itemjson.url = appjson.url;
          itemjson.appid = appid;
          itemjson.title = appjson.title;
          itemjson.editable = (appjson.owner === my.items.username || appjson.writers.indexOf(my.items.username) >= 0);
          itemjson.app = appjson;
          itemjson.editorurl = "http://editor.pageforest.com/#" + appid;

          if (options && options.staple) {
            itemjson.staple = true;
          }

          // itemjson: {<appid>: {icon: '', url: '', title: ''}
          my.items.create(appid, itemjson, function() {
            if (fn) {
              fn(appid, itemjson);
            }
          }, err);
        },
        error: function(request, textStatus, errorThrown) {
          var exception = {datasetname: 'my.pageforest', status: request.status, message: request.statusText, url: apppath, method: "read", kind: textStatus};
          exception.nested = {request: request, status: textStatus, exception: errorThrown};
          if (err) {
            err(exception);
          }
        }
      });
    };

    // Map Pageforest URL's to be relative to current domain (for non-pageforest.com hosting).
    function normalizeHost(url) {
        var appHost = window.location.host;
        url = url.replace(/\.pageforest\.com/, appHost.substr(appHost.indexOf('.')));
        return url;
    }

    // reference: http://code.google.com/p/pageforest/source/browse/appengine/auth/middleware.py::referer_is_trusted
    var referers;
    function check(allowed, referer) {
      var i, len;
      for (i=0, len=allowed.length; i<len; i++) {
         var prefix = allowed[i];
         if (Strings.startsWith(referer, prefix)
             || Strings.startsWith(referer.replace('http://', 'https://'), prefix)) {
           return true;
         }
      }
      return false;
    }

    // Manage display to indicate state
    modelReadyLatch.bind(function() {
      $("#jqt").removeClass("initstate");
      $("#jqt").removeClass("nouserstate");
    });
    my.loggedout.push(function() {
      if (!loggedin) {
        $("#jqt").removeClass("initstate");
        $("#jqt").addClass("nouserstate");
      }
    });

    // Optional: Use code to ensure user always has our icons
    $(document).ready(function() {
      addApp('editor', {staple: true});
    });

    function checkInstall() {
      var hash = window.location.hash.substr(1);
      window.location.hash = '';
      hash = hash.replace(/installapp=(.+)$/, "$1");
      if (hash) {
        addApp(hash);
      }
    }
    setInterval(checkInstall, 1000);

    // Logical Actions
    var actions = {
      removeApp: function(event) {
        var $target = $(this.currentTarget || this);
        var appid = $target.parents("li").attr("data-launcheritemid");
        if (appid) {
          my.items.remove(appid, function() {
            if (fn) {
              fn(appid, itemjson);
            }
          }, function() {
            console.warn("error on item removed.");
          });
        }
      },
      enterEditMode: function() {
        $("ul#appgrid").addClass("editmode");
        $('body').addClass("editmode");

        dnd.start();
      },
      exitEditMode: function() {
        $("ul#appgrid.editmode").removeClass("editmode");
        $('body').removeClass("editmode");
        $("ul#appgrid > li").removeClass("invisible active");

        dnd.stop();
      },
      randomize: function() {
        var list = [];
        $("ul#appgrid > li").each(function(i, item) {
          list.push($(item).attr("data-launcheritemid"));
        });
        list.sort(function() {return 0.5 - Math.random();});

        $("ul#appgrid > li").each(function(i, item) {
          my.items.read($(item).attr("data-launcheritemid"), function(id, item) {
            if (list[i] !== id) {
              item.after = list[i];
            } else {
              item.after = undefined;
            }
            my.items.update(id, item);
          });
        });
      }
    };

    // UI Events
    var dnd = new DragAndDropHandler({
      container: "ul#appgrid",
      onMove: function(id, afterid, fn) {
        my.items.read(id, function(id, item) {
          item.after = afterid;
          my.items.update(id, item, fn);
        });
      },
      onDragStarted: function() {
        //if (IS_TOUCH) {
          $("ul#appgrid").addClass("noshake");
          $("ul#replacement").addClass("noshake");
        //}
      },
      onDragEnded: function() {
        //if (IS_TOUCH) {
          $("ul#appgrid").removeClass("noshake");
          $("ul#replacement").removeClass("noshake");
        //}
      },
      onIdle: function() {
        actions.exitEditMode();
      },
      tapholdThreshold: conf.tapholdThreshold,
      activateOnTaphold: true,
      duration: 500,
      margin: 30
    });

    $(document).ready(function() {
      gt(document).on('doubletap', actions.exitEditMode);
      gt("#exitedit").on("tap", actions.exitEditMode, false);
      gt("#randomize").on("tap", actions.randomize, false);
    });

    function animationEnded() {
      dnd.notifyAnimationEnded();
    };
    function animationStarted() {
      dnd.notifyAnimationStarted();
    };

    function prepItem(newitem) {
      var $newitem = $(newitem);
      gt(newitem).on('taphold', actions.enterEditMode, {retain: conf.tapholdThreshold});

      var $deleteicon = $newitem.find(".deleteicon");
      gt($deleteicon[0]).on('tap', function(event) {
        var $target = $(this.currentTarget || this); // support both gt() and $()
        var $parent = $target.parents("ul.grid.editmode");
        if ($parent.length > 0) {
          if (!$target.hasClass("nodelete")) {
            if (confirm("Are you surey you want to delete \"" + $target.parents("li").find("a").attr("title") +"\"?")) {
              actions.removeApp.apply(this, arguments);
            }
          }
        }
      }, false);
      $deleteicon.bind("mousedown touchstart", false);
      $deleteicon.bind("tap", false);

      var $editoricon = $newitem.find(".editoricon");
      $editoricon.bind("mousedown touchstart", function(e) {
        // important! prevent the icon and dnd code picking the event up
        e.stopPropagation();
      });
      $editoricon.bind("click", function(e) {
        // important! prevent the icon and dnd code picking the event up
        e.stopPropagation();
        actions.exitEditMode();
      });

      if (("standalone" in window.navigator) && window.navigator.standalone) {
        // let the default handler do the job. the only way to launch
        // a browser external.
      } else {
        // use our own handler to avoid launching the href page if your user
        // flick. Help avoid accidential launch when user intent to enter edit mode
        gt(newitem).on('tap', function(event) {
          var $target = $(this.currentTarget || this); // support both gt() and $()
          if ($target.parents("ul.grid.editmode").length === 0) {
            console.warn("a? " + $target.find("a").length);
            var href = $target.find("a").attr("href");
            var target = $target.attr("target");
            if (href) {
              window.open(href, "_blank");
            } else {
              console.warn("Cannot located href.");
            }
          }
        }, {expire: (conf.tapholdThreshold - 25)});
        $newitem.bind("mousedown touchstart", function(event) {
          event.preventDefault();
        });
        $newitem.bind("tap", false);
        $newitem.bind("click", false);
      }

      $newitem.css('-webkit-touch-callout', 'none');
      $newitem.css('-webkit-user-drag', 'none');
    }

    // Special queue mechanism to handle add/remove animation.
    // It queues up action if animation is in progress.
    var quicksandQueue = (function() {
      // @TODO generalize this function into a generic utility
      var i, len, list;
      function launch(pre, fn) {
        var i, len;
        if (list.length > 0) {
          pre();
          for (i=0, len=list.length; i<len; i++) {
            list[i]();
          }
          list = [];
          $("#appgrid").quicksand($("ul#replacement > li"), {duration: 500, atomic: true},
            function() {
              launch(pre, fn);
            }
          );
          animationStarted();
        } else {
          fn();
          list = undefined;
        }
      };
      function tickle() {
        if (list === undefined) {
          list = [];
          setTimeout(function() {
            // launch quicksand
            launch(function() {
              // prep a replacement section
              $("ul#replacement").children().remove();
              $("ul#appgrid > li").each(function(i, item) {
                var $cloneitem = $(item).clone();
                $cloneitem.appendTo($("ul#replacement"));
              });
            }, function() {
              $("ul#appgrid > li").each(function(i, item) {
                prepItem(item);
              });
              animationEnded();
            });
          }, 10);
        }
      };
      function queue(fn) {
        tickle();
        list.push(fn);
      };
      return {queue: queue};
    }());

    // Items handler listens to CRUD events from model
    my.items.handler = {
      added: function(event) {
        function addItem() {
          var $newitem = $("#launcheritem-template").tmpl(
            $.extend({}, event.item, {url: normalizeHost(event.item.url),
                                      editorurl: normalizeHost(event.item.editorurl)}));
          if ("after" in event) {
            if (event.after !== undefined) {
              var $leader = $("ul#replacement").find("li[data-launcheritemid=" + event.after + "]");
              if ($leader.length > 0) {
                $leader.after($newitem);
              } else {
                console.error("Could not find peer, '" + event.after + "'");
                $("ul#replacement").append($newitem);
              }
            } else {
              $("ul#replacement").prepend($newitem);
            }
          } else {
            $("ul#replacement").append($newitem);
          }
        };
        quicksandQueue.queue(addItem);
      },
      removed: function(event) {
        function removeItem() {
          var appid = event.id;
          $("ul#replacement > li[data-launcheritemid=" + appid + "]").remove();
        }
        quicksandQueue.queue(removeItem);
      },
      updated: function(event) {
        function updateItem() {
          var appid = event.id;
          var $item = $("ul#replacement > li[data-launcheritemid=" + appid + "]");
          if ("after" in event) {
            if (event.after !== undefined) {
              var $leader = $("ul#replacement").find("li[data-launcheritemid=" + event.after + "]");
              if ($leader.length > 0) {
                $leader.after($item);
              } else {
                console.error("Could not find peer, '" + event.after + "'");
                $("ul#replacement").append($item);
              }
            } else {
              $("ul#replacement").prepend($item);
            }
          } else {
            console.log("No change in position for '" + appid + "'");
          }
        }
        quicksandQueue.queue(updateItem);
      }
    };
  });
  </script>
  <script id="launcheritemgroup-template" type="text/x-jquery-tmpl">
    <ul id="${id}" class="grid"></ul>
  </script>
  <script id="launcheritem-template" type="text/x-jquery-tmpl">
    <li data-id="${appid}" data-launcheritemid="${appid}" class="{{if staple}} nodelete{{/if}} {{if editable}}{{else}} noeditor{{/if}}" draggable="false">
      <a href="${url}" title="${title}" target="_blank" draggable="false">
        <div class="icon" style="background-image: url(${icon});"><div class="mask"></div></div>
      </a>
      <div class="deleteicon">X</div>
      <div><a class="editoricon" href="${editorurl}" target="_blank">E</a></div>
    </li>
  </script>
  </head>
  <body>
    <div id="jqt" class="initstate unfixed">
    <div id="z-launcherpane" class="pane form" section="aside">
      <ul id="appgrid" class="grid"></ul>
      <div class="showoninit emboss">
          <div class="spinner animate" style="width: 26px; height: 26px; margin: -8px 0;">
              <div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div>
              <div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div>
              <div class="bar9"></div><div class="bar10"></div><div class="bar11"></div><div class="bar12"></div>
          </div>Loading</div>
      <div class="showonnouser emboss">Please sign in</div>
    </div>
    </div>
    <div>
      <ul class="hidden" id="replacement"></ul>
    </div>
    <div class="nonpage">
      <!--
         Standard Google Analytics tracking.  This can be removed from your own app,
         or replaced with your own account id.
        -->
      <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-2072869-7']);
        _gaq.push(['_trackPageview']);

        (function() {
          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
          ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') +
              '.google-analytics.com/ga.js';
          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
      </script>
    </div> <!-- page -->
    <div class="buttonbar">
      <span id="exitedit">Done</span>
    </div>
    <div class="buttonbar shifted">
      <span id="randomize">Randomize</span>
    </div>
  </body>
</html>
