/**
 * Petra
 * Provides communication with Petra screens.
 * @module petra
 */

var ee = require('../../events');

var io = require('../../io').socketio;
var nsp = io.of('/petra');

nsp.on("connection", function(socket) {
    console.log("[petra] petra connected");
});

ee.on("soundboard", function(data) {
    nsp.emit("soundboard", data);
});