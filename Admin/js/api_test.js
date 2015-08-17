define(["jquery", "commJs"], function (_, comm) {
    var submitBtn = $('#_submit'),
        formMsgEl = $('#formMsg');

    function main() {
        comm.checkLogin(function () {
            init();
        });
    }

    function init() {
        bindEvent();
    }

    function bindEvent() {
        submitBtn.click(function () {
            var api_url = $("#api_url").val();
            var api_method = $("#api_method").val();
            var api_params = $("#api_params").val();
            if (api_params) {
                var reg0 = new RegExp(":", "g");
                var reg1 = new RegExp("{", "g");
                var reg2 = new RegExp("}", "g");
                var reg3 = new RegExp(",", "g");
                api_params = api_params.replace(reg0, '":"').replace(reg1, '{"').replace(reg2, '"}').replace(reg3, '","');
                try {
                    var params = JSON.parse(api_params);
                } catch (e) {
                    comm.showMsg("参数格式错误");
                }
            }
            doSubmit(api_method, api_url, params);
        });
    }

    function doSubmit(method, action, param) {
        if (method == 0) {
            comm.io.get({
                url: comm.config.BASEPATH + action,
                data: param,
                success: function (data) {
                    comm.showMsg("提交成功");
                    formMsgEl.html(JSON.stringify(data));
                }
            });
        } else if (method == 1) {
            comm.io.post({
                url: comm.config.BASEPATH + action,
                data: param,
                success: function (data) {
                    comm.showMsg("提交成功");
                    formMsgEl.html(JSON.stringify(data));
                }
            });
        }
    }

    return {
        main: main
    }
});