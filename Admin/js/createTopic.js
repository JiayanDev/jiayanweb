define([ "commJs"], function(comm) {
	var submitBtn = $('#_submit');

	function main(){
        // comm.checkLogin(function(){
            init();
        // })
    }

    function init () {
 		setupRichEditor();
		bindEvent();
		getList();
    }

    function setupRichEditor(){
    	comm.setupRichEditor({
    		targetElementId: 'description',
    		toolbarContainer:$('#richEditorToolBar')
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
    		param[key] = $('#'+key).html();
    	})
    	return param;
    }



    return {
    	main:init
    };

});