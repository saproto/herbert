/**
 * Protube remote
 * Provides socket.io endpoint for Protube remotes.
 * @module protube_remote
 */

var http_request = require('http-request');

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

    socket.emit("queue", protube.getQueue());
    socket.emit("ytInfo", protube.getCurrent());

    console.log("[protube_remote] remote connected");

    socket.on("authenticate", function(data) {

        if(data.pin == protube.getPin()) { // pin correct

            authenticated = true;
            pin = protube.getPin();

            socket.emit("authenticated", true);
            socket.emit("toast", "Authenticated");

            console.log("[protube_remote] remote authenticated");

            protube.generatePin();

            socket.on("add", function(data) {
                protube.addToQueue(data, socket);
            });
            
            socket.on("search", function(data) {
                http_request.get({
                    url: 'https://www.googleapis.com/youtube/v3/search?key=' + process.env.YOUTUBE_API_KEY + '&part=snippet&maxResults=15&regionCode=nl&videoEmbeddable=true&type=video&q=' + data,
                }, function(err, res) {
                    var response = JSON.parse(res.buffer.toString());
                    var 

                    http_request.get({
                        url: 'https://'
                    })

                    socket.emit("searchResults", response);
                });
            });

        }else{ // pin incorrect

            socket.emit("authenticated", false);
            socket.emit("toast", "Not authenticated");

        }
    });

});