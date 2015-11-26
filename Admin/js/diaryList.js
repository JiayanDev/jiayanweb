define(["commJs","tipped"], function (comm,Tipped) {

    function main() {
        comm.checkLogin(function () {
            init();
        });
    }

    function init() {
        comm.setupWorkspace();
        getList();
        bindEvent();
        setupFileLoader();
    }

    function getList() {
        comm.io.get({
            url: comm.config.BASEPATH + 'post/list',
            data: {
                type: 'diary'
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

        Tipped.create('.hover-text', function(element) {
            return $("<div>").css("max-width","500px").html(decodeURIComponent( $(element).attr('data-fulltext')).replace(/\n/g, '<br />'));

            //{
            //    title: "全文",
            //    content: $(element).attr('data-fulltext')
            //};
        }, {
            //skin: 'light'
        });

        Tipped.create('.hover-images img', function(element) {
            return $("<img>").attr('src',$(element).attr("src")).css("max-width","500px").css("max-height","500px");
        }, {
            //skin: 'light'
        });

    }

    function renderDetail(id) {
        var url = comm.config.BASE_APP_SERVER_PATH + "html/diary.html?id=" + id;
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
            } else if ($t.hasClass('_edit')) {
                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                resetForm();
                openPanel("编辑日志信息    ID: " + id);
                $('#_submit').text('编辑');

                setForm(row, row_str);
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
                            subject: "diary",
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

            if ($t.hasClass('_verify')) {
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
            }

            // 审核
            if (evt.target.id == 'angentNameBtn') {
                getList(undefined, renderList);
                comm.showLoading($('#_list'));
            }
        });

        $('#_add').click(function () {
            openPanel("添加日记", true);
            $('#_submit').text('添加');
            $('#item').show();
            return false;
        });

        $('.close').click(function (e) {
            closePanel();
            return false;
        });

        $('#_submit').click(function () {
            var params = getParam();
            var el = $('#editPanel');
            var id = el.data('id');
            if (id) {
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit("post/update", params, "更新成功");
            } else {
                params['type'] = 'diary';
                doSubmit("post/create", params, "添加成功");
            }
            return false;
        });
    }

    function setupFileLoader() {
        var $loadingEl = $('.loading'),
            fileMsg = $('#fileMsg');

        comm.utils.setupFileLoader({
            el: '#thumberUploader',
            beforeSubmit: function (e, data) {
                fileMsg.html('');
                $loadingEl.removeClass('none');
            },
            callback: function (resp) {
                var imgUrl = (resp && resp.url) || null;
                if (imgUrl) {
                    imgUrl = comm.config.BASE_IMAGE_PATH + imgUrl;
                    appendImageList(imgUrl);
                    $loadingEl.addClass('none');
                } else {
                    fileMsg.html('imgUrl==null');
                }
            },
            error: function (resp) {
                fileMsg.html((resp && resp.msg) || '文件上传失败');
            }
        });
    }

    var photoUrls = [];

    function appendImageList(imgUrl) {
        var imgListEl = $('#imageList');
        imgListEl.removeClass("none");
        //imgListEl.html('');
        imgListEl.append('<li style="margin:2px;"><img src="' + imgUrl + '"' + 'style="vertical-align:middle;">' +
            '<a href="#" src="' + imgUrl + '"' + 'class="img-delete">&times;</a></li>');
        photoUrls.push(imgUrl);

        $("#imageList .img-delete:last").click(function () {
            var src = $(this).attr('src');
            var index = photoUrls.indexOf(src);
            photoUrls.splice(index, 1);
            $(this).parent().remove();
            return false;
        });
    }

    function tdContent(postId, status, antiStuats) {
        var h = [
            '<a href="#" class="_verify" data-id="' + postId + '" data-status="' + status + '">' + antiStuats + '</a>'
            //,
            //'<a href="#" class="_detail" data-id="' + postId + '">详情</a>'
        ].join('&nbsp;&nbsp;');

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

    function openPanel(title, showCreateItem) {
        if (showCreateItem) {
            $('[name=create-item]').show();
        } else {
            $('[name=create-item]').hide();
        }
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
        $.each(fields.concat(['userId']), function (i, key) {
            var $key = $('#' + key);
            if ($key && $key.val()) param[key] = $key.val();
        });
        //if (photoUrls.length > 0) {
        //    param["photoUrls"] = JSON.stringify(photoUrls);
        //}
        param["photoUrls"] = JSON.stringify(photoUrls);
        return param;
    }

    function resetForm() {
        $.each(fields.concat(['userId']), function (idx, field) {
            $('#' + field).val('');
        });
        photoUrls = [];
        $('#imageList').html('');
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    function setForm(row, row_str) {
        $.each(fields, function (idx, field) {
            if ($('#' + field) && row[field]) $('#' + field).val(row[field]);
        });
        for (var key in row.photoes){
            var photo = row.photoes[key];
            appendImageList(photo);
        }
        var el = $('#editPanel');
        if (row_str) el.data("row", row_str);
        if (row['id']) el.data("id", row['id']);
    }

    return {
        setup: main
    }
});