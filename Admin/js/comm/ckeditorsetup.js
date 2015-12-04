/**
 * Created by zcw_RMBP13 on 15/12/3.
 */
define(["jquery", 'lib/tmpl', 'ckeditor-core'], function ($, tmpl, CKEDITOR) {
    function setup(eleId){

        CKEDITOR.replace( eleId );
        toolbarConfig();

    }

    function toolbarConfig(){

    }

    return {
        setup:setup
    };
});