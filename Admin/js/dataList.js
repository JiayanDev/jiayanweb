/**
 * @author janson
 * @date    2015-08-11
 * @todo  user admin manager
 */
define(["commJs"], function (comm) {
    var formMsgEl = $('#formMsg'),
        model,
        listAction,
        createAction,
        updateActon,
        removeActon,
        editFields,
        createFields,
        createPanel,
        editPanel;

    function main(config) {
        comm.checkLogin(function () {
            model = getConfigValue(config, 'model', 'model');
            listAction = getConfigValue(config, 'listAction', model + '/list');
            createAction = getConfigValue(config, 'createAction', model + '/create');
            updateActon = getConfigValue(config, 'updateActon', model + '/update');
            removeActon = getConfigValue(config, 'removeActon', model + '/remove');
            editFields = getConfigValue(config, 'editFields', []);
            createFields = getConfigValue(config, 'createFields', []);
            var editPanelId = getConfigValue(config, 'editPanel', 'editPanel');
            editPanel = $('#' + editPanelId);
            createPanel = $('#' + getConfigValue(config, 'createPanel', editPanelId));
            init();
        });
    }

    function getConfigValue(config, key, def) {
        var value = config[key];
        if (!value) value = def;
        return value;
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        getList();
    }

    function getList() {
        var data = {};
        var id = $("#modelId".replace("model", model)).val();
        if (id) {
            data["id"] = id;
        }
        comm.io.get({
            url: comm.config.BASEPATH + listAction,
            data: data,
            success: function (d) {
                renderList(d);
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

    function bindEvent() {
        $('body').click(function (evt) {
            var $t = $(evt.target);
            if ($t.hasClass('_edit')) {
                var id = $t.data('id');
                var row_str = $t.data('row');
                var row = JSON.parse(row_str);
                setForm(editPanel, editFields, row);
                openPanel(editPanel);
                editPanel.data("id", $t.data('id'));
                editPanel.data("row", row_str);
                return false;
            } else if ($t.hasClass('_delete')) {
                var id = $t.data('id');
                comm.confirm({
                    el: $t,
                    content: '确定删除吗？',
                    placement: 'left',
                    onYES: function () {
                        comm.io.postId(removeActon, id, getList);
                    }
                });
                return false;
            }
        });

        $('#_search').click(function () {
            getList();
            return false;
        });

        $('#_add').click(function () {
            openPanel(createPanel);
            resetForm(createPanel, createFields);
            return false;
        });

        $('.close').click(function (e) {
            closePanel($(e.target).parent());
            return false;
        });

        $("[name='_submit']").click(function (e) {
            var el = $(e.target).parents('.container.container-bg');
            var id = el.data('id');
            if (id) {
                var params = getParam(el, editFields);
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit(el, updateActon, params, "更新成功");
            } else {
                var params = getParam(el, createFields);
                doSubmit(el, createAction, params, "添加成功");
            }
            return false;
        });
    }

    function doSubmit(panel, action, param, msg) {
        comm.io.post({
            url: comm.config.BASEPATH + action,
            data: param,
            success: function () {
                closePanel(panel);
                getList();
                comm.showMsg(msg);
            }
        });
    }

    function getParam(panel, fields) {
        var param = {};
        $.each(fields, function (idx, field) {
            var child = panel.find("[name='" + field + "']");
            var val = $.trim(child.val());
            if (val) {
                param[field] = val;
            }
        });
        return param;
    }

    function resetForm(panel, fields) {
        $.each(fields, function (idx, field) {
            var child = panel.find("[name='" + field + "']");
            child.val('');
        });
        resetEditPanel();
    }

    function resetEditPanel() {
        editPanel.data("row", "");
        editPanel.data("id", "");
        editPanel.removeAttr("data-id");
        editPanel.removeAttr("data-row");
    }

    function setForm(panel, fields, row) {
        $.each(fields, function (idx, field) {
            var child = panel.find("[name='" + field + "']");
            child.val(row[field]);
        });
    }

    function openPanel(el) {
        el.addClass('bounce').addClass('animated').removeClass('none');
        setTimeout(function () {
            el.removeClass('bounce').removeClass('animated')
        }, 1000);
    }


    function closePanel(el) {
        el.addClass('bounce').addClass('animated');
        setTimeout(function () {
            el.addClass('none');
        }, 1000);
    }

    return {
        main: main
    }
});