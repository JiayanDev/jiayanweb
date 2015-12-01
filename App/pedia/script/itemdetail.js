/**
 * Created by liangzili on 15/11/27.
 */

define(["commJs"], function (comm) {
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
            url: comm.config.BASEPATH + "pedia/item/detail",
            data:{
                id: id
            },
            success: function(data){
                render(data);
                comm.utils.hideNativeLoading();
            },
            error: function(msg){
                comm.utils.hideNativeLoading();
            }
        });
    }

    function render(data){
        if(!data) return;
        var $el = $('<div></div>');
        comm.render({
            tpl: 'tplForItemDetail',
            data: data,
            renderTo: $el
        });
        $('#detail').html('').append($el.children());
    }

    function getId() {
        var hash = comm.hashMng();
        var id = hash.id;
        return id;
    }

    return {setup: init};
})
;