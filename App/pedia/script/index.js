/**
 * Created by liangzili on 15/11/25.
 */
define(["commJs"], function (comm) {
    function init() {
        comm.setupWorkspace();
        loadCategoryData();
        loadSuggestData();
    }

    function loadCategoryData() {
        comm.io.get({
            url: 'http://apptest.jiayantech.com/',
            //url: comm.config.BASEPATH + "event/applyment/list",
            data: {
                eventId: 1087
            },
            success: function (data) {
                renderCategoryList(data);
            },
            error: function (msg) {
                comm.utils.alertMsg("加载出错");
            }
        });
    }

    function loadSuggestData() {
        comm.io.get({
            url: 'http://apptest.jiayantech.com/event/applyment/list',
            //url: comm.config.BASEPATH + "event/applyment/list",
            data: {
                eventId: 1087
            },
            success: function (data) {
                renderSuggestList(data);
            },
            error: function (msg) {
                comm.utils.alertMsg("加载出错");
            }
        });
    }

    function renderSuggestList(suggestItems) {
        var suggestLength = suggestItems === null ? 0 : suggestItems.length;
        if (!suggestLength) return;

        var $el = $('<div></div>');
        comm.render({
            tpl: 'tplForSuggest',
            data: suggestItems,
            renderTo: $el
        });
        $('#suggest-items').html('').append($el.children());
    }

    function renderCategoryList(categoryList) {
        var categoryLength = categoryList === null ? 0 : categoryList.length;
        if (!categoryLength) return;

        var $el = $('<div></div>');
        comm.render({
            tpl: 'tplForCategory',
            data: categoryList,
            renderTo: $el
        });
        $('#category-list').html('').append($el.children());
    }

    /**
     * @return {string}
     */
    window.G_getHotTag = function(isHot){
        if(!isHot) return "";
        return '<img class="absolute badge-hot-mid" src="../asset/img/icon_hot.png">';
    }

    return {setup: init};
});