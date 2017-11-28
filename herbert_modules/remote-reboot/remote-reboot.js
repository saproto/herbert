var ee = require('../../events');
var http_request = require('http-request');

ee.on("omnomcomReboot", function() {
    http_request.get({
        url: process.env.HESTIA_ENDPOINT + '/reboot?secret=' + process.env.HESTIA_SECRET
    }, function (err, res) {
        if (err) {
            console.log("[remote-reboot] Calling reboot webhook resulted in error. " + err);
        }
    });
});

ee.on("protubeReboot", function() {
    http_request.get({
        url: process.env.IRIS_ENDPOINT + '/reboot?secret=' + process.env.IRIS_SECRET
    }, function (err, res) {
        if (err) {
            console.log("[remote-reboot] Calling reboot webhook resulted in error. " + err);
        }
    });
});