/**
 * Petra
 * Provides communication with Petra screens.
 * @module petra
 */

var http_request = require('http-request');

var ee = require('../../events');

var io = require('../../io').socketio;
var nsp = io.of('/petra');

var protube = require('../../moduleLoader').loaded.protube;

var windowDefinitions;

function updateDisplayDefinitions() {
    http_request.get({
        url: process.env.DISPLAYS_ENDPOINT
    }, function (err, res) {
        if(err) {
            console.log("[petra] error: " + err);
        } else {
            var gotDefinitions = JSON.parse(res.buffer.toString())
            var definitions = [];
            for (i in gotDefinitions) {
                var d = gotDefinitions[i];
                if (d.name === "ProTube") {
                    definitions.push({
                        'url': (protube.status.protubeOn ? d.url : "https://www.saproto.nl/protube/offline"),
                        'displayNumber': d.display
                    });
                } else {
                    definitions.push({
                        'url': d.url,
                        'displayNumber': d.display
                    });
                }
            }
            windowDefinitions = definitions;
            console.log("[radio] Displays refreshed.");
        }
    })
}

updateDisplayDefinitions();
setInterval(updateDisplayDefinitions, 10000);

nsp.on("connection", function (socket) {
    console.log("[petra] petra connected");

    socket.emit("loadPages", windowDefinitions);

    socket.on("get-window-definitions", function (data) {
        socket.emit("loadPages", windowDefinitions);
    });
});

ee.on("petraReload", function () {
    console.log("[petra] requesting reload");
    nsp.emit("loadPages", windowDefinitions);
});

ee.on("protubeStateChange", function (status) {
    updateDisplayDefinitions();
});