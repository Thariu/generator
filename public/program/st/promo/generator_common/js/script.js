$(function ($) {
    $(document).ready(function() {
        $('.js-scroll').on('click', function(event) {
            event.preventDefault();
            var target = $(this).attr('href');
            var headerHeight = $('header').outerHeight();
            var targetPosition = $(target).offset().top - headerHeight;
            $('html, body').animate({
                scrollTop: targetPosition
            }, 500);
        });
    });

    // #priceArea　アコーディオン　初回視聴料1,980円(税込)の注意事項
    $('#priceArea').on('click', '.mustReadbox dl dt', function () {
        $(this).toggleClass('active');
        $(this).next().slideToggle();
    });

    // #floatArea吸着エリアの表示
    // ファーストビューから表示するため、スクロール時の表示処理をコメントアウト
    // var floatArea_flg = false;
    // $(window).scroll(function () {
    //     if ($(this).scrollTop() > $(window).height()) {
    //         if(!floatArea_flg){
    //             $('#floatArea').css('bottom',0);
    //             floatArea_flg = true;
    //         }
    //     }
    // });
})

$(window).on('load', function() {
    if($('.copyRight').children().length === 0){
        $('.copyRight').remove();
    }
    $('.flagWrapper').each(function() {
        if ($(this).children().length == 0) {
            $(this).remove();
        }
    });

    if ($('#dynamicProgram li').length == 0) {
        $('#dynamicProgram').remove();
    }
});

//チャンネルデータ保管
var ChData;
$(function ($) {
    //設定ファイル読み込み
    $.ajax({
        type: 'GET',
        url: '/program/st/promo/generator_common/data/settings'+ajaxNo+'.json',
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
                if(D.data[i].jsonNo == 3){
                    var settingjson2 = D.data[i];
                    var index2 = i;
                    $.ajax({
                        type: 'GET',
                        url: '/program/st/promo/generator_common/js/ajax.php',
                        dataType: 'json',
                        timeout: 30000
                    }).done(function (res2) {
                        //番組リスト（HTML）の生成
                        //引数：設定ファイルのデータ,jsonレスポンスデータ,HTML出力先の要素
                        makeProgramList2(settingjson2,res2,$('#dynamicProgram').get(index2));
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
function makeProgramList2(settingjson2,res2){
    var res_watch = res2;

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
        for(var i = 0 ; i < settingjson2.condition.length ; i++) {
            if(thisElm['GenreDescription']['@attributes'][settingjson2.condition[i]]) {
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
            watchCodeTmp += '<p class="noImg"><img src="' + imgIcon + '" alt="' + thisChaName + '" class="guard"></p>';
        } else {
            watchCodeTmp += '<p class="img"><img src="' + imgPath + '" alt="' + thisTit + '" class="guard"></p>';
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
            watchCodeTmp += '<p class="icon"><img src="/program/st/promo/generator_common/img/kihon_logo.gif" alt="基本プラン" class="guard"></p>';
        }
        watchCodeTmp += '</li>';
    });

    $('#dynamicProgram').append(watchCodeTmp);
    sliderSetting2();
    $('#dynamicProgram .guard').imgGuard();
    checkProgram();

    //クレジット表記
    $(copyCodeArr).each(function(){
        var item = this;
        $('.copyRight').append(this);
    });
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
function sliderSetting2() {
    $('#dynamicProgram').not('.slick-initialized').slick({
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


/*====================
	もっと見るボタンセッティング
====================*/
function setSynopsis(){
	$('#programArea .descriptionStatic .more').click(function () {
		$(this).hide()
		.prev('.omit').hide()
		.prev('.hide').fadeIn();
		return false;
	});
}


/*====================
	番組が一つも存在しない場合の処理
====================*/
function checkProgram(){
    if ($('#staticProgram li').length === 0 && $('#dynamicProgram li').length === 0) {
        $('#programArea').remove();
    }
}


/*====================
	smooth
====================*/
$('a[href^="#"]').on('click', function() {
	var speed = 500;
	var href = $(this).attr("href");
	var target = $(href == "#" || href == "" ? "html" : href);
	var position = target.offset().top;
	$("body,html").animate({ scrollTop: position }, speed, "swing");
	return false;
});


/*====================
	modal__basic
====================*/
$(function() {
	var open = $('.modal__basic-open'),
		close = $('.modal__basic-close'),
		base = $('.modal__basic');

	open.on('click',function(){
		base.addClass('active');
		return false;
	});

	close.on('click',function(){
		base.removeClass('active');
	});

	$(document).on('click',function(e) {
		if(!$(e.target).closest('.modal__contents').length) {
			base.removeClass('active');
		}
	});
});

$(function(){
	$('.accordion-title').click(function(){
		$(this).toggleClass('active');
		$(this).next().slideToggle();
	});
});


/*====================
	modal__premium
====================*/
$(function() {
	var open = $('.modal__premium-open'),
		close = $('.modal__premium-close'),
		base = $('.modal__premium');

	open.on('click',function(){
		base.addClass('active');
		return false;
	});

	close.on('click',function(){
		base.removeClass('active');
	});

	$(document).on('click',function(e) {
		if(!$(e.target).closest('.modal__contents').length) {
			base.removeClass('active');
		}
	});
});


/*====================
	modal
====================*/
const buttonsNodes = document.querySelectorAll('.js-modal');
const buttons = Array.prototype.slice.call(buttonsNodes,0);
const modal = document.querySelector('#modal');
const modalNodes = document.querySelectorAll('#modal .modal-close, #modal .modal-bg');
modals = Array.prototype.slice.call(modalNodes,0);
modals.forEach(function(el) {
	el.addEventListener('click', function(e) {
		modal.classList.remove('-show');
		document.body.style.overflow = '';
		$('html').removeClass('scroll_none');
		e.preventDefault();
	})
})
buttons.forEach(function(el) {
	$(el).on('click',function(e){
	// el.addEventListener('click', function(e) {
		if($(this).hasClass('disabled')) return;

		modal.classList.add('-show');
		document.body.style.overflow = 'hidden';
		const modalInnerNodes = modal.querySelectorAll('.modal-window-inner');
		const modalInners = Array.prototype.slice.call(modalInnerNodes,0);
		modalInners.forEach(function(el) {
			el.classList.remove('-show');
		})
		modal.querySelector('#' + e.currentTarget.dataset.target).classList.add('-show');
		$('html').addClass('scroll_none');
		e.preventDefault();
	})
})