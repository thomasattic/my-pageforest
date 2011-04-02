// Scratch - a sample Pageforest Application
//
// You can modify this app as a starting point for
// your own applications.  See "TODO" markers in the source
// code below.

// TODO: Change the namespace for your application to:
//     'com.pageforest.your_app_name'
namespace.lookup('com.pageforest.my').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client');

    // This function is called when the index.html home page
    // is loaded.  Use it to initialize your application and
    // set up the Pageforest Client Library App Bar user interface.
    function onReady() {
        // TODO: You application will probably not have an id="blob"
        // element - so this line can be removed.
        $('#blob').focus();

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

    // setDoc is called whenever your document is be reloaded.
    //
    // TODO: Change this function to read the passed in json object,
    // and reconstitute your application state from it.
    function setDoc(json) {
        $('#blob').val(json.blob);
    }

    // getDoc is called to read the state of the current document.
    //
    // TODO: Convert your current state to JSON and return as the
    // 'blob' property of a json object.  Note that your application
    // state should not have any circular references between objects
    // (it should be directly representable as a JSON object).
    function getDoc() {
        return {
            "blob": $('#blob').val()
        };
    }

    // TODO: This function is for demonstration purposes only.
    // You can safely delete it.
    function onStateChange(newState, oldState) {
        // Refresh links on the page
        var url = ns.client.getDocURL();
        var link = $('#document');
        if (url) {
            link.attr('href', url + '?callback=document').show();
        }
        else {
            link.hide();
        }
        $('#mydocs').attr('href', 'http://' + ns.client.wwwHost + '/docs/');
        $('#app-details').attr('href', 'http://' + ns.client.wwwHost +
                               '/apps/' + ns.client.appid);
    }

    // Namespace exported properties
    // TODO: Add any additional functions that you need to access
    // from your index.html page.
    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        // TODO: Remove this exported name when you remove the
        // onStateChange function above.
        'onStateChange': onStateChange
    });

});
