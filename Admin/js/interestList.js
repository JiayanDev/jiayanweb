/**
 * @author janson
 * @date    2015-11-30
 * @todo  manager
 */
define(["commJs"], function (comm) {
    const DIR = 'pedia';

    var categoryData,
        categoryMap = {};

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        getList();
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
                    content: '确定删除该感兴趣条目吗？',
                    placement: 'left',
                    onYES: function (options) {
                        remove(options, id, 1, null);
                    }
                });
                return false;
            } else if ($t.hasClass('_edit')) {
                var id = $t.parent().data('id');
                var row_str = $t.parent().attr('data-row');
                var row = JSON.parse(row_str);

                $("#panelTitle").html("编辑感兴趣信息    ID: " + id);
                resetForm();
                openPanel(true);
                $('#_submit').text('编辑');

                setForm(row, row_str);
                return false;
            }
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加感兴趣信息");
            resetForm();
            openPanel();
            $('#_submit').text('添加');
            return false;
        });

        $('.close').click(function (e) {
            closePanel();
            return false;
        });

        $('#_category-reset').click(function (e) {
            setupCategories(categoryData);
            return false;
        });
        $('#_interest-reset').click(function (e) {
            setupInterests(categoryData);
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

    ////////////////////////////////////http
    function getList() {
        comm.io.get({
            url: comm.config.BASEPATH + DIR + '/interest/list',
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
                setupCategories(d);
                setupInterests(d);
            }
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

    ////////////////////////////////////Render
    function renderList(d) {
        comm.render({
            tpl: "tplList",
            data: d,
            renderTo: "#_list",
            isTableList: true
        });
    }

    function setupCategories(data) {
        setupParentCategoryList($("#category"), data);
    }

    function setupInterests(data) {
        setupParentCategoryList($("#interest"), data);
    }

    function setupParentCategoryList($el, data) {
        $el.empty();
        comm.pedia.renderParentCategoryList($el, data, categoryMap);
    }

    ////////////////////////////////////Form data

    function getParam() {
        var param = {};

        var categoryId = getSelectId($("#category"));
        if (categoryId) param['categoryId'] = categoryId;

        var interestId = getSelectId($("#interest"));
        if (interestId) param['interestId'] = interestId;

        return param;
    }

    function resetForm() {
        setupCategories(categoryData);
        setupInterests(categoryData);

        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    function setForm(row, row_str) {
        setSelect($("#category"), row.id);
        setSelect($("#interest"),row.id);

        var el = $('#editPanel');
        if (row_str) el.data("row", row_str);
        if (row['id']) el.data("id", row['id']);
    }

    function getSelectId($el) {
        var itemId = null;
        $el.find('select').each(function (idx, select) {
            var val = $.trim($(select).val());
            if (val) itemId = val;
            else return false;
        });
        return itemId;
    }

    function setSelect($el, id) {
        var category = categoryMap[id];
        var parentIds = [];
        var parentId = category ? category.parentId : null;
        while (parentId) {
            parentIds.push(parentId);
            category = categoryMap[parentId];
            parentId = category ? category.parentId : null;
        }
        parentIds = parentIds.reverse();

        setupParentCategoryList($el, categoryData);
        var data = categoryData;
        $.each(parentIds, function (idx, parentId) {
            $el.find("select:last").val(parentId);
            data = categoryMap[parentId];
            if (data.sub && data.sub.length > 0) comm.pedia.renderParentCategoryList($el, data.sub, categoryMap);
        });
    }

    ////////////////////////////////////panel
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
        }, 200);
    }

    return {
        setup: main
    }
});