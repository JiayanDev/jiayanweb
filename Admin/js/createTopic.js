define([ "commJs", 'widget/bootstrap-wysiwyg'], function(comm) {
	var submitBtn = $('#_submit');

	function main(){
        // comm.checkLogin(function(){
            init();
        // })
    }

    function init () {
    	getFilePolicyAndSignature();
		bindEvent();
		getList();
    }

    function setupRichEditor(){
        $('#description').wysiwyg();
    }

    function getFilePolicyAndSignature () {
    	comm.io.get({
    		url: "http://apptest.jiayantech.com/uploader/sign",
    		data:{
    			mod: "topic",
    			daddy:1
    		},
    		success:function  (data) {
    			$('#richInputFileControl').data('policy', data.policy);
    			$('#richInputFileControl').data('signature', data.signature);
    			setupRichEditor();
    		}
    	});
    }

    function getList () {
    	
    }

    function bindEvent(){
    	submitBtn.click(function(){
            var param = getParam();

            if( param ){
                doSubmit( param );
            }
        });
    }

    function doSubmit(data){
    	comm.io.post({
    		url: '',
    		data: data,
    		success:function() {
    			getList();
    		}
    	})
    }

    function getParam(){
    	var param = {};
    	$.each(['description'], function(i,key) {
    		param[key] = $('#'+key).val();
    	})
    	return param;
    }



    return {
    	main:init
    };

});