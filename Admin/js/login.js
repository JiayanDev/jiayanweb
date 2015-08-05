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
			url: '/user/login',
			data: param,
			success: function (data) {
				if (data.code = 0) {
					localStorage.setItem(comm.AUTHORIZATION, data.token);

				} else if (data.code = -36) {
					localStorage.removeItem(AUTHORIZATION);
				}
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