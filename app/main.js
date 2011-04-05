//
// Modified copy of Scratch's main.js
//
namespace.lookup('com.pageforest.my').defineOnce(function (ns) {
    var displayedkeys = [];
    var displayedorder = [];
    var displayeditems = {};

    var emptyfn = function() {};
    var items = {
        handler: {added: emptyfn, removed: emptyfn, updated: emptyfn},
        create: function(id, item) {
          //@TODO -- work to add it to the list

          items.handler.added({entryId, id, entry: item});
        },
        remove: function(id, olditem) {
          //@TODO -- work to remove it from the lsit

          items.handler.removed({entryId, id, entry: item});
        },
        update: function(id, item, olditem) {
          //@TODO -- work to update the item

          items.handler.updated({entryId, id, entry: item});
        }
    };

    var clientLib = namespace.lookup('com.pageforest.client');

    // Set to a large number to save battery on mobile phone,
    // we will use setDirty() & save() explicitly
    // clientLib.pollInterval = 10000000;

    // This function is called when the index.html home page
    // is loaded.  Use it to initialize your application and
    // set up the Pageforest Client Library App Bar user interface.
    function onReady() {
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

        var hasitem = !!json && !!json.blog && !!json.blog.items;
        if (!hasitem) {
            return;
        }

        var data = json.blog;
        var keys = Arrays.keys(data.order);
        keys.sort();

        var diff = Arrays.intersect(displayedkeys, keys, false);
        for (var i=0, len=left.length; i<len; i++) {
            // item removed
          if (!!items.handler) {
            items.handler.removed({entryId: left[i], entry: data[left[i]]});
          }
        }
        for (var i=0, len=right.length; i<len; i++) {
            // item added
            items.handler.added({entryId: right[i], entry: data[right[i]]});
        }

        //@TODO -- determine if the order has changed
        // ...

        displayedkeys = keys;
        displayeditem = json.blog.items;
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
        'items': items
    });
});
