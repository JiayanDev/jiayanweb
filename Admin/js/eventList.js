/**
 * @author janson
 * @date    2015-08-11
 * @todo  event manager
 */
define(["jquery", "commJs", 'widget/bootstrap-wysiwyg'], function (_, comm) {
    var submitBtn = $('#_submit'),
        formMsgEl = $('#formMsg'),
    //imageList = [],
        coverImg = null,
        pickedDate;

    function main() {
        comm.checkLogin(function () {
            init();
        });
        return comm;
    }

    function init() {
        //imageList = [];
        coverImg = null;
        comm.setupWorkspace();
        setupCategories();
        setupFileLoader();
        bindEvent();
        setupDateSel();
        setupRichEditor();
        getList();
    }

    var categoryMap = {};

    function setupCategories() {
        $("#categories").empty();
        var topCategories = comm.login.getProjects().data;
        for (var topKey in topCategories) {
            var topCategory = topCategories[topKey];
            categoryMap[topCategory.id] = topCategory.name;
            //$("#categories").append('<optgroup label="-' + topCategory.name + '" data-max-options="2">');
            var subCategories = topCategory.sub;
            for (var subKey in subCategories) {
                var sub2Category = subCategories[subKey];
                categoryMap[sub2Category.id] = sub2Category.name;
                //$("#categories").append('<optgroup label="-' + sub2Category.name + '" data-max-options="2" style="margin-left:15px">');
                var categories = sub2Category.sub;
                for (var key in categories) {
                    var category = categories[key];
                    categoryMap[category.id] = category.name;
                    $("#categories").append("<option value='" + category.id + "'>" + topCategory.name + ">>" + sub2Category.name + ">>" + category.name + "</option>");
                }
                //$("#categories").append('</optgroup>');
            }
            //$("#categories").append('</optgroup>');
        }
    }

    function setupRichEditor() {
        $('._detailItem').each(function  () {
            var $item = $(this);

            comm.setupRichEditor({
                target: $item.find('._detailValue'),
                toolbarContainer: $item.find('.richEditorToolBar')
            });
        })
    }

    function setupFileLoader() {
        setupCoverImg();
        setupCoverWithTxtImg();
    }

    function setupCoverImg () {
        var $el = $('#thumberUploader'),
            $closest = $el.closest('.col-sm-1'),
            $loadingEl = $closest.find('.loading'),
            fileMsg = $closest.find('.fileMsg');

        comm.utils.setupFileLoader({
            el: $el,
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
                    //imageList.push(imgUrl);
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

    function setupCoverWithTxtImg () {
        var $el = $('#thumberWithTxtUploader'),
            $closest = $el.closest('.col-sm-1'),
            $loadingEl = $closest.find('.loading'),
            fileMsg = $closest.find('.fileMsg');

        comm.utils.setupFileLoader({
            el: $el,
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
                    //imageList.push(imgUrl);
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
        //imgListEl.append('<li><img src="../statics/img/addimage-empty.png"></li>');

        imgListEl.html('');
        imgListEl.append('<li><img src="' + imgUrl + '"' + 'style="vertical-align:middle;"></li>');
        //return imageList;
    }

    function bindEvent() {
        submitBtn.click(function () {
            var el = $('#editPanel');
            var id = el.data('id');
            if (id) {
                var params = getParam();
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit("event/update", params, "更新成功");
            } else {
                var params = getParam();
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
                resetForm();
                $('#item-topic').show();
                $("#panelTitle").html("编辑活动信息");
                var id = $t.data('id');
                comm.io.get({
                    url: comm.config.BASEPATH + 'event/detail',
                    data: {
                        id: id
                    },
                    success: function (row) {
                        //$('#userId').attr("disabled", true);
                        //$('#userId').val(row.userId);
                        $('#userName').val(row.userName);
                        $('#phoneNum').val(row.phone);
                        $('#title').val(row.title);
                        $("#categories option").each(function () {
                            $(this).removeAttr("selected");
                        });
                        var categoryIds = row.categoryIds;
                        if (categoryIds && categoryIds.length > 0) {
                            for (var key in categoryIds) {
                                $("#categories option[value=" + categoryIds[key] + "]").attr("selected", "selected");
                            }
                        }
                        $('#hospital').val(row.hospitalName);
                        $('#doctor').val(row.doctorName);
                        $('#beginTime').val(window.G_formatTime(row.beginTime));
                        $('#phone').val(row.phone);
                        if (row.coverImg && row.coverImg != "undefined") appendImageList(row.coverImg);
                        $('#bindTopicId').val(row.bindTopicId);
                        resetDesc(row.desc);
                        var el = $('#editPanel');
                        el.data("row", JSON.stringify(row));
                        el.data("id", id);

                        openPanel();
                    }
                });
                //$("#panelTitle").html("编辑活动信息");
                //var id = $t.data('id');
                //var row_str = $t.attr('data-row');
                //var row = JSON.parse(row_str);
                //$('#userName').val(row.userName);
                //$('#phone').val(row.phone);
                //$('#title').val(row.title);
                //$('#hospital').val(row.hospitalName);
                //$('#doctor').val(row.doctorName);
                //$('#beginTime').val(row.beginTime);
                //$('#event-phone').val(row.phone);
                //
                //var el = $('#editPanel');
                //el.data("row", row_str);
                //el.data("id", id);
                //
                //openPanel();
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
        resetForm();
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
                    for (var key in d) {
                        var item = d[key];
                        var categoryIds = item.categoryIds;
                        if (categoryIds && categoryIds.length > 0) {
                            var name = "";
                            for (var idKey in categoryIds) {
                                var id = categoryIds[idKey]
                                name += categoryMap[id] + " ";
                            }
                            item.categoryName = name;
                        }
                    }
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
        userName: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入用户呢称')
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

    var fields = ['userName', 'phoneNum', 'title', 'bindTopicId'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });

        var categoryIds = [];
        $("#categories option:selected").each(function () {
            categoryIds.push(1*$(this).val());
        });

        if (categoryIds.length > 0) param["categoryIds"] = JSON.stringify(categoryIds);

        var hospitalId = $('#hospital').data("id");
        if (hospitalId) param["hospitalId"] = hospitalId;
        var doctorId = $('#doctor').data("id");
        if (doctorId) param["doctorId"] = doctorId;

        param['beginTime'] = pickedDate;
        param['desc'] = getDesc();
        //param['coverImg'] = JSON.stringify(imageList);
        if (coverImg) param['coverImg'] = coverImg;
        return validate(param);
    }

    function getDesc () {
        var desc = [];

        $('._detailItem').each(function  () {
            var $item = $(this);

            desc.push({
                key: $item.find('._detailKey').val(),
                value: $item.find('._detailValue').html()
            });
        });
        return JSON.stringify(desc);
    }

    function resetDesc ( desc ) {
        
        $('._detailItem').each(function(i, item) {
            var $item = $(this);

            itemValue = !!desc&&desc.length > i ? desc[i]:{};

            $item.find('._detailKey').val( itemValue.key||'');
            $item.find('._detailValue').html( itemValue.value || '');
        });
    }

    function resetForm() {
        $.each(fields.concat(['categories', 'hospital', 'doctor', 'beginTime']), function (idx, field) {
            $('#' + field).val('');
        });
        $('#hospital').data("id", "");
        $('#hospital').removeAttr("data-id");
        $('#doctor').data("id", "");
        $('#doctor').removeAttr("data-id");
        $('#item-topic').hide();
        $('#imageList').html('');
        resetDesc();
        $('#categories option').removeAttr("selected");
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
        coverImg = null;
        //imageList = [];
        //closePanel();
    }

    function setupDateSel() {
        comm.utils.datetimepicker({
            el: $("#timeSelector input"),
            minView: 'hour',
            format: 'yyyy - MM - dd hh:mm',
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