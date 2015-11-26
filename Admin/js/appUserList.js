/**
 * @author janson
 * @date    2015-11-10
 * @todo  user admin manager
 */
define(["commJs"], function (comm) {
    var pickedDate,
        avatar;

    function main() {
        comm.checkLogin(function () {
            init();
        });
    }

    function init() {
        comm.setupWorkspace();
        setupCategories();
        bindEvent();
        setupDateSel();
        setupImg();
        comm.utils.getArea();
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

    function getCategoryNames(categoryIds) {
        if (!categoryIds) {return;}
        var categoryNames = "";
        $.each(categoryIds, function () {
            var categoryId = this;
            categoryNames += categoryMap[categoryId + ""]+"; ";
        });
        return categoryNames;
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
                    content: '确定删除该该用户吗？',
                    placement: 'left',
                    onYES: function () {
                        comm.io.postId('app/user/remove', id, getList);
                    }
                });
                return false;
            } else if ($t.hasClass('_edit')) {
                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                $("#panelTitle").html("编辑用户信息    ID: " + id);
                resetForm();
                openPanel(true);
                $('#_submit').text('编辑');

                setForm(row, row_str);
                return false;
            }
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加用户信息");
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
                doSubmit("app/user/update", params, "更新成功");
            } else {
                var params = getParam();
                doSubmit("app/user/create", params, "添加成功");
            }
            return false;
        });
    }

    function setupDateSel(minView) {
        comm.utils.datetimepicker({
            el: $("#birthday"),
            minView: minView || 'month',
            format: 'yyyy-mm-dd',
            onChangeDate: function (ev) {
                var val = ev.date.val;
                pickedDate = Math.round(val / 1000);
                console.log('时间', val);
            }
        });
    }

    function setupImg() {
        var $el = $('#avatarImgThumberUploader');
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
            url: comm.config.BASEPATH + 'app/user/list',
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

    function appendImage(imgEl, imgUrl) {
        imgEl.removeClass("none");
        imgEl.html('');
        imgEl.append('<li><img src="' + imgUrl + '"' + 'style="vertical-align:middle;"></li>');
        var id = imgEl.attr("id");
        avatar = imgUrl;
    }

    function resetImage() {
        $('#avatar').html('');
        avatar = null;
    }

    ////////////////////////////////////Form data
    var fields = ['name', 'gender', 'phone', 'province', 'city', 'career', 'role', 'remove'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });
        if($('#avoidSameName').is(":checked")) param['avoidSameName'] = $('#avoidSameName').val();

        var psw = $.trim($('#psw').val());
        if (psw) param['psw'] = md5(psw);

        if (pickedDate) param['birthday'] = pickedDate;
        if (avatar) param['avatar'] = avatar;

        var categoryIds = [];
        $("#categories option:selected").each(function () {
            categoryIds.push(1 * $(this).val());
        });
        if (categoryIds.length > 0) param["categoryIds"] = JSON.stringify(categoryIds);

        //if (param['remove'] != null) param['remove'] = (param['remove'] == "true" ? true : false);
        return param;
    }

    function resetForm() {
        $.each(fields.concat(['birthday', 'psw', 'categories']), function (idx, field) {
            $('#' + field).val('');
        });
        $('#avoidSameName').removeAttr("checked");

        pickedDate = null;
        resetImage();
        $('#categories option').removeAttr("selected");
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    function setForm(row, row_str) {
        if (row['remove'] != null) row['remove'] = row['remove'] == true ? "1" : "0";
        if (row['gender'] != null) row['gender'] = row['gender'] == 1 ? "1" : "0";
        $.each(fields, function (idx, field) {
            if ($('#' + field) && row[field]) $('#' + field).val(row[field]);
        });
        comm.utils.provinceChange(row['city'], row['district']);
        pickedDate = row['birthday'];
        if (pickedDate) $('#birthday').val(window.G_formatDate(pickedDate));
        if (row.avatar) appendImage($("#avatar"), row.avatar);

        $("#categories option").each(function () {
            $(this).removeAttr("selected");
        });
        var categoryIds = row.categoryIds;
        if (categoryIds && categoryIds.length > 0) {
            for (var key in categoryIds) {
                $("#categories option[value=" + categoryIds[key] + "]").attr("selected", "selected");
            }
        }

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

    window.G_getCategoryNames = getCategoryNames;


    return {
        setup: main
    }
});