define(["commJs"], function(comm) {
	var cacheEventData = {};

	function init(){
		var id = getId();

		if( id ){
			loadData(id)
		}else{
			// 获取当前用户
		}
		bindEvent();
		
		var title = '话题详情';
		title = window.location.href.indexOf('topic.html')>0?title: '日志详情';
		comm.io.call({
			action:"setNavigationBarTitle",
			data: {"title":title}
		});
	}

	function loadData (id) {
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

	function renderComment (data) {
		if( !!data && data.length ){
			var $el = $('<div></div>');

			comm.render({
				tpl:"tplComment",
				data:data,
				renderTo:$el
			});
			return $el.children().appendTo($('#commentList'));
		}
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
		
		$('#topicContent').html(data.content);
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
		var tpl = ['<a>',
			'<img src="{AVATAR}">',
		 '</a>',
         '<div class="text">',
                '<p class="nickname-gray">{USERNAME}</p>',
                '<span class="small gray-text-x2">{GENDER} {PROVINCE}{CITY}</span>',
        '</div>'].join('');

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

		if( data.subject == 'diary' ){
			insertedEl = renderComment({comments:[data]});
		}else{
			insertedEl = appendOneReply( data );
		}

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

	function switchLike () {
		data = data||{};
		var like = data.hasLike;
		var likeCountEl = $('#likeCount');
		var likeCount = likeCountEl.html();

		like? ++likeCount: --likeCount;

		likeCount<0?0:likeCount;

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