//
// Modified copy of Scratch's main.js
//
namespace.lookup('com.pageforest.my').defineOnce(function (ns) {
    var appid;
    var displayedorder = [];
    var displayeditems = {};

    var emptyfn = function() {};
    var items = {
        handler: {added: emptyfn, removed: emptyfn, updated: emptyfn},
        create: function(id, item) {
          if (!displayeditems[id]) {
            displayeditems[id] = item;
            displayedorder.push(id);

            ns.client.setDirty();
            ns.client.save();

            items.handler.added({id: id, item: item});
          } else {
            console.warn("app already added!");
          }
        },
        remove: function(id, olditem) {
          if (displayeditems[id]) {
            delete displayeditems[id];
            Arrays.remove(displayedorder, displayedorder.indexOf(id));

            ns.client.setDirty();
            ns.client.save();

            items.handler.removed({id: id, olditem: olditem});
          } else {
            console.warn("app is not known!");
          }
        },
        update: function(id, item, olditem) {
          //@TODO -- work to update the item

          items.handler.updated({id: id, item: item, olditem: olditem});
        }
    };

    var clientLib = namespace.lookup('com.pageforest.client');

    // Client library for Pageforest
    ns.client = new clientLib.Client(ns);

    // Expose appid
    appid = ns.client.appid;

    // Set to a large number to save battery on mobile phone,
    // we will use setDirty() & save() explicitly
    // clientLib.pollInterval = 10000000;

    // This function is called when the index.html home page
    // is loaded.  Use it to initialize your application and
    // set up the Pageforest Client Library App Bar user interface.
    function onReady() {

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

    // Namespace exported properties
    // TODO: Add any additional functions that you need to access
    // from your index.html page.
    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'getDocid': getDocid,
        'setDocid': setDocid,
        'items': items,
        'appid': appid
    });
});
