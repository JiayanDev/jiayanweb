/**
 * @author janson
 * @date    2015-11-10
 * @todo  user admin manager
 */
define(["commJs"], function (comm) {
    const PATH_DIR = "price_collect/poster";

    function main() {
        comm.checkLogin(function () {
            init();
        });
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        setupRichEditor();
        setupCoverImgFileLoader();
        getList();
    }

    ////////////////////////////////////event
    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);
            if ($t.hasClass('_td_edit')) {
                comm.utils.showTdEdit($t);
                return false;
            } else if ($t.hasClass('_delete')) {
                var id = $t.data('id');
                comm.confirm({
                    el: $t,
                    content: '确定删除该Banner吗？',
                    placement: 'left',
                    onYES: function () {
                        comm.io.postId(PATH_DIR + '/remove', id, getList);
                    }
                });
                return false;
            } else if ($t.hasClass('_edit')) {
                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                $("#panelTitle").html("编辑Banner信息    ID: " + id);
                resetForm();
                openPanel(true);
                $('#_submit').text('编辑');

                setForm(row, row_str);
                return false;
            }
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加Banner信息");
            resetForm();
            openPanel();
            $('#_submit').text('添加');
            return false;
        });

        $('.close').click(function (e) {
            closePanel();
            return false;
        });

        $('#_submit').click(function () {
            if ($('#_submit').text() == '查询') {
                //getList(getParam());
                comm.utils.replaceParam(getParam());
                return false;
            }
            var el = $('#editPanel');
            var id = el.data('id');
            if (id) {
                var params = getParam();
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit(PATH_DIR + '/update', params, "更新成功");
            } else {
                var params = getParam();
                doSubmit(PATH_DIR + '/create', params, "添加成功");
            }
            return false;
        });
    }


    function setupRichEditor() {
        comm.setupRichEditor({
            target: $('#content'),
            toolbarContainer: $('#richEditorToolBar')
        });
    }

    function setupCoverImgFileLoader() {
        var $el = $('#coverImgThumberUploader');
        var $closest = $el.closest('.col-sm-1'),
            $loadingEl = $closest.find('.loading'),
            fileMsg = $closest.find('.fileMsg'),
            gallery = $el.closest('.form-group').find('ul.gallery');

        comm.utils.setupFileLoader({
            el: $el,
            beforeSubmit: function (e, data) {
                fileMsg.html('');
                $loadingEl.removeClass('none');
            },
            callback: function (resp) {
                var imgUrl = (resp && resp.url) || null;
                if (imgUrl) {
                    imgUrl = comm.config.BASE_IMAGE_PATH + imgUrl;
                    appendImage(gallery, imgUrl);
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


    ////////////////////////////////////http
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

    function getList(data) {
        if (!data) {
            data = {};
        }
        comm.io.get({
            url: comm.config.BASEPATH + PATH_DIR + '/list',
            data: data,
            success: function (d) {
                renderList(d);
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

    var coverImg;
    function appendImage(imgEl, imgUrl) {
        imgEl.removeClass("none");
        imgEl.html('');
        imgEl.append('<li><img src="' + imgUrl + '"' + 'style="vertical-align:middle;"></li>');
        var id = imgEl.attr("id");
        coverImg = imgUrl;
    }

    function resetImage() {
        $('#coverImg').html('');
        coverImg = null;
    }


    ////////////////////////////////////Form data
    var fields = ['title', 'desc', 'goodItemId', 'wikiItemId', "order", 'status'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });
        param['content'] = $.trim($('#content').html());

        if (coverImg) param['coverImg'] = coverImg;

        return param;
    }

    function resetForm() {
        $.each(fields, function (idx, field) {
            $('#' + field).val('');
        });
        resetImage();
        $('#content').html('');
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

        if (row.coverImg) appendImage($("#coverImg"), row.coverImg);
        $('#content').html(row.content);

        var el = $('#editPanel');
        if (row_str) el.data("row", row_str);
        if (row['id']) el.data("id", row['id']);
    }

    ////////////////////////////////////panel
    function openPanel(showEdit) {
        if (showEdit) {
            $('[name=edit-item]').show();
        } else {
            $('[name=edit-item]').hide();
        }
        var el = $('#editPanel');
        el.addClass('bounce').addClass('animated').removeClass('none');
        setTimeout(function () {
            el.removeClass('bounce').removeClass('animated')
        }, 1000);
    }

    function closePanel() {
        resetForm();
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