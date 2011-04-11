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
        handler: {added: emptyfn, removed: emptyfn, updated: emptyfn},
        appid: undefined,
        create: function(id, item, fn, err) {
            signal.bind(function() {
                if (!ns.client.username) {
                    if (err) {
                      var exception = {datasetname: items.name, status: '401', message: 'Not signed in.', url: '', method: 'create', kind: ''};
                      err(excepion);
                    }
                } else if (!displayeditems[id]) {
                    displayeditems[id] = item;
                    displayedorder.push(id);

                    ns.client.setDirty();
                    ns.client.save();

                    items.handler.added({id: id, item: item});
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
            signal.bind(function() {
                //@TODO -- work to update the item

                items.handler.updated({id: id, item: item, olditem: olditem});
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
        'appid': appid,
        'confirmDiscard': confirmDiscard,
        'onError': onError
    });

    // This function is called when pageforest client code polled for
    // the first time.
    function onUserChange(newname) {
        username = newname;

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
        var theirs = data.order.sort();
        var mine = displayedorder.sort();

        var combinedorder = [];
        var combineditems = {};

        var diff = Arrays.intersect(mine, theirs, false);
        for (i=0, len=diff.middle.length; i<len; i++) {
          var id = diff.middle[i];
          var item = data.items[id];
          var olditem = displayeditems[id];

          combinedorder.push(id);
          combineditems[id] = item;

          if (!Hashs.isEquals(item, olditem)) {
            // item updated
            items.handler.updated({id: id, item: item, olditem: olditem});
          }
        }
        for (i=0, len=diff.left.length; i<len; i++) {
            // item removed
            var id = diff.left[i];
            var olditem = displayeditems[id];
            items.handler.removed({id: id, olditem: olditem});
        }
        for (i=0, len=diff.right.length; i<len; i++) {
            // item added
            var id = diff.right[i];
            var item = data.items[id];

            combinedorder.push(id);
            combineditems[id] = item;

            items.handler.added({id: id, item: item});
        }

        //@TODO -- Feature -- determine if the order has changed
        // ...

        displayedorder = combinedorder;
        displayeditems = combineditems;

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
