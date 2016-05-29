/**
 * Protube screen
 * Provides socket.io endpoint for Protube screens.
 * @module protube_screen
 */

var protube = require('../../moduleLoader').loaded.protube;

var io = require('../../io').socketio;
var ee = require('../../events');
var nsp = io.of('/protube-screen');

nsp.on("connection", function(socket) {

    console.log("[protube_screen] screen connected");

    socket.on("screenReady", function(data) {

        console.log("[protube_screen] screen ready");

        socket.emit("queue", protube.getQueue());
        
        socket.emit("ytInfo", protube.getCurrent());
        socket.emit("progress", protube.getCurrent().progress);
        socket.emit("playerState", protube.getStatus().playing);
    });

});

ee.on("progressChange", function(data) {
    nsp.emit("progress", data);
});

ee.on("videoChange", function(data) {
    nsp.emit("ytInfo", protube.getCurrent());
});

ee.on("protubeStateChange", function(data) {
    nsp.emit("playerState", data);
});

ee.on("queueUpdated", function(data) {
    nsp.emit("queue", data);
});

function emitProgress() {
    nsp.emit("progress", protube.getCurrent().progress);
}

var emitCurrentInterval = setInterval(emitProgress, 5000);