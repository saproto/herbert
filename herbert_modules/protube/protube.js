/**
 * Protube main module
 * Central point for storing Protube data and keeping it current.
 * @module protube
 */

var http_request = require('http-request');

var ee = require('../../events');

var queue = [];
var current = {};
var pin = 0;

generatePin();

var status = {
    "playing" : false,
    "paused" : false
};

module.exports.queue = queue;
module.exports.current = current;
module.exports.status = status;

/**
 * Export for getNextVideo function.
 */
module.exports.getNextVideo = function() {
    getNextVideo();
}

/**
 * Returns current video
 * @returns {{current}}
 */
module.exports.getCurrent = function() {
    return current;
};

/**
 * Returns Protube queue
 * @returns {Array}
 */
module.exports.getQueue = function() {
    return queue;
};

/**
 * Returns playback status
 * @returns {{playing: boolean, paused: boolean}}
 */
module.exports.getStatus = function() {
    return status;
};

/**
 * Sets progress to given time in seconds.
 * @param time
 */
module.exports.setTime = function(time) {
    current.progress = time;
    ee.emit("progressChange", current.progress);
};

/**
 * Toggles pause status for Protube
 */
module.exports.togglePause = function() {
    if(status.paused) status.paused = false;
    else status.paused = true;
    ee.emit("protubeStateChange", status);
};

/**
 * Returns current pin
 * @returns {number}
 */
module.exports.getPin = function() {
    return pin;
};

/**
 * Generates a new pin. To be called when PIN has been used.
 */
module.exports.generatePin = function() {
    generatePin();
};


/**
 * Pads number with zeroes to get constant length.
 *
 * @param number
 * @param length
 * @returns {string}
 */
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}


/**
 * Generates new pin
 */
function generatePin() {
    pin = pad(Math.round( Math.random() * 1000 ), 3);
    ee.emit("pinChange", pin);
}

/**
 * Adds video to Protube queue.
 *
 * @param data
 * @param socket
 */
module.exports.addToQueue = function(data, socket) {
    // TODO: add fairness based on pins or something.
    http_request.get({
        url: 'https://www.googleapis.com/youtube/v3/videos?key=' + process.env.YOUTUBE_API_KEY + '&part=snippet,contentDetails&id=' + data.id
    }, function(err, res) {
        if(err) {
            console.log("[protube] Adding video resulted in error. "+err);
        } else {
            
            var response = JSON.parse(res.buffer.toString());

            if(response.pageInfo.totalResults == 0) {
                socket.emit("toast", "Video not found.");
                return false;
            }

            var video_data = response.items[0];

            for(var i in queue) {
                if(video_data.id == queue[i].id) {
                    socket.emit("toast", "This video is already in the queue.");
                    return false;
                }
            }

            var video = {
                "id" 		: video_data.id,
                "title" 	: video_data.snippet.title,
                "duration" 	: parseISO8601Duration(video_data.contentDetails.duration),
                "progress"  : 0
            };

            queue.push(video);

            socket.emit("toast", "Video " + video.title + " has been added.");

            ee.emit("queueUpdated", queue);

        }
    });
};


/**
 * Converts ISO8601 time to seconds.
 *
 * @param iso8601Duration
 * @returns {number}
 */
 function parseISO8601Duration(iso8601Duration) {
    var iso8601DurationRegex = /(-)?P(?:([\.,\d]+)Y)?(?:([\.,\d]+)M)?(?:([\.,\d]+)W)?(?:([\.,\d]+)D)?T(?:([\.,\d]+)H)?(?:([\.,\d]+)M)?(?:([\.,\d]+)S)?/;
    var matches = iso8601Duration.match(iso8601DurationRegex);

    var years = parseFloat(matches[2] === undefined ? 0 : matches[2]);
    var months = parseFloat(matches[3] === undefined ? 0 : matches[3]);
    var weeks = parseFloat(matches[4] === undefined ? 0 : matches[4]);
    var days = parseFloat(matches[5] === undefined ? 0 : matches[5]);
    var hours = parseFloat(matches[6] === undefined ? 0 : matches[6]);
    var minutes = parseFloat(matches[7] === undefined ? 0 : matches[7]);
    var seconds = parseFloat(matches[8] === undefined ? 0 : matches[8]);

    return seconds + minutes*60 + hours*3600 + days*86400 + weeks*86400*7 + months*86400*31 + years*86400*365;
};


/**
 * Increments time and checks for finish video.
 */
function incrementTimeAndCheckNext() {
    if(status.playing) {
        if(!status.paused) current.progress++;
        if(current.progress > current.duration) getNextVideo();
    }else{
        getNextVideo();
    }
}

/**
 * Gets next video from the queue, if available, and makes it current.
 */
function getNextVideo() {
    if(queue.length > 0) {
        status.playing = true;
        ee.emit("protubeStateChange", status);
        current = queue.shift();
        console.log("[protube] Playing "+current.title);
        ee.emit("videoChange", current);
        ee.emit("queueUpdated", queue);
        ee.emit("progressChange", current.progress);
        
    }else{
        if(status.playing) {
            status.playing = false;
            ee.emit("protubeStateChange", status);
            current = {};
            ee.emit("videoChange", current);
            ee.emit("queueUpdated", queue);
        }
    }
}

// Interval for incrementing Protube time, and getting new video from queue if previous video has finished.
var I_incrementTime = setInterval(incrementTimeAndCheckNext, 1000);