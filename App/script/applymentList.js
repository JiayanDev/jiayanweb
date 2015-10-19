define(["commJs"], function (comm) {
	function init() {
		var id = getId();
		// hideNativeLoading();

		if (id) {
			loadData(id);
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
			url: comm.config.BASEPATH + "event/applyment/list",  //s
			data: {
				eventId: id
			},
			success: function (data) {
				render(data);
				comm.utils.hideNativeLoading();
			},
			error: function (msg) {
				comm.utils.hideNativeLoading();
				comm.utils.alertMsg('请求出错')
			}
		});
	}

	function bindEvent() {
		$('#applymentBtn').click(function () {
			applyment();
		});
	}

	function render(data) {
		renderApplymentList(data);
	}


	function renderApplymentList(applymentList) {
		var applymentLength = applymentList.length;

		if (!applymentLength)return;

		$('#applymentPanel').removeClass('none');

		var $el = $('<div></div>');
		comm.render({
			tpl: 'tplForApplyment',
			data: applymentList,
			renderTo: $el
		});
		
		$('#applymentList').html('').append($el.children());
	}

	function getId() {
		var hash = comm.hashMng();
		var id = hash.id;
		return id;
	}

	//window.G_requestShareData = function () {
	//    return JSON.stringify(cacheData);
	//};

	window.G_getRoleText = comm.getRoleText;

	window.G_getAngelLink = function (role, userId) {
		return (role == 'angel' ? 'target="_blank" href=timeline.html?id=' + userId : '');
	};

	return {setup: init}
});