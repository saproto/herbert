/**
 * Protube remote
 * Provides socket.io endpoint for Protube remotes.
 * @module protube_remote
 */

var http_request = require('http-request');
var moment = require('moment');
require("moment-duration-format");

var protube = require('../../moduleLoader').loaded.protube;

var io = require('../../io').socketio;
var ee = require('../../events');
var nsp = io.of('/protube-remote');

ee.on("videoChange", function(data) {
    nsp.emit("ytInfo", protube.getCurrent());
});

ee.on("queueUpdated", function(data) {
    nsp.emit("queue", data);
});

nsp.on("connection", function(socket) {

    var authenticated = false;
    var pin;
    var token = null;

    socket.emit("queue", protube.getQueue());
    socket.emit("ytInfo", protube.getCurrent());

    console.log("[protube_remote] remote connected");

    socket.on("token", function(_token) {
        token = _token;
        console.log("[protube_remote] remote sent token", token);
    });

    socket.on("authenticate", function(data) {

        if(data.pin == protube.getPin()) { // pin correct

            authenticated = true;
            pin = protube.getPin(); // Store PIN for this socket.

            socket.emit("authenticated", true);
            socket.emit("toast", "Authenticated");

            console.log("[protube_remote] remote authenticated");

            protube.generatePin();

            setTimeout(function() {
                socket.disconnect();
                console.log("[protube_remote] remote timed out");
            }, process.env.REMOTE_TIMEOUT * 1000);

            socket.on("add", function(data) {
                data.token = token;
                data.pin = pin;
                protube.addToQueue(data, true);
            });
            
            socket.on("search", function(data) {
                protube.searchVideo(data, true, function(returnResponse) {
                    socket.emit("searchResults", returnResponse);
                });
            });

        }else{ // pin incorrect

            socket.emit("authenticated", false);
            socket.emit("toast", "Not authenticated");

        }
    });

});