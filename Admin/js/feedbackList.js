define(["commJs"], function (comm) {

    function main() {
        comm.checkLogin(function () {
            init();
        });
    }

    function init() {
        comm.setupWorkspace();
        getList();
        bindEvent();
    }

    function getList() {
        var id = $("#_id").val();
        var data = {};
        if (id) {
            data["id"] = id;
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'feedback/list',
            data: data,
            success: function (d) {
                renderList(d);
            }
        });
    }

    function renderList(d) {
        comm.render({
            tpl: "tplList",
            data: d,
            renderTo: "#_list",
            isTableList: true
        });
    }

    function bindEvent() {
        $('#_search').click(function () {
            getList();
        });
    }

    return {
        setup: main
    }
});