var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
            'controls': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'iv_load_policy': 3
        },
        events: {
            'onReady': onYouTubePlayerReady,
            'onStateChange': onYouTubePlayerStateChange
        }
    });

    console.log(player);
}

var screen = io('/protube-screen');
var pin = io('/protube-pin');

pin.on("pin", function(data) {
    $("#pinCode").html(data);
});

var radio = document.createElement("AUDIO");

var radioStation = {};

screen.on("radioStation", function(data) {
    radioStation = data;
});

function onYouTubePlayerReady() {
    $("#connecting").hide(0);

    screen.emit("screenReady");

    screen.on("disconnect", function() {
        $("#connecting").show(0);
    });

    screen.on("reconnect", function() {
        $("#connecting").hide(0);
        screen.emit("screenReady");
    });

    screen.on("ytInfo", function(data) {
        player.cueVideoById(data.id);
        player.setPlaybackQuality('highres');
    });

    screen.on("queue", function(data) {
        $("#queue ul").html("");
        for(var i in data) {
            $("#queue ul").append('<li><img src="http://img.youtube.com/vi/' + data[i].id + '/0.jpg" /><h1>' + data[i].title +  '</h1></li>');
        }
    });

    screen.on("progress", function(data) {
        var progress = parseInt(data);
        if(player.getCurrentTime() != progress+1 || progress == 0) {
            player.seekTo(progress);
            setProgressBar(player.getDuration(), progress);
        }
    });

    screen.on("playerState", function(data) {
        if(data.playing && !data.paused) {
            stopIdle();
            player.playVideo();

        } else if(data.playing && data.paused) {
            player.pauseVideo();
            stopProgressBar(true);

        } else {
            player.stopVideo();
            stopProgressBar(false);
            startIdle();
        }
    });

    screen.on("volume", function(data) {
        player.setVolume(data.youtube);
        radio.volume = data.radio / 100;
    });
}

function onYouTubePlayerStateChange(newState) {
    if(newState.data == 1) setProgressBar();
}

function setProgressBar() {
    var current = player.getCurrentTime();
    var total = player.getDuration();

    var progressBar = $("#progressBar");
    var percentage = current/total * 100;

    progressBar.stop();

    progressBar.css({
        width: percentage + '%'
    });

    progressBar.animate({
        width: '100%'
    }, (total - current) * 1000, 'linear', function(){
        $(this).css({
            width: '0%'
        });
    });
}

function stopProgressBar(reset) {
    var progressBar = $("#progressBar");
    progressBar.stop();
    if(reset) progressBar.css({ width: '0%' });
}

function startIdle() {
    $("#queue").hide(0);
    $("#progressBar").hide(0);
    $("#progressBarBackground").hide(0);
    $("#slideshow").show(0);

    radio.src = radioStation.url;
    radio.play();
}

function stopIdle() {
    $("#slideshow").hide(0);
    $("#queue").show(0);
    $("#progressBar").show(0);
    $("#progressBarBackground").show(0);

    radio.src = "";
}