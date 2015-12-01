define(["commJs"], function(comm) {


	function init(){
		comm.setupWorkspace();
		var id = getId();

		if( id ){
			loadData(id);
		}else{
			// 提示不存在
		}
		bindEvent();
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

	function loadData (id) {
		comm.io.get({
			
			url: comm.config.BASEPATH+"post/detail",
			data:{
				postId: id
			},
			success:function(data){
				onGetShareInfo(data);
				renderProfile(data);
				renderHeader(data);
				renderPost(data);
				renderComment(data);
				setNavigationBarTitle(data);
				comm.utils.hideNativeLoading();
			}
		});
	}

	function onGetShareInfo(data) {
		var content = '';
		if (data.content.length > 20) content = data.content.substring(20); else content = data.content;

		comm.setWeixinShareMeta(data.userName+'的美丽日记',data.avatar,content);

		comm.io.call({
			action: "getShareInfo",
			data: {
				id: getId(),
				title: data.userName+'的美丽日记',
				thumbnail: data.avatar,
				content: content
			}
		});
	}

	function renderProfile (data) {
		//if (!data.avatar) data.avatar = window.G_default_img;
		var tpl = [
                '<a href="user.html?id={USERID}"><img src="{AVATAR}" onerror="this.src=window.G_default_img"></a>',
                '<div class="text">',
                    '<p class="nickname"><a href="user.html?id={USERID}">{USERNAME}</a></p>',
                    '<div class="small">',
                        '<span>{GENDER}</span>&nbsp;&nbsp;',
                        '<span>{CITY}</span>&nbsp;&nbsp;',
                    '</div>',
                '</div>'].join('');

        !!data.city || (data.city="");
        if( typeof data.gender == 'undefined'){
        	data.gender = "";
        }else{
        	data.gender = ['女', "男"][data.gender*1];
        }
        $('#profilePanel').html( comm.fillString(tpl, data) );
	}

	function renderPost(data){
		$('#postContent').html(data.content);
		$('#commentIcon').data('userid', data.userId);
		$('#commentIcon').data('username', data.userName);

		renderGallery(data.photoes);

		// data.createTime = window.G_formatTime(data.createTime);
		$.each(['createTime', 'commentCount', 'likeCount'], function(i,key){
			$('#'+key).html(data[key]);
		});
		if( data.isLike ){
			$('#likeIcon').addClass('on');
		}
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

			if( eId== 'commentIcon' ){
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

	function doLike ( isCancel ) {
		// var action = isCancel?"cancel_like":"like";
		// var id = getId();

		// comm.io.post({
		// 	url: comm.config.BASEPATH+'post/'+action,
		// 	data: {id:id},
		// 	success:function(){

		// 	}
		// });
	}

	function renderHeader(data){
		var el = $('<div></div>');
		comm.render({
            tpl: 'tplForHeader',
            data: data,
            renderTo: el
        });
        $(
        	['<div class="dairy-tip relative">',
	            '<a href="diaryheader.html?id='+data.headerId+'">',
	                '<p>查看全部日志</p>',
	                '<span class="absolute">></span>',
	            '</a>',
	        '</div>'].join('')

        ).insertAfter( $('#headerPanel').append( el.children()) ); 
	}

	function renderGallery (photoes) {
		var tpl = '<li><img src="{URI}"></li>',
			html = [];

		if( photoes ){
			$.each( photoes, function( i, photo) {
				html.push( tpl.replace('{URI}', photo) );
			});
			$('#gallery').html( html.join("") );
		}
	}

	function renderComment(data){
		var el = $('<div></div>');
		comm.render({
            tpl: 'tplForComment',
            data: data&&data.comments? data.comments: [],
            renderTo: el
        });
        return el.children().appendTo( $('#commentList') );
	}	

	// 设置app的bar条
	function setNavigationBarTitle(data){
		var seconds = data.createTime - data.operationTime;
		var oneDay = 24*60*60;

		var title = "手术恢复第" + Math.ceil( seconds/oneDay ) +"天";

		comm.io.call({
			action:"setNavigationBarTitle",
			data: {"title":title}
		});
	}


	function renderCommentOnNativeCallback(data){
		if( typeof data.code !='undefined' ) data = data.data;
		var insertedEl = false;

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


	function bottomScrollTo (el) {
		// var pos = el.offset();
		// var scrollTop = $(window).scrollTop();
		// var height = el.height();
		// var posY = pos.top-170;
		// var nowPos = scrollTop;
		// var step = 50;
		// var shouldGoUp = scrollTop>posY;
		// var direction = shouldGoUp?-1:1;

		// var timer = window.setInterval( function() {
		// 	var stop = shouldGoUp? (nowPos <=posY):(nowPos>=posY);

		// 	if( stop ){
		// 		window.clearInterval(timer);
		// 		timer = null;
		// 	}else{
		// 		nowPos = nowPos+step;
				// window.scrollTo(0, nowPos);
		// 	}
		// }, 100);
		
		var pos = el.offset();
		var posY = pos.top-170;
		$("html, body").animate({ scrollTop: posY }, "normal");

		// comm.io.call({
		// 	action: "scrollBottomToPosY",
		// 	data: {"posY": posY}
		// })
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

	window.G_testForCallNativeConsoleLogWhatRev = function(data) {
		// console.log('success from native', data, data.code, data.data );
		alert('native resp success\n'+JSON.stringify(data));
	}

	window.G_testForCallNativeError = function(data) {
		// console.log( 'error from native', data );
		alert('native resp error\n'+JSON.stringify(data));
	}

	window.G_errorForCallNavtive = function(data) {
		// console.log( 'error from native', data );
		alert('native resp error\n'+JSON.stringify(data));
	}

	window.G_renderPostComment = renderCommentOnNativeCallback;

	return {
		setup:init
	}
});