namespace.lookup('com.pageforest.my.controller').defineOnce(function (ns) {
    var my = namespace.lookup("com.pageforest.my");

    var IS_TOUCH = 'ontouchstart' in window;
    var IS_WEBKIT = 'WebKitCSSMatrix' in window;
    var IS_IOS = navigator.userAgent.match(/like Mac OS X/i);
    var USE_TRANSFORM = IS_WEBKIT && !IS_IOS; /* disable IOS because of a bug */

    var conf = {
        tapholdThreshold: 1000
    };

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
                itemjson.editable = (
                    appjson.owner === my.items.username
                    || appjson.writers.indexOf(my.items.username) >= 0
                );
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
                var exception = {
                      datasetname: 'my.pageforest', status: request.status,
                      essage: request.statusText, url: apppath, method: "read", kind: textStatus
                };
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
                    var appname = $target.parents("li").find("a").attr("title");
                    if (confirm("Are you surey you want to delete \"" + appname +"\"?")) {
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
                $("#appgrid").quicksand($("ul#replacement > li"), {
                      duration: 500, atomic: true, useTransform: USE_TRANSFORM
                    },
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
                    $.extend({}, event.item, {
                        url: normalizeHost(event.item.url),
                        editorurl: normalizeHost(event.item.editorurl)
                }));
                if (event.after === undefined) {
                    $("ul#replacement").append($newitem);
                } else if (event.after === '<ROOT>') {
                    console.error("Peer is 'string(null)'");
                    $("ul#replacement").prepend($newitem);
                } else {
                    var $leader = $("ul#replacement")
                          .find("li[data-launcheritemid=" + event.after + "]");

                    if ($leader.length > 0) {
                        $leader.after($newitem);
                    } else {
                        console.error("Could not find peer, '" + event.after + "'");
                        $("ul#replacement").append($newitem);
                    }
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
                if (event.after === undefined) {
                    $("ul#replacement").append($item);
                } else if (event.after === '<ROOT>') {
                    $("ul#replacement").prepend($item);
                } else {
                    var $leader = $("ul#replacement")
                          .find("li[data-launcheritemid=" + event.after + "]");

                    if ($leader.length > 0) {
                        $leader.after($item);
                    } else {
                        console.error("Could not find peer, '" + event.after + "'");
                        $("ul#replacement").append($item);
                    }
                }
            }

            quicksandQueue.queue(updateItem);
        }
    };
});
