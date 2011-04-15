//
//
//
namespace.lookup('com.pageforest.my').defineOnce(function (ns) {
    // Namespace exported properties
    // TODO: Add any additional functions that you need to access
    // from your index.html page.

    var appid;
    var displayedorder = [];
    var displayeditems = {};
    var signal = Threads.latchbinder();

    var emptyfn = function() {};
    var items = {
        name: "my.pageforest",
        username: undefined,
        handler: {added: emptyfn, removed: emptyfn, updated: emptyfn},
        appid: undefined,
        read: function(id, fn, err) {
          fn(id, displayeditems[id]);
        },
        create: function(id, item, fn, err) {
            signal.bind(function() {
                var after = undefined;
                if (!ns.client.username) {
                    if (err) {
                      var exception = {datasetname: items.name, status: '401', message: 'Not signed in.', url: '', method: 'create', kind: ''};
                      err(excepion);
                    }
                } else if (!displayeditems[id]) {
                    if ("after" in item) {
                      after = item.after;
                      if (displayedorder.indexOf(after) < 0) {
                        after = displayedorder[displayedorder.length - 1];
                      }
                      delete item.after;
                    } else {
                      after = displayedorder[displayedorder.length - 1];
                    }

                    displayeditems[id] = item;
                    displayedorder.splice(displayedorder.indexOf(after) + 1, 0, id);

                    ns.client.setDirty();
                    ns.client.save();

                    items.handler.added({id: id, item: item, after: after});
                } else {
                    console.warn("app '" + id + "' already added!");
                }
            });
        },
        remove: function(id, olditem, fn, err) {
            signal.bind(function() {
                if (displayeditems[id]) {
                    delete displayeditems[id];
                    Arrays.remove(displayedorder, displayedorder.indexOf(id));

                    ns.client.setDirty();
                    ns.client.save();

                    items.handler.removed({id: id, olditem: olditem});
                } else {
                    console.warn("app is not known! known app: " + JSON.stringify(displayeditems));
                }
            });
        },
        update: function(id, item, olditem, fn, err) {
            var event;
            signal.bind(function() {
                event = {id: id, item: item, olditem: olditem};
                if ("after" in item) {
                  var after = item.after;
                  if (after !== undefined && displayedorder.indexOf(after) < 0) {
                    after = displayedorder[displayedorder.length - 1];
                    if (after === id) {
                      after = undefined;
                    }
                  }
                  delete item.after;

                  //console.warn("== instruction   : item: " + id + " .after: " + after);
                  //console.warn("== order (before): " + JSON.stringify(displayedorder));
                  Arrays.remove(displayedorder, displayedorder.indexOf(id));
                  displayedorder.splice(displayedorder.indexOf(after) + 1, 0, id);
                  //console.warn("== order (after) : " + JSON.stringify(displayedorder));

                  event.after = after;
                }

                //ns.client.setDirty();
                //ns.client.save();

                items.handler.updated(event);
            });
        }
    };

    var documentready = [];

    var loggedin = [];

    var loggedout = [];

    ns.extend({
        'onReady': onReady,
        'onUserChange': onUserChange,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'getDocid': getDocid,
        'setDocid': setDocid,
        'items': items,
        'documentready': documentready,
        'loggedin': loggedin,
        'loggedout': loggedout,
        'signin': signin,
        'appid': appid,
        'confirmDiscard': confirmDiscard,
        'onError': onError
    });

    function signin() {
      if (!username) {
        ns.client.signIn();
      }
    }

    // This function is called when pageforest client code polled for
    // the first time.
    function onUserChange(newname) {
        username = newname;

        items.username = username;

        var fn = !!username? loggedin: loggedout;
        for (i=0, len=fn.length; i<len; i++) {
          fn[i]();
        }

        if (!username) {
          for (var id in displayeditems) {
            items.handler.removed({id: id, olditem: displayeditems[id]});
          }
        }
    }

    // This function is called when the index.html home page
    // is loaded.  Use it to initialize your application and
    // set up the Pageforest Client Library App Bar user interface.
    function onReady() {

        var clientLib = namespace.lookup('com.pageforest.client');

        // Client library for Pageforest
        ns.client = new clientLib.Client(ns);

        // Use the standard Pageforest UI widget.
        ns.client.addAppBar();

        // This app demonstrates auto-loading - will reload the doc if
        // it is changed by another user.
        ns.client.autoLoad = true;

        // Quick call to poll - don't wait a whole second to try loading
        // the doc and logging in the user.
        ns.client.poll();

    }

    function getDocid() {
        return ns.client.username;
    }

    function setDocid() {
    }

    // setDoc is called whenever your document is be reloaded.
    function setDoc(json) {
        // doc schema: {blob: {schema: 1, items: {<appid>: {icon: '', url: '', title: ''}, order: []}}}
        var i, len;

        var hasitem = !!json && !!json.blob && !!json.blob.items;
        if (!hasitem) {
            return;
        }

        var data = json.blob;

        var commonTheirOrder = Arrays.clone(data.order);
        var theirs = Arrays.clone(data.order).sort();

        var commonMyOrder = Arrays.clone(displayedorder);
        var mine = Arrays.clone(displayedorder).sort();

        var combineditems = {};

        var diff = Arrays.intersect(mine, theirs, false);
        for (i=0, len=diff.left.length; i<len; i++) {
          // item removed
          var id = diff.left[i];
          var olditem = displayeditems[id];
          items.handler.removed({id: id, olditem: olditem});
          Arrays.remove(commonMyOrder, commonMyOrder.indexOf(id));
        }
        for (i=0, len=diff.right.length; i<len; i++) {
          Arrays.remove(commonTheirOrder, commonTheirOrder.indexOf(id));
        }
        for (i=0, len=diff.middle.length; i<len; i++) {
          var event = {id: id, item: item, olditem: olditem};
          var id = commonTheirOrder[i];
          var item = data.items[id];
          var olditem = displayeditems[id];

          // @TODO -- some bug around here merging with new order
          var theirPrev, myPrev, cur;
          var after;
          if (i>0) {
            theirPrev = commonTheirOrder[i-1];
            cur = commonMyOrder.indexOf(id);
            myPrev = commonMyOrder[cur-1];
            if (myPrev !== theirPrev) {
              event.after = theirPrev;
            }
          } else {
            theirPrev = null;
            cur = commonMyOrder.indexOf(id);
            if (cur !== 0) {
              event.after = null;
            }
          }
          if (!Hashs.isEquals(item, olditem) || after === undefined) {
            // item updated
            if (after === null) after = undefined;
            items.handler.updated(event);
          }
        }
        for (i=0, len=data.order.length; i<len; i++) {
          // item added
          var id = data.order[i];
          var item = data.items[id];
          if (diff.right.indexOf(id) >= 0) {
            if (i === 0) {
              after = undefined;
            } else {
              after = data.order[i-1];
            }
            items.handler.added({id: id, item: item, after: after});
          }
        }

        displayedorder = data.order;
        displayeditems = data.items;

        signal.latch();

        // Expose appid
        items.appid = ns.client.appid;

        for (i=0, len=documentready.length; i<len; i++) {
          documentready[i]();
        }
    }

    // getDoc is called to read the state of the current document.
    function getDoc() {
        return {
          title: 'User workspace',
          blob: {
            items: displayeditems,
            order: displayedorder
          }
        };
    }

    function confirmDiscard() {
    }

    function onError() {
    }
});
