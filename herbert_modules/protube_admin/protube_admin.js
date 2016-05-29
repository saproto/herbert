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

    console.log("admin connected");

    socket.emit("queue", protube.queue);
    socket.emit("ytInfo", protube.current);
    
    socket.on('setTime', function(data) {
        protube.setTime(data);
    });

    socket.on('skip', function() {
        protube.getNextVideo();
    });
    
});

/**
 * Emits current video to all connected screens.
 * This should run on a 1 second interval.
 */
function emitCurrent() {
    nsp.emit("ytInfo", protube.getCurrent());
}

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

var emitCurrentInterval = setInterval(emitCurrent, 5000);