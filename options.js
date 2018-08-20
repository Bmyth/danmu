$(function(){
	var defaulValue = {
		fontSize : '24px',
		speed : 4
	}
	var fontSize, speed;
	chrome.storage.local.get('_danmu_fontsize',function(d){
		fontSize = d._danmu_fontsize || defaulValue.fontSize;
		$("#font-size").val(fontSize);
	});

	chrome.storage.local.get('_danmu_speed',function(d){
		speed = d._danmu_speed || defaulValue.speed;
		$("#speed").val(speed);
	})

	$('.opt #save').click(save);
	$('.opt #reset').click(reset);

	$('.info .menu p').click(function(){
		$('.open').removeClass('open');
		$('#'+$(this).attr('item')).addClass('open');
	})

	function save(){
		chrome.storage.local.set({'_danmu_fontsize': $('#font-size').val()}, function(){
			chrome.storage.local.set({'_danmu_speed': $('#speed').val()}, function(){
				chrome.runtime.sendMessage({danmu: 'updateSetting'});
				alert('save success')
			})
		});
	}

	function reset(){
		$('#font-size').val(defaulValue.fontSize);
		chrome.storage.local.set({'_danmu_fontsize': defaulValue.fontSize}, function(){
			$('#speed').val(defaulValue.speed);
			chrome.storage.local.set({'_danmu_speed': defaulValue.speed}, function(){
				chrome.runtime.sendMessage({danmuMsg : 'updateSetting'});
				alert('reset success')
			})
		});
	}
})
