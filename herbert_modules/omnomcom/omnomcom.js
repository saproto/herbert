var ee = require('../../events');
var http_request = require('http-request');

ee.on("omnomcomReboot", function() {
    console.log(process.env.HESTIA_ENDPOINT + '/reboot?secret=' + process.env.HESTIA_SECRET);
    http_request.get({
        url: process.env.HESTIA_ENDPOINT + '/reboot?secret=' + process.env.HESTIA_SECRET
    }, function (err, res) {
        if (err) {
            console.log("[omnomcom] Calling reboot webhook resulted in error. " + err);
        }
    });
});