define(["commJs"], function (comm) {

    function main() {
        comm.checkLogin(function () {
            init();
        });
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        setupRichEditor();
        bindCreateEvent();
        getList();
    }

    function getList() {
        comm.io.get({
            url: comm.config.BASEPATH + 'post/list',
            data: {
                type: 'topic'
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
        var url = comm.config.BASE_APP_SERVER_PATH + "app/html/dairy.html?id=" + id;
        var el = $('<div style="border:2px solid #555;width:322px;height:568px;margin:0 auto;"><iframe style="width:318px;height:568px;border:none;" src="' + url + '"></div>');
        return el;
    }

    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);

            if ($t.hasClass('_detail')) {
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
            } else if ($t.hasClass('_verify')) {
                var status = $t.data('status');
                var postId = $t.data('id');

                if (status == '通过') {
                    // 改为未通过
                    comm.confirm({
                        el: $t,
                        content: "<textarea class='form-control' placeholder='填写不通过的原因'></textarea>",
                        placement: "left",
                        onYES: function (options) {
                            var textareaEl = $(options.target).closest('.popover-content').find('textarea');
                            var reason = textareaEl.val();

                            verify({
                                postId: postId,
                                reason: reason,
                                status: '不通过'
                            }, function (argument) {
                                options.unload();
                                var td = $t.closest('td');
                                var verifyStatusTd = td.siblings("td[name='verifyStatus']");
                                verifyStatusTd.html("不通过");
                                td.html(tdContent(postId, "不通过", "通过"));
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
                                postId: postId,
                                reason: reason,
                                status: '通过'
                            }, function (argument) {
                                options.unload();
                                var td = $t.closest('td');
                                var verifyStatusTd = td.siblings("td[name='verifyStatus']");
                                verifyStatusTd.html("通过");
                                td.html(tdContent(postId, "通过", "不通过"));
                            });
                        }
                    });
                }

                return false;
            } else if ($t.hasClass('_edit')) {
                var id = $t.data('id');

                comm.io.get({
                    url: comm.config.BASEPATH + 'post/detail',
                    data: {
                        id: id
                    },
                    success: function (row) {
                        openPanel("编辑话题");
                        $('#content').html(row.content);
                        var el = $('#editPanel');
                        el.data("row", JSON.stringify(row));
                        el.data("id", id);
                    }
                });

                //var row_str = $t.attr('data-row');
                //var row = JSON.parse(row_str);
                //
                //$('#content').val(row.content);
                //
                //var el = $('#editPanel');
                //el.data("row", row_str);
                //el.data("id", id);

                return false;
            } else if ($t.hasClass('_comment')) {
                var id = $t.data('id');
                comm.confirm({
                    el: $t,
                    content: "<textarea class='form-control' placeholder='填写评论内容'></textarea><input class='form-control' style='margin-top:5px;' placeholder='填写用户Id'></inpu>",
                    placement: "left",
                    onYES: function (options) {
                        var textareaEl = $(options.target).closest('.popover-content').find('textarea');
                        var inputEl = $(options.target).closest('.popover-content').find('input');
                        var content = textareaEl.val();
                        var userId = inputEl.val();

                        if (!content) {
                            comm.utils.alertMsg("请填写评论内容！");
                            return;
                        }

                        var data = {
                            subject: "topic",
                            subjectId: id,
                            content: content
                        };
                        if (userId) {
                            data['userId'] = userId;
                        }
                        comm.io.post({
                            url: comm.config.BASEPATH + 'post/comment',
                            data: data,
                            success: function () {
                                options.unload();
                                comm.utils.showMsg("评论成功！");
                                getList();
                            }
                        });
                    }
                });
                return false;
            } else if ($t.hasClass('_like')) {
                var id = $t.data('id');
                comm.confirm({
                    el: $t,
                    content: "<input class='form-control' placeholder='填写用户Id'></inpu>",
                    placement: "left",
                    onYES: function (options) {
                        var inputEl = $(options.target).closest('.popover-content').find('input');
                        var userId = inputEl.val();

                        var data = {
                            postId: id
                        };
                        if (userId) {
                            data['userId'] = userId;
                        }
                        comm.io.post({
                            url: comm.config.BASEPATH + 'post/like',
                            data: data,
                            success: function () {
                                options.unload();
                                comm.utils.showMsg("点赞成功！");
                                getList();
                            }
                        });
                    }
                });
                return false;
            }

            // 审核
            if (evt.target.id == 'angentNameBtn') {
                getList(undefined, renderList);
                comm.showLoading($('#_list'));
            }
        });
    }

    function tdContent(postId, status, antiStuats) {
        var h = [
            '<a href="#" class="_verify" data-id="' + postId + '" data-status="' + status + '">' + antiStuats + '</a>',
            '<a href="#" class="_edit" data-id="' + postId + '">编辑</a>',
            '<a href="#" class="_detail" data-id="' + postId + '">详情</a>'
        ].join('&nbsp;');

        return h;
    }

    function verify(data, cb) {
        comm.io.post({
            url: comm.config.BASEPATH + 'post/verify',
            data: data,
            success: function (data) {
                cb && cb();
            }
        });
    }

    //////////////create
    function setupRichEditor() {
        comm.setupRichEditor({
            target: $('#content'),
            toolbarContainer: $('#richEditorToolBar')
        });
    }

    var submitBtn = $('#_submit');

    function bindCreateEvent() {
        submitBtn.click(function () {
            var params = getParam();
            var el = $('#editPanel');
            var id = el.data('id');
            if (id) {
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit("post/update", params, "更新成功");
            } else {
                doSubmit("topic/create", params, "添加成功");
            }
            return false;
        });

        $('#_add').click(function () {
            openPanel("添加话题");
            $('#item').show();
            return false;
        });

        $('.close').click(function (e) {
            closePanel();
            return false;
        });
    }

    function openPanel(title) {
        resetForm();
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

    var fields = ['content'];

    function getParam() {
        var param = {};
        $.each(fields, function (i, key) {
            param[key] = $('#' + key).html();
        });
        param["photoUrls"] = "[]";
        return param;
    }

    function resetForm() {
        $('#content').html("");
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    return {
        setup: main
    }
});