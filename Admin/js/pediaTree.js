/**
 * @author janson
 * @date    2015-11-10
 * @todo  user admin manager
 */
define(["commJs"], function (comm) {
    const DIR = 'pedia';
    var categoryData,
        categoryMap = {},
        icon;

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        setupImg();
        setupRichEditor();
        getTree();
    }

    ////////////////////////////////////event
    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);
            if ($t.hasClass('_delete')) {
                var id = $t.parent().data('id');
                comm.confirm({
                    el: $t,
                    content: '确定删除该该百科条目吗？',
                    placement: 'left',
                    onYES: function (options) {
                        remove(options, id, 1, null);
                    }
                });
                return false;
            } else if ($t.hasClass('_delete_forever')) {
                var id = $t.parent().data('id');
                comm.confirm({
                    el: $t,
                    content: '确定永久删除该百科条目吗？',
                    placement: 'left',
                    onYES: function (options) {
                        remove(options, id, null, 1);
                    }
                });
                return false;
            } else if ($t.hasClass('_edit')) {
                var id = $t.parent().data('id');
                var row_str = $t.parent().attr('data-row');
                var row = JSON.parse(row_str);

                $("#panelTitle").html("编辑百科信息    ID: " + id);
                resetForm();
                openPanel(true);
                $('#_submit').text('编辑');

                setForm(row, row_str);
                return false;
            }
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加百科信息");
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
            var el = $('#editPanel');
            var id = el.data('id');
            if (id) {
                var params = getParam();
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit(DIR + "/item/update", params, "更新成功");
            } else {
                var params = getParam();
                doSubmit(DIR + "/item/create", params, "添加成功");
            }
            return false;
        });
    }

    function setupImg() {
        var $el = $('#iconImgThumberUploader');
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

    function setupRichEditor() {
        comm.setupRichEditor({
            target: $('#content'),
            toolbarContainer: $('#richEditorToolBar')
        });
    }

    ////////////////////////////////////http
    function getTree() {
        comm.io.get({
            url: comm.config.BASEPATH + DIR + '/tree',
            data: {},
            success: function (d) {
                categoryData = d;
                categories2Map(d);
                setupParentCategories(d);
                setupCategoryTree(d);
                //renderList(d);
            }
        });
    }

    function detail(id, success) {
        $('#category-detail').empty();

        var data = {
            id: id
        };
        comm.io.get({
            url: comm.config.BASEPATH + DIR + '/item/detail',
            data: data,
            success: success
        });
    }

    function doSubmit(action, param, msg) {
        comm.io.post({
            url: comm.config.BASEPATH + action,
            data: param,
            success: function () {
                closePanel();
                getTree();
                comm.showMsg(msg);
            }
        });
    }

    function remove(options, id, tree, db) {
        var data = {
            id: id
        };
        if (tree) data['tree'] = tree;
        if (db) data['db'] = db;
        comm.io.post({
            url: comm.config.BASEPATH + DIR + '/item/remove',
            data: data,
            success: function () {
                options.unload();
                getTree();
            }
        });
    }

    ////////////////////////////////////Render
    function categories2Map(data, parentId) {
        for (var key in data) {
            var category = data[key];
            if (parentId) category['parentId'] = parentId;
            categoryMap[category.id] = category;
            var sub = category.sub;
            if (sub) categories2Map(sub, category.id);
        }
    }

    function setupCategoryTree(data) {
        var tree = appendCategoryTree(data);
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
            //var row_str = $t.attr('data-row');
            //var row = JSON.parse(row_str);

            detail(id, function(data){
                renderCategory(data);
            });
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

            var img = ('<img src="' + row.icon + '" class="tree-icon"/>') + ((row.isHot && row.isHot == true) ? '<img class="tree-hot" src="../statics/img/icon_hot.png"/>' : '');

            strArr.push("<a style='height:25px;' href='#' data-id='" + row.id + "' data-row='" + row_str + "'>" + value.name + img + "</a>");

            if (value.sub) strArr = strArr.concat(appendCategoryTree(value.sub));
            strArr.push('</li>');
        }
        strArr.push('</ul>');
        return strArr;
    }

    function renderCategory(category) {
        var $el = $('#category-detail');
        comm.renderEl({
            tpl: 'tplForCategory',
            data: category,
            renderTo: $el
        });
    }

    function setupParentCategories(data) {
        $("#parent").empty();
        renderParentCategoryList(data);
    }

    function renderParentCategoryList(data) {
        $("#parent").append(setupParentCategoryList(data).join(''));
        $("#parent select:last").val('');
        $("#parent select:last").change(function () {
            $(this).parent().nextAll().remove();
            var category = categoryMap[$(this).val()];
            if (category.sub && category.sub.length > 0) renderParentCategoryList(category.sub);
        });
    }

    function setupParentCategoryList(categoryList) {
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

    function appendImage(imgEl, imgUrl) {
        imgEl.removeClass("none");
        imgEl.html('');
        imgEl.append('<li><img src="' + imgUrl + '"' + 'style="vertical-align:middle;"></li>');
        var id = imgEl.attr("id");
        icon = imgUrl;
    }

    function resetImage() {
        $('#icon').html('');
        icon = null;
    }

    ////////////////////////////////////Form data
    var fields = ['name', 'introduction'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });

        var keywords = $("#keywords").val();

        if (keywords) param['keywords'] = JSON.stringify(keywords.replace('，', ',').split(','));

        if (icon) param['icon'] = icon;

        var parentId;
        $("#parent select").each(function (idx, select) {
            var val = $.trim($(select).val());
            if (val) parentId = val;
            else return false;
        });
        if (parentId) param['parentId'] = parentId;

        var isHot = $('#isHot').val();
        if (isHot) param['isHot'] = isHot;
        //if (isHot != null) if (isHot == 0) param['isHot'] = 'false'; else if (isHot == 1) param['isHot'] = 'true';

        var content = $('#content').html();
        if (content) param['content'] = content;

        return param;
    }

    function resetForm() {
        $.each(fields.concat(['keywords', 'isHot']), function (idx, field) {
            $('#' + field).val('');
        });
        resetImage();
        setupParentCategories(categoryData);
        $('#content').html('');

        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    function setForm(row, row_str) {
        if (row['isHot'] != null) row['isHot'] = row['isHot'] == true ? "1" : "0";
        $.each(fields.concat(['isHot']), function (idx, field) {
            if ($('#' + field) && row[field]) $('#' + field).val(row[field]);
        });

        var keywords = row['keywords'];
        if (keywords != null) {
            $("#keywords").val(keywords.join(','));
        }

        if (row.icon) appendImage($("#icon"), row.icon);

        //var parentIds = [row.id];
        var parentIds = [];
        var parentId = row.parentId;
        while (parentId){
            parentIds.push(parentId);
            parentId = categoryMap[parentId].parentId;
        }
        parentIds = parentIds.reverse();

        setupParentCategories(categoryData);
        var data = categoryData;
        $.each(parentIds, function (idx, parentId) {
            $("#parent select:last").val(parentId);
            data = categoryMap[parentId];
            renderParentCategoryList(data);
        });

        $('#content').html(row.content);

        var el = $('#editPanel');
        if (row_str) el.data("row", row_str);
        if (row['id']) el.data("id", row['id']);
    }

    ////////////////////////////////////panel
    function openPanel(showEdit) {
        //if (showEdit) {
        //    $('[name=edit-item]').show();
        //} else {
        //    $('[name=edit-item]').hide();
        //}
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