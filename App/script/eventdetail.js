define(["commJs"], function(comm) {


	function init(){
		var id = getId();

		if( id ){
			loadData(id);
		}else{
			// 提示不存在
		}
		bindEvent();
	}

	function loadData (id) {
		comm.io.get({
			
			// url: comm.config.BASEPATH+"event/detail",
			url: "http://apptest.jiayantech.com/event/detail",
			data:{
				id: id,
				daddy:8
			},
			success:function(data){
				render(data);
			}
		});
	}


	function bindEvent(){
		$('#applyment').click(function(){
			applyment();
		});
	}

	function applyment () {
		comm.io.call({
			action: "applymentEvent",
			data:{
				id: getId()
			}
		});
	}

	function render (data) {
		$('#eventDetail').html(JSON.stringify(
			data
		));
	}

	function getId () {
		var hash = comm.hashMng();
		var id = hash.id;
		return id;	
	}

	function isDebug () {
		var hash = comm.hashMng();
		
		return hash.debug==1;
	}

	return {setup:init}
});