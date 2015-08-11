define(["commJs"], function (comm) {
    var formMsgEl = $('#formMsg'),
        photoUrl = null;

    function main() {
        comm.checkLogin(function () {
            init();
        })
        return comm;
    }

    function init() {
        comm.setupWorkspace();
        photoUrl = null;
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
                    photoUrl = imgUrl;
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

    function getList() {
        var data = {};
        var id = $("#doctorId").val();
        if (id) {
            data["id"] = id;
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'doctor/list',
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
                openPanel("编辑医生");

                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                $('#name').val(row.name);
                if (row.photoUrl && row.photoUrl != "undefined") appendImageList(row.photoUrl);
                $('#title').val(row.title);
                $('#hospital').val(row.hospitalName);
                $('#desc').val(row.desc);

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
            openPanel("添加医生");
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
                doSubmit("doctor/update", params, "更新成功");
            } else {
                doSubmit("doctor/create", params, "添加成功");
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

    function remove(id) {
        var data = {
            id: id
        };
        comm.io.post({
            url: comm.config.BASEPATH + 'doctor/remove',
            data: data,
            success: function () {
                getList();
            }
        });
    }

    function appendImageList(imgUrl) {
        var imgListEl = $('#imageList');
        imgListEl.removeClass("none");
        imgListEl.html('');
        imgListEl.append('<li><img src="' + imgUrl + '"' + 'style="vertical-align:middle;"></li>');
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
                formMsgEl.html('请输入医生名称')
                return false;
            }
        }
    };

    var fields = ['name', 'title', 'desc'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) {
                param[field] = $.trim($('#' + field).val());
            }
        });
        var el = $('#hospital');
        //var hospital = el.val();
        var hospitalId = el.data("id");
        param["hospitalId"] = hospitalId;
        if (photoUrl){
            param["photoUrl"] = photoUrl;
        }
        return validate(param);
    }

    function resetForm() {
        $.each(fields.concat('hospital'), function (idx, field) {
            $('#' + field).val('');
        });
        $('#imageList').html('');
        photoUrl = null;
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