define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		loadTimeline();
		bindEvent();
	}

	function loadTimeline () {
		var userId = getUserId();
		if( userId ){
			loadData(userId);
		}else{
			// 获取当前用户
		}
	}

	function loadData (id) {
		comm.io.get({
			// url: comm.config.BASEPATH+"event/detail",  //s
			url: "http://apptest.jiayantech.com/post/timeline",
			data:{
				id:id
			},
			success:function(data){
				render(data);
				hideNativeLoading();
				showHeaderInfo(data);
			}
		});
	}



	function bindEvent(){
		$('#addPost').click(function(){
			addPost();
			//window.G_refreshTimeline();
		});
	}

	function addPost () {
		comm.io.call({
			action: "addPost"
		});
	}

	function render (data) {
		//data.timeline = [data.timeline[0]];
		comm.render({
			tpl:'tplForTimeline',
			data: data.timeline,
			renderTo: $('#timeline')
		});

		$(".my-row:last").css("border-bottom", "0px");

		comm.io.call({
			action:"setNavigationBarTitle",
			data: {"title":'个人主页'}
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

	function showHeaderInfo (data) {
		comm.io.call({
			action:"showUserProfileHeader",
			data: data.user
		});
	}

	window.G_showAddPostButton = function  () {
		$('#addPost').removeClass('none');
	}

	window.G_refreshTimeline = loadTimeline;

	return {setup:init}
});