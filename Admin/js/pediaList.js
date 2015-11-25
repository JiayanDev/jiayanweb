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
        })
    }

    function init() {
        comm.setupWorkspace();
        categories2Map();
        setupCategories();
        setupCategoryTree();
        bindEvent();
        setupDateSel();
        setupImg();
        getList();
    }

    var categoryMap = {};

    function categories2Map() {
        var topCategories = comm.login.getProjects().data;
        for (var topKey in topCategories) {
            var topCategory = topCategories[topKey];
            categoryMap[topCategory.id] = topCategory;
            var subCategories = topCategory.sub;
            for (var subKey in subCategories) {
                var sub2Category = subCategories[subKey];
                categoryMap[sub2Category.id] = sub2Category;
                var categories = sub2Category.sub;
                for (var key in categories) {
                    var category = categories[key];
                    categoryMap[category.id] = category;
                }
            }
        }
    }

    function setupCategories() {
        $("#categories").empty();
        //$("#categories").append('<label class="col-sm-2 control-label">分类</label>');
        renderCategories(comm.login.getProjects().data);
    }

    function renderCategories(data) {
        $("#categories").append(setupCategoryList(data).join(''));
        $("#categories select:last").val('');
        $("#categories select:last").change(function () {
            $(this).parent().nextAll().remove();
            var category = categoryMap[$(this).val()];
            if (category.sub) renderCategories(category.sub);
        });
    }

    function setupCategoryList(categoryList) {
        var strArr = [];
        strArr.push('<div class="col-sm-4">');
        strArr.push('<select class="form-control" style="margin-bottom: 5px">');
        for (var key in categoryList) {
            var category = categoryList[key];
            strArr.push('<option value="' + category.id + '">' + category.name + '</option>');
        }
        strArr.push('</select>');
        strArr.push('</div>');
        return strArr;
    }

    function setupCategoryTree() {
        var tree = appendCategoryTree(comm.login.getProjects().data);
        $("#category-tree").empty();
        $("#category-tree").append(tree.join(''));
        $("#category-tree").jstree({
            "plugins": ["themes", "html_data", "ui", "crrm", "hotkeys"],
            "core": {/**"initially_open": ["phtml_1"], **/ animation: 50}
        }).bind("loaded.jstree", function (event, data) {

        }).bind("select_node.jstree", function (event, data) {
            var $t = $(event.target);
            //var $t = data.rslt.obj;
            var id = $t.data('id');
            var row_str = $t.attr('data-row');
            var row = JSON.parse(row_str);
            renderCategory(row);
            return false;
        }).delegate("a", "click", function (event, data) {
            //event.preventDefault();
            var $t = $(event.target);
            //var $t = data.rslt.obj;
            var id = $t.data('id');
            var row_str = $t.attr('data-row');
            var row = JSON.parse(row_str);
            renderCategory(row);
            return false;
        });
    }

    function appendCategoryTree(tree) {
        var strArr = [];
        strArr.push('<ul>');
        for (var key in tree) {
            var value = tree[key];
            strArr.push('<li>');

            var row = {};
            $.extend(row, value);
            if (row.sub) delete row.sub;
            var row_str = JSON.stringify(row);
            strArr.push("<a href='#' data-id='" + row.id + "' data-row='" + row_str + "'>" + value.name + "</a>");

            if (value.sub) strArr = strArr.concat(appendCategoryTree(value.sub));
            strArr.push('</li>');
        }
        strArr.push('</ul>');
        return strArr;
    }

    function getCategoryNames(categoryIds) {
        if (!categoryIds) {
            return;
        }
        var categoryNames = "";
        $.each(categoryIds, function () {
            var categoryId = this;
            categoryNames += categoryMap[categoryId + ""].name + "; ";
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
    function renderCategory(category) {
        var $el = $('#category-detail');
        comm.renderEl({
            tpl: 'tplForCategory',
            data: category,
            renderTo: $el
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