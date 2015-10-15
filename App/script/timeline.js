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
            url: comm.config.BASEPATH + "post/timeline",  //s
			//url: "http://apptest.jiayantech.com/post/timeline",
			data:{
				id:id
			},
			success:function(data){
				render(data);
				hideNativeLoading();
				showHeaderInfo(data);

                onGetShareInfo(id, data);
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

    function onGetShareInfo(id, data) {
        var content = '';
        var timeline = data.timeline;
        if (timeline.length > 0) if (timeline[0].content.length > 20) content = timeline[0].content.substring(0, 20); else content = timeline[0].content;
        comm.io.call({
            action: "getShareInfo",
            data: {
                id: id,
                title: data.user.name + '的美丽历程',
                thumbnail: data.user.avatar,
                content: content
            }
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