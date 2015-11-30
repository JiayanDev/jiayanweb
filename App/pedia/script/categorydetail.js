/**
 * Created by liangzili on 15/11/27.
 */
define(["commJs"], function (comm) {
    var detail;

    function init() {
        comm.setupWorkspace();
        var id = getId();
        if (id) {
            loadData(id);
        }
        else { // 提示不存在
            comm.utils.hideNativeLoading();
            comm.utils.alertMsg('id 不存在');
        }

        bindEvent(id);

        comm.io.call({
            action: "setNavigationBarTitle",
            data: {"title": '百科分类详情'}
        });
    }

    function loadData(id) {
        //getDetail(id);
        getTree(id);
    }

    //function getDetail(id) {
    //    comm.io.get({
    //        url: comm.config.BASEPATH + "pedia/item/detail",
    //        data:{
    //            id: id
    //        },
    //        success: function(data){
    //            renderDetail(data);
    //        }
    //    });
    //}

    function getTree(id) {
        comm.io.get({
            url: comm.config.BASEPATH + "pedia/tree",
            data:{
                id: id
            },
            success: function(data){
                renderDetail(data.detail);
                renderList(data.data);
            }
        });
    }

    function bindEvent(id) {
        $('#_arrow').attr('href', 'itemdetail.html?id=' + id);
        //$('#_arrow').click(function () {
        //    if (!detail) return false;
        //    if ($(this).parent().hasClass('rotate-180')) {
        //        $(this).parent().removeClass('rotate-180');
        //        $('#detail').html('<p>' + detail.introduction + '</p>');
        //    } else {
        //        $(this).parent().addClass('rotate-180');
        //        $('#detail').html(detail.content);
        //    }
        //    //var html = $('#detail').html();
        //    //$('#detail').html($('#detail').attr('introduction'));
        //    //$('#detail').attr('introduction', html);
        //    return false;
        //});
    }

    ///////////////////////////////////render
    function renderDetail(data){
        detail = data;
        //var introduction = data.introduction;
        //if (introduction && introduction.length > 100) introduction = introduction.substr(0, 100);
        //$('#detail').html(data.introduction);
        //$('#detail').attr('introduction', data.introduction);

        $('#detail').html('<p>' + detail.introduction + '</p>');

        document.title = data.name;
        comm.io.call({
            action: "setNavigationBarTitle",
            data: {"title": data.name}
        });
    }

    function renderList(list){
        if(!list) return;
        var $el = $('<div></div>');
        comm.render({
            tpl: 'tplForCategorySub',
            data: list,
            renderTo: $el
        });
        $('#categorySubList').html('').append($el.children());
    }

    function getId() {
        var hash = comm.hashMng();
        var id = hash.id;
        return id;
    }

    return {
        setup: init
    }
});