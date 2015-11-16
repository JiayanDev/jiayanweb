$(function () {

    /*-----------------------------------------------------------------------------------*/
    /*  Anchor Link
     /*-----------------------------------------------------------------------------------*/
    $('a[href*=#]:not([href=#])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
            || location.hostname == this.hostname) {

            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    /*-----------------------------------------------------------------------------------*/
    /*  Tooltips
     /*-----------------------------------------------------------------------------------*/
    $('.tooltip-side-nav').tooltip();

    if (is_weixn()){
        $('.btn').click(function () {
            alert("�������Ϸ��Ĳ˵���ѡ������������򿪣�");
            return false;
        });
    }

    function is_weixn(){
        var ua = navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
            return true;
        } else {
            return false;
        }
    }

});
