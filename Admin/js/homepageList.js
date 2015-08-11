/**
 * @author janson
 * @date    2015-08-11
 * @todo  homepage manager
 */
define(["commJs"], function (comm) {
    var formMsgEl = $('#formMsg'),
        coverImg = null;

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        coverImg = null;
        setupFileLoader();
        getList();
        bindEvent();
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
                    coverImg = imgUrl;
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

    function appendImageList(imgUrl) {
        var imgListEl = $('#imageList');
        imgListEl.removeClass("none");
        imgListEl.html('');
        imgListEl.append('<li><img src="' + imgUrl + '"' + 'style="vertical-align:middle;"></li>');
    }

    function getList() {
        var data = {};
        var id = $("#homepageId").val();
        if (id) {
            data["id"] = id;
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'homepage/list',
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
            if ($t.hasClass('_edit')) {
                openPanel("编辑首页运营");
                $('#item').hide();

                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                $('#title').val(row.title);
                //$('#itemType').val(row.type);
                if (row.coverImg && row.coverImg != "undefined") appendImageList(row.coverImg);
                $('#desc').val(row.desc);
                $('#status').val(row.status);

                var el = $('#editPanel');
                el.data("row", row_str);
                el.data("id", id);

                return false;
            } else if ($t.hasClass('_delete')) {
                var id = $t.data('id');
                comm.confirm({
                    el: $t,
                    content: '确定删除吗？',
                    placement: 'left',
                    onYES: function () {
                        remove(id);
                    }
                });
                return false;
            }
        });

        $('#btnSearch').click(function () {
            getList();
        });

        $('#_add').click(function () {
            openPanel("添加首页运营");
            $('#item').show();
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
                doSubmit("poster/update", params, "更新成功");
            } else {
                doSubmit("homepage/create", params, "添加成功");
            }
            return false;
        });
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
        }, 1000);
    }

    function validate(param) {
        var flag = true;
        $.each(param, function (key, val) {
            if (handler[key] && handler[key](val) === false) {
                flag = false;
                return false;
            }
        })
        return flag ? param : false;
    }

    var handler = {
        name: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入首页运营名称')
                return false;
            }
        },
        phone: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入用户手机号码');
                return false;
            }
        }
    };

    var fields = ['title', 'itemType', 'itemId', 'desc', 'status'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) {
                param[field] = $.trim($('#' + field).val());
            }
        });
        if (coverImg) {
            param["coverImg"] = coverImg;
        }
        return validate(param);
    }

    function resetForm() {
        $.each(fields, function (idx, field) {
            $('#' + field).val('');
        });
        $('#imageList').html('');
        coverImg = null;
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