define(["jquery", "commJs", 'widget/bootstrap-wysiwyg'], function (_, comm) {
    var submitBtn = $('#_submit'),
        formMsgEl = $('#formMsg'),
        imageList = [],
        pickedDate;

    function main() {
        comm.checkLogin(function () {
            init();
        });
        return comm;
    }

    function init() {
        imageList = [];
        comm.setupWorkspace();
        setupFileLoader();
        bindEvent();
        setupDateSel();
        setupRichEditor();
        getList();
    }

    //function setupRichEditor() {
    //    $('#description').wysiwyg();
    //}

    function setupRichEditor() {
        comm.setupRichEditor({
            targetElementId: 'description',
            toolbarContainer: $('#richEditorToolBar')
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
                // $('#photo_file').val(data);都没必要存在了
                var imgUrl = (resp && resp.url) || null;
                if (imgUrl) {
                    imgUrl = comm.config.BASE_IMAGE_PATH + imgUrl;
                    appendImageList(imgUrl);
                    imageList.push(imgUrl);
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
        //imgListEl.append('<li><img src="../statics/img/addimage-empty.png"></li>');

        imgListEl.append('<li><img src="' + imgUrl + '"></li>');
        return imageList;
    }

    function bindEvent() {
        submitBtn.click(function () {
            var params = getParam();

            var el = $('#editPanel');
            var id = el.data('id');

            if (id) {
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit("event/update", params, "更新成功");
            } else {
                doSubmit("event/create", params, "添加成功");
            }
        });

        $('#_list').click(function (evt) {
            var t = evt.target,
                $t = $(t);

            if ($t.hasClass('_detail')) {
                var id = $t.data('id');

                comm.dialog({
                    onLoad: function (options) {
                        getList(id, function (d) {
                            var el = renderDetail(d);
                            options.content.append(el);

                            // getQuest(id);
                        });
                    },
                    title: "活动信息"
                });
                return false;
            }

            if ($t.hasClass('_edit')) {
                $("#panelTitle").html("编辑活动信息");
                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);
                $('#userName').val(row.userName);
                $('#phone').val(row.phone);
                $('#title').val(row.title);
                $('#hospital').val(row.hospitalName);
                $('#doctor').val(row.doctorName);
                $('#beginTime').val(row.beginTime);
                $('#event-phone').val(row.phone);

                var el = $('#editPanel');
                el.data("row", row_str);
                el.data("id", id);

                openPanel();
                return false;
            }
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加活动信息");
            resetForm();
            openPanel();
        });

        $('.close').click(function () {
            closePanel();
        });

        $('#event-detail').on('focus', function () {
            $(this).animate({
                height: 400
            });
        });
    }

    function openPanel() {
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
            $('#description').height(100);
        }, 1000);
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

    function getParam() {
        var param = {};

        $.each(['userName', 'phone', 'title'], function (idx, field) {
            param[field] = $.trim($('#' + field).val());
        });
        //param['beginTime'] = pickedDate;
        //param['desc'] = $('#description').html();
        //param['coverImg'] = JSON.stringify(imageList);

        return validate(param);
    }

    function getList(id, callback) {
        comm.io.get({
            url: comm.config.BASEPATH + 'event/list',
            data: {
                orgId: window.G_ORG_ID,
                activityId: id
            },
            success: function (d) {
                if (callback) {
                    callback(d);
                } else {
                    renderList(d);
                }
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

    function getQuest(actId) {
        comm.io.get({
            url: "/act/questionnaire",
            data: {activityId: actId},
            success: function (d) {
                if (!!d && d.length > 0) {
                    $('#questAction').attr('href', 'questionnaire.html?actId=' + actId)
                        .html('创建问卷');
                } else {
                    $('#questAction').attr('href', 'questDetail.html?actId=' + actId);
                }
            }
        })
    }

    function renderDetail(d) {
        var el = $('<div></div>')
        var el = comm.render({
            tpl: "tplDetail",
            data: d,
            renderTo: el
        });
        el.find('#detail_description').html(d.description);
        if (d.questionnaireId < 0) {
            el.find('#questAction').attr('href', 'questionaire.html?actId=' + d.id)
                .html('创建问卷');
        } else {
            el.find('#questAction').attr('href', 'questlist.html?id=' + d.questionnaireId);
        }
        if (d.lotteryId.length < 1) {
            el.find('#lotteryAction').attr('href', 'createLottery.html?actId=' + d.id)
                .html('创建抽奖');
        } else {
            el.find('#lotteryAction').attr('href', 'lotterylist.html?actId=' + d.id);
        }
        return el;
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

    function getQrcode(id, callback) {
        comm.io.get({
            url: "/act/getActivityQrCode",
            data: {activityId: id},
            success: function (d) {
                callback(d);
            }
        });
    }

    function renderQrcode(data) {
        var el = $(['<div class="row">',
            '<div class="center col-xs-6">',
            '<p><strong class="text-danger">报名</strong>二维码<small class="text-info">用户扫一扫即可参与报名</small></p>',
            '<div id="qrcode_join"></div>',
            '</div>',
            '<div class="center col-xs-6">',
            '<p><strong class="text-danger">签到</strong>二维码<small class="text-info">用户现场扫一扫签到</small></p>',
            '<div id="qrcode_sign"></div>',
            '</div>',
            '</div>'].join(''));

        appendQrcode(el.find('#qrcode_sign'), data.sign);
        appendQrcode(el.find('#qrcode_join'), data.signUp);

        return el;
    }

    function appendQrcode(el, url) {
        el.html(
            '<img style="width:200px; " src=' + url + '>'
        ).css("text-align", 'center');
    }

    var handler = {
        userName: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入用户呢称')
                return false;
            }
        },
        phone: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入用户手机号码')
                return false;
            }
        }
        //,
        //desc: function (val) {
        //    if (0 == val.length) {
        //        formMsgEl.html('请输入活动简介')
        //        return false;
        //    }
        //    // if( val.length > 30 ){
        //    //     formMsgEl.html('活动简介不能超过30个字。');
        //    //     return false;
        //    // }
        //},
        //beginTime: function (val) {
        //    if (0 == val.length) {
        //        formMsgEl.html('请选择活动开始时间');
        //        return false;
        //    }
        //}
    };

    function resetForm() {
        $.each(['userName', 'phone', 'title', 'categories', 'hospital', 'doctor', 'beginTime'], function (idx, field) {
            $('#' + field).val('');
        });
        $('#imageList').html('');
        $('#description').html('');
        var el = $('#editPanel');
        el.removeAttr("data-id");
        el.removeAttr("data-row");
        imageList = [];
        //closePanel();
    }

    function setupDateSel() {
        comm.utils.datetimepicker({
            el: $("#timeSelector input"),
            onChangeDate: function (ev) {
                var val = ev.date.val;
                pickedDate = Math.round(val / 1000);
                console.log('时间', val);
            }
        });
    }

    return {
        main: main
    }

});