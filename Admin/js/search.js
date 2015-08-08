define(["jquery", "commJs"], function (_, comm) {

    function main() {
        comm.checkLogin(function () {
            init();
        });
    }

    function init() {
        bindEvent();
    }

    function bindEvent() {
//        $('#product_search').typeahead({
//            source: function (query, process) {
//                //var params = {query: query};
//                var params = {};
////                $.post('@Url.Action("AjaxService")', parameter, function (data) {
////                    process(data);
////                });
////                get("http://admintest.jiayantech.com/my_admin/user/list", params, function (data) {
////                    process(data);
////                });
//                comm.io.get({
//                    url: "http://admintest.jiayantech.com/my_admin/user/list",
//                    data: {},
//                    success: function (d) {
//                        //callback(d);
//                        //process(d);
//                        process(JSON.parse('["Deluxe Bicycle", "Super Deluxe Trampoline", "Super Duper Scooter"]'));
//                    }
//                });
//            }
//        });
    }

    return {
        main: main,
        comm: comm
    }
});