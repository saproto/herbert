/**
 * Protube screen
 * Provides socket.io endpoint for Protube screens.
 * @module protube_screen
 */

var protube = require('../../moduleLoader').loaded.protube;

var io = require('../../io').socketio;
var ee = require('../../events');
var nsp = io.of('/protube-screen');

nsp.on("connection", function (socket) {

    console.log("[protube_screen] screen connected");

    protube.updateClient(socket, 'screen', null);

    socket.on("disconnect", function () {
        protube.removeClient(socket);
        console.log("[protube_screen] screen disconnected");
    });

    socket.on("screenReady", function (data) {

        console.log("[protube_screen] screen ready");

        socket.emit("volume", protube.getVolume());

        socket.emit("radioStation", protube.getCurrentRadioStation());

        socket.emit("queue", protube.getQueue());

        socket.emit("ytInfo", protube.getCurrent());
        socket.emit("progress", protube.getCurrent().progress);
        socket.emit("playerState", protube.getStatus());
    });

});

ee.on("progressChange", function (data) {
    nsp.emit("progress", data);
});

ee.on("videoChange", function (data) {
    nsp.emit("ytInfo", protube.getCurrent());
});

ee.on("protubeStateChange", function (data) {
    nsp.emit("playerState", data);
});

ee.on("queueUpdated", function (data) {
    nsp.emit("queue", data);
});

ee.on("radioStation", function (data) {
    nsp.emit("radioStation", data);
});

ee.on("volumeChange", function (data) {
    nsp.emit("volume", data);
});

ee.on("reloadScreens", function () {
    console.log("[protube_screen] reload command sent to all screens");
    nsp.emit("reload");
});

ee.on("soundboard", function (data) {
    console.log("[protube_screen] requesting soundboard sound", data);
    nsp.emit("soundboard", data);
});

function emitProgress() {
    nsp.emit("progress", protube.getCurrent().progress);
}