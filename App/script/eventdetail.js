define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		var id = getId();
		// hideNativeLoading();

		if( id ){
			loadData(id);
			loadRelativeEvent(id);
		}else{
			// 提示不存在
			comm.utils.hideNativeLoading();
			comm.utils.alertMsg('id 不存在')
		}
		bindEvent();
	}

	function loadData (id) {
		comm.io.get({
			url: comm.config.BASEPATH+"event/detail",  //s
			data:{
				id: id
			},
			success:function(data){
				cacheData(data);
				render(data);
				getUserTimeline(data);
				comm.utils.hideNativeLoading();
			},
			error:function  (msg) {
				comm.utils.hideNativeLoading();
				comm.utils.alertMsg('请求出错')
			}
		});
	}

	function loadRelativeEvent (id) {
		comm.io.get({
			url: comm.config.BASEPATH+'related/event/list',
			data:{
				eventId:id
			},
			success:function  (data) {
				renderRelativeEvent(data);
			}
		})
	}

	function getUserTimeline (data) {
		var userId = data.userId;
		comm.io.get({
			url:comm.config.BASEPATH+'post/timeline',
			data: {
				id: userId
			},
			success:function(data){
				renderLastestPost(data, userId);
			}
		});
	}

	function renderLastestPost (data, userId) {
		if( !!data && data.length ){
			data = data[0];
			$('#postContent').html( data.content );

			var imgList = [];

			$.each( data.photoes, function  (i, photo) {
				imgList.push('<li><img src="'+photo+'"></li>');
			});

			$('#gallery').html( imgList.join('') );
			$('#timelinePanel a').attr('href', "timeline.html?id="+userId)
		}
	}

	function renderRelativeEvent (data) {
		var html = [];

		$.each(data,function  () {
			html.push(['<a href="eventdetail.html?id='+this.eventId+'">',
						'<div>',
		                        '<img src="'+this.posterImg+'">',
		                '</div>',
		    '</a>'].join(''));
		});

		$('#relatedEventList').html( html.join('') );
	}

	function cacheData (data) {
		$.each(['id','hospitalName', 'doctorName', 'beginTime', 'categoryIds'], function (i, key) {
			cacheEventData[key] = data[key]
		});
		cacheEventData['angelUserInfo'] = data['userInfo'];
		console.log(cacheEventData);
	}


	function bindEvent(){
		$('#applymentBtn').click(function(){
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
		renderHeaderProfile(data);
		renderEventInfo(data);
		renderTopic(data);
		renderDetailDesc(data);
		renderComment(data);

		$('#eventDetail').html(JSON.stringify(
			data
		)).append('<div style="margin-top:20px;"><a style="color:red;" href="timeline.html?id='+data.userId+'">进入美丽天使主页</a></div>');
	}

	function renderTopic (data) {
		loadTopic( data.bindTopicId );
		$('#eventTopicMore').attr('href', 'topic.html?id='+data.bindTopicId);
	}

	function loadTopic (bindTopicId) {
		comm.io.get({
			url:comm.config.BASEPATH+'post/detail',
			data:{
				postId: bindTopicId
			},
			success:function  (data) {
				$('#eventTopic').html(data.content||'空内容');
			}
		})
	}

	function renderCategory (data) {
		var html = [];
		data.categoryIds && $.each(data.categoryIds, function  () {
			html.push('<span class="dairy-header-value-item">'+this.name+'</span>');
		});
		$('#categoryList').html(html);
	}

	function renderHeaderProfile (data) {
		var tpl = ['<a href="#"><img src="{AVATAR}"></a>',
	        '<div class="text">',
	            '<span class="nickname">{DOCTORNAME}</span>',
	            '&nbsp;<span>{TITLE}</span>',
	            '&nbsp;<span>{HOSPITALNAME}</span>',
	        '</div>',
	        '<span class="status absolute">{STATUS}</span>'
	        ].join('');

	    var doctor = !!data.doctor? JSON.parse(data.doctor):{},
	    	title = doctor.title,
	    	h = comm.fillString(tpl, $.extend({}, data.userInfo, {
	    		status:data.status, 
	    		title: title,
	    		doctorName:data.doctorName, 
	    		hospitalName:data.hospitalName
	    	}));

	    $('#profilePanel').html(h);
	    $('#headerPanel img').attr('src', data.coverImg);
	}

	function renderEventInfo (data) {
		renderCategory(data);
		// $('#hospitalName').html(data.hospitalName);
		$('#userName').html(data.userName);
		$('#beginTime').html( formatTime(data.beginTime) );
		$('#applyment').html('限额30人 已报名'+data.applymentList.length+'人');
		renderApplymentList(data.applymentList);

	}

	function formatTime(time){
		return time;
	}

	function renderApplymentList (data) {
		var html = [];

		data && data.length && $.each(data, function () {
			html.push('<img src="'+this.avatar+'">');
		});
		if( data && data.length ){
			html.push('<span class="absolute">'+data.length+'</span>');
		}

		$('#applymentList').html( html.join('') );
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

	function renderComment(data){
		var commentLength = data.commentList.length;

		if( !commentLength )return;

		var $el = $('<div></div');
		comm.render({
			tpl:'tplForComment',
			data: data.commentList,
			renderTo: $el
		});

		if( commentLength > 2 ){
			$el.append(['<div class="btn-panel">',
	                        '<button class="btn">更多评论('+commentLength+')</button>',
	                    '</div>'].join(''));
		}
		renderStar(data);

		$('#commentList').html('').append( $el.children() );
	}

	function renderStar (data) {
		var html = [];
		for (var i = 1*data.satisfyLevel; i > 0; i--) {
			html.push('<i class="icon icon-star"></i>');
		}
		for (var i = 5 - 1*data.satisfyLevel; i > 0; i--) {
			html.push('<i class="icon icon-star-empty"></i>');
		}
		$('#mltsstar').html(html.join(''));

		var html = [];
		for (var i = 1*data.doctorSatisfyLevel; i > 0; i--) {
			html.push('<i class="icon icon-star"></i>');
		}
		for (var i = 5 - 1*data.doctorSatisfyLevel; i > 0; i--) {
			html.push('<i class="icon icon-star-empty"></i>');
		}

		$('#zzysstar').html(html.join(''));
		
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