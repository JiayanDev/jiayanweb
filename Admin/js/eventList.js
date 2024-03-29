/**
 * @author janson
 * @date    2015-08-11
 * @todo  event manager
 */
define(["jquery", "commJs", 'widget/bootstrap-wysiwyg'], function (_, comm) {
    var submitBtn = $('#_submit'),
        formMsgEl = $('#formMsg'),
        imgs = {},
        pickedDate,
        desc = null;

    function main() {
        comm.checkLogin(function () {
            init();
        });
        return comm;
    }

    function init() {
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
        $('._detailItem').each(function () {
            var $item = $(this);

            comm.setupRichEditor({
                target: $item.find('._detailValue'),
                toolbarContainer: $item.find('.richEditorToolBar')
            });
        })
    }

    function setupFileLoader() {
        setupImg($('#coverImgThumberUploader'));
        setupImg($('#posterImgThumberUploader'));
    }

    function setupImg($el) {
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

    function appendImage(imgEl, imgUrl) {
        imgEl.removeClass("none");
        imgEl.html('');
        imgEl.append('<li><img src="' + imgUrl + '"' + 'style="vertical-align:middle;"></li>');
        var id = imgEl.attr("id");
        imgs[id] = imgUrl;
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
                        //getList(id, function (d) {
                        //    var el = renderDetail(d);
                        //    options.content.append(el);
                        //
                        //    // getQuest(id);
                        //});
                        var el = renderDetail(id);
                        options.content.append(el);
                    },
                    title: "活动信息"
                });
                return false;
            }

            if ($t.hasClass('_edit')) {
                resetForm();
                $('#item-topic').show();
                $('#item-posterImg').show();
                $('#item-applymentLimit').show();
                $('#item-status').show();
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
                        $('#applymentLimit').val(row.applymentLimit);
                        if (row.coverImg && row.coverImg != "undefined") appendImage($("#coverImg"), row.coverImg);
                        if (row.posterImg && row.posterImg != "undefined") appendImage($("#posterImg"), row.posterImg);
                        $('#bindTopicId').val(row.bindTopicId);

                        comm.status.edit(row.status, true);

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

        $('#_search').click(function () {
            getList();
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加活动信息");
            resetForm();
            openPanel(true);
            comm.status.hide();
        });

        $('.close').click(function () {
            closePanel();
        });

        $('#event-detail').on('focus', function () {
            $(this).animate({
                height: 400
            });
        });
        $('a[name="detail-tab"]').click(function () {
            checkDesc();
            saveDescItem();
            setDescItem($(this));
            return true;
        });
    }

    function openPanel(showCreate) {
        if (showCreate) {
            $('[name=create-item]').show();
        } else {
            $('[name=create-item]').hide();
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
            $('#description').height(100);
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

    function getList(id, callback) {
        var data = {};
        if (!id){
            id = $("#_id").val();
        }
        if (id) {
            data["id"] = id;
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'event/list',
            data: data,
            success: function (data) {
                if (callback) {
                    callback(data);
                } else {
                    var d = $.isArray(data)? data: data['list'];
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
                    renderList(data);
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

    function renderDetail(id) {
        var url = comm.config.BASE_APP_SERVER_PATH + "html/eventdetail.html?id=" + id;
        var el = $('<div style="border:2px solid #555;width:322px;height:568px;margin:0 auto;"><iframe style="width:318px;height:568px;border:none;" src="' + url + '"></div>');
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

    var fields = ['userId', 'userName', 'phoneNum', 'title', 'applymentLimit', 'bindTopicId', 'status'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });

        var categoryIds = [];
        $("#categories option:selected").each(function () {
            categoryIds.push(1 * $(this).val());
        });

        if (categoryIds.length > 0) param["categoryIds"] = JSON.stringify(categoryIds);

        var hospitalId = $('#hospital').data("id");
        if (hospitalId) param["hospitalId"] = hospitalId;
        var doctorId = $('#doctor').data("id");
        if (doctorId) param["doctorId"] = doctorId;

        param['beginTime'] = pickedDate;
        param['desc'] = getDesc();
        $.extend(param, imgs);
        return validate(param);
    }

    function getDesc() {
        checkDesc();
        saveDescItem();
        return JSON.stringify(desc);
    }

    function resetDesc(descStr) {
        !!descStr && (desc = JSON.parse(descStr));
        checkDesc();
        $('#_detail-tabs li').removeClass('active');
        $('#_detail-tabs li:first').addClass('active');
        setDescItem($('#_detail-tabs .active a'));
    }

    function checkDesc() {
        if (!desc) {
            desc = [{key: '', value: ''}, {key: '', value: ''}, {key: '', value: ''}];
        }
    }

    function saveDescItem(){
        var href = $('#_detail-tabs .active a').attr('href');
        var index = Number(href);
        desc[index].key = $('#_detail_content ._detailKey').val();
        desc[index].value = $('#_detail_content ._detailValue').html();
    }

    function setDescItem($tab){
        var href = $tab.attr('href');
        var index = Number(href);
        $('#_detail_content ._detailKey').val(desc[index].key);
        $('#_detail_content ._detailValue').html(desc[index].value);
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
        $('#item-posterImg').hide();
        $('#item-applymentLimit').hide();
        $('#item-status').hide();
        $('#coverImg').html('');
        $('#posterImg').html('');
        //$("#status").get(0).selectedIndex = 0;
        imgs = {};
        resetDesc();
        $('#categories option').removeAttr("selected");
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
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