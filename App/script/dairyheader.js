define(["commJs"], function(comm) {


	function init(){
		comm.setupWorkspace();
		var id = getId();

		if( id ){
			loadData(id);
		}else{
			// 提示不存在
		}
	}

	function getId () {
		var hash = comm.hashMng();
		var id = hash.id;
		return id;	
	}

	function loadData (id) {
		comm.io.get({
			url: comm.config.BASEPATH+"diary/detail",
			data:{
				headerId: id
			},
			success:function(data){
				renderProfile(data.header);
				renderHeader(data.header);
				renderPreviousPhotoes(data.header.previousPhotoes);
				renderPost(data.content);
			}
		});
	}

	function renderProfile (data) {
		var tpl = [
                '<a href="user.html?id={USERID}"><img src="{AVATAR}"></a>',
                '<div class="text">',
                    '<p class="nickname">{USERNAME}</p>',
                    '<div class="small">',
                        '<span>{GENDER}</span>&nbsp;&nbsp;',
                        '<span>{CITY}</span>&nbsp;&nbsp;',
                    '</div>',
                '</div>'].join('');

        !!data.city || (data.city="");
        if( typeof data.gender == 'undefined'){
        	data.gender = "";
        }else{
        	data.gender = ['女', "男"][data.gender*1];
        }
        $('#profilePanel').html( comm.fillString(tpl, data) );
	}
	
	function renderHeader(data){
		var el = $('<div></div>');
		comm.render({
            tpl: 'tplForHeader',
            data: data,
            renderTo: el
        });
        $('#headerPanel').append( el.children()); 
	}

	function renderPreviousPhotoes (photoes) {
		var tpl = '<li><img src="{URI}"></li>',
			html = [];

		if( photoes ){
			$.each( photoes, function( i, photo) {
				html.push( tpl.replace('{URI}', photo) );
			});
			$('#previousPhotoes').html( html.join("") );
		}
	}

	function renderPost (data) {
		var el = $('<div></div>');
		comm.render({
            tpl: 'tplForPost',
            data: data,
            renderTo: el
        });
        $('#postList').append( el.children());
	}

	return {
		setup: init
	}
});