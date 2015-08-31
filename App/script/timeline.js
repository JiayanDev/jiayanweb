define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		var userId = getUserId();

		if( userId ){
			loadData(userId);
		}else{
			// 获取当前用户
		}
		bindEvent();
	}

	function loadData (id) {
		comm.io.get({
			// url: comm.config.BASEPATH+"event/detail",  //s
			url: "http://apptest.jiayantech.com/post/timeline",
			data:{
				daddy:id
			},
			success:function(data){
				render(data);
				hideNativeLoading();
			}
		});
	}



	function bindEvent(){
		$('#addPost').click(function(){
			addPost();
		});
	}

	function addPost () {
		comm.io.call({
			action: "addPost"
		});
	}

	function render (data) {
		comm.render({
			tpl:'tplForTimeline',
			data: data,
			renderTo: $('#timeline')
		});
	}

	function hideNativeLoading () {
		comm.io.call({
			action:"hideLoading"
		});
	}

	function getUserId () {
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