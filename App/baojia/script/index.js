/**
 * Created by zcw_RMBP13 on 16/1/13.
 */
define(["commJs", "slick"], function (comm, bxslider) {
    var get=comm.io.get;

    function init() {
        comm.setupWorkspace();
        bindEvent();
        loadData();
    }

    function loadData() {
        var ajax1=get({
            url: comm.config.BASEPATH + "pc/homepage/poster_item/list",
            success: function (data) {


                renderHeaderSlider(data);
            },
            error: function (msg) {
                comm.utils.alertMsg("加载出错");
                comm.utils.hideNativeLoading();
            }
        });


        //$.when(ajax1,ajax2).done(function(){
        //    comm.preloadNextPageWithUrl("category.html");
        //});
    }


    function getLinkOfItem(item){


        return "javascript:;";
    }

    function renderHeaderSlider(items){
        $.each(items, function (one) {
            var li = $("<div>").append(
                $("<a>").attr("href", getLinkOfItem(one)).append(
                    $("<img>").attr("src", one.coverImg)
                        .addClass("header-img")
                )
            );
            $('#marquee').append(li);

        });



        $('#marquee').slick({
            arrows:false,
            dots:true,
            cssEase:"cubic-bezier(.02, .01, .47, 1)",
            easing:"swing",
            edgeFriction:0,
            swipeToSlide:true,
            speed:300,
            responsive:true,
            mobileFirst:true



            ///*mode:'vertical', //默认的是水平*/
            //displaySlideQty:1,//显示li的个数
            //moveSlideQty: 1,//移动li的个数
            //captions: true,//自动控制
            //auto: true,
            //controls: false//隐藏左右按钮
        });
    }

    function bindEvent() {

    }


    return {setup: init};
});