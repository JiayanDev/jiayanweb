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
                        comm.io.postId('user/remove', id, getList);
                    }
                });
                return false;
            } else if ($t.hasClass('_edit')) {
                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                $("#panelTitle").html("编辑用户信息    ID: " + id);
                openPanel();
                $('#_submit').text('编辑');

                setForm(row, row_str);
                return false;
            }
        });

        $('#_search').click(function () {
            $("#panelTitle").html("查询用户信息");
            resetForm();
            var args = comm.utils.getUrlArgObject();
            args['pageIndex'] = '';
            args['orders'] = '';
            setForm(args);
            openPanel(true);
            $('#_submit').text('查询');
            return false;
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
                doSubmit("user/update", params, "更新成功");
            } else {
                var params = getParam();
                doSubmit("user/create", params, "添加成功");
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
            url: comm.config.BASEPATH + 'user/list',
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
    var fields = ['name', 'wxNickName', 'gender', 'phone', 'province', 'career', 'source', 'birthYear'];

    function getParam() {
        var param = {};
        $.each(fields.concat(['city', 'district']), function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) param[field] = val;
        });
        if (pickedDate) param['birthday'] = pickedDate;
        return param;
    }

    function resetForm() {
        $.each(fields.concat(['birthday', 'city', 'district']), function (idx, field) {
            $('#' + field).val('');
        });
        pickedDate = null;
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
        comm.utils.provinceChange(row['city'], row['district']);
        pickedDate = row['birthday'];
        if (pickedDate) $('#birthday').val(window.G_formatDate(pickedDate));

        var el = $('#editPanel');
        if (row_str) el.data("row", row_str);
        if (row['id']) el.data("id", row['id']);
    }

    ////////////////////////////////////panel
    function openPanel(showSearch) {
        if (showSearch) {
            $('[name=not-search-item]').hide();
            $('[name=search-item]').show();
        } else {
            $('[name=not-search-item]').show();
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