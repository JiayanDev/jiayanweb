define(["commJs"], function(comm) {
	var url = comm.config.BASEPATH+"topic/all/base/{BASEID}/{PAGESIZE}/{DIRECTION}",
		container = $('#topicList'),

		baseId,
		listEl = $("#topicList"),
		loadingTipEl,
		loadMoreBtn,
		loading = false;

	function init(){
		baseId = -1;
		listEl.html('');
		removeMoreBtn();
		appendLoadMoreBtn();
		// loadData();
        bindEvent();
        showCreatePanel();
        galleryUploader();
	}


	function loadData(){
		var param = {
			baseId: baseId,
			pagesize: comm.config.PAGE_SIZE,
			direction:1  //@todo
 		};
 		loading = true;

		comm.io.get({
            url: url,
            param: param,
            success: function(d) {
                if (!d || d.length < 1) {
                	if( baseId < 0 ){
                		comm.utils.emptyTips( listEl, '没有话题');
                	}else{
                		$('<div class="load-more">没有更多话题</div>').appendTo(listEl);
                	}
                    removeMoreBtn();
                }else{
                	render(d);
                	baseId = d[d.length-1]['id'];
                }
                loadingTipEl.remove();
                loading = false;
            }
        });
       	loadingTipEl = comm.utils.loadingTips($("<div style='text-align:center;'></div")).appendTo(listEl);
	}


	function showCreatePanel(){
		var panel = $('#topicOrHelpCreatePanel');

        if( panel.data('moving') == 1 )return false;

        if( panel.hasClass('none') ){
            panel.removeClass('none');
            panel.data('moving', 1);
            $('#moreMenu').find('.icon').addClass('on');

            setTimeout(function(){
                panel.data('moving', 0)
            }, 500)
        }
	}

	function hideCreatePanel(){
		var panel = $('#topicOrHelpCreatePanel');
	
		if( panel.data('moving') == 1 )return false;
		
		panel.removeClass('bounceInUp').addClass('bounceOutDown');
        panel.data('moving', 1);

        $('#moreMenu').find('.icon').removeClass('on');

        setTimeout(function(){
            panel.data('moving', 0);
            panel.addClass('none').addClass('bounceInUp').removeClass('bounceOutDown');
        }, 500);
	}


	function submitDataToRemote (el, data, onSuccess) {
		
		comm.io.post({
			url:url,
			data: JSON.stringify({
				act:"create",
				entity_data: data
			}),
			success:function(){
				comm.utils.showMsg("保存成功");
				onSuccess();
			},
			el: $(el)
		})
	}

	//加载更多
	function appendLoadMoreBtn(){
		loadMoreBtn = $('<div class="load-more" style="width:789px;margin:0 auto;"><button style="margin-left:-40px;">加载更多&nbsp;<i class="fa fa-angle-double-down"></i></button></div>').insertAfter(listEl).click(function(){
			loadData();
		});
	}

	function removeMoreBtn(){
		!!loadMoreBtn && loadMoreBtn.remove();
		loadMoreBtn = null;
	}

	function render(data){
		var el = $('<div></div>');
		comm.render({
            tpl: 'tplForTopicList',
            data: data,
            renderTo: el
        });
        listEl.append( el.children());
	}

	function bindEvent () {
		container.off('click').on('click', function(evt){
			var t = evt.target,
				$t = $(t),
				id = t.id;

			if( $t.hasClass('_like') ){
				//comment
				var topicId = $t.data('id');
				var groupId = 1;
				submitLike( topicId, groupId, $t, $t.closest('.topic-item'));
				return false;
			}

			if( $t.hasClass('_comment') ){
				var topicId = $t.data('id');
				var groupId = 1;
				showCommentInput( topicId, groupId, $t);
				// submitLike( topicId, $t.closest('.topic-item'));
				return false;
			}	
		});

		$('._topic_cancel').off('click').on('click', function() {
			hideCreatePanel();
		})

		$(document).off('scroll').on('scroll',function(){
			setTimeout(function(){
				if( !loadMoreBtn || loading ){
					// console.log( loadMoreBtn, loading )
					return;
				}
				var scrollTop = $('body').scrollTop(),
					windowHeight = $(window).height(),
					docHeight = $(document).height();

				if( scrollTop + windowHeight + 100 > docHeight ){
					loadData();
				}
			}, 100);
		});
	}

	function showCommentInput(topicId, groupId, $t){
		var panel;
		comm.hideButtomNav();
		panel= $('#commentPanel');
		panel.removeClass('none');
		panel.find('button').off('click').on('click', function(){
			var val = panel.find('input').val();
			if( val ){
				// parentId的情况要加上
				submitComment(val, topicId, groupId, $t);
			}else{
				// 
			}
		})
	}

	function submitLike(topicId, groupId, $el, $topicItem){
		var submitLikeUrl = comm.config.BASEPATH + 'topic/add_positive_score';
		$likeCnt = $topicItem.find('._like_cnt');
		cnt = $likeCnt.html();
		$likeCnt.html(1*cnt+1);

		comm.io.post({
			url: submitLikeUrl,
			data: {
				id: topicId,
				group_id: groupId,
				user_info_id: 122
			},
			success:function(d){

			}
		});
	}

	function submitComment (content, topicId, groupId, $t, parentId) {
		var submitCommentUrl = comm.config.BASEPATH + "topic/comment";
		
		comm.io.post({
			url: submitCommentUrl,
			data:{
				"user_info_id": 122, //
				"group_id": groupId,
				"root_id": topicId,
				"comment_parent_id": parentId //可空
			},
			success:function(data) {
				$topicItem = $('#topicItem_'+topicId);
				// 评论数加1， 内容写到数据里
				loadOneTopicItem();
				// comm.utils.showMsg('成功发表评论')
			},
			el: $t
		});
	}

	function loadOneTopicItem(topicId){
		var param = {
			baseId: topicId,
			pagesize: 1,
			direction:1  //@todo
 		};

		comm.io.get({
            url: url,
            param: param,
            success: function(d) {
                renderOneTopicItem(d);
            }
        });
	}

	function renderOneTopicItem(data){
		var el = $('<div></div>');
		comm.render({
            tpl: 'tplForTopicList',
            data: data,
            renderTo: el
        });
        $topicItem = $('#topicItem_'+data.id);
        $newTopicItem = el.find('.topic-item');
        $topicItem.append( $newTopicItem.children());
	}

	function galleryUploader () {
		$loadingEl = $('<p style="text-align:center;"><i class="fa fa-spinner fa-pulse fa-spin"></i></p>');
		comm.utils.setupFileLoader({
            el: '._uploadPicForAddActGallery',
            beforeSubmit: function(e, data) {
                $loadingEl.insertBefore($("._uploadPicForAddActGallery"));
            },
            data:{
            	policy: 'eyJidWNrZXQiOiAiamlheWFuaW1nIiwgImV4cGlyYXRpb24iOiAxNDM2NTE4OTUzLCAic2F2ZS1rZXkiOiAidGVzdC9hdmF0YXIvOC9hdmF0YXIucG5nIn0=',
            	signature:'9c5a2b2d7673458cf616c966f35b55c2'
            },
            callback: function(resp) {
                // $('#photo_file').val(data);都没必要存在了
                var imgUrl = (resp && resp.data) || '';
                // $('#hasActPic img')[0].src = imgUrl;
                $loadingEl.remove();
                saveGalleryPic(imgUrl);
            },
            error: function(resp) {
                $loadingEl.html((resp && resp.msg) || '文件上传失败');
            }
        });
	}


	return {
		init: init
	}

});