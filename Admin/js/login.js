define([ "commJs"], function(comm) {

	function main(){
		bindEvent();
	}

	function bindEvent(){
		$('#loginBtn').click(function(){
			$('#loginMsg').html('');
			login();
		});
	}

	function getLoginParam(){
		return {
			userName: $('#name').val(),
			psw: md5($('#password').val())
		};
	}

	function login(){
		var param = getLoginParam();
		comm.io.post({
			url: '/api/login',
			data:param,
			success:function(){
				window.location.href = "agentList.html";
			},
			error:function(msg){
				$('#loginMsg').html(msg||'登录失败');
			},
			el: $('#loginBtn')
		});
	}
	
	return {
		main:main
	}
})