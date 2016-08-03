/**
 * Protube admin
 * Provides socket.io endpoint for admin-related tasks.
 * @module protube_admin
 */

var protube = require('../../moduleLoader').loaded.protube;

var ee = require('../../events');

var io = require('../../io').socketio;
var nsp = io.of('/protube-admin');

nsp.on("connection", function(socket) {

    console.log("[protube_admin] admin connected");

    socket.emit("queue", protube.queue);
    socket.emit("ytInfo", protube.getCurrent());
    socket.emit("progress", protube.getCurrent().progress);
    socket.emit("playerState", protube.getStatus());
    socket.emit("volume", protube.getVolume());
    
    socket.on('setTime', function(data) {
        protube.setTime(data);
    });

    socket.on("setRadioVolume", function(data) {
        protube.setRadioVolume(data);
    });

    socket.on("setYoutubeVolume", function(data) {
        protube.setYoutubeVolume(data);
    });

    socket.on('skip', function() {
        protube.getNextVideo();
    });

    socket.on('pause', function() {
        protube.togglePause();
    });

    socket.on("add", function(data) {
        protube.addToQueue(data, false);
    });

    socket.on("search", function(data) {
        protube.searchVideo(data, false, function(returnResponse) {
            socket.emit("searchResults", returnResponse);
        });
    });
    
});

setInterval(function() {
    var progress = protube.getCurrent().progress;
    if(progress) {
        nsp.emit("progress", progress);
    }
}, 1000);

ee.on("progressChange", function(data) {
    nsp.emit("progress", data);
});

ee.on("videoChange", function(data) {
    nsp.emit("ytInfo", protube.getCurrent());
    nsp.emit("queue", protube.getQueue());
});

ee.on("queueUpdated", function(data) {
    nsp.emit("queue", protube.getQueue());
});

ee.on("protubeStateChange", function(data) {
    nsp.emit("playerState", data);
});

ee.on("volumeChange", function(data) {
    nsp.emit("volume", data);
});