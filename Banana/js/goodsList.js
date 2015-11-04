/**
 * @author janson
 * @date    2015-08-11
 * @todo  user admin manager
 */
define(["commJs"], function (comm) {
    var pickedDate;

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        bindEvent();
        setupDateSel();
        comm.utils.getArea();
        getList();
    }

    ////////////////////////////////////event
    function bindEvent() {
        $('#_search').click(function () {
            getList();
        });

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
                openPanel();

                setForm(id, row, row_str);
                return false;
            }
        });

        $('#_add').click(function () {
            $("#panelTitle").html("添加订单信息");
            resetForm();
            openPanel();
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
                doSubmit("order/update", params, "更新成功");
            } else {
                var params = getParam();
                doSubmit("order/create", params, "添加成功");
            }
            return false;
        });
    }

    function setupDateSel() {
        comm.utils.datetimepicker({
            el: $("#birthday"),
            minView: 'hour',
            format: 'yyyy-mm-dd',
            onChangeDate: function (ev) {
                var val = ev.date.val;
                pickedDate = Math.round(val / 1000);
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
                getList();
                comm.showMsg(msg);
            }
        });
    }

    function getList() {
        var data = {};
        var id = $("#userId").val();
        if (id) {
            data["id"] = id;
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
    var fields = ['userId', 'youZanNumber', 'hospitalNumber', 'content', 'price', 'count'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });
        return param;
    }

    function resetForm() {
        $.each(fields.concat(['orderTime']), function (idx, field) {
            $('#' + field).val('');
        });
        pickedDate = null;
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    function setForm(id, row, row_str) {
        $.each(fields, function (idx, field) {
            $('#' + field).val(row[field]);
        });
        pickedDate = row['orderTime'];
        $('#orderTime').val(window.G_formatTime(pickedDate));

        var el = $('#editPanel');
        el.data("row", row_str);
        el.data("id", id);
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