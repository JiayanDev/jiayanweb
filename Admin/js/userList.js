define(["commJs"], function (comm) {

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        getList();
        bindEvent();
    }

    function getList() {
        comm.io.get({
            url: comm.config.BASEPATH + 'user/list',
            data: {
                daddy: 8
            },
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

    function renderDetail(id) {
        var el = $('<div style="border:2px solid #555;width:322px;height:568px;margin:0 auto;"><iframe style="width:318px;height:568px;border:none;" src="http://app.jiayantech.com/app/html/dairy.html?id=' + id + '"></div>');
        return el;
    }

    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);
            if ($t.hasClass('_grant')) {
                $('#edit-name').val($t.data('name'));
                $('#edit-role').val($t.data('role'));

                var el = $('#editPanel');
                el.addClass('bounce').addClass('animated').removeClass('none');
                setTimeout(function () {
                    el.removeClass('bounce').removeClass('animated')
                }, 1000);

                el.data("id", $t.data('id'));
                return false;
            } else if ($t.hasClass('_delete')) {
                var id = $t.data('id');

                return false;
            }
        });

        $('#_add').click(function () {
            var el = $('#createPanel');
            el.addClass('bounce').addClass('animated').removeClass('none');
            setTimeout(function () {
                el.removeClass('bounce').removeClass('animated')
            }, 1000);
        });

        $('.close').click(function () {
            closePanel('#createPanel');
            return false;
        });

        $('#create-submit').click(function () {
            create();
            return false;
        });

        $('#edit-submit').click(function () {
            grant();
            return false;
        });
    }

    function create() {
        var name = $('#create-name').val();
        var role = $('#create-role').val();
        var psw = $('#create-psw').val();
        var psw2 = $('#create-psw2').val();
        if (!name) {
            alertMsg("请输入帐户名！");
            return;
        }
        if (!role) {
            alertMsg("请选择角色！");
            return;
        }
        if (!psw) {
            alertMsg("请输入密码！");
            return;
        }
        if (!psw2) {
            alertMsg("请输入确认密码！");
            return;
        }
        if (psw != psw2) {
            alertMsg("两次输入的密码不一致！");
            return;
        }

        var data = {
            daddy: 8,
            name: name,
            role: role
        };
        comm.io.post({
            url: comm.config.BASEPATH + 'user/create',
            data: data,
            success: function () {
                closePanel('#editPanel');
                getList();
            }
        });
    }

    /**
     * 修改权限
     */
    function grant() {
        var id = $("#editPanel").data("id");
        var role = $('#edit-role').val();
        var data = {
            daddy: 8,
            id: id,
            role: role
        };
        comm.io.post({
            url: comm.config.BASEPATH + 'user/grant',
            data: data,
            success: function () {
                closePanel('#editPanel');
                getList();
            }
        });
    }

    function closePanel(id) {
        var el = $(id);
        el.addClass('bounce').addClass('animated');
        setTimeout(function () {
            el.addClass('none');
        }, 1000);
    }

    return {
        setup: main
    }
});