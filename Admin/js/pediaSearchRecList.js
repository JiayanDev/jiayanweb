/**
 * @author janson
 * @date    2015-11-30
 * @todo  manager
 */
define(["commJs"], function (comm) {
    const DIR = 'pedia';

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        getList();
    }

    ////////////////////////////////////event
    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);
            if ($t.hasClass('_delete')) {
                var id = $t.parent().data('id');
                comm.confirm({
                    el: $t,
                    content: '确定删除该感兴趣条目吗？',
                    placement: 'left',
                    onYES: function () {
                        comm.io.postId(DIR + "/search/recommend/remove", id, getList);
                    }
                });
                return false;
            }
        });

        $('#_add').click(function () {
            comm.confirm({
                el: $(this),
                content: "<input class='form-control' placeholder='填写词条Id'></inpu>",
                placement: "left",
                onYES: function (options) {
                    var inputEl = $(options.target).closest('.popover-content').find('input');
                    var id = inputEl.val();
                    var data = {id: id};
                    doSubmit(options, DIR + "/search/recommend/create", data, "添加成功");
                }
            });
            return false;
        });
    }

    ////////////////////////////////////http
    function getList() {
        comm.io.get({
            url: comm.config.BASEPATH + DIR + '/search/recommend/list',
            data: {},
            success: function (d) {
                renderList(d);
            }
        });
    }

    function doSubmit(options, action, param, msg) {
        comm.io.post({
            url: comm.config.BASEPATH + action,
            data: param,
            success: function () {
                options.unload();
                comm.showMsg(msg);
                getList();
            }
        });
    }

    ////////////////////////////////////Render
    function renderList(d) {
        comm.render({
            tpl: "tplList",
            data: d,
            renderTo: "#_list",
            isTableList: true
        });
    }

    return {
        setup: main
    }
});