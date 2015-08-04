define([ "commJs"], function(comm) {

	function main(){
        // comm.checkLogin(function(){
            init();
        // })
    }

	function init(){
		comm.setupWorkspace();
		getList();
		bindEvent();
	}

	function getList( ){
		comm.io.get({
			url: comm.config.BASEPATH+'post/list',
			data:{
				daddy:8,
				type:'diary'
			},
			success: function(d){
				renderList(d);
			}
		});
	}

	function renderList( d ){
		comm.render({
			tpl:"tplList",
			data:d,
			renderTo: "#_list",
			isTableList: true
		});
	}
	
	// function renderDetail(d){
	// 	var el = $('<div></div>')
	// 	var el = comm.render({
	// 		tpl:"tplAgentDetail",
	// 		data:d,
	// 		renderTo: el
	// 	});
	// 	if( d.length && d[0].hasCode){
			
	// 	}
	// 	return el;
	// }
	
	  
	function renderDetail(id){
		var el = $('<div style="border:2px solid #555;width:322px;height:568px;margin:0 auto;"><iframe style="width:318px;height:568px;border:none;" src="http://app.jiayantech.com/app/html/dairy.html?id='+id+'"></div>');
		return el;
	}

	function bindEvent(){
		$('body').click(function(evt){
			var $t = $( evt.target );

			if( $t.hasClass('_detail') ){
				comm.dialog({
					onLoad: function(options){
						var id = $t.data('id');
						// getDetail( id, function(d){
						var el = renderDetail(id);
						options.content.append( el );
						// });
					},
					title: "日记详情"
				});
				return false;
			}

			if( $t.hasClass('_verify')){
				var status = $t.data('status');
				var postId = $t.data('id');

				if( status == '通过'){
					// 改为未通过
					comm.confirm({
						el: $t,
						content: "<textarea class='form-control' placeholder='填写不通过的原因'></textarea>",
						onYES: function(options){
							var textareaEl =  $(options.target).closest('.popover-content').find('textarea');
							var reason = textareaEl.val();

							verify( {
								postId: postId,
								reason: reason,
								status: '不通过'
							},function(argument) {
								options.unload();
								var td = $t.closest('td');
								td.html(tdContent(postId, "不通过", "通过"));
							});
						}
					});
				}else{
					// 审核通过
					verify({
						postId: postId,
						status: '通过'
					}, function(){
						var td = $t.closest('td');
						td.html(tdContent(postId, "不通过", "通过"));
					})
				}


				return false;
			}

			// 审核
			if( evt.target.id == 'angentNameBtn'){
				getList(undefined, renderList);
				comm.showLoading( $('#_list') );
			}
		});
	}

	function tdContent( postId, status, antiStuats ){
		var h = [
			'<a href="#" class="_verify" data-id="'+postId+'" data-status="'+status+'">'+antiStuats+'</a>',
			'<a href="#" class="_detail" data-id="'+postId+'">详情</a>'
		].join('&nbsp;&nbsp;');

		return h;
	}

	function verify (data, cb) {
		comm.io.post({
			url: comm.config.BASEPATH + 'post/verify',
			data:data,
			success:function(data) {
				cb && cb();
			},
			error:function  (msg) {
				comm.utils.alertMsg(msg);
			}
		});
	}


	return {
		setup: main
	}
});