/**
 * Created by liangzili on 15/11/27.
 */

define(["commJs", "pediaCommJs"], function (comm, pediaComm) {
    function init() {
        comm.setupWorkspace();
        var id = getId();
        if (id) {
            loadDetail(id);
        }
        else {
            // 提示不存在
            comm.utils.hideNativeLoading();
            comm.utils.alertMsg('id 不存在');
        }
    }

    function loadDetail(id) {
        comm.io.get({
            url: comm.config.BASEPATH + "pedia/tree",
            data: {
                id: id
            },
            success: function (data) {
                render(data);
                comm.utils.hideNativeLoading();
                comm.io.call({
                    action:"setNavigationBarTitle",
                    data: {"title": data.name}
                });
            },
            error: function (msg) {
                comm.utils.hideNativeLoading();
            }
        });
    }

    function render(data) {
        renderCategory(data.data);
        renderHeader(data.detail);
        renderRecommend(data.recommend);
        document.title = data.detail.name;

    }

    function renderHeader(header){
        if(!header) return;
        var $el = $('<div></div>');
        comm.render({
            tpl: 'tplForHeader',
            data: header,
            renderTo: $el
        });
        $('#category-header').html('').append($el.children());
    }

    function renderCategory(category){
        if (!category) return;
        var $el = $('<div></div>');
        comm.render({
            tpl: 'tplForCategory',
            data: category,
            renderTo: $el
        });
        $('#category-content').html('').append($el.children());
    }

    function renderRecommend(recommend){
        if (!recommend) return;
        var $el = $('<div></div>');
        comm.render({
            tpl: 'tplForInterest',
            data: recommend,
            renderTo: $el
        });
        $('#interest-content').html('').append($el.children());
    }

    function getId() {
        var hash = comm.hashMng();
        var id = hash.id;
        return id;
    }

    /**
     * @return {string}
     */
    window.G_getHotTag = function (isHot) {
        return isHot ? '<img class="absolute badge-hot-right" src="../asset/img/icon_hot.png">' : "";
    }

    return {setup: init};
})
;