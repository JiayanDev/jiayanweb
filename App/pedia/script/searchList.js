define(["commJs"], function (comm) {
	function init() {
		comm.setupWorkspace();
		var name = getName();
		// hideNativeLoading();

		if (name) {
			loadData(name);
		} else {
			// 提示不存在
			comm.utils.hideNativeLoading();
			comm.utils.alertMsg('name 不存在');
		}
		bindEvent();

		comm.io.call({
			action: "setNavigationBarTitle",
			data: {"title": '百科搜索'}
		});
	}

	function loadData(name) {
		comm.io.get({
			url: comm.config.BASEPATH + "pedia/item/list",
			data: {
				name: name
			},
			success: function (data) {
				render(data);
				comm.utils.hideNativeLoading();
			},
			error: function (msg) {
				comm.utils.hideNativeLoading();
				comm.utils.alertMsg(msg | '请求出错');
			}
		});
	}

	function bindEvent() {
		$('#applymentBtn').click(function () {
			applyment();
		});
	}

	function render(list) {
		var length = list.length;

		if (!length)return;

		var $el = $('<div></div>');
		comm.render({
			tpl: 'tplForSearch',
			data: list,
			renderTo: $el
		});

		$('#searchList').html('').append($el.children());
	}

	function getName() {
		var hash = comm.hashMng();
		var name = hash.name;
		return name;
	}

	return {setup: init}
});