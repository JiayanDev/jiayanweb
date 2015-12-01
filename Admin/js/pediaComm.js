/**
 * @author janson
 * @date    2015-11-26
 * @todo  manager
 */
define(["commJs"], function (comm) {
    const DIR = 'pedia',
        TREE = 'Tree',
        LIST = 'List';

    var categoryData,
        categoryMap = {},
        icon;

    const pathname = window.location.pathname;
    const type = pathname.lastIndexOf(TREE) > 0 ? TREE : (pathname.lastIndexOf(LIST) > 0 ? LIST : '');

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
        if (type == LIST) getList();
    }

    ////////////////////////////////////event
    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);
            if ($t.hasClass('_detail')) {
                var id = $t.parent().data('id');
                var row_str = $t.parent().attr('data-row');
                var row = JSON.parse(row_str);
                comm.dialog({
                    onLoad: function (options) {
                        var el = renderDetail(id);
                        options.content.append(el);
                    },
                    title: row.name
                });
                return false;
            } else if ($t.hasClass('_delete')) {
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
            } else if ($t.hasClass('recommendItem-tag')) {
                var parent = $t.parent();
                parent.remove();
                return false;
            } else if ($t.parent().hasClass('recommendItem-tag')) {
                var parent = $t.parent().parent();
                parent.remove();
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

        $('#_parent-reset').click(function (e) {
            setupParentCategories(categoryData);
            return false;
        });

        $('#_recommendItem-ok').click(function (e) {
            var id = getParentId($("#recommendItem-select"));

            var $el = $('#recommendItems a[value="' + id + '"]');
            if ($el.size() > 0) {
                comm.alertMsg('该词条已经选择了！');
                return false;
            }

            var strArr = [];
            if (id) buildRecommendItem(strArr, id);
            $('#recommendItems').append(strArr.join(''));
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
    function getData() {
        if (type == LIST) getList();
        else if (type == TREE) getTree();
    }

    function getList() {
        comm.io.get({
            url: comm.config.BASEPATH + DIR + '/item/list',
            data: {},
            success: function (d) {
                renderList(d);
            }
        });
    }

    function getTree() {
        comm.io.get({
            url: comm.config.BASEPATH + DIR + '/tree',
            data: {},
            success: function (d) {
                categoryData = d;
                comm.pedia.categories2Map(categoryMap, d);
                setupParentCategories(d);
                setuprecommendItemCategories(d);
                if (type == TREE) setupCategoryTree(d);
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
                getData();
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
                getData();
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

    function setupCategoryTree(data) {
        $('#category-detail').empty();

        var tree = appendCategoryTree(data);
        $("#category-tree").empty();
        $("#category-tree").append(tree.join(''));
        $("#category-tree").jstree({
            "plugins": ["themes", "html_data", "ui", "crrm", "hotkeys"],
            "core": {/**"initially_open": ["phtml_1"], **/ animation: 50}
        //}).bind("loaded.jstree", function (event, data) {
        //
        //}).bind("select_node.jstree", function (event, data) {
        //    var $t = $(event.target);
        //    //var $t = data.rslt.obj;
        //    var id = $t.data('id');
        //    var row_str = $t.attr('data-row');
        //    var row = JSON.parse(row_str);
        //    renderCategory(row);
        //    return false;
        }).delegate("a", "click", function (event, data) {
            //event.preventDefault();
            var $t = $(event.target);
            //var $t = data.rslt.obj;
            var id = $t.data('id');
            if (!id) {
                $t = $t.parent();
                id = $t.data('id');
            }
            var row_str = $t.attr('data-row');
            var row = JSON.parse(row_str);

            detail(id, function(data){
                if (data.isHot == null || data.isHot == 'undefined') {
                    data.isHot = row.isHot;
                }
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

            var img = (row.icon?'<img src="' + row.icon + '" class="tree-icon"/>':'') + ((row.isHot && row.isHot == true) ? '<img class="tree-hot" src="../statics/img/icon_hot.png"/>' : '');

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
        comm.pedia.renderParentCategoryList($("#parent"), data, categoryMap);
    }

    function setuprecommendItemCategories(data) {
        $("#recommendItem-select").empty();
        comm.pedia.renderParentCategoryList($("#recommendItem-select"), data, categoryMap);
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

    function renderDetail(id) {
        var url = comm.config.BASE_APP_SERVER_PATH + "pedia/html/itemdetail.html?id=" + id;
        var el = $('<div style="border:2px solid #555;width:322px;height:568px;margin:0 auto;"><iframe style="width:318px;height:568px;border:none;" src="' + url + '"></div>');
        return el;
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

        var parentId = getParentId($("#parent"));
        if (parentId) param['parentId'] = parentId;

        var isHot = $('#isHot').val();
        if (isHot) param['isHot'] = isHot;
        //if (isHot != null) if (isHot == 0) param['isHot'] = 'false'; else if (isHot == 1) param['isHot'] = 'true';

        var recommendItemIds = [];
        $('#recommendItems a').each(function () {
            recommendItemIds.push(Number($(this).attr('value')));
        });

        param['recommendItemIds'] = JSON.stringify(recommendItemIds);

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
        $('#recommendItems').html('');
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

        var category = categoryMap[row.id];
        //var parentIds = [row.id];
        var parentIds = [];
        var parentId = category ? category.parentId : null;
        while (parentId) {
            parentIds.push(parentId);
            category = categoryMap[parentId];
            parentId = category ? category.parentId : null;
        }
        parentIds = parentIds.reverse();

        setupParentCategories(categoryData);
        var data = categoryData;
        $.each(parentIds, function (idx, parentId) {
            $("#parent select:last").val(parentId);
            data = categoryMap[parentId];
            if (data.sub && data.sub.length > 0) comm.pedia.renderParentCategoryList($("#parent"), data.sub, categoryMap);
        });

        setRecommendItems(row.recommendItems);
        $('#content').html(row.content);

        var el = $('#editPanel');
        if (row_str) el.data("row", row_str);
        if (row['id']) el.data("id", row['id']);
    }

    function getParentId($parent){
        var parentId = null;
        $parent.find("select").each(function (idx, select) {
            var val = $.trim($(select).val());
            if (val) parentId = val;
            else return false;
        });
        return parentId;
    }

    function setRecommendItems(idList) {
        $('#recommendItems').html('');
        if (!idList) return;
        var strArr = [];
        $.each(idList, function (i, id) {
            buildRecommendItem(strArr, id);
        });
        $('#recommendItems').html(strArr.join(''));
    }

    function buildRecommendItem(strArr, id) {
        strArr.push('<li class="relative block f-left">');
        var category = categoryMap[id];
        var name;
        if (category == null) name = id; else name = category.name;
        strArr.push('<a class="recommendItem-tag" href="#" value="' + id + '">' + name + '<i>×</i></a>');
        strArr.push('</li>');
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