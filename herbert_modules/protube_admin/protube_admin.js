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
    socket.emit("ytInfo", protube.current);
    socket.emit("progress", protube.getCurrent().progress);
    socket.emit("playerState", protube.getStatus());
    
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
    
});

ee.on("progressChange", function(data) {
    nsp.emit("progress", data);
});

ee.on("videoChange", function(data) {
    nsp.emit("ytInfo", protube.getCurrent());
    nsp.emit("queue", protube.getQueue());
});

ee.on("protubeStateChange", function(data) {
    nsp.emit("playerState", data);
});

ee.on("volumeChange", function(data) {
    nsp.emit("volume", data);
});