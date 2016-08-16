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

var nowPlaying = {};

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
        nowPlaying = data;
        setNowPlaying(nowPlaying.title);
        player.cueVideoById(nowPlaying.id);
        player.setPlaybackQuality('highres');
    });

    screen.on("queue", function(data) {
        $("#queue ul").html("");
        for(var i in data) {
            var invisible = (data[i].showVideo ? '' : '<i class="fa fa-eye-slash" aria-hidden="true"></i>');
            $("#queue ul").append(`<li><img src="http://img.youtube.com/vi/${data[i].id}/0.jpg" /><h1>${data[i].title}${invisible}</h1></li>`);
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
        console.log("playerState", data);
        if(data.playing && !data.paused) {
            stopIdle(data.slideshow);
            player.playVideo();

        } else if(data.playing && data.paused) {
            player.pauseVideo();
            stopProgressBar(false);

        } else {
            player.stopVideo();
            stopProgressBar(true);
            startIdle();
        }
    });

    screen.on("volume", function(data) {
        player.setVolume(data.youtube);
        radio.volume = data.radio / 100;
    });

    screen.on("reload", function() {
        location.reload();
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

function startSlideshow() {
    var slideshow = $("#slideshow");
    if(slideshow.html() == "") slideshow.html('<iframe src="https://next.saproto.nl/photos/slideshow" width="100%" height="100%" frameborder="0"></iframe>');
    slideshow.show(0);
}

function stopSlideshow() {
    var slideshow = $("#slideshow");
    slideshow.hide(0);
    slideshow.html("");
}

function startRadio() {
    setNowPlaying("Now playing radio: " + radioStation.name);
    radio.src = radioStation.url;
    radio.play();
}

function stopRadio() {
    radio.src = "";
    console.log("stopping radio");
}

function startIdle() {
    $("#queue").hide(0);
    $("#progressBar").hide(0);
    $("#progressBarBackground").hide(0);
    $("#bottomBar").removeClass("blackBg");

    startSlideshow();
    startRadio();
}

function stopIdle(slideshow) {
    if(!slideshow) {
        stopSlideshow();
    }else{
        startSlideshow();
    }
    stopRadio();

    $("#queue").show(0);
    $("#progressBar").show(0);
    $("#progressBarBackground").show(0);
    $("#bottomBar").addClass("blackBg");
}

function setNowPlaying(title) {
    $("#nowPlaying").html(title);
}