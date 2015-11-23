define(["commJs"], function (comm) {
	var cacheEventData = {};

	function init() {
		comm.setupWorkspace();
		var id = getId();
		// hideNativeLoading();

		if (id) {
			loadData(id);
			loadRelativeEvent(id);
		} else {
			// 提示不存在
			comm.utils.hideNativeLoading();
			comm.utils.alertMsg('id 不存在')
		}
		bindEvent();

		comm.io.call({
			action: "setNavigationBarTitle",
			data: {"title": '活动详情'}
		});
	}

	function loadData(id) {
		comm.io.get({
			url: comm.config.BASEPATH + "event/detail",  //s
			data: {
				id: id
			},
			success: function (data) {
				cacheData(data);
				render(data);
				getUserTimeline(data);
				comm.utils.hideNativeLoading();

				onGetShareInfo(data);
			},
			error: function (msg) {
				comm.utils.hideNativeLoading();
				comm.utils.alertMsg('请求出错')
			}
		});
	}

	function loadRelativeEvent(id) {
		comm.io.get({
			url: comm.config.BASEPATH + 'related/event/list',
			data: {
				eventId: id
			},
			success: function (data) {
				renderRelativeEvent(data);
			}
		})
	}

	function getUserTimeline(data) {
		var userId = data.userId;
		comm.io.get({
			url: comm.config.BASEPATH + 'post/timeline',
			data: {
				id: userId
			},
			success: function (data) {
				renderLastestPost(data, userId);
			}
		});
	}

	function renderLastestPost(data, userId) {
		var post = false;
		var data = data.timeline;

		if (!!data && data.length) {
			$.each(data, function () {
				if (this.type != 'event') {
					post = this;
					return false;
				}
			});
			if (!post)return false;

			$('#postContent').html(post.content);

			var imgList = [];

			$.each(post.photoes, function (i, photo) {
				imgList.push('<li><img src="' + photo + '"></li>');
			});

			$('#gallery').html(imgList.join(''));
			$('#timelinePanel a').attr('href', "timeline.html?id=" + userId);
			$('#timelinePanel').removeClass('none');
		}
	}

	function renderRelativeEvent(data) {
		var html = [];

		$.each(data, function () {
			html.push(['<a href="eventdetail.html?id=' + this.eventId + '">',
				'<div>',
				'<img src="' + this.posterImg + '">',
				'</div>',
				'</a>'].join(''));
		});

		$('#relatedEventList').html(html.join(''));
		if (html.length) {
			$('#relatedEventList').parent().removeClass('none');
		}
	}

	function cacheData(data) {
		$.each(['id', 'hospitalName', 'doctorName', 'beginTime', 'categoryIds'], function (i, key) {
			cacheEventData[key] = data[key]
		});
		var angelUserInfo = {
			id: data['userId'],
			avatar: data['userAvatar'],
			name: data['userName'],
			phone: data['userPhone']
		};
		cacheEventData['angelUserInfo'] = angelUserInfo;
		console.log(cacheEventData);
	}


	function bindEvent() {
		$('#applymentBtn').click(function () {
			applyment();
		});
		$("#share-wechat-friends-btn").click(function () {
			shareToWechatFriends();
		});
		$("#share-wechat-timeline-btn").click(function () {
			shareToWechatTimeline();
		});

		//$('#applymentList').click(function () {
		//	getApplymentList();
		//});
	}

	function applyment() {
		comm.io.call({
			action: "applymentEvent",
			data: {
				id: getId(),
				eventInfo: cacheEventData
			}
		});
	}

	function shareToWechatFriends() {
		comm.io.call({
			action: "shareEventToWechatFriends"
		});
	}

	function shareToWechatTimeline() {
		comm.io.call({
			action: "shareEventToWechatTimeline"
		});
	}

	function getApplymentList() {
		comm.io.call({
			action: "getApplymentList",
			data: {
				id: getId()
			}
		});
	}

	function onGetShareInfo(data) {
		var content = '';
		var contentCur = $('#event-desc-content-cur');
		if (contentCur) {
			var desc = contentCur.text();
			if (desc.length > 20) content = desc.substring(0, 20); else content = desc.value;
		}

		comm.io.call({
			action: "getShareInfo",
			data: {
				id: getId(),
				title: data['title'],
				thumbnail: data['coverImg'],
				content: content
			}
		});
	}

	function render(data) {
		renderHeaderProfile(data);
		renderEventInfo(data);
		renderTopic(data);
		renderDetailDesc(data);
		renderComment(data);
	}

	function renderTopic(data) {
		loadTopic(data.bindTopicId);
		$('#eventTopicMore').attr('href', 'topic.html?id=' + data.bindTopicId);
		$('#eventIntroLink').attr('href', 'eventintro.html?id=' + data.id);
	}

	function loadTopic(bindTopicId) {
		if (!bindTopicId || bindTopicId=='undefined') {
			return;
		}
		comm.io.get({
			url: comm.config.BASEPATH + 'post/detail',
			data: {
				postId: bindTopicId
			},
			success: function (data) {
				var html = window.clipString(data.content || '空内容', 300);
				html = html.replace(/<img.*>/ig, "");
				$('#eventTopic').html(html);
				$('#event-topic').removeClass('none');
			},
			error:function(msg){
				console.log(msg);
			}
		})
	}

	function renderCategory(data) {
		var html = [];
		data.categoryIds && $.each(data.categoryIds, function () {
			html.push('<span class="dairy-header-value-item">' + this.name + '</span>');
		});
		$('#categoryList').html(html);
	}

	function renderHeaderProfile(data) {
		var on = data['status'] == '发布' ? 'on' : '';
		data['showStatus'] = data['status'] == '发布' ? '招募中' : data['status'];
		var tpl = ['<a href="#"><img src="{DOCTORAVATAR}" onerror="this.src=window.G_default_img"></a>',
			'<div class="relative text">',
			'<span class="nickname">{DOCTORNAME}</span>',
			'&nbsp;<span>{DOCTORTITLE}</span>',
			'&nbsp;<span>{HOSPITALNAME}</span>',
			'<span class="status ' + on + ' absolute">{SHOWSTATUS}</span>',
			'</div>'
		].join('');

		var h = comm.fillString(tpl, $.extend(data, {}));

		$('#profilePanel').html(h);
		$('#headerPanel img').attr('src', data.coverImg);

		if (on) $('#eventDescPanelContainer').removeClass('none');
		else {
			$('#eventIntroLinkContainer').removeClass('none');
			$('#applymentBtn').attr('disabled','disabled');
			$('#applymentBtn').css('background-color','lightgrey');
			$('#applymentBtn').css('border-width','0');
		}
	}

	function renderEventInfo(data) {
		renderCategory(data);
		// $('#hospitalName').html(data.hospitalName);
		$('#userName').html(data.userName);
		$('#beginTime').html(formatTime(data.beginTime));
		$('#applyment').html('限额' + (!!data.applymentLimit ? data.applymentLimit : 0) + '人 已报名' + (!!data.applymentList ? data.applymentList.length : 0) + '人');
		renderApplymentList(data.applymentList);
	}

	function formatTime(time) {
		return window.G_formatTime(time);
	}

	function renderApplymentList(data) {
		//data = [data[0], data[0],data[0],data[0],data[0],data[0],data[0],data[0],data[0],data[0],data[0],data[0],data[0],data[0]];

		var html = [];

		var i = 0;
		!!data && data.length && $.each(data, function () {
			html.push('<img src="' + this.userAvatar + '" onerror="this.src=window.G_default_img">');
			if (++i >= 6) {
				return false;
			}
		});
		if (!!data && data.length) {
			html.push('<span class="absolute">' + data.length + '</span>');
		}

		$('#applymentList').html(html.join(''));
		$('#applymentList-link').attr('href', 'applymentList.html?id=' + getId());
	}

	function renderDetailDesc(data) {
		var navHtml = [];
		var contentHtml = [];
		data.desc && $.each(JSON.parse(data.desc), function () {
			if (!this.key) return true;
			var cur = navHtml.length == 0 ? 'cur' : '';
			navHtml.push('<span class="' + cur + '">' + this.key + '</span>');

			if (cur) contentHtml.push('<div id="event-desc-content-cur" class="event-desc-content">' + this.value + '</div>');
			else contentHtml.push('<div class="event-desc-content">' + this.value + '</div>');
		});

		if (navHtml.length <= 0) {
			$('#eventDescPanelContainer').addClass('none');
			return;
		}

		$('#eventDescNav').html(navHtml.join(''));
		$('#eventDescContent').html(contentHtml.join(''));

		require(['widget/touchslide'], function (ts) {
			new ts.TouchSlide({
				slideCell: "#eventDescPanel",
				titCell: ".hd span",
				titOnClassName: "cur"
			});
		});
	}

	function renderComment(data) {
		var commentLength = data.commentList.length;

		if (!commentLength)return;

		$('#commentPanel').removeClass('none');

		if (commentLength > 2) {
			data.commentList.length = 2;
		}
		var $el = $('<div></div>');
		comm.render({
			tpl: 'tplForComment',
			data: data.commentList,
			renderTo: $el
		});

		if (commentLength > 2) {
			$el.append(['<div class="btn-panel">',
				'<a class="btn" href="eventcomment.html?id=' + data.id + '">更多评论(' + commentLength + ')</a>',
				'</div>'].join(''));
		}
		renderStar(data);

		$('#commentList').html('').append($el.children());
	}

	function renderStar(data) {
		var html = [];
		var satisfyLevel = data.satisfyLevel ? Math.floor(data.satisfyLevel) : 0;
		var satisfyLevelToDoctor = data.satisfyLevelToDoctor ? Math.floor(data.satisfyLevelToDoctor) : 0;
		for (var i = 1 * satisfyLevel; i > 0; i--) {
			html.push('<i class="icon icon-star icon-star-full"></i>');
		}
		for (var i = 5 - 1 * satisfyLevel; i > 0; i--) {
			html.push('<i class="icon icon-star icon-star-empty"></i>');
		}
		html.push('<span class="num-satisfy-level">' + (data.satisfyLevel == null ? 0 : data.satisfyLevel) + '</span>');
		$('#mltsstar').html(html.join(''));

		var html = [];
		for (var i = 1 * satisfyLevelToDoctor; i > 0; i--) {
			html.push('<i class="icon icon-star icon-star-full"></i>');
		}
		for (var i = 5 - 1 * satisfyLevelToDoctor; i > 0; i--) {
			html.push('<i class="icon icon-star icon-star-empty"></i>');
		}
		html.push('<span class="num-satisfy-level">' + (data.satisfyLevelToDoctor == null ? 0 : data.satisfyLevelToDoctor) + '</span>');
		$('#zzysstar').html(html.join(''));

	}


	function hideNativeLoading() {
		comm.io.call({
			action: "hideLoading"
		});
	}

	function getId() {
		var hash = comm.hashMng();
		var id = hash.id;
		return id;
	}

	function isDebug() {
		var hash = comm.hashMng();

		return hash.debug == 1;
	}

	//window.G_requestShareData = function () {
	//    return JSON.stringify(cacheData);
	//};

	return {setup: init}
});