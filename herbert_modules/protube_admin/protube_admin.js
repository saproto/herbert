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

    var ip = socket.request.connection.remoteAddress;

    console.log("[protube_admin] admin connected from", ip);

    socket.on('authenticate', function (token) {

        function kickHandler() {
            adminCheck(socket, token, function (isAdmin, _user_info) {
                if (!isAdmin) {
                    console.log("[protube_admin] kicking admin with token", token);
                    socket.disconnect();
                }
            });
        }

        ee.on("adminCheck", kickHandler);

        socket.on("disconnect", function () {
            protube.removeClient(socket);
            ee.removeListener("adminCheck", kickHandler);
            console.log("[protube_admin] admin disconnected");
        });

        adminCheck(socket, token, function (isAdmin, _user_info) {

            var user_info = _user_info;

            if (isAdmin) {
                console.log("[protube_admin] admin authenticated");

                socket.emit("authenticated");

                socket.emit("queue", protube.getQueue(true));
                socket.emit("ytInfo", protube.getCurrent());
                socket.emit("progress", protube.getCurrent().progress);
                socket.emit("playerState", protube.getStatus());
                socket.emit("volume", protube.getVolume());
                socket.emit("pin", protube.getPin());
                socket.emit('radiostations', protube.getRadioStations());
                ee.emit('clientChange');

                socket.on('setTime', function (data) {
                    protube.setTime(data);
                });

                socket.on("setRadioVolume", function (data) {
                    protube.setRadioVolume(data);
                });

                socket.on("setYoutubeVolume", function (data) {
                    protube.setYoutubeVolume(data);
                });

                socket.on("setSoundboardVolume", function (data) {
                    protube.setSoundboardVolume(data);
                });

                socket.on('skip', function () {
                    protube.getNextVideo();
                });

                socket.on('pause', function () {
                    protube.togglePause();
                });

                socket.on('togglePhotos', function () {
                    protube.togglePhotos();
                });

                socket.on("add", function (data) {
                    data.token = token;
                    protube.addToQueue(data, false, user_info, ip);
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

                socket.on("shuffleRadio", function (data) {
                    protube.shuffleRadio();
                });

                socket.on("setRadio", function(data)  {
                    protube.setRadio(data);
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

                socket.on("fullReload", function () {
                    ee.emit("petraReload");
                });

                socket.on("omnomcomReboot", function() {
                    ee.emit("omnomcomReboot");
                });

                socket.on("protubeReboot", function() {
                    ee.emit("protubeReboot");
                });

                socket.on("lampOn", function (data) {
                    http_request.get({
                        url: process.env.HELIOS_ENDPOINT + 'lampOn?secret=' + process.env.HELIOS_SECRET + '&lamp=' + data
                    }, function (err, res) {
                        //
                    });
                });

                socket.on("lampOff", function (data) {
                    http_request.get({
                        url: process.env.HELIOS_ENDPOINT + 'lampOff?secret=' + process.env.HELIOS_SECRET + '&lamp=' + data
                    }, function (err, res) {
                        //
                    });
                });
            } else {
                socket.emit("no_admin");
            }

        });

    });

});

var adminCheck = function (socket, token, callback) {
    console.log("[protube_admin] authentication requested for", token);

    http_request.get({
        url: process.env.AUTH_ENDPOINT + token
    }, function (err, res) {

        if (err) {
            console.error(err);
            return;
        }

        var user_info = JSON.parse(res.buffer.toString());

        protube.updateClient(socket, 'admin', user_info);

        if (user_info.is_admin) {
            callback(true, user_info);
        } else {
            callback(false, user_info);
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
    nsp.emit("queue", protube.getQueue(true));
});

ee.on("queueUpdated", function (data) {
    nsp.emit("queue", protube.getQueue(true));
});

ee.on("protubeStateChange", function (data) {
    nsp.emit("playerState", data);
});

ee.on("volumeChange", function (data) {
    nsp.emit("volume", data);
});

ee.on('pinChange', function (data) {
    nsp.emit("pin", data);
});

ee.on('clientChange', function () {
    nsp.emit('clients', protube.getClients());
});

ee.on('radiostationRefresh', function() {
    nsp.emit('radiostations', protube.getRadioStations());
});