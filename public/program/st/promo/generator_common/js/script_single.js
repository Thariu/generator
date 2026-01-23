$(document).ready(function() {
    $('#showDesc').on('click', function(){
        $(this).toggleClass('active');
        $(this).prev().toggleClass('show');

        if($(this).hasClass('active')) {
            $(this).text('閉じる');
        }
        else {
            $(this).text('もっと見る');
        }
    });

});


var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var players = {};
function onYouTubeIframeAPIReady() {
    $("#kvSlider iframe").each(function(id) {
        var $iframe = $(this).get(0);
        if ($iframe) {
            players = new YT.Player($iframe, {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
            });
        }
    });
}
function onPlayerReady() {
    $('#kvSlider').slick('slickPlay');
}
function onPlayerStateChange(obj) {
    if (obj.data == 1) {
        $('#kvSlider').slick('slickPause');
    } else if (obj.data == 2) {
        $('#kvSlider').slick('slickPlay');
        obj.target.seekTo(0);
    }
}


$(function(){
    $("#kvSlider").on("beforeChange", function(event, slick) {
        var currentSlide, player, command;
        currentSlide = $(slick.$slider).find(".slick-current");
        player = currentSlide.find("iframe").get(0);
        command = {
        "event": "command",
        "func": "pauseVideo"
        };
        if ( player != undefined ) {
        player.contentWindow.postMessage(JSON.stringify(command), "*");
        }
    });

    if ($('#kvSlider').children().length > 1) {
        $('#kvSlider').not('.slick-initialized').slick({
            infinite: true,
            slidesToShow: 1,
            dots: true,
            autoplay: true,
            speed: 800
        });
    }else {
        $('#kvSlider').css('opacity', '1');
    }
});