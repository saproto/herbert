/**
 * Petra
 * Provides communication with Petra screens.
 * @module petra
 */

var ee = require('../../events');

var io = require('../../io').socketio;
var nsp = io.of('/petra');

var protubeOn = true;

var windowDefinitions = function() {
    return [{
            "name": "protube",
            "displayNumber": 1,
            "url": (protubeOn ? "https://www.saproto.nl/protube/screen" : "https://www.saproto.nl/images/application/protube_offline.png")
        },
        {
            "name": "smartxp",
            "displayNumber": 3,
            "url": "https://www.saproto.nl/smartxp"
        },
        {
            "name": "narrowcasting",
            "displayNumber": 0,
            "url": "https://www.saproto.nl/narrowcasting"
        }];
};

nsp.on("connection", function(socket) {
    console.log("[petra] petra connected");

    socket.emit("loadPages", windowDefinitions());

    socket.on("get-window-definitions", function(data) {
        socket.emit("loadPages", windowDefinitions());
    });
});

ee.on("soundboard", function(data) {
    nsp.emit("soundboard", data);
});

ee.on("protubeToggle", function() {
    protubeOn = !protubeOn;
    nsp.emit("loadPages", windowDefinitions());
});