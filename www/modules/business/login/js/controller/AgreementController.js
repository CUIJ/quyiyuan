/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：协议页面的controller
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
	.group("kyee.quyiyuan.login.agreement.controller")
	.require([
		"kyee.framework.service.view",
		"kyee.quyiyuan.login.service"
	])
	.type("controller")
	.name("AgreementController")
	.params([
		"$scope",
		"KyeeViewService",
		"KyeeListenerRegister",
		"LoginService",
		"$sce",
        "$ionicHistory"
	])
	.action(function($scope, KyeeViewService, KyeeListenerRegister, LoginService,$sce,$ionicHistory){
		// http://quyiyuan.com/terms.html  2.0.10版本之前使用的协议地址
		var url=AppConfig.SERVER_URL + "help/xyi.html";
		$scope.openUrl=$sce.trustAsResourceUrl(url)
		//回退上一个页面
		$scope.backTohome = function(){
            $ionicHistory.goBack(-1);// 	模态改路由 付添  KYEEAPPC-3658 1
		};

	})
	.build();
