/**
 * Protube admin
 * Provides socket.io endpoint for admin-related tasks.
 * @module protube_admin
 */

var http_request = require('http-request');
var protube = require('../../moduleLoader').loaded.protube;

var ee = require('../../events');

var io = require('../../io').socketio;
var nsp = io.of('/protube-admin');

nsp.on("connection", function (socket) {

    console.log("[protube_admin] admin connected");

    socket.on('authenticate', function (token) {
        
        function kickHandler() {
            adminCheck(token, function(isAdmin) {
                if(!isAdmin) {
                    console.log("[protube_admin] kicking admin with token", token);
                    socket.disconnect();
                }
            });
        }

        ee.on("adminCheck", kickHandler);

        socket.on("disconnect", function() {
            ee.removeListener("adminCheck", kickHandler);
        });

        adminCheck(token, function (isAdmin) {

            if(isAdmin) {
                console.log("[protube_admin] admin authenticated");

                socket.emit("authenticated");

                socket.emit("queue", protube.getQueue());
                socket.emit("ytInfo", protube.getCurrent());
                socket.emit("progress", protube.getCurrent().progress);
                socket.emit("playerState", protube.getStatus());
                socket.emit("volume", protube.getVolume());
                socket.emit("pin", protube.getPin());

                socket.on('setTime', function (data) {
                    protube.setTime(data);
                });

                socket.on("setRadioVolume", function (data) {
                    protube.setRadioVolume(data);
                });

                socket.on("setYoutubeVolume", function (data) {
                    protube.setYoutubeVolume(data);
                });

                socket.on('skip', function () {
                    protube.getNextVideo();
                });

                socket.on('pause', function () {
                    protube.togglePause();
                });

                socket.on("add", function (data) {
                    data.token = token;
                    protube.addToQueue(data, false);
                });

                socket.on("search", function (data) {
                    protube.searchVideo(data, false, function (returnResponse) {
                        socket.emit("searchResults", returnResponse);
                    });
                });

                socket.on("move", function (data) {
                    protube.moveQueueItem(data.index, data.direction);
                });

                socket.on("veto", function (data) {
                    protube.removeQueueItem(data);
                });

                socket.on("reload", function (data) {
                    ee.emit("reloadScreens");
                });

                socket.on("soundboard", function (data) {
                    ee.emit("soundboard", data);
                });

                socket.on("protubeToggle", function () {
                    ee.emit("protubeToggle");
                });
            }

        });

    });

});

var adminCheck = function (token, callback) {
    console.log("[protube_admin] authentication requested for", token);

    http_request.get({
        url: process.env.AUTH_ENDPOINT + token
    }, function (err, res) {

        if (err) {
            console.error(err);
            return;
        }

        var user_info = JSON.parse(res.buffer.toString());

        if (user_info.is_admin) {
            callback(true);
        }else{
            callback(false);
        }
    });
};

setInterval(function () {
    var progress = protube.getCurrent().progress;
    if (progress) {
        nsp.emit("progress", progress);
    }
}, 1000);

ee.on("progressChange", function (data) {
    nsp.emit("progress", data);
});

ee.on("videoChange", function (data) {
    nsp.emit("ytInfo", protube.getCurrent());
    nsp.emit("queue", protube.getQueue());
});

ee.on("queueUpdated", function (data) {
    nsp.emit("queue", protube.getQueue());
});

ee.on("protubeStateChange", function (data) {
    nsp.emit("playerState", data);
});

ee.on("volumeChange", function (data) {
    nsp.emit("volume", data);
});

ee.on('pinChange', function(data) {
    nsp.emit("pin", data);
});