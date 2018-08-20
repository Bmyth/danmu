var toggleFlag = isYoutube = false;
var fontSize = speed = null;
chrome.browserAction.onClicked.addListener(toggleDanmu);

getSetting()

function toggleDanmu(){
	if(!isYoutube){
		alert('only work for Youtube now')
		return;
	}
	toggleFlag = !toggleFlag;
	setBadge();
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){  
    	chrome.tabs.sendMessage(tabs[0].id, {danmu: "toggleFlag"})
	})
}

function setBadge(){
	if(toggleFlag){
		chrome.browserAction.setIcon({path:"resource/icon" + "On" + ".png"});	
	}else{
		chrome.browserAction.setIcon({path:"resource/icon" + "Off" + ".png"});
	}
}

function getSetting(){
	chrome.storage.local.get('_danmu_fontsize',function(d){
		if(d._danmu_fontsize){
			fontSize = d._danmu_fontsize;
		}else{
			fontSize = null;
		}
		chrome.storage.local.get('_danmu_speed',function(d){
			if(d._danmu_speed){
    			speed = d._danmu_speed;
    		}else{
    			speed = null;
    		}
		})
	})
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.danmu == "startQuery"){
    	toggleFlag = request.toggleFlag;
    	isYoutube = request.isYoutube;
    	setBadge();
    	sendResponse({fontSize:fontSize, speed:speed})
  	}
  	if(request.danmu == "updateSetting"){
    	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){  
	    	chrome.tabs.sendMessage(tabs[0].id, {danmu: "updateSetting"})
		})
  	}
});


