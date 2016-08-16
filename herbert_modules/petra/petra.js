/**
 * Petra
 * Provides communication with Petra screens.
 * @module petra
 */

var ee = require('../../events');

var io = require('../../io').socketio;
var nsp = io.of('/petra');

var protubeOn = true;

var windowDefinitions = [{
    "name": "protube",
    "displayNumber": 1,
    "url": "https://www.saproto.nl/protube/screen"
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

nsp.on("connection", function(socket) {
    console.log("[petra] petra connected");

    socket.on("get-window-definitions", function(data) {
        socket.emit("loadPages", windowDefinitions);
    });
});

ee.on("soundboard", function(data) {
    nsp.emit("soundboard", data);
});