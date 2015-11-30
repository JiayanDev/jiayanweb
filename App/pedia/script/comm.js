/**
 * Created by 健兴 on 2015/11/26.
 */
define(["commJs"], function (comm) {
    const DIR = 'pedia';

    var categoryData,
        categoryMap = {};

    function init() {
        comm.setupWorkspace();
    }

    function getTree(id) {
        comm.io.get({
            url: comm.config.BASEPATH + DIR + '/tree',
            data: {},
            success: function (d) {
                categoryData = d;
                categories2Map(d);
            }
        });
    }

    function categories2Map(data, parentId) {
        for (var key in data) {
            var category = data[key];
            if (parentId) category['parentId'] = parentId;
            categoryMap[category.id] = category;
            var sub = category.sub;
            if (sub) categories2Map(sub, category.id);
        }
    }

    function bindSearchEvent() {
        $('#_btn-search').click(function () {
            var name = $('#_search').val();
            if (!name) {
                comm.utils.alertMsg('请输入关键字！');
                return false
            }
            var href = $(this).attr('href') + '?name=' + escape(name);
            window.location.href = href;
            //loadData(name);
            return false
        });
        $('body').keydown(function (e) {
            var curKey = e.which;
            if (curKey == 13) {
                $('#_btn-search').click();
                return false;
            }
        });
    }

    return {
        setup: init,
        categoryData: categoryData,
        categoryMap: categoryMap,
        bindSearchEvent: bindSearchEvent
    }
});
