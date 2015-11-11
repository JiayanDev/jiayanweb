define(["commJs", "jquery"], function(comm, jQuery) {
	(function ($) {
		$.fn.innerText = function (msg) {
			if (msg) {
				if (document.body.innerText) {
					for (var i in this) {
						this[i].innerText = msg;
					}
				} else {
					for (var i in this) {
						this[i].innerHTML.replace(/\&lt;br\&gt;/gi, "\n").replace(/(&lt;([^&gt;]+)&gt;)/gi, "");
					}
				}
				return this;
			} else {
				if (document.body.innerText) {
					return this[0].innerText;
				} else {
					return this[0].innerHTML.replace(/\&lt;br\&gt;/gi, "\n").replace(/(&lt;([^&gt;]+)&gt;)/gi, "");
				}
			}
		};
	})(jQuery);

	var cacheEventData = {};
	var cacheUserData;

	function init(){
		comm.setupWorkspace();
		var id = getId();
		var isWebKit = comm.isWebKit();

		if( id ){
			if( isWebKit ){
				loadData();
				getUserInfo();
			}else{
				loadData();
			}
		}else{
			return false;
		}
		bindEvent();

		var title = '话题详情';
		title = window.location.href.indexOf('topic.html')>0?title: '日志详情';
		comm.io.call({
			action:"setNavigationBarTitle",
			data: {"title":title}
		});
	}

	function loadData () {
		var id = getId();
		comm.io.get({
			url: comm.config.BASEPATH+"post/detail",
			data:{
				postId:id
			},
			success:function(data){
				render(data);
				setPostDetailData(data);
				if( data.commentCount ){
					loadComment(id);
				}else{
					$('._nocomment').removeClass('none');
				}
				hideNativeLoading();

				onGetShareInfo(data);
			}
		});
	}

	function loadComment (id) {
		comm.io.get({
			url: comm.config.BASEPATH + "/post/getCommentList",
			data:{
				postId:id
			},
			success:function  (data) {
				renderComment(data);
			}
		});
	}

	function onGetShareInfo(data) {
		var title = '', content = '';
		if (window.location.href.indexOf('topic.html') > 0) {
			//var texts = $('#topicContent').innerText().split("\n");

			//var texts = $('#topicContent').innerHTML.replace(/\&lt;br\&gt;/gi, "\n").replace(/(&lt;([^&gt;]+)&gt;)/gi, "");
			//var texts = $('#topicContent').text().split("\n");
			var texts = $('#topicContent')[0].innerText.split("\n");

			if (texts.length > 0) if (texts[0].length > 20) title = texts[0].substring(0, 20); else title = texts[0];
			if (texts.length > 1) if (texts[1].length > 20) content = texts[1].substring(0, 20); else content = texts[1];
		} else {
			title = data.userName + '的美丽日记' + window.G_formatDate(data.createTime);
			if (data.content.length > 20) content = data.content.substring(20); else content = data.content;
		}

		comm.io.call({
			action: "getShareInfo",
			data: {
				id: data.id,
				title: title,
				thumbnail: data.avatar,
				content: content
			}
		});
	}

	function renderComment (data) {
		if( !!data && data.length ){
			var $el = $('<div></div>');

			comm.render({
				tpl:"tplComment",
				data:data,
				renderTo:$el
			});
			return $el.children().prependTo($('#commentList'));
		}
	}

	function getUserInfo () {
		comm.io.call({
			action:"getUserInfo",
			success:"onGetUserInfo",
			error:"onGetUserInfoError"
		});
	}

	window.G_onGetUserInfo = function (data) {
		if( !!data && data.code == 0 ){
			cacheUserData = data.data;
			var token = data.data.token;
			comm.setToken(token);
			//loadData();
			//alert('成功'+JSON.stringify(data));
		}else{
			//alert('no login');
			comm.setToken('no login');
			//loadData();
		}
	}

	window.G_onGetUserInfoError = function  (data) {
		alert(data);
		comm.setToken('no login');
		//loadData();
	}

	function render (data) {
		$('#topicContent').html(data.content.replace(/\n/g, '<br />'));
		$('#likeCount').html(data.likeCount)
		$('#commentCount').html(data.commentCount)
		$('#createon').html(window.G_formatTime(data.createTime))
		renderAuthor(data);

		var img = [];
		var imgData = data.photoes;

		if( !!imgData ){
			// imgData = JSON.parse(imgData);
			$.each( imgData, function  (i, photo) {
				img.push('<img src="'+photo+'">');
			});

			$('#topicImg').html(img.join(''));
		}
	}

	function renderAuthor (data) {
		//if (!data.avatar) data.avatar = window.G_default_img;
		var aStr = '<a ' + (data.role == 'angel' ? 'target="_blank" href=timeline.html?id=' + data.userId : '') + '>';
		var tpl = [aStr,
			'<img src="{AVATAR}" onerror="this.src=window.G_default_img">',
			'</a>',
			'<div class="text">',
			'<p class="nickname-gray">',
			aStr+'{USERNAME}'+'</a>',
			comm.getRoleText(data.role) + '</a></p>',
			'<span class="small gray-text-x2">{GENDER} {PROVINCE}{CITY}</span>',
			'</div>']
			.join('');

        data.gender = {1:'男', 0:'女'}[data.gender]||'';
        data.province = data.province||'';
        data.city = data.city||'';

        var html = comm.fillString( tpl, data);
        $('#author').html(html);
	}

	function bindEvent () {
		$('div').attr('onclick', "");

		// @TODO::等上线后用tap事件
		$('body').on('click', function(evt) {
			var $t = $(evt.target),
				eId = evt.target.id;

			if( eId == 'likeIcon'){
				isCancel = $t.hasClass('on');
				$t.toggleClass('on');
				doLike(isCancel);
				var likeCount = 1*$('#likeCount').html();
				var gap = gap * (isCancel?-1:1);
				$('#likeCount').html(likeCount+gap);
			}

			if( eId== 'commentBtn' ){
				// 评论日记
				openComment({
					toUserId: $t.data('userid'),
					toUserName: $t.data('username'),
					subject: 'diary',
					subjectId: getId()
				});
				return false;
			}

			var commentEl = $t.closest('.commentForPost, .replyForPost');
			if(  commentEl.length > 0 ){
				console.log('commentForPost or replyForPost');
				openComment({
					toUserName: commentEl.data('username'),
					toUserId: commentEl.data('userid'),
					subject:'comment',
					subjectId: commentEl.data('id')
				});
				return false;
			}

			var isGalleryImg = $t.closest('#topicImg').length > 0;
			var thisImg = $t.attr('src');
			if( thisImg && isGalleryImg ){
				var imgList = [];
				var index = 0;

				$('#topicImg img').each(function( i ) {
					if( this.src == thisImg ){
						index = i;
					}
					imgList.push(this.src);
				});

				comm.io.call({
					action:"playImg",
					data: {
						imgList: imgList,
						defaultIndex:index
					}
				});
			}
		});
	}

	function renderCommentOnNativeCallback(data){
		if( typeof data.code !='undefined' ) data = data.data;
		var insertedEl = false;

		var commentCountEl = $('#commentCount');
		var commentCount = commentCountEl.html();
		commentCountEl.html( ++commentCount );

		if( data.subject == 'diary' || data.subject == 'topic' ){
			if (cacheUserData) {
				data['avatar'] = cacheUserData.avatar;
				data['gender'] = cacheUserData.gender;
				data['province'] = cacheUserData.province;
				data['city'] = cacheUserData.city;
			}

			insertedEl = renderComment([data]);
		}else{
			insertedEl = appendOneReply( data );
		}

		$('._nocomment').addClass('none');

		if( insertedEl ){
			bottomScrollTo(insertedEl);
		}
	}

	function appendOneReply( data ){
		var subjectId = data.subjectId;
		var insertedEl = false;

		var tpl = [
			'<div class="comment-reply-item replyForPost" data-userid="'+data.userId+'" data-id="'+data.id+'" id="replyPanel_'+data.id+'">',
                '<span class="nickname">'+(data.userName||'美丽天使')+'</span>回复<span class="nickname">'+(data.toUserName||'美丽天使')+'：</span>',
                data.content,
            '</div>'
		].join('');

		if( subjectId ){

			var commentReplyPanel = findCommentReplyPanel(subjectId);

			if( commentReplyPanel ){
				commentReplyPanel.parent().removeClass('none');
				insertedEl = $(tpl).appendTo(commentReplyPanel);
			}
		}
		return insertedEl;
	}

	function findCommentReplyPanel (subjectId) {
		var commentReplyPanel = $('#commentReplyPanel_'+subjectId);

		if( commentReplyPanel.length ){
			return commentReplyPanel;
		}else{
			var replyPanel = $('#replyPanel_' + subjectId );
			if(replyPanel){
				commentReplyPanel = replyPanel.closest('.commentReplyPanel');
				if( commentReplyPanel ){
					return commentReplyPanel;
				}
			}
		}
		return false;
	}

	function setPostDetailData (data) {
		data = data||{};
		data.comments = undefined;
		comm.io.call({
			action:"postDetailData",
			data:data
		});
	}

	function bottomScrollTo (el) {
		var pos = el.offset();
		var posY = pos.top-170;
		$("html, body").animate({ scrollTop: posY }, "normal");
	}

	window.G_scrollTo = bottomScrollTo;


	function openComment(options){
		// 测试
		if( isDebug() ){
			comm.io.call({
				action: 'testForCallNativePleaseGiveBackWhatIHadSend',
				data: options,
				success: 'testForCallNativeConsoleLogWhatRev',
				error: 'testForCallNativeError'
			});
		}else{
			comm.io.call({
				action:'openCommentPanel',
				data: options,
				success: 'renderPostComment',
				error:'errorForCallNavtive'
			});
		}
	}

	function switchLike (data) {
		data = data||{};
		if( data.code != 0  )return;
		data = data.data;
		if( !data )return;

		var likeCountEl = $('#likeCount');
		var likeCount = likeCountEl.html();

		data.hasLike? ++likeCount: --likeCount;

		likeCount = likeCount<0?0:likeCount;

		likeCountEl.html( likeCount );
	}

	window.G_errorForCallNavtive = function(data) {
		// console.log( 'error from native', data );
		alert('native resp error\n'+JSON.stringify(data));
	}

	window.G_renderPostComment = renderCommentOnNativeCallback;
	window.G_switchLike = switchLike;

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