define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		var id = getId();

		if( id ){
			loadData(id);
		}else{
			// 提示不存在
		}
		bindEvent();
	}

	function loadData (id) {
		comm.io.get({
			
			// url: comm.config.BASEPATH+"event/detail",  //s
			url: "http://apptest.jiayantech.com/event/detail",
			data:{
				id: id,
				daddy:8
			},
			success:function(data){
				render(data);
				cacheData(data);
				hideNativeLoading();
			}
		});
	}

	function cacheData (data) {
		$.each(['hospitalName', 'doctorName', 'beginTime', 'category'], function (i, key) {
			cacheEventData[key] = data[key]
		});
	}


	function bindEvent(){
		$('#applyment').click(function(){
			applyment();
		});
	}

	function applyment () {
		comm.io.call({
			action: "applymentEvent",
			data:{
				id: getId(),
				eventInfo: cacheEventData
			}
		});
	}

	function render (data) {
		$('#eventDetail').html(JSON.stringify(
			data
		)).append('<div style="margin-top:20px;"><a style="color:red;" href="timeline.html?id='+data.userId+'">进入美丽天使主页</a></div>');
	}

	function hideNativeLoading () {
		comm.io.call({
			action:"hideLoading"
		});
	}

	function getId () {
		var hash = comm.hashMng();
		var id = hash.id;
		return id;	
	}

	function isDebug () {
		var hash = comm.hashMng();
		
		return hash.debug==1;
	}

	return {setup:init}
});