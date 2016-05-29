/**
 * Protube remote
 * Provides socket.io endpoint for Protube remotes.
 * @module protube_remote
 */

var protube = require('../../moduleLoader').loaded.protube;

var io = require('../../io').socketio;
var nsp = io.of('/protube-remote');

nsp.on("connection", function(socket) {

    var authenticated = false;
    var pin;

    console.log("[protube_remote] remote connected");

    socket.on("authenticate", function(data) {

        if(data.pin == protube.getPin()) { // pin correct

            authenticated = true;
            pin = protube.getPin();

            socket.emit("toast", "Authenticated");

            console.log("[protube_remote] remote authenticated");

            protube.generatePin();

            socket.on("add", function(data) {
                protube.addToQueue(data, socket);
            });

        }else{ // pin incorrect

            socket.emit("toast", "Not authenticated");

        }
    });

});