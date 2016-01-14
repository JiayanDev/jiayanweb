/**
 * Created by zcw_RMBP13 on 16/1/13.
 */
define(["commJs"], function (comm) {
    function init() {
        //comm.setupWorkspace();
        //bindEvent();
        //loadCategoryData();
        ////loadSuggestData();

        $('#marquee').bxSlider({
            /*mode:'vertical', //默认的是水平*/
            displaySlideQty:1,//显示li的个数
            moveSlideQty: 1,//移动li的个数
            captions: true,//自动控制
            auto: true,
            controls: false//隐藏左右按钮
        });
    }

    function loadCategoryData() {
        var ajax1=comm.io.get({
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
        var ajax2=comm.io.get({
            url: comm.config.BASEPATH + "pedia/search/recommend/list",
            success: function (data) {
                renderSuggestList(data);
            },
            error: function (msg) {
                comm.utils.alertMsg("建议列表加载出错");
            }
        });
        $.when(ajax1,ajax2).done(function(){
            comm.preloadNextPageWithUrl("category.html");
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