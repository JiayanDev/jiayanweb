define(["jquery", "commJs"], function (_, comm) {
    function main() {
        comm.checkLogin(function () {});
        return comm;
    }

    return {
        main: main
    }
});