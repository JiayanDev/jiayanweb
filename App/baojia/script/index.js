/**
 * Created by zcw_RMBP13 on 16/1/13.
 */
define(["commJs", "bxslider"], function (comm, bxslider) {

    function init() {
        comm.setupWorkspace();
        bindEvent();
        loadData();
    }

    function loadData() {
        //var ajax1=comm.io.get({
        //    url: comm.config.BASEPATH + "pedia/tree",
        //    success: function (data) {
        //        renderCategoryList(data.data);
        //        //renderSuggestList(data.recommend);
        //        comm.utils.hideNativeLoading();
        //    },
        //    error: function (msg) {
        //        comm.utils.alertMsg("加载出错");
        //        comm.utils.hideNativeLoading();
        //    }
        //});
        //var ajax2=comm.io.get({
        //    url: comm.config.BASEPATH + "pedia/search/recommend/list",
        //    success: function (data) {
        //        renderSuggestList(data);
        //    },
        //    error: function (msg) {
        //        comm.utils.alertMsg("建议列表加载出错");
        //    }
        //});
        //$.when(ajax1,ajax2).done(function(){
        //    comm.preloadNextPageWithUrl("category.html");
        //});
    }

    function bindEvent() {
        $('#marquee').bxSlider({
            /*mode:'vertical', //默认的是水平*/
            displaySlideQty:1,//显示li的个数
            moveSlideQty: 1,//移动li的个数
            captions: true,//自动控制
            auto: false,
            controls: false//隐藏左右按钮
        });
    }


    return {setup: init};
});