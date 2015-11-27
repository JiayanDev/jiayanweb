/**
 * Created by ½¡ÐË on 2015/11/26.
 */
define(["commJs"], function (comm) {
    const DIR = 'pedia';

    var categoryData,
        categoryMap = {};

    function init() {
        comm.setupWorkspace();
        getTree();
    }

    function getTree() {
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

    //window.G_getRoleText = comm.getRoleText;
    //
    //window.G_getAngelLink = function (role, userId) {
    //    return (role == 'angel' ? 'target="_blank" href=timeline.html?id=' + userId : '');
    //};

    return {
        setup: init,
        categoryData: categoryData,
        categoryMap: categoryMap
    }
});
