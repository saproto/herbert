/**
 * Protube remote
 * Provides socket.io endpoint for Protube remotes.
 * @module protube_remote
 */

var http_request = require('http-request');
var moment = require('moment');
require("moment-duration-format");

var protube = require('../../moduleLoader').loaded.protube;

var io = require('../../io').socketio;
var ee = require('../../events');
var nsp = io.of('/protube-remote');

ee.on("videoChange", function(data) {
    nsp.emit("ytInfo", protube.getCurrent());
});

ee.on("queueUpdated", function(data) {
    nsp.emit("queue", data);
});

nsp.on("connection", function(socket) {

    var authenticated = false;
    var pin;

    socket.emit("queue", protube.getQueue());
    socket.emit("ytInfo", protube.getCurrent());

    console.log("[protube_remote] remote connected");

    socket.on("authenticate", function(data) {

        if(data.pin == protube.getPin()) { // pin correct

            authenticated = true;
            pin = protube.getPin();

            socket.emit("authenticated", true);
            socket.emit("toast", "Authenticated");

            console.log("[protube_remote] remote authenticated");

            protube.generatePin();

            setTimeout(function() {
                socket.disconnect();
                console.log("[protube_remote] remote timed out");
            }, process.env.REMOTE_TIMEOUT * 1000);

            socket.on("add", function(data) {
                protube.addToQueue(data, socket);
            });
            
            socket.on("search", function(data) {
                http_request.get({
                    url: 'https://www.googleapis.com/youtube/v3/search?key=' + process.env.YOUTUBE_API_KEY + '&part=snippet&maxResults=50&regionCode=nl&videoEmbeddable=true&type=video&q=' + data,
                }, function(err, res) {

                    var searchResponse = JSON.parse(res.buffer.toString());
                    
                    var commaId = '';
                    
                    for(var i = 0; i<searchResponse.items.length; i++) {
                        commaId += searchResponse.items[i].id.videoId + ',';
                    }

                    commaId = commaId.substr(0, commaId.length-1);

                    http_request.get({
                        url: 'https://www.googleapis.com/youtube/v3/videos?key=' + process.env.YOUTUBE_API_KEY + '&part=contentDetails&maxResults=50&id='+commaId
                    }, function(err, res) {

                        var detailsResponse = JSON.parse(res.buffer.toString());

                        var returnResponse = [];

                        for(var i = 0; i<detailsResponse.items.length; i++) {

                            var duration = moment.duration(detailsResponse.items[i].contentDetails.duration);

                            if(duration.asSeconds() < process.env.YOUTUBE_MAX_DURATION) {
                                returnResponse.push({
                                    "id" : searchResponse.items[i].id.videoId,
                                    "title" : searchResponse.items[i].snippet.title,
                                    "channelTitle" : searchResponse.items[i].snippet.channelTitle,
                                    "duration" : duration.format("mm:ss")
                                });
                            }
                        }

                        socket.emit("searchResults", returnResponse);

                    });
                });
            });

        }else{ // pin incorrect

            socket.emit("authenticated", false);
            socket.emit("toast", "Not authenticated");

        }
    });

});