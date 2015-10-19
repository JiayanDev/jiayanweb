/**
 * 公共函数
 * @author kenshinlin   <kenshinlin.iris@gmail.com>
 * @date    2015-4-14
 * @todo  alertMsg confirm
 */
define(["jquery", 'lib/tmpl'], function ($, tmpl) {
    const CODE_OVERDUE = -36;
    const AUTHORIZATION = "AUTHORIZATION";
    const CONFIG_VERSION = "configVersion";
    const PROJECT_CONFIG = "projectConfig";


    window.G_ENV = window.location.host.indexOf('test') > 0 ? 'test' : 'release';
    var env = window.G_ENV == 'release' ? '' : 'test';

    const BASE_SERVER_PATH = 'http://admin' + env + '.jiayantech.com/';
    const BASE_API_SERVER_PATH = BASE_SERVER_PATH + 'my_admin/';
    const BASE_APP_SERVER_PATH = 'http://app' + env + '.jiayantech.com/';
    const BASE_IMAGE_SERVER_SHOW_PATH = "http://jiayanimg.b0.upaiyun.com/";

    var $confirmEl = null,
        BASEPATH = '../index.php/api/';

    function setupAdminNav() {
        require(['bootstrap'], function () {
            var nav = [
                    {label: "管理员", url: "userList"},
                    {label: "医院", url: "hospitalList"},
                    {label: "医生", url: "doctorList"},
                    {label: "日记", url: "diaryList"},
                    {label: "话题", url: "topicList"},
                    {label: "活动", url: "eventList"},
                    {label: "伴美", url: "companyList"},
                    {label: "反馈", url: "feedbackList"},
                    {
                        label: "运营",
                        sub: [
                            {
                                url: 'homepageList',
                                label: '首页展示'
                            },
                            {
                                url: 'recommendTopicList',
                                label: '推荐话题'
                            }]
                    }
                ],
                cur = getCur(nav),
                html = [],
                tpl = '<li class="{ACTIVE}"><a href="{URL}.html">{LABEL}</a></li>',
                tplWithSub = '<li class="dropdown {ACTIVE}">' +
                    '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{LABEL}<span class="caret"></span></a>' +
                    '<ul class="dropdown-menu" role="menu">{SUBNAV}</ul>' +
                    '</li>',
                tplSub = '<li><a href="{URL}.html">{LABEL}{ACTIVE}</a></li>';

            $.each(nav, function () {
                var active = cur == this.url ? 'active' : '';

                if (window.G_ENV == 'release' && window.G_ORG_ID == 1 && this.mod == 'qudao') {
                    return;
                }

                if (!this.sub) {
                    html.push(fillString(tpl, $.extend(this, {active: active})));
                } else {
                    var subList = [];
                    var active = '';

                    $.each(this.sub, function () {
                        if (active != 'active') {
                            active = cur == this.url ? 'active' : '';
                        }
                        var subActive = cur == this.url ? ' √' : '';
                        subList.push(fillString(tplSub, $.extend(this, {active: subActive})));
                    });

                    html.push(fillString(tplWithSub, $.extend(this, {
                        subnav: subList.join(''),
                        active: active
                    })));
                }
            });

            $('#firNav').html(html.join(''));
        })
    }

    function successFn(d, conf) {
        var code = typeof d.code === 'undefined' ? d.ret : d.code;
        if (code >= 0) {
            if (typeof conf.success == 'function') {
                conf.success(d.data || d.date, code);
            } else {
                showMsg(d.msg || '操作成功');
            }
        } else if (code == CODE_OVERDUE) {
            localStorage.removeItem(AUTHORIZATION);
            window.location = 'login.html';
        } else {
            if (typeof conf.error == 'function') {
                conf.error(d.msg || '系统错误');
            } else {
                alertMsg(d.msg || '系统错误');
            }

        }
    }

    //post请求封装
    function post(conf) {
        var config = {},
            $el = conf.el,
            oldVal;
        $.extend(config, conf);

        if (typeof $el != 'undefined') {
            if ($el.data('requesting') == true) {
                return;
            }
            oldVal = $el.html();
            $el.data('requesting', true).html('<i class="fa fa-spinner fa-spin"></i>&nbsp;&nbsp;提交中...');
        }

        $.extend(config, {
            type: 'POST',
            dataType: 'json',
            beforeSend: setRequestHeader,
            success: function (d) {
                successFn(d, conf);
                (!!$el) && $el.html(oldVal).data('requesting', false);
            },
            error: function (e) {
                if (typeof conf.error == 'function') {
                    conf.error('系统错误: ' + JSON.stringify(e));
                } else {
                    alertMsg('系统错误: ' + JSON.stringify(e));
                }
                (!!$el) && $el.html(oldVal).data('requesting', false);
            }
        });
        config.el = undefined;
        // config.data && (config.data.r = Math.random());
        return $.ajax(config);
    }

    //get请求封装
    function get(conf) {
        var config = {};
        if (conf['url'].lastIndexOf('list') >= 0) {
            var args = getUrlArgObject();
            if (args['pageIndex']) {
                var data = conf['data'];
                if (!data) data = {};
                data['pageIndex'] = args['pageIndex'];
            }
        }
        $.extend(config, conf);
        $.extend(config, {
            type: 'GET',
            dataType: 'json',
            beforeSend: setRequestHeader,
            success: function (d) {
                successFn(d, conf);
            },
            error: function (e) {
                if (typeof conf.error == 'function') {
                    conf.error('系统错误: ' + JSON.stringify(e));
                } else {
                    alertMsg('系统错误: ' + JSON.stringify(e));
                }
            }
        });
        // config.data && (config.data.r = Math.random());
        return $.ajax(config);
    }

    //get json 请求封装
    function getJson(url, success) {
        var config = {};
        $.extend(config, {
            url: url,
            type: 'GET',
            dataType: 'json',
            success: success,
            error: function (e) {
                alertMsg('系统错误: ' + JSON.stringify(e));
            }
        });
        return $.ajax(config);
    }

    function postId(action, id, callback) {
        var data = {
            id: id
        };
        post({
            url: BASE_API_SERVER_PATH + action,
            data: data,
            success: function () {
                if (callback) callback();
            }
        });
    }

    function setRequestHeader(request) {
        var token = getToken();
        if (token) {
            request.setRequestHeader(AUTHORIZATION, token);
        } else {
            //window.location = 'login.html';
        }
    }

    function render(config) {
        var tpl = config.tpl,
            html = [],
            isTableList = config.isTableList,
            data = config.data,
            list = data,
            pageCount = 0,
            el;

        var dataIsArr = $.isArray(data);

        if (!dataIsArr) {
            list = data['list'];
            pageCount = data['pageCount'];
        }

        if (isTableList) {
            var h = tmpl(tpl, list);
            html.push(h);
        } else {
            $.each(list, function () {
                var h = tmpl(tpl, this);
                html.push(h);
            });
        }

        if (typeof config.renderTo == 'string') {
            el = $(config.renderTo);
        } else {
            el = config.renderTo;
        }
        if (html.length > 0) {
            el.html(html.join('') + getPagination(pageCount));
        } else {
            // emptyTips(el);
        }
        return el;
    }

    function getPagination(pageCount, pageIndex) {
        if (!pageCount || pageCount <= 0) {
            return '';
        }
        var args = getUrlArgObject();
        if (!pageIndex) {
            pageIndex = args['pageIndex'];
            if (pageIndex && typeof pageIndex == 'string') {
                pageIndex = parseInt(pageIndex);
            }
            if (!pageIndex) {
                pageIndex = 1;
            }
        }
        var path = window.location.pathname;
        var maxShowSize = 7;
        var halfShowSize = Math.floor(maxShowSize / 2);
        var leftShowSize = Math.min(pageIndex - 1, halfShowSize);
        var rightShowSize = Math.min(pageCount - pageIndex, halfShowSize);
        args['pageIndex'] = 1;
        var arr = new Array('<div class="center">', '<ul class="pagination">', '<li><a href="' + (path + getUrlArgStr(args)) + '">首页</a></li>');
        for (var i = pageIndex - leftShowSize; i < pageIndex + rightShowSize + 1; i++) {
            args['pageIndex'] = i;
            if (i == pageIndex) {
                arr[i + 3] = '<li class="active"><a href="' + (path + getUrlArgStr(args)) + '">' + i + '</a></li>';
            } else {
                arr[i + 3] = '<li><a href="' + (path + getUrlArgStr(args)) + '">' + i + '</a></li>';
            }
        }
        args['pageIndex'] = pageCount;
        arr[arr.length] = '<li><a href="' + (path + getUrlArgStr(args)) + '">尾页</a></li>';
        arr[arr.length] = '</ul></div>';
        return arr.join('');
    }

    function getUrlArgObject() {
        var args = {};
        var query = location.search.substr(1);//获取查询串
        var pairs = query.split("&");//在逗号处断开
        for (var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');//查找key=value
            if (pos == -1) {//如果没有找到就跳过
                continue;
            }
            var key = pairs[i].substring(0, pos);//提取key
            var value = pairs[i].substring(pos + 1);//提取value
            args[key] = unescape(value);//存为属性
        }
        return args;//返回对象
    }

    function getUrlArgStr(args) {
        var argsStr = '';
        if (args) {
            for (var key in args) {
                var value = args[key];
                argsStr += key + '=' + value + '&';
            }
            if (argsStr.length > 0) {
                argsStr = '?' + argsStr.substring(0, argsStr.length - 1);
            }
        }
        return argsStr;
    }

    function confirm(options) {
        if (!options.el) {
            return false;
        }
        require(['bootstrap'], function () {
            buildConfirm(options);
        });
    }

    function buildConfirm(options) {
        options.el.popover({
            title: options.title,
            content: getConfirmContent(options.content),
            html: true,
            placement: options.placement || 'right'
        }).popover('show');
        $('._confirm_ok').click(function () {
            options.onYES && options.onYES({
                unload: function () {
                    options.el.popover('hide');
                    options.el.popover('destroy')
                },
                target: $(this)
            });
        });
        $('._confirm_no').click(function () {
            options.el.popover('hide');
            options.el.popover('destroy');
        })

    }

    function getConfirmContent(content) {
        return [
            '<div>',
            content,
            '</div>',
            '<p style="border-top: 1px solid #ddd;padding-top: 10px;">',
            '<button class="_confirm_ok btn btn-sm btn-danger">确定</button>&nbsp;&nbsp;',
            '<button class="_confirm_no btn btn-sm">取消</button>',
            '</p>'
        ].join('');
    }

    function dialog(options) {
        require(['bootstrap'], function () {
            buildDialog(options);
        });
    }

    function getDialogFrameTpl() {
        return ['<div class="modal fade" id="modalFrame">',
            '<div class="modal-dialog">',
            '<div class="modal-content">',
            ' <div class="modal-header">',
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
            '<h4 class="modal-title">对话框</h4>',
            '</div>',
            '<div class="modal-body">',
            '</div>',
            '<div class="modal-footer">',
            '<button type="button" class="btn btn-default _no" data-dismiss="modal">关闭</button>',
            // '<button type="button" class="btn btn-primary _ok">{YES_LABEL}</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    }

    function buildDialog(options) {
        var tpl = getDialogFrameTpl();
        var frame = $('#modalFrame');

        if (frame.length > 0) {
            frame.remove();
        }
        frame = $(tpl).appendTo($('body'));

        frame.on('show.bs.modal', function (event) {
            var modal = $(this);
            options.title && modal.find('.modal-title').html(options.title);

            typeof options.onLoad == 'function' && options.onLoad({
                content: modal.find('.modal-body'),
                dialog: {
                    hide: function () {
                        modal.modal('hide');
                    },
                    target: modal
                }
            });
        });
        frame.modal();
    }

    /**
     * 文件上传组件
     */
    function setupFileLoader(options) {
        if (typeof options == 'undefined') return;
        var $el = $(options.el),
            beforeSubmit = options.beforeSubmit,
            callback = options.callback,
            errorFn = options.error,
            widget = options.widget || 'fileuploader';

        getFilePolicyAndSignature({mod: options.mod}, function (policyData) {

            require(['widget/' + widget], function () {
                if (widget == 'fileuploader') {
                    $el.fileupload({
                        dataType: 'json',
                        add: function (e, data) {
                            // data.context = $('<p/>').text('Uploading...').appendTo(document.body);
                            typeof beforeSubmit === 'function' && beforeSubmit(e, data);
                            data.submit();
                        },
                        formData: {
                            policy: policyData.policy,
                            signature: policyData.signature
                        },
                        done: function (e, data) {
                            var resp = data.jqXHR.responseJSON;
                            var code = typeof resp.ret == 'undefined' ? resp.code : resp.ret;

                            if (code == 0 || code == 200) {
                                typeof callback === 'function' && callback(resp, e, data);
                            } else {
                                typeof errorFn === 'function' && errorFn(resp, e, data);
                            }
                        }
                    });
                } else {
                    $el.localResizeIMG({
                        // width: 100,
                        quality: 0.5,
                        before: beforeSubmit,
                        success: function (result) {
                            var img = new Image();
                            img.src = result.base64;

                            // @todo canvas
                            $.post(BASEPATH + 'Fileentity/canvas', {
                                // uploadfile: result.base64
                                uploadfile: result.base64.substr(22)
                            }, function (data) {
                                if (data.ret == 0) {
                                    callback(data);
                                } else {
                                    errorFn(data);
                                }
                            }, 'json');

                            // $('body').append(img);
                            // console.log(result);
                        }
                    });
                }
            });
        });
    }

    function setupRichEditorToolBar(options) {
        var tpl = ['<div class="btn-toolbar" data-role="editor-toolbar" data-target="' + options.targetElementSel + '">',
            '<div class="btn-group">',
            '<a class="btn btn-default" data-edit="fontSize 5" title="标题（大字）">标题</a>',
            '<a class="btn btn-default" data-edit="fontSize 2" title="正文">正文</a>',
            '</div>',
            '<div class="btn-group">',
            '<a class="btn btn-default" data-edit="bold" title="加粗 (Ctrl/Cmd+B)"><i class="fa fa-bold"></i></a>',
            '<a class="btn btn-default" data-edit="italic" title="斜体 (Ctrl/Cmd+I)"><i class="fa fa-italic"></i></a>',
            '<a class="btn btn-default" data-edit="strikethrough" title="Strikethrough"><i class="fa fa-strikethrough"></i></a>',
            '<a class="btn btn-default" data-edit="underline" title="下划线 (Ctrl/Cmd+U)"><i class="fa fa-underline"></i></a>',
            '</div>',
            '<div class="btn-group">',
            '<a class="btn btn-default" data-edit="insertunorderedlist" title="列表"><i class="fa fa-list-ul"></i></a>',
            '<a class="btn btn-default" data-edit="insertorderedlist" title="数字列表"><i class="fa fa-list-ol"></i></a>',
            '</div>',
            '<div class="btn-group relative">',
            '<a class="btn btn-default" title="插入图片" id="pictureBtn"><i class="fa fa-photo"></i></a>',
            '<input type="file" id="richInputFileControl" data-role="magic-overlay" data-target="#pictureBtn" data-edit="insertImage" name="file" data-url="http://v0.api.upyun.com/jiayanimg/" style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 41px; height: 30px;"/>',
            '</div>',
            '<div class="btn-group">',
            '<button type="button" class="btn btn-default" data-toggle="dropdown">',
            '颜色',
            '<span class="caret"></span>',
            '</button>',
            '<div class="dropdown-menu">',
            '<a class="color-block" href="#" data-edit="foreColor #ff0000" title="字体红色" style="background-color:#ff0000;"></a>',
            '<a class="color-block" href="#" data-edit="foreColor #000" title="字体黑色" style="background-color:#000;"></a>',
            '</div>',
            '</div>',
            '</div>'].join('');

        $(options.toolbarContainer).html(tpl);
    }


    function setupRichEditor(options) {
        var targetUniqueClass;


        targetUniqueClass = 'targetUniqueClass' + (+new Date) + Math.round((Math.random() * 100))
        options.targetElementSel = '.' + targetUniqueClass;
        $(options.target).addClass(targetUniqueClass);

        setupRichEditorToolBar(options);
        require(['widget/bootstrap-wysiwyg', 'bootstrap'], function () {
            $(options.target).wysiwyg();
        });
    }

    function getFilePolicyAndSignature(options, cb) {
        var env = window.G_ENV == 'release' ? '' : 'test';

        get({
            url: "http://admin" + env + ".jiayantech.com/my_admin/uploader/sign",
            data: {
                //daddy: 1,
                mod: options.mod || "adminupload"
            },
            success: function (data) {
                cb(data);
            },
            error: function (msg) {
                alertMsg(msg || "获取图片上传的token失败");
            }
        });
    }

    function showLoading(el) {
        el.html('<p><i class="fa fa-spin fa-spinner"></i></p>');
    }

    function bindEvent() {
        $('#logout').click(function () {
            window.location.href = "login.html";
        });
    }

    function getCur(nav) {
        var cur = 'userList';

        $.each(nav, function () {
            if (this.sub) {
                $.each(this.sub, function () {
                    if (location.href.indexOf(this.url) > -1) {
                        cur = this.url;
                        return false;
                    }
                });
            } else if (location.href.indexOf(this.url) > -1) {
                cur = this.url;
                return false;
            }
        });
        return cur;
    }

    /**
     * 格式化模板
     * @param  {string} tpl  原始模板
     * @param  {string} data 填充数据
     * @return {string}      返回字符串
     */
    function fillString(tpl, data) {
        $.each(data, function (k, val) {
            var r = new RegExp('{' + k.toUpperCase() + '}', 'g');
            tpl = tpl.replace(r, val);
        });
        return tpl;
    }

    function checkLogin(callback) {
        post({
            url: BASE_API_SERVER_PATH + 'user/quick_login',
            data: {
                configVersion: getConfigVersion()
            },
            success: function (d, code) {
                if (code == 0) {
                    setLoginConfig(d);
                }
                window.G_ORG_ID = d.orgId;
                window.G_ADMIN_NAME = d.userName;
                callback();
                initWorkspace();
            },
            error: function () {
                window.location.href = 'login.html';
            }
        })
    }

    function datetimepicker(options) {
        options = options || {};

        var el = options.el;
        if (!el) {
            alert('日历控件初始化失败');
            return false;
        }

        // require(['widget/bootstrap-datetimepicker.min','widget/bootstrap-datetimepicker.zh-CN'], function(){
        require(['widget/bootstrap-datetimepicker.min'], function () {
            require(['widget/bootstrap-datetimepicker.zh-CN'], function () {
                options.minView = options.minView || 'month';

                el.datetimepicker({
                    format: options.format || "yyyy - MM - dd",
                    fontAwesome: true,
                    language: 'zh-CN',
                    minView: options.minView,
                    autoclose: true
                }).on('changeDate', function (ev) {
                    var gapHours = 1000 * 60 * 60 * 8;
                    var dateVal = ev.date.valueOf() - gapHours;
                    // var dateVal = ev.date.valueOf();

                    if (options.minView == 'month') {
                        var d = new Date(dateVal);
                        d.setHours(0);
                        dateVal = d.setMinutes(0)
                        dateVal = d.setSeconds(0);
                    }
                    if (options.minView == 'day') {
                        var d = new Date(dateVal);
                        dateVal = d.setMinutes(0);
                        dateVal = d.setSeconds(0);
                    }
                    if (options.minView == 'hour') {
                        var d = new Date(dateVal);
                        dateVal = d.setSeconds(0);
                    }
                    ev.date.val = dateVal;
                    !!options.onChangeDate && options.onChangeDate(ev);
                });
            })
        });
    }

    function hashMng() {
        var hash = window.location.search.replace('?', '');
        var hashes = hash.split('&');
        var map = {};

        if (hashes.length > 0) {
            $.each(hashes, function (idx, val) {
                var temp = val.split('=');
                if (temp.length == 2) {
                    map[temp[0]] = temp[1];
                }
            });
        }
        return map;
    }

    /**
     * 弹出层
     * @param  {[type]} el  弹出层父元素，用于定们
     * @todo fade in out
     */
    function alert(msg, el, type) {
        // el = el || $('#msg_placeholder');
        el = el || $('body');
        var html = '<div class="alert alert-uestc">' + msg + '</div>';
        var alertEl = $(html).prependTo(el);
        setTimeout(function () {
            alertEl.remove();
        }, 1024);
    }

    function showMsg(msg, el) {
        msg = '<i class="fa fa-check-circle fa-2x"></i>&nbsp;&nbsp;' + msg;
        alert(msg, el, 'success');
    }

    function alertMsg(msg, el) {
        msg = '<i class="fa fa-times-circle fa-2x"></i>&nbsp;&nbsp;' + msg;
        alert(msg, el, 'danger');
    }

    function buildSelector(options) {

        var selectTagHead = '<select class="form-control">',
            selectTagEnd = '</select>',
            html = [selectTagHead],
            data = options.data;

        $.each(data, function () {
            html.push('<option value="' + this.id + '">' + this.name || this.id + '</option>');
        });
        html.push(selectTagEnd);
        var el = $(html.join(''));
        el.on('change', function () {
            options.onChange && options.onChange(el.val());
        });

        return el;
    }

    function buildMap(d) {
        var map = {};

        $.each(d, function () {
            map[this.id] = this.name;
        });
        return map;
    }


    window.G_formatTime = function (val) {
        var d = new Date(Math.floor(val * 1000));
        return [
                d.getFullYear(),
                d.getMonth() + 1,
                d.getDate()
            ].join('-') + ' ' + [
                d.getHours(),
                d.getMinutes()
            ].join(':');
    }

    window.G_getAge = function (birthday) {
        if (!birthday) return '';
        var age = -1;
        var today = new Date();
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();
        var birthday = new Date(birthday);

        var birthdayYear = birthday.getFullYear();
        var birthdayMonth = birthday.getMonth();
        var birthdayDay = birthday.getDate();

        if (todayMonth * 1 - birthdayMonth * 1 < 0) {
            age = (todayYear * 1 - birthdayYear * 1) - 1;
        } else {
            if (todayDay - birthdayDay >= 0) {//alert(thisDay+'-'+brithd+"_ddd");
                age = (todayYear * 1 - birthdayYear * 1);
            } else {
                age = (todayYear * 1 - birthdayYear * 1) - 1;
            }
        }

        return age * 1;
    }

    function isPhone(num) {
        var partten = /^1[3,5]\d{9}$/;
        return partten.test(num);
    }

    function initWorkspace() {
        setupAdminNav();
        bindEvent();
    }


    function getToken() {
        return getLocalStorageValue(AUTHORIZATION, '');
    }

    function setToken(token) {
        localStorage.setItem(AUTHORIZATION, token);
    }

    function getConfigVersion() {
        return getLocalStorageValue(CONFIG_VERSION, 0);
    }

    function setConfigVersion(value) {
        localStorage.setItem(CONFIG_VERSION, value);
    }

    function getProjectConfig() {
        var value = getLocalStorageValue(PROJECT_CONFIG, null);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    }

    function setProjectConfig(data) {
        if (data.version) {
            setConfigVersion(data.version);
        }
        localStorage.setItem(PROJECT_CONFIG, JSON.stringify(data));
    }

    function setLoginConfig(data) {
        if (data.token) {
            setToken(data.token);
        }
        if (data.projectConfig) {
            setProjectConfig(data.projectConfig);
        }
    }

    function getLocalStorageValue(key, def) {
        var value = localStorage.getItem(key);
        if (!value) {
            return def;
        }
        return value;
    }

    function option(el, action, query, process) {
        var params = {blurName: query};
        comm.io.get({
            url: comm.config.BASEPATH + action,
            data: params,
            success: function (d) {
                var results = $.map(d, function (item) {
                    return item.id + ":" + item.name;
                });
                process(results);
                el.data("id", "");
            }
        });
    }

    function highlighter(query, item) {
        var query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        var strSplits = item.split(':');
        return strSplits[1].replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>'
        })
    }

    function updater(el, item) {
        var strSplits = item.split(':');
        el.data("id", strSplits[0]);
        return strSplits[1];
    }


    function editStatus(status, hasEnding) {
        $('#status').show();
        $('#status').empty();
        if ("发布" == status) {
            $('#status').append('<option value="审核不通过">审核不通过</option>');
            if (hasEnding) $('#status').append('<option value="报名结束">报名结束</option>');
        } else if ("审核通过" == status) {
            $('#status').append('<option value="审核不通过">审核不通过</option>');
            $('#status').append('<option value="发布">发布</option>');
        } else if ("审核不通过" == status) {
            $('#status').append('<option value="审核通过">审核通过</option>');
        } else if ("待审核" == status) {
            $('#status').append('<option value="审核通过">审核通过</option>');
            $('#status').append('<option value="审核不通过">审核不通过</option>');
            $('#status').append('<option value="发布">发布</option>');
        } else {
            $('#status').append('<option value="审核通过">审核通过</option>');
            $('#status').append('<option value="审核不通过">审核不通过</option>');
            $('#status').append('<option value="发布">发布</option>');
        }
        $('#status').val(status);
    }

    function hideStatus() {
        $('#status').hide();
        $('#status').empty();
    }

    return {
        constant: {
            HOSPITAL_ID: 1,
            ENV: window.G_ENV
        },
        config: {
            BASE_SERVER_PATH: BASE_SERVER_PATH,
            BASEPATH: BASE_API_SERVER_PATH,
            BASE_APP_SERVER_PATH: BASE_APP_SERVER_PATH,
            BASE_IMAGE_PATH: BASE_IMAGE_SERVER_SHOW_PATH
        },
        io: {
            get: get,
            getJson: getJson,
            post: post,
            postId: postId
        },
        utils: {
            setupFileLoader: setupFileLoader,
            datetimepicker: datetimepicker
        },
        login: {
            getVersion: getConfigVersion,
            getProjects: getProjectConfig,
            set: setLoginConfig
        },
        option: option,
        typeahead: {
            highlighter: highlighter,
            updater: updater
        },
        render: render,
        dialog: dialog,
        confirm: confirm,
        showLoading: showLoading,
        checkLogin: checkLogin,
        hashMng: hashMng,
        showMsg: showMsg,
        alertMsg: alertMsg,
        buildSelector: buildSelector,
        buildMap: buildMap,
        isPhone: isPhone,
        setupWorkspace: initWorkspace,
        setupRichEditor: setupRichEditor,
        status: {
            hide: hideStatus,
            edit: editStatus
        }
    }
});
