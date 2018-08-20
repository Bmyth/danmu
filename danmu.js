var isYoutube = location.hostname == 'www.youtube.com';
var latestId = '';
var channels = [{
    id: 0,
    items: []
}];
var maxChannelNum = 6;

window.danmuSetting = {
    fontSize: '24px',
    speed: 4
}
var timer1 = timer2 = null;

window.toggleFlag = false;

// $(document).keypress(function(e){
//     if(e.ctrlKey && e.which == 17) {
//         chrome.runtime.sendMessage({formDagger : 'toggle'}, function(response) {
//             alert(response.flag);
//         });
//     }
// });

if(isYoutube){
    if(localStorage.getItem('danmu_toggleFlag')){
        toggleFlag = localStorage.getItem('danmu_toggleFlag') != 'false';
    }
    chrome.runtime.sendMessage({danmu: 'startQuery', toggleFlag: toggleFlag, isYoutube: isYoutube});

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if(request.danmu == "toggleFlag"){
                console.log('danmu toggleFlag')
                toggleFlag = !toggleFlag;
                localStorage.setItem('danmu_toggleFlag', toggleFlag);
                main();
            }else if(request.danmu == "updateSetting"){
                console.log('danmu updateSetting')
                loadingSetting();
            }
    });

    $(function(){
        addCss();
        main();
    })
}

function main(){
    if(toggleFlag){
        console.log('danmu start');
        loadingSetting();
        timer1 = setInterval(function(){
            if(window.toggleFlag){
                var items = fetch();
                render(items);
                if(items.length > 0){
                    latestId = items[items.length - 1].id;
                }
            }
        }, 250)
        timer2 = setInterval(function(){
            move();
        }, 40)
    }else{
        console.log('danmu stop');
        clear()
    }
}

function loadingSetting(){
    chrome.storage.local.get('_danmu_fontsize',function(d){
        if(d._danmu_fontsize){
            window.danmuSetting.fontSize = d._danmu_fontsize;
        }
    })

    chrome.storage.local.get('_danmu_speed',function(d){
        if(d._danmu_speed){
            window.danmuSetting.speed = parseInt(d._danmu_speed);
        }
    })
}

function clear(){
    console.log('danmu clear')
    if(timer1){
        clearInterval(timer1)
    }
    if(timer2){
        clearInterval(timer2)
    }
    $('#danmu-container').remove();
}

function render(items){
    var videoContainer = $('#player-container .html5-video-player');
    var danmuContainer = $('#danmu-container');
    if(danmuContainer.length == 0){
        danmuContainer = $('<div id="danmu-container"></div>').appendTo(videoContainer);
    }
    if(videoContainer.hasClass('ytp-fullscreen')){
        danmuContainer.show();
    }else{
        danmuContainer.empty().hide();
        return;
    }
    for(var i = 0; i < items.length; i++){
        var ele = $('<div class="danmu-item"></div>').html(items[i].content).css('font-size', window.danmuSetting.fontSize).attr('guid', guid()).appendTo(danmuContainer);
        $('<img class="danmu-head">').attr('src', items[i].img).prependTo(ele);
        addToChannel(ele); 
    }
}

function fetch(){
    var textContainer = $("ytd-app #chatframe").contents().find("body").find('#chat #items');
    var items = [];
    var eles;
    console.log(textContainer.length)
    if(latestId){
        lastNode = textContainer.find('[id="' + latestId + '"]');
        if(lastNode){
             eles = lastNode.nextAll();
        }else{
            eles = textContainer.find('yt-live-chat-text-message-renderer');
        }
    }else{
        eles = textContainer.find('yt-live-chat-text-message-renderer')
        if(eles.length > 4){
            eles = eles.slice(-4);
        }
    }
    console.log(eles.length)

    eles.each(function(){
        var item = {
            id: $(this).attr('id'),
            img: $(this).find('#author-photo img').attr('src'),
            name: $(this).find('#content #author-name').text(),
            content: $(this).find('#content #message').html()
        };
        items.push(item);
    })
    return items;
}

function move(){
    var w = $('#danmu-container').outerWidth();
    $('#danmu-container .danmu-item').each(function(){
        var item = $(this);
        var right = parseInt(item.css('right'));
        if(right > w){
            removeItem(item)
        }else{
            item.css('right', right + window.danmuSetting.speed)
        }
    })
}

function addToChannel(ele){
    var index = 0;
    var channelId = null;
    while(channelId == null){
        var l = channels[index].items.length;
        if(l == 0){
            channelId = index;
        }
        else{
            var item = getEle(channels[index].items[l - 1]);
            var right = parseFloat(item.css('right'));
            
            if(right > 100){
                channelId = index;
            }else{
                index = index + 1;
                if(index == channels.length){
                    if(index <= maxChannelNum){
                        channels.push({id: index, items:[]});
                        channelId = index
                    }else{
                        channelId = findSecondBest();
                    }
                }
            }
        }
    }
    // console.log(channelId)

    var initRight = -(ele.outerWidth());
    var channel = channels[channelId];
    if(channel.items.length > 0){
        initRight = initRight - 200;
        var item = getEle(channel.items[channel.items.length - 1]);
        var itemRight = parseFloat(item.css('right'))
        if(itemRight < 0){
            initRight = initRight + itemRight;
        }
    }else{
        initRight = initRight - 30;
    }

    var top = ele.height() * channelId + 5;
    // console.log(index)
    // console.log(top)
    // console.log(initRight)
    channels[channelId].items.push(ele.attr('guid'));
    ele.attr('channel', channelId).css({right:initRight, top: top});
}

function findSecondBest(){
    var index = 0;
    var maxRight = getEle(channels[0].items[channels[0].items.length - 1]).css('right');;
    for(var i = 1; i < channels.length; i++){
        var right = getEle(channels[i].items[channels[i].items.length - 1]).css('right');
        if(right > maxRight){
            maxRight = right;
            index = i;
        }
    }
    return index;
}

function getEle(guid){
    return $('#danmu-container [guid="'+ guid +'"]');
}

function getEleLeft(guid){
    var ele = getEle(guid);
    var left = ele.offset().left + ele.outerWidth();
    return left;
}

function removeItem(ele){
    channels[ele.attr('channel')].items.splice($.inArray(ele.attr('guid'), channels[ele.attr('channel')].items), 1);
    ele.remove();
}

function addCss(){
    var css = '#danmu-container{position: absolute;top: 0;left: -10%;width: 120%; color: #fff;z-index: 40;height:120px; overflow:visible;}' +
                    '#danmu-container .danmu-item {display: inline; padding: 5px; position:absolute; width: auto; font-size:20px; margin: 0; text-shadow: 0 0 1px #000; white-space: nowrap;}' +
                    '#danmu-container .danmu-item img{width:1em;}' +
                    '#danmu-container .danmu-item img.danmu-head{display:inline-block; width:25px; height:25px; border-radius:100%; margin-right:4px;}';
    $('<style type="text/css" id="danmu-css">' + css + '</style>').appendTo($('body'));
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4();
}