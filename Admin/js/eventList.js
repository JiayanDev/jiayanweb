define(["jquery", "commJs", 'widget/bootstrap-wysiwyg'], function (_, comm) {
    var submitBtn = $('#_submit'),
        formMsgEl = $('#formMsg'),
        imageList = [],
        pickedDate;

    function main() {
        comm.checkLogin(function () {
            init();
        });
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
    //    $('#event-description').wysiwyg();
    //}

    function setupRichEditor() {
        comm.setupRichEditor({
            targetElementId: 'event-detail',
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
                var imgUrl = (resp && resp.data && resp.data.url) || '';
                appendImageList(imgUrl);
                imageList.push(imgUrl);
                $loadingEl.addClass('none');
            },
            error: function (resp) {
                fileMsg.html((resp && resp.msg) || '文件上传失败');
            }
        });
    }

    function appendImageList(imgUrl) {
        var imgListEl = $('#imageList');
        imgListEl.append('<li><img src="' + imgUrl + '"></li>');
        return imageList;
    }

    function bindEvent() {
        submitBtn.click(function () {
            var param = getParam();

            if (param) {
                doSubmit(param);
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
                var id = $t.data('id');
                comm.dialog({
                    onLoad: function (options) {
                        getQrcode(id, function (d) {
                            var el = renderQrcode(d);
                            options.content.append(el);
                        });
                    },
                    title: "活动二维码"
                });
                return false;
            }
        });

        $('#_add').click(function () {
            var el = $('#editPanel');
            el.addClass('bounce').addClass('animated').removeClass('none');
            setTimeout(function () {
                el.removeClass('bounce').removeClass('animated')
            }, 1000);
        });

        $('.close').click(function () {
            var el = $('#editPanel');
            el.addClass('bounce').addClass('animated');
            setTimeout(function () {
                el.addClass('none');
                $('#event-description').height(100);
            }, 1000);
        });

        $('#event-detail').on('focus', function () {
            $(this).animate({
                height: 400
            });
        });
    }

    function doSubmit(param) {
        comm.io.post({
            url: '/act/createActivity',
            data: param,
            success: function () {
                resetForm();
                getList();
                comm.showMsg('添加成功')
            }
        });
    }

    function getParam() {
        var param = {};

        $.each(['name', 'location', 'url'], function (idx, field) {
            param[field] = $.trim($('#' + field).val());
        });
        param['startTime'] = pickedDate;
        param['description'] = $('#event-description').html();
        param['image'] = JSON.stringify(imageList);
        param['orgId'] = window.G_ORG_ID;

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
        name: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入活动名称')
                return false;
            }
        },
        description: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入活动简介')
                return false;
            }
            // if( val.length > 30 ){
            //     formMsgEl.html('活动简介不能超过30个字。');
            //     return false;
            // }
        },
        startTime: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入文章链接');
                return false;
            }
        },
        location: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入活动地址');
                return false;
            }
        }
    };

    function resetForm() {
        $.each(['name', 'location', 'startTime', 'url'], function (idx, field) {
            $('#' + field).val('');
        });
        $('#imageList').html('');
        $('#event-description').html('');
        imageList = [];
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