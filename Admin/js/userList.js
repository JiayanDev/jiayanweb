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
        var data = {};
        var id = $("#userId").val();
        if (id) {
            data["id"] = id;
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'user/list',
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
                comm.confirm({
                    el: $t,
                    content: '确定删除该该用户吗？',
                    placement: 'left',
                    onYES: function () {
                        remove(id);
                    }
                });
                return false;
            }
        });

        $('#btnUserSearch').click(function () {
            getList();
        });

        $('#_add').click(function () {
            var el = $('#createPanel');
            el.addClass('bounce').addClass('animated').removeClass('none');
            setTimeout(function () {
                el.removeClass('bounce').removeClass('animated')
            }, 1000);
        });

        $('.close').click(function (e) {
            closePanel($(e.target).parent());
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

    /**
     * 创建用户
     */
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
            psw: md5(psw),
            name: name,
            role: role
        };
        comm.io.post({
            url: comm.config.BASEPATH + 'user/create',
            data: data,
            success: function () {
                closePanel($('#createPanel'));
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
            //daddy: 8,
            id: id,
            role: role
        };
        comm.io.post({
            url: comm.config.BASEPATH + 'user/grant',
            data: data,
            success: function () {
                closePanel($('#editPanel'));
                getList();
            }
        });
    }

    function remove(id) {
        var data = {
            id: id
        };
        comm.io.post({
            url: comm.config.BASEPATH + 'user/remove',
            data: data,
            success: function () {
                getList();
            }
        });
    }

    function closePanel(el) {
        el.addClass('bounce').addClass('animated');
        setTimeout(function () {
            el.addClass('none');
        }, 1000);
    }

    return {
        setup: main
    }
});