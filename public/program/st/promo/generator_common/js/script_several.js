$(document).ready(function(){
    setTimeout(function() {
        $('#mainInfo_slider').not('.slick-initialized').slick({
            infinite: true,
            slidesToShow: 1,
            variableWidth: true,
            centerMode: true,
            dots: true,
            autoplay: true,
            speed: 800,
            adaptiveHeight: true,
            responsive: [
                {
                breakpoint: 768,
                    settings: {
                        infinite: true,
                        slidesToShow: 1,
                        variableWidth: true,
                        centerMode: true,
                        dots: true,
                        autoplay: true,
                        speed: 800,
                        adaptiveHeight: true,
                    }
                }
            ]
        });

        $('#modalKv .modalFlex').not('.slick-initialized').slick({
            infinite: true,
            slidesToShow: 1,
            arrows: true,
            dots: true,
            variableWidth: true,
            centerMode: true,
            adaptiveHeight: true,
        });
    }, 1000);

    $(".mainInfo_modal").each(function(){
        var $mainInfoModal = $(this);
        var $description = $mainInfoModal.find(".description");
        var text = $description.text();
        var length = 0;
        for(var i = 0; i < text.length; i++){
            var charCode = text.charCodeAt(i);
            if(charCode >= 0x0000 && charCode <= 0x00FF){
                length += 1;
            }else{
                length += 2;
            }
        }
        if(length > 26){
            var showText = text.substring(0,26) + "...";
            var hideText = text.substring(26);
            $description.html(showText).append('<span class="moreBtn">もっと見る</span><span class="hide" style="display:none">' + hideText + '</span>');
        }
    });

    $('#mainInfo_slider .moreBtn').on('click', function(){
        var index = $(this).closest('.flexWrapper').data('slick-index');
        $('#modalKv').fadeIn();
        $('#modalKv .modalFlex').slick('slickGoTo', index);
        mainInfoSlider.slick('slickPause'); // autoplayを停止
    });

    $('#modalKv .closeBtn').on('click', function(){
        $('#modalKv').fadeOut();
        $('#mainInfo_slider').slick('slickPlay'); // autoplayを再開
        $('#modalKv .modalFlex').slick('slickPause');
        $('#modalKv iframe').each(function() {
            $(this).attr('src', $(this).attr('src'));
        });
    });
    $('#modalKv').on('click', function(event){
        if ($(event.target).closest('.modalFlex').length === 0 && $(event.target).closest('.slick-dots').length === 0) {
            $(this).fadeOut();
            $('#mainInfo_slider').slick('slickPlay'); // autoplayを再開
            $('#modalKv .modalFlex').slick('slickPause');
        $('#modalKv iframe').each(function() {
            $(this).attr('src', $(this).attr('src'));
        });
        }
    });

    if ($('#staticProgram li').length == 0) {
        $('#staticProgram').remove
    }


    $('#mainInfo_slider iframe').on('load', function() {
        $('#mainInfo_slider').slick('slickPlay');
        var iframeDoc = $(this).contents();
        var iframeVideo = iframeDoc.find('video');
        if (iframeVideo.length) {
            iframeVideo.on('play', function() {
                $('#mainInfo_slider').slick('slickPause');
                $('#mainInfo_slider').slick('slickSetOption', 'autoplay', false);
            });
            iframeVideo.on('pause ended', function() {
                $('#mainInfo_slider').slick('slickSetOption', 'autoplay', true);
                $('#mainInfo_slider').slick('slickPlay');
            });
        } else if ($(this).attr('src').indexOf('autoplay=1') === -1) {
            var iframeSrc = $(this).attr('src');
            var autoplaySrc = iframeSrc + '?autoplay=1';
            $(this).attr('src', '');
            $(this).attr('src', autoplaySrc);
            $(this).on('load', function() {
                $('#mainInfo_slider').slick('slickPause');
                $('#mainInfo_slider').slick('slickSetOption', 'autoplay', false);
            });
        }

        if ($(this).attr('src').indexOf('autoplay=1') === -1) {
            var iframeSrc = $(this).attr('src');
            var autoplaySrc = iframeSrc + '?autoplay=1';
            $(this).attr('src', '');
            $(this).attr('src', autoplaySrc);
            $(this).on('load', function() {
                $('#mainInfo_slider').slick('slickPause');
                $('#mainInfo_slider').slick('slickSetOption', 'autoplay', true);
                $('#mainInfo_slider').slick('slickPlay');
            });
        }
    });

    $('#mainInfo_slider, #modalKv .modalFlex').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        var iframes = $(slick.$slides.get(currentSlide)).find('iframe');
        iframes.each(function() {
            var iframeSrc = $(this).attr('src');
            $(this).attr('src', '');
            $(this).attr('src', iframeSrc);
        });
    });

});


$(window).scroll(function() {
    var kvArea = $('#kvArea').offset().top;
    var kvAreaHeight = $('#kvArea').height();
    var kvAreaBottom = kvArea + kvAreaHeight;
    var windowHeight = $(window).height();
    var scrollTop = $(window).scrollTop();
    var scrollHeight = $(window).width() * 10.66 / 100; // 10.66vwの高さを取得
    // #kvAreaの要素の下端が画面上に見えた場合
    if (kvAreaBottom - scrollTop <= windowHeight) {
        // stickyクラスを付与
        $('#kvArea #mainInfo_slider button.slick-arrow').addClass('sticky');
        $('#kvArea #mainInfo_slider button.slick-arrow').removeClass('fixed');
    }
    else {
        // stickyクラスを削除
        $('#kvArea #mainInfo_slider button.slick-arrow').removeClass('sticky');
    }
    // .c-headlineの高さ分スクロールが発生した場合
    if (scrollTop > scrollHeight) {
        // stickyクラスを付与
        $('#kvArea #mainInfo_slider button.slick-arrow').addClass('fixed');
    } else {
        // stickyクラスを削除
        $('#kvArea #mainInfo_slider button.slick-arrow').removeClass('fixed');
    }
});


$(function() {
    $('#modalKv').scroll(function() {
        if ($(this).scrollTop() > 0) {
            $('.closeBtn').addClass('scrolled');
        } else {
            $('.closeBtn').removeClass('scrolled');
        }
    });
});

//チャンネルデータ保管
var ChData;
$(function ($) {
    //設定ファイル読み込み
    $.ajax({
        type: 'GET',
        url: '/program/st/promo/generator_common/data/settings'+ajaxSelect5facetNo+'.json',
        dataType: 'json',
        timeout: 30000
    }).done(function (D) {
        //チャンネルデータ読み込み
        $.ajax({
            type: 'GET',
            url: '/plan/special/kihonplan_module/data/channel_data.json',
            dataType: 'json',
            timeout: 30000
        }).done(function (ChData_res) {
            //チャンネルデータ保管用変数にコピー
            ChData = ChData_res.ChannelData;

            //番組表示エリアを複数生成
            for(var i = 0 ; i < D.data.length ; i++) {
                // facetIDjson読み込み
                if(D.data[i].jsonNo == 2){
                    var settingjson = D.data[i];
                    var index = i;
                    $.ajax({
                        type: 'GET',
                        url: '/program/st/promo/generator_common/js/ajax_select5facet.php',
                        dataType: 'json',
                        timeout: 30000
                    }).done(function (res) {
                        //番組リスト（HTML）の生成
                        //引数：設定ファイルのデータ,jsonレスポンスデータ,HTML出力先の要素
                        makeProgramList(settingjson,res,$('#staticProgram').get(index));
                    }).fail(function () {
                    });
                }
            }

        }).fail(function () {
        });
    }).fail(function () {
    });
});

var serviceArr = ['basic', 'basic', 'premium', 'premium_hikari'];
var serviceTypeArr = ['bs', 'cs', '', ''];
var serviceTypeArr_02 = ['BS', 'CS', 'Ch.', 'Ch.'];
var today = new Date();

/* makeProgramList */
/* 番組リスト（HTML）の生成 */
function makeProgramList(settingjson,res){
    var res_watch = res;

    //クレジット保管
    var copyCodeArr = [];

    // 放送開始日時でソート
    res_watch.sort(function (a, b) {
        var time_a = a['@attributes']['broadCastStartDate'];
        var time_b = b['@attributes']['broadCastStartDate'];
        if (time_a > time_b) {
            return 1;
        } else {
            return -1;
        }
    });
    var imgArr = [];
    var watchCodeTmp = '';

    $(res_watch).each(function (i, obj) {
        var thisElm = obj;
        var isRrate = false;
        var siType = thisElm['@attributes']['siType'];
        var cid = thisElm['@attributes']['serviceId'];
        var gid = '';
        var serviceId = serviceTypeArr_02[siType - 1];
        var searchCid = ['218','223','227','240','252','255','250','254','257','800','256','296','297','298','299','300','301','305','307','308','321','322','323','324','325','329','310','311','312','314','316','317','292','293','294','295','236','330','331','340','341','342','343','349','351','353','354','251','339','363']
        var replaceCid = ['5021801','5022301','5022701','5024001','5025201','5025501','5025001','5025401','51YA101','50M9901','5025601','51E0401','51E0401','5100401','5100401','51YA101','5030101','5030501','5108001','5108001','5032101','5032201','5032301','5032401','5032501','5032901','5031001','5031101','5031201','5031401','5031601','5031701','5029201','5029301','5029401','5029501','5023601','5033001','5033101','5034001','5034101','5034201','5034301','51YA101','5035101','5035301','5035401','5025101','5033901','5036301']
        var resultCid = $.inArray(cid, searchCid);
        var chLink = '/plan/channel/basic/' + replaceCid[resultCid];

        var fil_flg = false;
        //facetIDで絞り込み
        for(var i = 0 ; i < settingjson.condition.length ; i++) {
            if(thisElm['GenreDescription']['@attributes'][settingjson.condition[i]]) {
                fil_flg = true;
            }
        }
        if(!fil_flg){
            return true;
        }


        var broadCastStartDate = $.trim(thisElm['@attributes']['broadCastStartDate']);
        var month = broadCastStartDate.substring(6, 4);
        var day = broadCastStartDate.substring(8, 6);
        var hour = broadCastStartDate.substring(10, 8);
        var minute = broadCastStartDate.substring(12, 10);
        var wday = $.trim(thisElm['@attributes']['wday']);
        var broadCastStartDate_html = '<p class="schedule">' + month + '/' + day + '(' + wday + ') ' + hour + ':' + minute + '～</p>';

        var thisSynopsis = thisElm['ShortSynopsis'];
        if (thisSynopsis == undefined) {
            thisSynopsis = '';
        }
        if (thisElm['ParentalRatingDescription'] && thisElm['ParentalRatingDescription']['@attributes']['parentalRating'] == 'R-18') {
            isRrate = true;
        }
        var imgIcon = ChData[cid]["logoImg"];
        // var imgIcon = '/library/common/img/channel/icon/' + serviceArr[siType - 1] + '/m_' + serviceTypeArr[siType - 1] + cid + '.gif';
        var imgPath = null;
        var hasValidImg = false;
        var copyright = '';
        if (thisElm['MonoMedias']) {
            if(thisElm['MonoMedias']['MonoMedia'].length){
                var monoMedia_tmp = thisElm['MonoMedias']['MonoMedia'];
                var result = monoMedia_tmp.sort(function(a, b) {
                    return (a['@attributes'].sortOrder < b['@attributes'].sortOrder) ? -1 : 1;
                });
                monoMedia_tmp = result[0];
            }
            else{
                var monoMedia_tmp = thisElm['MonoMedias']['MonoMedia'];
            }

            var monoMedia = monoMedia_tmp['@attributes'];
            var imageSTxt = typeof monoMedia['startDate'] == 'undefined' ? '00000000000000' : monoMedia['startDate'];
            var imageETxt = typeof monoMedia['endDate'] == 'undefined' ? '00000000000000' : monoMedia['endDate'];
            var imageSArr = dealDate(imageSTxt);
            var imageEArr = dealDate(imageETxt);
            var imageS = new Date(imageSArr[0], imageSArr[1], imageSArr[2], imageSArr[3], imageSArr[4], imageSArr[5]);
            var imageE = new Date(imageEArr[0], imageEArr[1], imageEArr[2], imageEArr[3], imageEArr[4], imageEArr[5]);
            var imageEXPDate = (imageS < today && imageE > today) ? true : false;
            var isValid = typeof monoMedia['permitDelivery'] == 'undefined' ? false : monoMedia['permitDelivery'][0] == 1 ? true : false;
            var imageHasURL = typeof monoMedia['url'] == 'undefined' ? false : true;
            if (imageEXPDate && isValid && imageHasURL && !isRrate) {
                imgPath = monoMedia['url'].replace('_L.jpg', '_M.jpg').replace('_L.JPG', '_M.JPG');
                hasValidImg = true;
            }
        }
        if (monoMedia_tmp) {
            var copy = monoMedia_tmp['CopyRights'];
            if (copy == undefined) {
                copy = '';
            }
            else{
                var thisCopyCode = '<span>' + copy + ' </span>';
                if (copyCodeArr.indexOf(thisCopyCode) < 0) {
                    copyCodeArr.push(thisCopyCode);
                }
            }
        } else {
            var copy = '';
        }

        imgArr.push(imgPath);
        var thisMemoIdAttr = thisElm['@attributes'];
        var thisTit = thisElm['Title'];
        var thisEventType = thisMemoIdAttr['eventType'];
        var thisId = thisMemoIdAttr['contentsId'];
        var thisIdType = 'c';
        if ((thisEventType != '1' && thisEventType != '2') || !thisId) {
            thisId = thisMemoIdAttr['informationId'];
            thisIdType = 'i';
        }
        var thisChaName = thisElm['ChannelName'];

        watchCodeTmp += '<li>';
        if (imgPath == null) {
            watchCodeTmp += '<p class="noImg"><img src="' + imgIcon + '" alt="' + thisChaName + '" class="guard2"></p>';
        } else {
            watchCodeTmp += '<p class="img"><img src="' + imgPath + '" alt="' + thisTit + '" class="guard2"></p>';
        }
        watchCodeTmp += '<p class="tit">' + thisTit + '</p>';
        watchCodeTmp += '<div class="flagWrapper">';
        //配信アイコン表示
        var thisVodMeta = thisElm['VodMetaInformation'];
        if(thisVodMeta){
            //アイコン出し分け処理を呼び出し
            var broadcasticon_text = broadcasticon(thisVodMeta['VodMeta']);
            if(broadcasticon_text){
                watchCodeTmp += '<p class="flag flag_streaming">' + broadcasticon_text + '</p>';
            }
        }
        watchCodeTmp += '</div>';
        watchCodeTmp += broadCastStartDate_html;
        watchCodeTmp += '<p class="description descriptionDynamic">' + thisSynopsis + '</p>';
        if(serviceId){
            watchCodeTmp += '<div class="ch_info"><p class="chNumber">' + serviceId + cid + '</p><p class="chName">' + thisChaName + '</p></div>';
        }
        else{
            watchCodeTmp += '<div class="ch_info"><p class="chNumber">' + ChData[cid]["codeLabel"] + '</p><p class="chName">' + thisChaName + '</p></div>';
        }
        if (ChData[cid]["kihonplan_flg"] === true) {
            watchCodeTmp += '<p class="icon"><img src="/program/st/promo/generator_common/img/kihon_logo.gif" alt="基本プラン" class="guard2"></p>';
        }
        watchCodeTmp += '<span>' + copy + '</span>';
        watchCodeTmp += '</li>';
    });

    $('#staticProgram').append(watchCodeTmp);
    if (typeof setSynopsis === "function") {
        setSynopsis();
    }
    if (typeof setSynopsisDynamic === "function") {
        setSynopsisDynamic();
    }
    sliderSetting();
    $('#staticProgram .guard2').imgGuard();
    checkProgram();
}

/** dealDate **/
function dealDate(dateStr) {
    var dateArr = [];
    dateArr.push(dateStr.substr(0, 4));
    dateArr.push((dateStr.substr(4, 2) - 1));
    dateArr.push(dateStr.substr(6, 2));
    dateArr.push(dateStr.substr(8, 2));
    dateArr.push(dateStr.substr(10, 2));
    dateArr.push(dateStr.substr(12, 2));
    return dateArr;
}


/*====================
	slicksliderセッティング
====================*/
function sliderSetting() {
    $('#staticProgram').not('.slick-initialized').slick({
        infinite: false,
        slidesToShow: 4,
        variableWidth: true,
        responsive: [
            {
            breakpoint: 1200,
                settings: {
                    infinite: false,
                    slidesToShow: 3,
                    variableWidth: true,
                }
            },
            {
            breakpoint: 768,
                settings: {
                    infinite: false,
                    slidesToShow: 1,
                    variableWidth: true,
                }
            }
        ]
    });
}


/* plugin */
/** imgGuard **/
$(function ($) {
    var pluginName = 'imgGuard';
    $.fn[pluginName] = function (options) {
        var opt = $.extend($.fn[pluginName].defaults, options);
        var targetArea = $(this.selector);
        return this.each(function () {
            if (!$(this).parent().hasClass('itemGuard')) {
                $(this)
                    .wrap('<span class="itemGuard"></span>')
                    .before('<span class="play"><img src="' + opt.spacerSrc + '" /></span>')
                if (typeof (opt.zIndex) === 'number') {
                    $(this).parent('.itemGuard').find('.play').css({ 'zIndex': (opt.zIndex) });
                }
            }
        });
    };
    $.fn[pluginName].defaults = {
        spacerSrc: '/static_r1/common_r1/images/spacer.gif',
        zIndex: false
    };
})
// imgGuard実行
$(function($) {
    $('.guard2').imgGuard();
});