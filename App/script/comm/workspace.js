/**
 * 工作车间
 */
define(["jquery", "backbone", "commJs"], function($, Backbone, comm) {
    var dataSource = {
        topic:{name:'话题'},
        act:{name:'活动'},
        help:{name:'互助'},
        contactlistThumber:{name: "我的朋友", moduleName: "contactlistThumber", url:"contactlist.html"},

        set: {name: "设置", moduleName: "set", url:"set.html"},
        msg: {name: "消息中心<span class='msgcentertip badge none'></span>", moduleName: "msg", url:"msgcenter.html"}
    };

      
    var MainRouter = Backbone.Router.extend({
        routes: {
            "mod/:mod/title/:title/type/:type": "bootStrapByType",
            "mod/:mod/title/:title/id/:id/type/:type": "bootStrapById",
            "mod/:mod/title/:title/id/:id": "bootStrapById",
            "mod/:mod/title/:title":"bootStrap",
            "mod/:mod":"bootStrap",
            "": "defaultMenu"
        },

        initialize: function() {
        
        },
        bootStrapByType:function( mod, title, type ){
            alert('yes');
            comm.bootStrap(mod, function(module){
                module.init({
                    type:type,
                    module:mod
                });
            });
            this.shouldShowBack(mod);
            comm.navigationHelper.setTitle(title);
        },

        bootStrapById:function(mod, title, id, type){
            comm.bootStrap(mod, function(module){
                var moduleName = mod;
                if( type ){
                    moduleName = mod+'_'+type;
                }
                module.init({
                    module: moduleName, 
                    id:id
                });
            });
            this.shouldShowBack(mod);
            comm.navigationHelper.setTitle(title);
        },

        bootStrap: function(mod, title, id){
            this.shouldShowBack(mod);
            this.renderSubNav(mod);
            comm.navigationHelper.setTitle(title);
            comm.bootStrap(mod);
        },

        defaultMenu: function() {
            var mod = 'topic',
                title = '话题';

            this.shouldShowBack(mod);
            comm.navigationHelper.setTitle(title);
            comm.bootStrap(mod);
        },

        renderSubNav:function(mod){
            if( dataSource[mod] && dataSource[mod].sub ){
                comm.renderSubMenu( dataSource[mod].sub );
            }else{
                comm.renderSubMenu([]);
            }
        },

        shouldShowBack:function( mod ){
            var isTop = dataSource[mod] && dataSource[mod].isTop!==false;

            //顶级菜单
            if( isTop ){
                $('#goBack').addClass('none');
            }else{
                $('#goBack').removeClass('none');
            }
        }
    });


    function setupMenu() {
        window.router = new MainRouter();
        Backbone.history.start(); 

        $('#msgcenter span').click(function(){
            if( $(this).hasClass('none') )return false;
            comm.toLocation('msg', {
                title:'消息中心'
            });
            return false;
        });

        // 绑定返回按钮事件
        $("#goBack").click(function(evt) {
            comm.navigationHelper.backToTopPage();
            return false;
        });
        $("#moreMenu").click(function(){
            var panel = $('#topicOrHelpCreatePanel');

            if( panel.data('moving') == 1 )return false;

            if( panel.hasClass('none') ){
                panel.removeClass('none');
                panel.data('moving', 1);
                $(this).find('.icon').addClass('on');

                setTimeout(function(){
                    panel.data('moving', 0)
                }, 500)
            }else{
                panel.removeClass('bounceInUp').addClass('bounceOutDown');
                panel.data('moving', 1);
                $(this).find('.icon').removeClass('on');

                setTimeout(function(){
                    panel.data('moving', 0);
                    panel.addClass('none').addClass('bounceInUp').removeClass('bounceOutDown');
                }, 500);
            }
        })

    }

    return {
        setup: setupMenu
    };
}); 