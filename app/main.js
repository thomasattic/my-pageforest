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

          items.handler.added({id: id, item: item});
        },
        remove: function(id, olditem) {
          //@TODO -- work to remove it from the list

          items.handler.removed({id: id, olditem: olditem});
        },
        update: function(id, item, olditem) {
          //@TODO -- work to update the item

          items.handler.updated({id: id, item: item, olditem: olditem});
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
        var i, len;
        // doc schema: {blob: {schema: 1, items: {<appid>: {icon: '', url: '', title: ''}, order: []}}}

        var hasitem = !!json && !!json.blog && !!json.blog.items;
        if (!hasitem) {
            return;
        }

        var data = json.blog;
        var keys = Arrays.keys(data.order);
        keys.sort();

        var diff = Arrays.intersect(displayedkeys, keys, false);
        for (i=0, len=diff.left.length; i<len; i++) {
            // item removed
            var id = diff.left[i];
            var olditem = displayeditems[id];
            items.handler.removed({id: id, olditem: olditem});
        }
        for (i=0, len=right.length; i<len; i++) {
            // item added
            var id = diff.right[i];
            var item = data.items[id];
            items.handler.added({id: id, item: olditem});
        }
        for (i=0, len=middle.length; i<len; i++) {
            var id = diff.middle[i];
            var item = data.items[id];
            var olditem = displayeditems[id];
            if (!Hashs.isEquals(item, olditem)) {
              // item updated
              items.handler.added({id: id, item: item, olditem: olditem});
            }
        }

        //@Feature -- determine if the order has changed
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
