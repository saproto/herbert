var remote = io('/protube-remote');

remote.on("connect", function() {
    $("#connecting").hide(0);
    $("#connected").show(0);
});

remote.on("queue", function(data) {
    var queue = $("#queue");
    queue.html("");
    
    for(var i in data) {
        queue.append('<img src="http://img.youtube.com/vi/' + data[i].id + '/0.jpg" width="20%" />');
    }
});

$(document).ready(function() {
    $("#doLogin").click(function(e) {
        e.preventDefault();
        remote.emit("authenticate", { 'pin' : $("#pin").val() });
    });

    $('form').bind('submit', function(e){
        e.preventDefault();
        remote.emit("search", $("#searchBox").val());
    });
});

remote.on("authenticated", function(data) {
    if(data) {
        $("#login").hide(0);
        $("#loggedIn").show(0);
    }else{
        alert("Nope. Try again.");
    }
});

remote.on("searchResults", function(data) {
    var results = $("#results");

    results.html("");

    for(var i in data.items) {
        results.append(generateResult(data.items[i]));
    }

    $(".result").each(function(i) {
        var current = $(this);
        alert('yay');
        current.click(function(e) {
            e.preventDefault();
            remote.emit("add", { id: current.attr("ytId")});
        })
    });
});

function generateResult(item) {
    console.log(item);
    var result = '<div class="result" ytId="' + item.id.videoId + '"><img src="http://img.youtube.com/vi/' + item.id.videoId + '/0.jpg" width="20%" /><h1>' + item.snippet.title + '</h1><h2>' + item.snippet.channelTitle +  '</h2></div>';

    return result;
}