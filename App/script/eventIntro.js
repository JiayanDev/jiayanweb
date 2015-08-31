define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		var id = getId();

		if( id ){
			loadData(id);
		}else{
			// 提示不存在
			comm.utils.hideNativeLoading();
			comm.utils.alertMsg('id 不存在')
		}
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
				comm.utils.alertMsg('系统繁忙')
			}
		});
	}

	

	function render (data) {
		renderDetailDesc(data);
	}


	function renderDetailDesc (data) {
		var navHtml = [];
		var contentHtml = [];
		data.desc && $.each( JSON.parse(data.desc), function  () {
			var cur = navHtml.length == 0? 'cur':'';
			navHtml.push('<span class="'+cur+'">'+this.key+'</span>');

			contentHtml.push('<div class="event-desc-content">'+this.value+'</div>');
		});

		$('#eventDescNav').html(navHtml.join(''));
		$('#eventDescContent').html(contentHtml.join(''));

		require(['widget/touchslide'], function  (ts) {
			new ts.TouchSlide({ 
				slideCell:"#eventDescPanel",
				titCell:".hd span",
				titOnClassName:"cur"
			});
		});
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