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
        var eventId = $("#_eventId").val();
        var data = {};
        if (eventId) {
            data["eventId"] = eventId;
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'applyment/list',
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

    function renderDetail(id) {
        var url = comm.config.BASE_APP_SERVER_PATH + "app/html/dairy.html?id=" + id;
        var el = $('<div style="border:2px solid #555;width:322px;height:568px;margin:0 auto;"><iframe style="width:318px;height:568px;border:none;" src="' + url + '"></div>');
        return el;
    }

    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);

            if ($t.hasClass('_edit')) {
                openPanel("编辑伴美");

                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                //$('#title').val(row.title);
                //if (row.coverImg && row.coverImg != "undefined") appendImageList(row.coverImg);
                //$('#desc').val(row.desc);
                $('#name').val(row.name);
                $('#status').val(row.status);

                var el = $('#editPanel');
                el.data("row", row_str);
                el.data("id", id);

                return false;
            } else if ($t.hasClass('_detail')) {
                comm.dialog({
                    onLoad: function (options) {
                        var id = $t.data('id');
                        // getDetail( id, function(d){
                        var el = renderDetail(id);
                        options.content.append(el);
                        // });
                    },
                    title: "日记详情"
                });
                return false;
            }

            if ($t.hasClass('_verify')) {
                var status = $t.data('status');
                var id = $t.data('id');

                if (status == '审核通过') {
                    // 改为未通过
                    comm.confirm({
                        el: $t,
                        content: "<textarea class='form-control' placeholder='填写不通过的原因'></textarea>",
                        placement: "left",
                        onYES: function (options) {
                            var textareaEl = $(options.target).closest('.popover-content').find('textarea');
                            var reason = textareaEl.val();

                            verify({
                                id: id,
                                //reason: reason,
                                status: '审核不通过'
                            }, function (argument) {
                                options.unload();
                                var td = $t.closest('td');
                                var verifyStatusTd = td.siblings("td[name='status']");
                                verifyStatusTd.html("审核不通过");
                                td.html(tdContent(id, "不通过", "通过"));
                            });
                        }
                    });
                } else {
                    // 审核通过
                    // 改为未通过
                    comm.confirm({
                        el: $t,
                        content: "<textarea class='form-control' placeholder='填写通过的原因'></textarea>",
                        placement: "left",
                        onYES: function (options) {
                            var textareaEl = $(options.target).closest('.popover-content').find('textarea');
                            var reason = textareaEl.val();

                            verify({
                                id: id,
                                //reason: reason,
                                status: '审核通过'
                            }, function (argument) {
                                options.unload();
                                var td = $t.closest('td');
                                var verifyStatusTd = td.siblings("td[name='status']");
                                verifyStatusTd.html("审核通过");
                                td.html(tdContent(id, "通过", "不通过"));
                            });
                        }
                    });
                }
                return false;
            }

            // 审核
            if (evt.target.id == 'angentNameBtn') {
                getList(undefined, renderList);
                comm.showLoading($('#_list'));
            }
        });

        $('.close').click(function (e) {
            closePanel();
            return false;
        });

        $('#_submit').click(function () {
            var params = getParam();
            var el = $('#editPanel');
            var id = el.data('id');
            params = $.extend(params, {id: id});
            doSubmit("applyment/update", params, "更新成功");
            return false;
        });
    }

    var fields = ['status'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) {
                param[field] = $.trim($('#' + field).val());
            }
        });
        return param;
    }

    function doSubmit(action, param, msg) {
        comm.io.post({
            url: comm.config.BASEPATH + action,
            data: param,
            success: function () {
                closePanel();
                getList();
                comm.showMsg(msg);
            }
        });
    }

    function tdContent(id, status, antiStuats) {
        var h = [
            '<a href="#" class="_verify" data-id="' + id + '" data-status="审核' + status + '">' + antiStuats + '</a>'
        ].join('&nbsp;&nbsp;');

        return h;
    }

    function verify(data, cb) {
        comm.io.post({
            url: comm.config.BASEPATH + 'applyment/update',
            data: data,
            success: function (data) {
                cb && cb();
            }
        });
    }

    function openPanel(title) {
        $("#status").get(0).selectedIndex = 0;
        $("#panelTitle").html(title);
        var el = $('#editPanel');
        el.addClass('bounce').addClass('animated').removeClass('none');
        setTimeout(function () {
            el.removeClass('bounce').removeClass('animated')
        }, 1000);
    }

    function closePanel() {
        var el = $('#editPanel');
        el.addClass('bounce').addClass('animated');
        setTimeout(function () {
            el.addClass('none');
        }, 200);
    }

    return {
        setup: main
    }
});