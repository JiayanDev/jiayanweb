define(["commJs", "pediaCommJs"], function (comm, pediaComm) {

	function init() {
		comm.setupWorkspace();
		var name = getName();
		// hideNativeLoading();

		if (name) {
			$('#_search').val(name);
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
		pediaComm.bindSearchEvent();
	}

	function render(list) {
		var length = list.length;

		if (!length) {
			$('#_list-msg').show();
			return;
		}
		$('#_list-msg').hide();
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
		var name = hash.name?unescape(hash.name):name;
		return name;
	}

	/**
	 * @return {string}
	 */
	window.G_getHrefLink = function (depth, id) {
		if (depth) {
			if (depth.length == 1) {
				return 'category.html?id=' + id;
			}
			if (depth.length == 2) {
				return 'categorydetail.html?id=' + id;
			}
		}
		return 'itemdetail.html?id=' + id;
	}

	return {setup: init}
});