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

function onYouTubePlayerReady() {
    screen.emit("screenReady");

    screen.on("reconnect", function() {
        screen.emit("screenReady");
    });

    screen.on("ytInfo", function(data) {
        player.cueVideoById(data.id);
    });

    screen.on("queue", function(data) {
        $("#queue").html("");
        for(var i in data) {
            $("#queue").append('<img src="http://img.youtube.com/vi/' + data[i].id + '/0.jpg" />');
        }
    });

    screen.on("progress", function(data) {
        var progress = parseInt(data);
        if(player.getCurrentTime() < progress-1 || player.getCurrentTime() > progress+1 || progress == 0) player.seekTo(progress);
    });

    screen.on("playerState", function(data) {
        if(data.playing && !data.paused) player.playVideo();
        else if(data.playing && data.paused) player.pauseVideo();
        else player.stopVideo();
    });
}

function onYouTubePlayerStateChange() {
    //
}