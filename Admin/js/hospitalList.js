/**
 * @author janson
 * @date    2015-08-11
 * @todo  hospital manager
 */
define(["commJs"], function (comm) {
    var formMsgEl = $('#formMsg'),
        regionData;

    function main() {
        comm.checkLogin(function () {
            init();
        })
    }

    function init() {
        comm.setupWorkspace();
        getArea();
        getList();
        bindEvent();
        setupFileLoader();
    }

    function getList() {
        var data = {};
        var id = $("#hospitalId").val();
        if (id) {
            data["id"] = id;
        }
        comm.io.get({
            url: comm.config.BASEPATH + 'hospital/list',
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
                openPanel("编辑医院");

                var id = $t.data('id');
                var row_str = $t.attr('data-row');
                var row = JSON.parse(row_str);

                $('#name').val(row.name);
                $('#introduction').val(row.introduction);
                $('#type').val(row.type);
                if (row.businessHourFrom!=null && row.businessHourFrom!='') {
                    var values = row.businessHourFrom.split(':');
                    $('#businessHourFrom').val(values[0]);
                    if (values.length>1) $('#businessMinFrom').val(values[1]);
                }
                if (row.businessHourTo!=null && row.businessHourTo!='') {
                    var values = row.businessHourTo.split(':');
                    $('#businessHourTo').val(values[0]);
                    if (values.length>1) $('#businessMinTo').val(values[1]);
                }
                setPictures(row.pictures);
                $('#province').val(row.province);
                provinceChange(row.city, row.district);
                //$('#city').val(row.city);
                //$('#district').val(row.district);
                $('#addr').val(row.addr);
                $('#contactPhone').val(row.contactPhone);
                $('#status').val(row.status);

                var el = $('#editPanel');
                el.data("row", row_str);
                el.data("id", id);

                return false;
            } else if ($t.hasClass('_delete')) {
                var id = $t.data('id');
                comm.confirm({
                    el: $t,
                    content: '确定删除吗？',
                    placement: 'left',
                    onYES: function () {
                        remove(id);
                    }
                });
                return false;
            }
        });

        $('#btnSearch').click(function () {
            getList();
        });

        $('#_add').click(function () {
            openPanel("添加医院");
        });

        $('.close').click(function (e) {
            closePanel();
            return false;
        });

        $('#_submit').click(function () {
            var params = getParam();
            if (!params) return false;
            var el = $('#editPanel');
            var id = el.data('id');
            if (id) {
                var row_str = el.data('row');
                var row = JSON.parse(row_str);
                params = $.extend(params, {id: id});
                doSubmit("hospital/update", params, "更新成功");
            } else {
                doSubmit("hospital/create", params, "添加成功");
            }
            return false;
        });
    }

    function setupFileLoader() {
        var $loadingEl = $('.loading'),
            fileMsg = $('#fileMsg');

        comm.utils.setupFileLoader({
            el: '#thumberUploader',
            beforeSubmit: function (e, data) {
                fileMsg.html('');
                $loadingEl.removeClass('none');
            },
            callback: function (resp) {
                var imgUrl = (resp && resp.url) || null;
                if (imgUrl) {
                    imgUrl = comm.config.BASE_IMAGE_PATH + imgUrl;
                    appendImageList(imgUrl);
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

    var pictures = [];

    function appendImageList(imgUrl) {
        var imgListEl = $('#imageList');
        imgListEl.removeClass("none");
        //imgListEl.html('');
        imgListEl.append('<li style="margin:2px;"><img src="' + imgUrl + '"' + 'style="vertical-align:middle;">' +
            '<a href="#" src="' + imgUrl + '"' + 'class="img-delete">&times;</a></li>');
        pictures.push(imgUrl);

        $("#imageList .img-delete:last").click(function () {
            var src = $(this).attr('src');
            var index = pictures.indexOf(src);
            pictures.splice(index, 1);
            $(this).parent().remove();
            return false;
        });
    }

    function setPictures(pictures) {
        for (var key in pictures) {
            var picture = pictures[key];
            appendImageList(picture);
        }
    }

    function getArea() {
        comm.io.getJson(comm.config.BASE_SERVER_PATH + 'statics/region.json', function (data) {
            regionData = data;
            $("#province").empty();
            for (var key in data) {
                var province = data[key];
                $("#province").append("<option value='" + province.provName + "'>" + province.provName + "</option>");
            }
            $("#province").val(regionData[0].provName);
            provinceChange();
        });
        // 切换省份
        $("#province").change(function () {
            provinceChange();
        });
        // 切换城市
        $("#city").change(function () {
            cityChange();
        });
    }

    function provinceChange(cityName, regionName) {
        if (!regionData) return;
        var index = $("#province ").get(0).selectedIndex;
        var cities = regionData[index].cities;
        $("#city").empty();
        for (var key in cities) {
            var city = cities[key];
            if (key = 0) {
                $("#city").append("<option selected='selected' value='" + city.cityName + "'>" + city.cityName + "</option>");
            } else {
                $("#city").append("<option value='" + city.cityName + "'>" + city.cityName + "</option>");
            }
        }
        if (cityName) {
            $('#city').val(cityName);
        } else {
            $('#city').val(cities[0].cityName);
        }
        cityChange(regionName);
    }

    function cityChange(regionName) {
        if (!regionData) return;
        var provinceIndex = $("#province").get(0).selectedIndex;
        var index = $("#city").get(0).selectedIndex;
        var regions = regionData[provinceIndex].cities[index].regions;
        $("#district").empty();
        if (regions.length > 0) {
            $("#district").show();
            for (var key in regions) {
                var region = regions[key];
                if (key = 0) {
                    $("#district").append("<option selected='selected' value='" + region.regionName + "'>" + region.regionName + "</option>");
                } else {
                    $("#district").append("<option value='" + region.regionName + "'>" + region.regionName + "</option>");
                }
            }
            if (regionName) {
                $('#district').val(regionName);
            } else {
                $('#district').val(regions[0].regionName);
            }
        } else {
            $("#district").hide();
        }
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

    function remove(id) {
        var data = {
            id: id
        };
        comm.io.post({
            url: comm.config.BASEPATH + 'hospital/remove',
            data: data,
            success: function () {
                getList();
            }
        });
    }

    function openPanel(title) {
        resetForm();
        $("#panelTitle").html(title);
        var el = $('#editPanel');
        el.addClass('bounce').addClass('animated').removeClass('none');
        setTimeout(function () {
            el.removeClass('bounce').removeClass('animated')
        }, 1000);
    }

    function closePanel() {
        var el = $('#editPanel');
        el.addClass('bounce').addClass('animated');
        setTimeout(function () {
            el.addClass('none');
        }, 200);
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
        name: function (val) {
            if (0 == val.length) {
                formMsgEl.html('请输入医院名称')
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

    var fields = ['name', 'introduction', 'type', 'province', 'city', 'district', 'addr', 'contactPhone'];

    function getParam() {
        var param = {};
        $.each(fields, function (idx, field) {
            var val = $.trim($('#' + field).val());
            if (val) {
                param[field] = $.trim($('#' + field).val());
            }
        });
        param["pictures"] = JSON.stringify(pictures);

        var businessHourFrom = checkNum('businessHourFrom', 0, 23);
        if (businessHourFrom == null) return;

        var businessMinFrom = checkNum('businessMinFrom', 0, 59);
        if (businessHourFrom != '' && businessMinFrom == '') {
            alert('时间格式错误！');
            return;
        }
        if (businessMinFrom == null) return;

        var businessHourTo = checkNum('businessHourTo', 0, 23);
        if (businessHourTo == null) return;

        var businessMinTo = checkNum('businessMinTo', 0, 59);
        if (businessMinTo == null) return;
        if (businessHourTo != '' && businessMinTo == '') {
            alert('时间格式错误！');
            return;
        }

        if (businessHourFrom!='') param["businessHourFrom"] = window.G_getNumStr(Number(businessHourFrom)) + ':' + window.G_getNumStr(Number(businessMinFrom));
        if (businessHourTo!='') param["businessHourTo"] = window.G_getNumStr(Number(businessHourTo)) + ':' + window.G_getNumStr(Number(businessMinTo));

        return validate(param);
    }

    function checkNum(field, min, max) {
        var val = $('#' + field).val();
        if (val==''){
            return '';
        }
        if (val=='' || val < min || val > max) {
            alert('时间格式错误！');
            return null;
        } else return val;
    }

    function resetForm() {
        $.each(fields.concat(['businessHourFrom', 'businessMinFrom', 'businessHourTo', 'businessMinTo']), function (idx, field) {
            $('#' + field).val('');
        });
        pictures = [];
        $('#imageList').html('');
        $('#province').val(regionData[0].provName);
        provinceChange();
        var el = $('#editPanel');
        el.data("row", "");
        el.data("id", "");
        el.removeAttr("data-id");
        el.removeAttr("data-row");
    }

    return {
        setup: main
    }
});