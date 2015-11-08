/**
 * @author janson
 * @date    2015-08-11
 * @todo  user admin manager
 */
define(["commJs"], function (comm) {

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        setupDateSel($("#orderTime"));
        setupDateSel($("#createTimeFrom"));
        setupDateSel($("#createTimeTo"));
        getList();
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
                    content: '确定删除该该订单吗？',
                    placement: 'left',
                    onYES: function () {
                        comm.io.postId('order/remove', id, getList);
                    }
                });
                return false;
            } else if ($t.hasClass('_edit')) {
                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                $("#panelTitle").html("编辑订单信息    ID: " + id);
                openPanel(2);
                $('#_submit').text('编辑');

                setForm(row, row_str);
                return false;
            }
        });

        $('#_search').click(function () {
            $("#panelTitle").html("查询订单信息");
            resetForm();
            var args = comm.utils.getUrlArgObject();
            args['pageIndex'] = '';
            args['orders'] = '';
            setForm(args);
            openPanel(1);
            $('#_submit').text('查询');
            return false;
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加订单信息");
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
                doSubmit("order/update", params, "更新成功");
            } else {
                var params = getParam();
                doSubmit("order/create", params, "添加成功");
            }
            return false;
        });
    }

    function setupDateSel(el) {
        comm.utils.datetimepicker({
            el: el,
            minView: 'hour',
            format: 'yyyy-mm-dd hh:ii',
            onChangeDate: function (ev) {
                var val = ev.date.val;
                var pickedDate = Math.round(val / 1000);
                el.data('pickedDate', pickedDate);
                console.log('时间', val);
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
                getList(comm.utils.getUrlArgObject());
                comm.showMsg(msg);
            }
        });
    }

    function getList(data) {
        if (!data) {
            data = {};
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'order/list',
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

    ////////////////////////////////////Form data
    var fields = ['userId', 'youZanNumber', 'hospitalNumber', 'content', 'price', 'count', 'status'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });
        if ($("#orderTime").data("pickedDate")) param['orderTime'] = $("#orderTime").data("pickedDate");
        if ($("#createTimeFrom").data("pickedDate")) param['createTimeFrom'] = $("#createTimeFrom").data("pickedDate");
        if ($("#createTimeTo").data("pickedDate")) param['createTimeTo'] = $("#createTimeTo").data("pickedDate");
        return param;
    }

    function resetForm() {
        $.each(fields.concat(['orderTime','createTimeFrom', 'createTimeTo']), function (idx, field) {
            $('#' + field).val('');
        });
        $("#orderTime").data('pickedDate', null);
        $("#createTimeFrom").data('pickedDate', null);
        $("#createTimeTo").data('pickedDate', null);
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    function setForm(row, row_str) {
        $.each(fields, function (idx, field) {
            if ($('#' + field) && row[field]) $('#' + field).val(row[field]);
        });

        $("#orderTime").data("pickedDate", row['orderTime']);
        $("#createTimeFrom").data("pickedDate", row['orderTime']);
        $("#createTimeTo").data("pickedDate", row['orderTime']);

        if (row['orderTime']) {
            $('#orderTime').val(window.G_formatTime(row['orderTime']));
            $("#orderTime").data("pickedDate", row['orderTime']);
        } else $("#orderTime").data("pickedDate", null);

        if (row['createTimeFrom']) {
            $('#createTimeFrom').val(window.G_formatTime(row['createTimeFrom']));
            $("#createTimeFrom").data("pickedDate", row['createTimeFrom']);
        } else $("#createTimeFrom").data("pickedDate", null);

        if (row['createTimeTo']) {
            $('#createTimeTo').val(window.G_formatTime(row['createTimeTo']));
            $("#createTimeTo").data("pickedDate", row['createTimeTo']);
        } else $("#createTimeTo").data("pickedDate", null);

        var el = $('#editPanel');
        if (row_str) el.data("row", row_str);
        if (row['id']) el.data("id", row['id']);
    }

    ////////////////////////////////////panel
    function openPanel(showFlag) {
        if (!showFlag || showFlag==0) { //创建
            $('[name=not-search-item]').show();
            $('[name=search-edit-item]').hide();
            $('[name=search-item]').hide();
        } else if (showFlag==1) { //查询
            $('[name=not-search-item]').hide();
            $('[name=search-edit-item]').show();
            $('[name=search-item]').show();
        }else if (showFlag==2) { //编辑
            $('[name=not-search-item]').show();
            $('[name=search-edit-item]').show();
            $('[name=search-item]').hide();
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


    return {
        setup: main
    }
});