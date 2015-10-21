define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		comm.setupWorkspace();
		var id = getId();

		if( id ){
			loadData(id);
		}else{
			// 提示不存在
			comm.utils.hideNativeLoading();
			comm.utils.alertMsg('id 不存在')
		}
		bindEvent();

		comm.io.call({
			action:"setNavigationBarTitle",
			data: {"title":'活动评论'}
		});
	}

	function loadData (id) {
		comm.io.get({
			url: comm.config.BASEPATH+"event/detail",  //s
			data:{
				id: id
			},
			success:function(data){
				render(data);
				comm.utils.hideNativeLoading();
			},
			error:function  (msg) {
				comm.utils.hideNativeLoading();
				comm.utils.alertMsg('网络繁忙')
			}
		});
	}

	function bindEvent(){
		$('#applymentBtn').click(function(){
			applyment();
		});
	}

	function render (data) {
		renderComment(data);
	}

	function renderComment(data){
		var commentLength = data.commentList.length;

		if( !commentLength )return;

		var $el = $('<div></div');
		comm.render({
			tpl:'tplForComment',
			data: data.commentList,
			renderTo: $el
		});

		$('#commentList').html('').append( $el.children() );
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