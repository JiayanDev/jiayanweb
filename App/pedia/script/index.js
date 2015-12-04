/**
 * Created by liangzili on 15/11/25.
 */
define(["commJs", "pediaCommJs"], function (comm, pediaComm) {
    function init() {
        comm.setupWorkspace();
        bindEvent();
        loadCategoryData();
        //loadSuggestData();
    }

    function loadCategoryData() {
        comm.io.get({
            url: comm.config.BASEPATH + "pedia/tree",
            success: function (data) {
                renderCategoryList(data.data);
                //renderSuggestList(data.recommend);
                comm.utils.hideNativeLoading();
            },
            error: function (msg) {
                comm.utils.alertMsg("加载出错");
                comm.utils.hideNativeLoading();
            }
        });
        comm.io.get({
            url: comm.config.BASEPATH + "pedia/search/recommend/list",
            success: function (data) {
                renderSuggestList(data);
            },
            error: function (msg) {
                comm.utils.alertMsg("建议列表加载出错");
            }
        });
    }

    function bindEvent() {
        pediaComm.bindSearchEvent();
    }

    //function loadSuggestData() {
    //    comm.io.get({
    //        url: 'http://apptest.jiayantech.com/event/applyment/list',
    //        //url: comm.config.BASEPATH + "event/applyment/list",
    //        data: {
    //            eventId: 1087
    //        },
    //        success: function (data) {
    //            renderSuggestList(data);
    //        },
    //        error: function (msg) {
    //            comm.utils.alertMsg("加载出错");
    //        }
    //    });
    //}

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