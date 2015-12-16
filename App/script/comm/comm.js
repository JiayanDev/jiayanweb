/**
 * 公共函数
 * @author kenshinlin   <kenshinlin.iris@gmail.com>
 * @date    2014-6-6
 * @todo  alertMsg confirm
 */
define(['tmpl', 'jquery'], function(tmpl, $) {
    const CODE_OVERDUE = -36;
    const AUTHORIZATION = "AUTHORIZATION";

    var BASEPATH = 'http://app.jiayantech.com/';
    window.G_ENV='product';
    window.G_default_img='../asset/img/img_header_def.png';

    if(window.location.host.indexOf('apptest')>-1){
       window.G_ENV = "test";
       BASEPATH = 'http://apptest.jiayantech.com/';
    }

    var userId,
        userName,
        _private = {},
        cssLoadedCache = [];

    $(document).bind("click",function(e){ 
      var target  = $(e.target); 
      if(target.closest("#subMenuCnt").length == 0 &&
        target.closest("#toggleSubMenu").length == 0){ 
          $("#subMenuCnt").hide();
      }
    });


    (function() {
        $('body').click(function(evt) {
            var $t = $(evt.target),
                $closestToggleBtn;

            if (evt.target.id == 'goback') {
                window.history.back();
                return false;
            }
            if (!$t.hasClass('.navbar-toggle')) {
                $closestToggleBtn = $t.closest('.navbar-toggle');
                if ($closestToggleBtn.length > 0) {
                    $t = $closestToggleBtn;
                } else {
                    return;
                }
            }
            if ($t.hasClass('navbar-toggle')) {
                var target = $t.data('target');
                $(target).toggleClass('in');
            }
        });
    })();

    function clipString(str, len) {
        len = len || 6;
        str = str || '';
        if (str.length > len) {
            str = str.substring(0, len) + '...';
        }
        return str;
    }

    window.clipString = clipString;

    function successFn(d, conf) {
        if (d.ret == 0 || d.code == 0 ) {
            if (typeof conf.success == 'function') {
                conf.success(d.data)
            } else {
                showMsg(d.msg || '请求成功');
            }
        } else if (d.ret == -100 || d.code == -100) {
            top.location = 'login.html';
        } else {
            if (typeof conf.error == 'function') {
                conf.error(d.msg || '网络繁忙');
            } else {
                alertMsg(d.msg || '网络繁忙');
            }

        }
    }

    //post请求封装
    function post(conf) {
        var config = {
                data: {}
            },
            $el = conf.el,
            oldVal,
            loadingMsg = conf.loadingMsg;
        $.extend(config, conf);

        if (typeof $el != 'undefined') {
            if ($el.data('requesting') == true) {
                return;
            }
            oldVal = $el.html();
            $el.data('requesting', true).html('<i class="fa fa-spinner fa-spin"></i>'+(loadingMsg||'&nbsp;&nbsp;提交中...') );
        }

        $.extend(config, {
            type: 'POST',
            //dataType: 'json',
            beforeSend: setRequestHeader,
            success: function(d) {
                successFn(d, conf);
                (!!$el) && $el.html(oldVal).data('requesting', false);
            },
            error: function() {
                if (typeof conf.error == 'function') {
                    conf.error('网络繁忙');
                } else {
                    alertMsg('网络繁忙');
                }
                (!!$el) && $el.html(oldVal).data('requesting', false);
            }
            //contentType:'application/json'
            // beforeSend: function(jqXHR, settings) {
            //     // jqXHR.setRequestHeader('Accept', 'application/json');
            //     // jqXHR.setRequestHeader('Content-Type', 'application/json');
                
            //     // jqXHR.setRequestHeader('Accept', 'application/json; charset=utf-8');
            //     // jqXHR.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            // }
            // headers: { 
            //     'Accept': 'application/json',
            //     'Content-Type': 'application/json' 
            // }
        });
        config.el = undefined;
        config.loadingMsg = undefined;
        // config.data && (config.data.r = Math.random());
        //config.data = JSON.stringify( config.data );

        var newConf = {};

        $.each( config, function(key,value){
            if(typeof value != 'undefined')
                newConf[key] = value;
        });
        return $.ajax(newConf);
    }

    //get请求封装
    function get(conf) {
        var config = {
                data: {}
            },
            $el = conf.el,
            oldVal;

        $.extend(config, conf);

        if (typeof $el != 'undefined') {
            if ($el.data('requesting') == true) {
                return;
            }
            oldVal = $el.html();
            $el.data('requesting', true).html('<i class="fa fa-spinner fa-spin"></i>&nbsp;&nbsp;努力加载中...');
        }

        $.extend(config, {
            type: 'GET',
            dataType: 'json',
            beforeSend: setRequestHeader,
            success: function(d) {
                hideLoading();
                (!!$el) && $el.html(oldVal).data('requesting', false);
                successFn(d, conf);
            },
            error: function() {
                if (typeof conf.error == 'function') {
                    conf.error();
                }
                else {
                    hideLoading();
                    if (typeof conf.error == 'function') {
                        conf.error('网络繁忙');
                    } else {
                        alertMsg('网络繁忙');
                    }
                } 
                (!!$el) && $el.html(oldVal).data('requesting', false);
            }
        });
        config.el = undefined;
        config.param = undefined;
        // config.data && (config.data.r = Math.random());
        return $.ajax(config);
    }

    function setRequestHeader(request) {
        var token = getToken();
        if (token) {
            request.setRequestHeader(AUTHORIZATION, token);
        } else {
            //window.location = 'login.html';
        }
    }

    function getToken() {
        return localStorage.getItem(AUTHORIZATION, '');
    }

    function setToken(token) {
        localStorage.setItem(AUTHORIZATION, token);
    }

    /**
     * 弹出层
     * @param  {[type]} el  弹出层父元素，用于定们
     * @todo fade in out
     */
    function alert(msg, el, type) {
        // el = el || $('#msg_placeholder');
        el = el || $('body');
        var html = '<div class="alert alert-uestc" style="width: 100%; position: fixed; background-color: aliceblue">' + msg + '</div>';
        var alertEl = $(html).prependTo(el);
        setTimeout(function() {
            alertEl.remove();
        }, 1024);
    }

    function showMsg(msg, el) {
        msg = '<i class="fa fa-check-circle"></i>&nbsp;&nbsp;'+msg;
        alert(msg, el, 'success');
    }

    function alertMsg(msg, el) {
         msg = '<i class="fa fa-times-circle"></i>&nbsp;&nbsp;' +msg;
        alert(msg, el, 'danger');
    }

    function dialog(options) {
        var tpl = [
        // '<div class="modal" id="modal-dialog-container" style="display:block;top: {TOP}px;z-index:2999;width:92%;left:4%;-webkit-transition:transform .35s linear;transition:transform .35s linear">',
        '<div class="modal" id="modal-dialog-container" style="display:block;top: {TOP}px;z-index:2999;width:92%;left:4%;overflow:hidden;">',
            '<div class="modal-dialog">',
            '<div class="modal-content">',
            ' <div class="modal-header">',
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
            '<h4 class="modal-title">{TITLE}</h4>',
            '</div>',
            '<div class="modal-body" style="overflow:auto;">',
            '<div class="_content">{CONTENT}</div>',
            '</div>',
            '<div class="modal-footer" style="text-align:center;margin-top:0px;padding:10px 20px 10px;">',
            '<button type="button" class="btn btn-default btn-sm _no" data-dismiss="modal">{NO_LABEL}</button>',
            '<button type="button" class="btn btn-primary _ok">{YES_LABEL}</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
        var $dialogEl = null;
        var dialog;
        var mask = $('.mask');
        var height = options.height;
        
        if( !options.height ){
            height = $(window).height() - 180;
            height = Math.min(height, 400);
        }

        var transformY = 60 + 20 + height;
        
        var posTransform = {
            // 设置动画时间300ms
            "transition": "transform 300ms",
            "-moz-transition": "-moz-transform 300ms",
            "-webkit-transition": "-webkit-transform 300ms",
            "-o-transition": "-o-transform 300ms",
            "-ms-transition": "-ms-transform 300ms",
            // 设置Y方向动画
            "transform": "translateY("+ transformY + "px)",
            "-moz-transform": "translateY("+ transformY + "px)",
            "-webkit-transform": "translateY("+ transformY + "px)",
            "-o-transform": "translateY("+ transformY + "px)",
            "-ms-transform": "translateY("+ transformY + "px)"
        };

        var posTransformRevert = {
            // 设置动画时间300ms
            "transition": "transform 300ms",
            "-moz-transition": "-moz-transform 300ms",
            "-webkit-transition": "-webkit-transform 300ms",
            "-o-transition": "-o-transform 300ms",
            "-ms-transition": "-ms-transform 300ms",
            // 设置Y方向动画
            "transform": "",
            "-moz-transform": "",
            "-webkit-transform": "",
            "-o-transform": "",
            "-ms-transform": ""
        };
        // if( !isIOS() ){
            posTransform = {};
            posTransform = {};
        // }
        var top = -height-20;

        // if( !isIOS() ){
            top = ($(window).height() - height)/2;
        // }

        data = {
            // top: -height-20,
            top: top,
            content: options.content,
            title: options.title || '',
            height: height - 53 - 55,
            yes_label: options.yes || '确定',
            no_label: options.no || '关闭'
        };

        // 打开新窗口之前，先移除旧的，解决无法关闭的Bug
        oldModal = $("#modal-dialog-container");
        if (oldModal) {
            oldModal.remove();
        }

        $dialogEl = $(fillString(tpl, data)).appendTo($('body'));
        $('body').addClass('fixed-no-scroll');

        // $toggleEl.css(pos).removeClass('hidden').slideDown();
        setTimeout(function(){
            $dialogEl.css(posTransform);
        }, 100);

        mask.removeClass('none');

        dialog = {
            unload: function() {
                $dialogEl.css(posTransformRevert);
                $('body').removeClass('fixed-no-scroll');
                // 500ms后移除
                setTimeout(function(){
                    $dialogEl.remove();
                }, 500);
                mask.addClass('none');
            },
            $el: $dialogEl,
            el: $dialogEl[0]
        };

        $dialogEl.find('._no').click(function() {
            if (typeof options.onNO == 'function') {
                options.onNO({
                    target: this,
                    dialog: dialog
                });
            } else {
                dialog.unload();
            }
        });

        $dialogEl.find('._ok').click(function() {
            options.onYES({
                target: this,
                dialog: dialog
            });
        });

        $dialogEl.find('.close').click(function() {
            dialog.unload();
        });
        typeof options.onLoad == 'function' && options.onLoad(dialog);
    }


    function emptyTips(el, msg) {
        //msg = msg || '查询结果为空';
        //var tpl = ['<p style="margin:100px auto;width:70%;background-color:#DBD9D9;color:#736D6D;text-align:center;padding:15px 0;border-radius:4px;border:1px solid #ddd;">',
        //    '<i class="fa fa-smile-o" style="font-size:38px;"></i>',
        //    msg,
        //'</p>'].join('');
        //return el.html(tpl);
        return el.html('');
    }

    function loadingTips(el, msg) {
        msg = msg || '<p><i class="fa fa-spinner fa-spin"></i>正在努力加载中...</p>';
        return el.html(msg);
    }

    function renderSubMenu(subList){
        var subMenuItemTpl = '<li><a data-url="{URL}" data-title="{NAME}">{NAME}</a></li>'
        if( subList && subList.length > 0 ){
            $('#toggleSubMenu').removeClass('none');
            // 渲染二级菜单
            var html = [];

            subList.forEach(function(item){
              html.push( fillString(subMenuItemTpl, item));
            });
            $('#subMenuCnt ul').html(html.join(''));
        }else{
            $('#toggleSubMenu').addClass('none');
            $('#subMenuCnt').hide();
        }
    }
        

    function showLoading(){
        $el = $('._pageLoading');
        if($el.length>0){
            $el.removeClass('none');
        }else{
            var loadingHeight = $(window).height() - 60;
            var spinTop = loadingHeight * 0.425;
            var tpl = [
                '<div class="_pageLoading" style="position:absolute;top:0;left:0;width:100%;height:'+loadingHeight+'px;background-color:#fff;z-index:1;"></div>',
                '<div class="_pageLoading" style="position:absolute;top:'+spinTop+'px;left:42.5%;font-size:25px;width:15%;background-color:#545454;padding:10px 0;text-align:center;border-radius:6px;color:#DBD9D9;z-index:2">',
                    '<span class="fa fa-spinner fa-spin"></span>',
                '</div>'
            ].join('');


            // var tpl = [
            // '<div class="_pageLoading" style="position:fixed;top:45%;left:40%;font-size:25px;width:15%;background-color:#545454;padding:10px 0;text-align:center;border-radius:6px;color:#DBD9D9;z-index:2">',
            // '<span class="fa fa-spinner fa-spin"></span>',
            // '</div>'
            // ].join('');
            $('#page').append($(tpl));
        }
    }
    function hideLoading(wait){
        if(wait===true){
            $('._pageLoading').addClass('none');
        }else{
            setTimeout(function(){
                $('._pageLoading').addClass('none');
            }, 500);
        }
    }
    /**
     * 格式化模板
     * @param  {string} tpl  原始模板
     * @param  {string} data 填充数据
     * @return {string}      返回字符串
     */
    function fillString(tpl, data) {
        $.each(data, function(k, val) {
            var r = new RegExp('{' + k.toUpperCase() + '}', 'g');
            if (val == null) {
                val = '';
            }
            tpl = tpl.replace(r, val);
        });
        return tpl;
    }

    function checkLogin(cb) {
        var url = BASEPATH + 'Userentity/users/checklogin';
        if( window.G_USER_ID ){
            cb();
            return;
        }

        get({
            url: url,
            success: function(d) {
                userId = d.user_id;
                userName = d.user_name;
                userAvatar = d.photo_file;

                window.G_USER_ID = userId;
                window.G_USER_NAME = userName;
                window.G_USER_AVATAR = userAvatar;
                cb();
            },
            error: function(response) {
                alert('用户未登录');
                window.location = "login.html";
            }
        });
    }

    function render(config) {
        var tpl = config.tpl,
            html = [],
            el,
            data = config.data;


        var dataIsArr = $.isArray(data);

        if (!dataIsArr) {
            data = [data];
        }

        if (!$.isArray(data)) data = [data];

        $.each(data, function() {
            var h = tmpl(tpl, this);
            html.push(h);
        });
        if (typeof config.renderTo == 'string') {
            el = $(config.renderTo);
        } else {
            el = config.renderTo;
        }
        if (html.length > 0) {
            el.html(html.join(''));
        } else {
            emptyTips(el);
        }
        return el;
    }

    function setupWorkspace(){
        showDownload();
    }
    function setupPage(){}

    var subListMap = {
        'topic':[{
            "name":"我创建的",
            "url" :"topic_me_create"
          },{
            "name":"所有话题",
            "url" :"topic_all"
        }],
        'zhuli':[{
            "name":"我创建的",
            "url" :"zhuli_me_create"
          },{
            "name":"所有互助",
            "url" :"zhuli_all"
        }],
        'act':[{
            "name": "我创建的",
            "url": "act_me_create"
          },{
            "name": "所有活动",
            "url": "act_all"
        }]
    }
    $('#fixedBottomNav ._plus').off('click').on('click', function(evt){
        // $("#menu").trigger("open");
        bootStrap( "roundnav", function(m){
            m.init('roundnav');
        })
    });
    $('#fixedBottomNav ._item').off('click').on('click', function(evt){

        var $t = $(this),
            mod = $t.data('module'),
            title = $t.data('modulename');
            
        toLocation( mod, {
            title:title 
        });
        return false;
    });

    function setupSubNav( $cnt, callback) {
        $cnt.click(function(evt) {
            var $t = $(evt.target),
                items,
                curItem = $t.closest('._navItem'),
                target,
                targetCnt;

            if (curItem.length > 0) {
                target = curItem.data('target');
                items = $cnt.find('._navItem');
                items.removeClass('cur');
                curItem.addClass('cur');
                targetCnt = curItem.data('targetcnt');
                $(targetCnt).find('._navTarget').addClass('none');
                $(target).removeClass('none');

                typeof callback ==='function' && callback({
                    targetItem: curItem
                })
                // 发送通知，以便于裁剪图片
                curItem.trigger("cardTypeChanged", [$(target)]);
            }
        });
    }

    function toggleList(options) {
        var tpl, position, data, $toggleEl;

        function callback(d, $ele) {

            // $(fillList(d)).appendTo($ele.find('.list-group').html()).css(posTransform).css({
            //     'z-index':3000
            // });
            // $(fillList(d)).appendTo($ele.find('.list-group').html());
            $ele.find('.list-group').html(fillList(d))
            $ele.click(function(evt) {
                if($(evt.target).closest('._item').length>0){
                    options.callback({
                        target: $(evt.target).closest('._item'),
                        evt: evt,
                        unload: function() {
                            $ele.css(posTransformRevert);
                            $('body').removeClass('fixed-no-scroll');
                            setTimeout(function(){
                                $ele.remove();
                            }, 1000);
                        }
                    });
                    return false;
                }
            });
        }

        tpl = [
        // '<div class="modal" id="modal-container" style="display:block;top: {TOP}px;z-index:2999;width:92%;left:4%;overflow:auto;-webkit-transition:transform .35s linear;transition:transform .35s linear">',
        '<div class="modal" id="modal-container" style="display:block;top: {TOP}px;z-index:2999;width:92%;left:4%;overflow:auto;">',
            '<div class="modal-dialog">',
                '<div class="modal-content">',
                    '<div class="modal-header" style="background-color:#eee;">',
                        '<button type="button" class="close" id="closestToggleBtn"><span aria-hidden="true">&times;</span></button>',
                        '<h4 class="modal-title">{OPTTITLE}</h4>',
                    '</div>',
                    '<div class="modal-body" style="height:{HEIGHT}px;overflow:auto;">',
                        '<div class="list-group" style="margin-bottom:0px;">',
                            '{CONTENT}',
                        '</div>',
                    '</div>',
                '</div > ',
            '</div>'
        ].join('');

        options.list = options.list || [];
        
        var height = options.height;
        
        if( !options.height ){
            height = $(window).height() - 220;
            height = Math.min(height, 400);
        }

        var transformY = 60 + 20 + height;
        
        var posTransform = {
            // 设置动画时间300ms
            "transition": "transform 300ms",
            "-moz-transition": "-moz-transform 300ms",
            "-webkit-transition": "-webkit-transform 300ms",
            "-o-transition": "-o-transform 300ms",
            "-ms-transition": "-ms-transform 300ms",
            // 设置Y方向动画
            "transform": "translateY("+ transformY + "px)",
            "-moz-transform": "translateY("+ transformY + "px)",
            "-webkit-transform": "translateY("+ transformY + "px)",
            "-o-transform": "translateY("+ transformY + "px)",
            "-ms-transform": "translateY("+ transformY + "px)"
        };

        var posTransformRevert = {
            // 设置动画时间300ms
            "transition": "transform 300ms",
            "-moz-transition": "-moz-transform 300ms",
            "-webkit-transition": "-webkit-transform 300ms",
            "-o-transition": "-o-transform 300ms",
            "-ms-transition": "-ms-transform 300ms",
            // 设置Y方向动画
            "transform": "",
            "-moz-transform": "",
            "-webkit-transform": "",
            "-o-transform": "",
            "-ms-transform": ""
        };
        // if( !isIOS() ){
            posTransform = {};
            posTransform = {};
        // }
        var top = -height-20;

        // if( !isIOS() ){
            top = ($(window).height() - height)/2;
        // }


        data = {
            top: top,
            content: fillList(options.list),
            opttitle: options.title || '',
            height: height - 53
        };

        // 打开新窗口之前，先移除旧的，解决无法关闭的Bug
        oldModal = $("#modal-container");
        if (oldModal) {
            oldModal.remove();
        }

        $toggleEl = $(fillString(tpl, data)).appendTo($('body'));
        $('body').addClass('fixed-no-scroll');


        // $toggleEl.css(pos).removeClass('hidden').slideDown();
        setTimeout(function(){
            $toggleEl.css(posTransform);
        }, 100);

        $('#closestToggleBtn').click(function(){
            $toggleEl.css(posTransformRevert);
            //$toggleEl.slideUp();
            $('body').removeClass('fixed-no-scroll');
            
            // 500ms后移除
            setTimeout(function(){
                $toggleEl.remove();
            }, 500);
        });

        if (typeof options.onLoad == 'function') {
            $toggleEl.find('.list-group').html('<div class="loading"><i class="icon-spinner icon-spin"></i><span class="text-info" style="font-size:12px;">正在加载...</span></div>')
            options.onLoad(function(d) {
                callback(d, $toggleEl);
            });
        } else {
            callback(options.list, $toggleEl);
        }
        return $toggleEl;
    }

    function fillList(list) {
        var content = [];

        $.each(list, function() {
            var title = this.card_name || this.category_name || this.message;

            if( this.card_name ){
                this.subtitle = [this.company, this.title].join(' ');
            }
            
            this.title = title;
            this.hightlight = this.status == 0 ? 'hightlight' : ''

            if( !!this.subtitle ){
               content.push(
                    fillString(['<a href="#" data-id="{ID}" data-title="{TITLE}" data-eventId="{EVENT_ID}" data-evtType="{EVENT_TYPE}" class="{HIGHTLIGHT} list-group-item _item">',
                            '<h6 class="list-group-item-heading" data-id="{ID}" data-title="{TITLE}" data-eventId="{EVENT_ID}" data-evtType="{EVENT_TYPE}">{TITLE}<small style="margin-left:10px;">{SUBTITLE}</small></h6>',
                        '</a>'
                    ].join(''), this)
                ); 
            }else{
                content.push(
                    fillString('<a href="#" data-id="{ID}" data-title="{TITLE}" data-eventId="{EVENT_ID}" data-evtType="{EVENT_TYPE}" class="{HIGHTLIGHT} list-group-item _item">{TITLE}</a>', this)
                ); 
            }
        });
        if (content.length < 1) {
            content.push('没有数据');
        }
        return content.join('');
    }

    function showDownload(){
        if (isWebKit()){
            return;
        }
        var content = ['<div id="_download-panel" class="bottom-info">',
            '<img class="left-img" src="../asset/img/icon_logo.png"/>',
            '<div class="mid-content">',
                '<p class="line-1x mid-content-title">佳妍APP</p>',
                '<span class="mid-content-text">抢优惠券更实惠</span>',
                '<a target="_blank" href="http://apptest.jiayantech.com/appsite/index.html" class="btn btn-gray absolute right-download">下载APP</a>',
                '<a href="#" id="_btn-close" class="absolute right-img"><img class="icon2x" src="../asset/img/icon_close.png"/></a>',
            '</div>',
            '</div>'].join('');
        $("body>.page").append(content);
        $("#_btn-close").on('click', function(evt) {
            $("#_download-panel").addClass("none");
            return false;
        });
        //$('#_download-panel .left-img').click(function () {
        //    $("#_download-panel").addClass("none");
        //    return false;
        //});
    }

    function hashMng() {
        var hash = window.location.search.replace('?', '');
        var hashes = hash.split('&');
        var map = {};

        if (hashes.length > 0) {
            $.each(hashes, function(idx, val) {
                var temp = val.split('=');
                if (temp.length == 2) {
                    map[temp[0]] = temp[1];
                    //map[temp[0]] = unescape(temp[1]);
                }
            });
        }
        return map;
    }

    function isMobil() {
        var isMob = false;
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            //alert(navigator.userAgent);  
            isMob = true;
        } else if (/(Android)/i.test(navigator.userAgent)) {
            //alert(navigator.userAgent); 
            isMob = true;
        }
        return isMob;
    }

    function isWebKit () {
        if (/jiayan/i.test(navigator.userAgent)) {
            return true;
        }else{
            return false;
        }
    }
    var _navigationHelper = {
        // 返回按钮标题中的"< "
        _lessThan: '&lt;&nbsp;',
        //_lessThan: '&lt; ',

        titleEl: null,
        // 用于存放导航信息的栈
        //navigationStack: [],

        /// 设置顶级导航菜单，这一级菜单无返回按钮，每次点击主菜单中的项时，会执行此函数
        /// 
        setTopNavigation: function (title, moduleName) {
            // 清空其它页面产生的导航历史记录
            //this.navigationStack = [];
            top.navigationStack = [];
        },

        setTitle: function( title){
            if( !!this.titleEl ){
                this.titleEl.html( title );
            }else{
                this.titleEl = $('#navigationTitle').html(title);
            }
        },

        /// 导航到子菜单时调用，设置新的页面标题，并设置返回按钮标题为上一页面的标题
        /// @param
        /// title 新的页面标题
        ///
        didForwardToSubPage: function (options, callback) {            
            
        },

        /// 点击返回按钮时调用，根据导航历史设置为上一次的导航信息
        backToTopPage: function () {
            // 后退一步
            window.history.back();
        }
    };

    function isPhoneGapApp() {
        if (document.location.protocol == 'file:') 
        { 
            return true; 
        }

        return false;
    }   

    function isIOS() {
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            return true;
        }

        return false;
    }

    /// 由于已经改为单页面，都需要显示android返回按钮
    function _showBackButton() {
        // if (isPhoneGapApp() || _isIOS())
        // {
        //     return true;
        // }

        // return false;
        return true;
    } 

    function logout(cb) {
        post({
            url: BASEPATH + 'Userentity/users/',
            data: JSON.stringify({
                act: 'logout',
                entity_data: {}
            }),
            success: function() {
                cb();
            },
            error: function() {}
        });
    } 


    function adjustImg($el){
        // 对于隐藏的裁剪会有问题，在显示时才调整
        if ($el.hasClass("none")) {
            return;
        }

        $el.find('img').load(function(){
            $(this).adjust();
            $(this).parent().fadeIn("fast");
        })
    }

    function adjustImgAfterLoad($el){
        // 对于隐藏的裁剪会有问题，暂时不改
        if ($el.hasClass("none")) {
            return;
        }

        $el.find('img').each(function(){
            $(this).adjust();
            $(this).parent().fadeIn("fast");
        })
    }

    function checkUpdate (showInfo) { 
        if (isPhoneGapApp() && isIOS() == false) {
                // 确认更新时执行的函数
                var url;
                function confirm(buttonIndex) {
                    if (buttonIndex == 1) {
                        // 使用window.open不起作用
                        navigator.app.loadUrl(encodeURI(url), { openExternal:true}); 
                    }
                }

                function alertCallback() {
                    // 暂时不做处理
                }

                var config = {
                url: 'http://uestcaa.net/uestc/android/update.js',
                type: 'GET',
                dataType: 'json',
                data: {r: Math.random()},
                success: function(d) {
                    if (d.version > _appVersion){
                        url = d.url;
                        navigator.notification.confirm(d.updateInfo, // 显示信息
                            confirm, // 按下按钮后触发的回调函数，返回按下按钮的索引
                            '更新程序', // 标题
                            '确定,取消' // 按钮标签
                        );
                    }
                    else if(showInfo) {
                        navigator.notification.alert(
                            '当前已经是最新版本',
                            alertCallback,
                            '检查更新');
                    }
                },
                error: function() {
                    navigator.notification.alert(
                        '检查自动更新失败',
                        alertCallback,
                        '检查更新');
                }
            };

            $.ajax(config);
        }
    }

    function bootStrap( module, callback ){
        // $('body').removeClass('fixed-no-scroll');
        // showBottomNav();
        // $("#rtEdit").addClass('none'); //默认隐藏
        // $("#searchTipBtn").addClass('none'); //默认隐藏
        require([module],
          function( mod ) {
            if( callback ){
                callback( mod );
            }else{
                mod.init(module);
            }
            console.log(module+' bootStrap');
          }
        );
    }

    function toLocation(mod, options ){
        var pstr = [];
        options = options ||{};

        $.each(['title', 'id', 'type'], function(idx, key){
            if( typeof options[key] !=='undefined' ){
                pstr.push(key);
                pstr.push(options[key]);
            }
        });
        if(pstr.length>0){
            pstr = pstr.join('/');
            pstr = '/'+pstr;
        }
        window.location.href = 'app.html#mod/'+mod+pstr;
    }

    function initPage(module){
        $('.module').addClass('none');
        $('#module_'+module).removeClass('none');
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
            widget = options.widget||'fileuploader';

        require(['widget/'+widget], function(){
            if( widget == 'fileuploader'){
                $el.fileupload({
                    dataType: 'json',
                    add: function(e, data) {
                        // data.context = $('<p/>').text('Uploading...').appendTo(document.body);
                        typeof beforeSubmit === 'function' && beforeSubmit(e, data);
                        data.submit();
                    },
                    formData: options.formData,
                    done: function(e, data) {
                        var resp = data.jqXHR.responseJSON;
                        var code = typeof resp.ret == 'undefined'? resp.code: resp.ret;

                        if (code == 0) {
                            typeof callback === 'function' && callback(resp, e, data);
                        } else {
                            typeof errorFn === 'function' && errorFn(resp, e, data);
                        }
                    }
                });
            }else{
                $el.localResizeIMG({
                     // width: 100,
                     quality: 0.5,
                     before: beforeSubmit,
                     success: function (result) {
                        var img = new Image();
                        img.src = result.base64;

                        // @todo canvas
                        $.post( BASEPATH + 'resource/upload', {
                            // uploadfile: result.base64
                            file: result.base64.substr(22)
                        }, function(data){
                            if(data.ret == 0 ){
                                callback(data);
                            }else{
                                errorFn( data );
                            }
                        }, 'json');

                     // $('body').append(img);
                     // console.log(result);
                     }
                }); 
            }
        });
    }

    function loadCss(urls) {
        if( !$.isArray(urls) ){
            urls = [urls];
        }
        $.each( urls, function( i, url ){
            if( !cssHasLoaded(url) ){
                cssLoadedCache.push( url );
                var link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = url;
                document.getElementsByTagName("head")[0].appendChild(link);
            }
        });
    }

    function cssHasLoaded(url){
        return $.inArray( url, cssLoadedCache ) > -1;
    }

    function showBottomNav(){
        $('#fixedBottomNav').removeClass('none');
    }
    function hideBottomNav(){
        $('#fixedBottomNav').addClass('none');
    }
    function swipeDel( el, callback ){
        var $el = $(el);
        require(['widget/swipeout'], function( SwipeOut ){
            var swipeEl = $el[0];
            new SwipeOut(swipeEl);
            $el.on("delete", function(evt) {
              var id = $(evt.target).data('id');
              typeof callback == 'function'&& callback(id, {
                target:evt.target,
                evt:evt
              });
            });
        });
    }

    function hideButtomNav(){
        $('.footer').addClass('none');
    }

    window.G_formatTime = function (val) {
        var d = new Date(Math.floor(val * 1000));
        return [
                // d.getFullYear(),
                getNumStr(d.getMonth() + 1),
                getNumStr(d.getDate())
            ].join('-') + ' ' + [
                getNumStr(d.getHours()),
                getNumStr(d.getMinutes())
            ].join(':');
    }

    window.G_formatDate = function (val) {
        var d = new Date(Math.floor(val * 1000));
        return [
            // d.getFullYear(),
            getNumStr(d.getMonth() + 1),
            getNumStr(d.getDate())
        ].join('-');
    }

    window.G_getAge = function (birthday) {
        if (!birthday) return '';
        var age = -1;
        var today = new Date();
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();

        var birthday = new Date(birthday * 1000);
        var birthdayYear = birthday.getFullYear();
        var birthdayMonth = birthday.getMonth();
        var birthdayDay = birthday.getDate();

        if (todayMonth - birthdayMonth < 0) {
            age = (todayYear - birthdayYear) - 1;
        } else if (todayMonth - birthdayMonth == 0 && todayDay - birthdayDay < 0) {
            age = (todayYear - birthdayYear) - 1;
        } else {
            age = (todayYear - birthdayYear);
        }

        return age * 1 + '岁';
    }

    function getNumStr(val) {
        if (val < 10) return '0' + val;
        return val;
    }

    // call native
    function callNativeFun(options) 
    {
        if(!isWebKit()){
            return;
        }
        var url = "jiayan://js_call_native?";
        var iframe = document.createElement("IFRAME");
        var param = {};

        // @todo，做必要的检查
        
        param.action = options.action;
        if( options.success ){
            param.success = 'G_'+options.success;
        }
        if( options.error ){
            param.error = 'G_'+options.error;
        }

        if( options.data ){
            param.data = options.data;
        }

        url = url + 'options=' + encodeURIComponent(JSON.stringify(param));

        iframe.setAttribute("src", url);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;

        //if (options['action']=='getShareInfo') window.alert(JSON.stringify(options));
    }

    function hideNativeLoading () {
        // setTimeout(function  () {
        //     callNativeFun({
        //         action:"hideLoading"
        //     });
        // }, 100);
        callNativeFun({
            action:"hideLoading"
        });
    }

    function getRoleText(role){
        //role = 'official';
        var roleText = '';

        if (role == 'angel') roleText = '<span class="icon icon-role" style="background-image: url(../../asset/img/icon_role_angel.png);"/>';
        else if (role == 'company') roleText = '<span class="icon icon-role" style="background-image: url(../../asset/img/icon_role_company.png);"/>';
        else if (role == 'official') roleText = '<span class="icon icon-role" style="background-image: url(../../asset/img/icon_role_official.png);"/>';
        else roleText = '<span class="icon icon-role"/>';
        return roleText;
    }

    function isInsideWeixin(){
        var ua = navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
            return true;
        } else {
            return false;
        }
    }



    function setWeixinShareMeta(title,image,content){
        if(isWebKit()){
            return;
        }

        document.title=title;




        //$.getScript( "http://res.wx.qq.com/open/js/jweixin-1.0.0.js" )
        //    .done(function( script, textStatus ) {
        //        alert("wx is : "+wx);
        //        console.log( textStatus );
        //    })
        //    .fail(function( jqxhr, settings, exception ) {
        //        $( "div.log" ).text( "Triggered ajaxError handler." );
        //    });
        //





        //require(
        //    [
        //        "http://res.wx.qq.com/open/js/jweixin-1.0.0.js"
        //    ],
        //    function( wx) {
        //
        //        //wx.config({
        //        //    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        //        //    appId: 'wx6ee6843aefff5345', // 必填，公众号的唯一标识
        //        //    timestamp: , // 必填，生成签名的时间戳
        //        //    nonceStr: '', // 必填，生成签名的随机串
        //        //    signature: '',// 必填，签名，见附录1
        //        //    jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        //        //});
        //
        //
        //        wx.ready(function(){
        //
        //            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        //        });
        //
        //
        //        wx.onMenuShareTimeline({
        //            title: title,
        //            link: location.href,
        //            imgUrl: image,
        //            success: function () {
        //                // 用户确认分享后执行的回调函数
        //            },
        //            cancel: function () {
        //                // 用户取消分享后执行的回调函数
        //            }
        //        });
        //
        //
        //
        //
        //        wx.onMenuShareAppMessage({
        //            title: title,
        //            link: location.href,
        //            imgUrl: image,
        //            desc: content,
        //            type: 'link',
        //            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        //            success: function () {
        //                // 用户确认分享后执行的回调函数
        //            },
        //            cancel: function () {
        //                // 用户取消分享后执行的回调函数
        //            }
        //        });
        //
        //
        //
        //
        //        wx.onMenuShareQQ({
        //            title: title,
        //            link: location.href,
        //            imgUrl: image,
        //            desc: content,
        //            success: function () {
        //                // 用户确认分享后执行的回调函数
        //            },
        //            cancel: function () {
        //                // 用户取消分享后执行的回调函数
        //            }
        //        });
        //
        //
        //        wx.onMenuShareQZone({
        //            title: title,
        //            link: location.href,
        //            imgUrl: image,
        //            desc: content,
        //            success: function () {
        //                // 用户确认分享后执行的回调函数
        //            },
        //            cancel: function () {
        //                // 用户取消分享后执行的回调函数
        //            }
        //        });
        //
        //    }
        //);
    }



    function preloadNextPageWithUrl(url){
        $("<iframe>").attr("src",url).css({
            width:"1px",
            height:"1px",
            opacity:"0.001",
            position:"absolute",
            top:"0px",left:"0px",
            border:"0"

        }).appendTo($("body"));
    }

    return {
        io: {
            post: post,
            get: get,
            call: callNativeFun
        },
        hideButtomNav:hideButtomNav,
        render: render,
        utils: {
            alertMsg: alertMsg,
            showMsg: showMsg,
            dialog: dialog,
            emptyTips: emptyTips,
            loadingTips: loadingTips,
            tmpl: _private.tmpl,
            setupSubNav: setupSubNav,
            toggleList:toggleList,
            setupFileLoader: setupFileLoader,
            adjustImg:adjustImg,
            adjustImgAfterLoad:adjustImgAfterLoad,
            showLoading:showLoading,
            hideLoading:hideLoading,
            setupPage: setupPage,
            hideNativeLoading:hideNativeLoading
        },
        fillString: fillString,
        config: {
            BASEPATH: BASEPATH,
            userId: userId,
            userName: userName,
            PAGE_SIZE: 4
        },
        getUserId: function() {
            return userId;
        },
        getUserName: function() {
            return userName;
        },
        getUserAvatar: function(){
            return userAvatar;
        },
        renderSubMenu: renderSubMenu,
        checkLogin: checkLogin,
        setupWorkspace: setupWorkspace,
        hashMng: hashMng,
        navigationHelper: _navigationHelper,
        isPhoneGapApp: isPhoneGapApp,
        logout: logout,
        checkUpdate: checkUpdate,
        bootStrap: bootStrap,
        initPage: initPage,
        isIOS: isIOS,
        loadCss: loadCss,
        showBottomNav: showBottomNav,
        hideBottomNav: hideBottomNav,
        toLocation: toLocation,
        swipeDel:swipeDel,
        setToken:setToken,
        isWebKit:isWebKit,
        getRoleText:getRoleText,
        setWeixinShareMeta:setWeixinShareMeta,
        isInsideWeixin:isInsideWeixin,
        preloadNextPageWithUrl:preloadNextPageWithUrl


    };
});