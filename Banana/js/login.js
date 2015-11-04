define(["commJs"], function (comm) {

    function main() {
        comm.setupWorkspace();
        bindEvent();
    }

    function bindEvent() {
        $('#loginBtn').click(function () {
            $('#loginMsg').html('');
            login();
        });
    }

    function getLoginParam() {
        return {
            name: $('#name').val(),
            psw: md5($('#password').val())//,
            //configVersion: comm.login.getVersion()
        };
    }

    function login() {
        var param = getLoginParam();
        comm.io.post({
            url: comm.config.BASEPATH + 'admin/login',
            data: param,
            success: function (data, code) {
                if (code == 0) {
                    comm.login.set(data);
                    window.location = "userList.html";
                }
            },
            error: function (msg) {
                $('#loginMsg').html(msg || '登录失败');
            },
            el: $('#loginBtn')
        });
    }

    return {
        main: main
    }
})