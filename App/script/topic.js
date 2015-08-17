define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		var id = getId();

		if( id ){
			loadData(id)
		}else{
			// 获取当前用户
		}
	}

	function loadData (id) {
		comm.io.get({
			// url: comm.config.BASEPATH+"event/detail",  //s
			url: comm.config.BASEPATH+"topic/getTopic",
			data:{
				topicId:id,
				daddy:8
			},
			success:function(data){
				render(data);
				cacheData(data);
				hideNativeLoading();
			}
		});
	}

	function getUserInfo () {
		comm.io.call({
			action:"getUserInfo",
			success:"onGetUserInfo",
			error:"onGetUserInfoError",
		});
	}

	window.G_onGetUserInfo = function (data) {
		alert('成功'+JSON.stringify(data));
	}

	window.G_onGetUserInfoError = function  (data) {
		alert(data);
	}

	function render (data) {
		$('#topicdetail').html(JSON.stringify(
			data
		));
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