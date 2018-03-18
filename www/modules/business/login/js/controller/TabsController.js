/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：首页页签的controller
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
	.group("kyee.quyiyuan.login.tabs.controller")
	.require([
		"kyee.framework.service.view",
		"kyee.quyiyuan.login.service",
		"kyee.quyiyuan.login.controller",
		"kyee.quyiyuan.center.updateuser.service",
		"kyee.quyiyuan.service_bus.http.service",
		//"kyee.quyiyuan.myWallet.service" //程铄闵 删除冗余代码 KYEEAPPC-5641
		"kyee.quyiyuan.patients_group.message.service"
	])
	.type("controller")
	.name("TabsController")
	.params(["$rootScope","$scope", "$state", "$timeout","$ionicViewSwitcher",
		"UpdateUserService", "KyeeViewService", "LoginService",
		"CacheServiceBus", "HttpServiceBusService", "HospitalSelectorService",
		"KyeeI18nService","MultipleQueryCityService","OperationMonitor","KyeeBroadcastService"])
	.action(function($rootScope,$scope, $state, $timeout,$ionicViewSwitcher,
					 UpdateUserService, KyeeViewService, LoginService,
					 CacheServiceBus, HttpServiceBusService, HospitalSelectorService,
					 KyeeI18nService,MultipleQueryCityService,OperationMonitor,KyeeBroadcastService){

		$scope.loginState =  KyeeI18nService.get("login.noLogin", "未登录");
		$scope.homeText = KyeeI18nService.get("commonText.homeText", "就医",null);
		$scope.serviceText = KyeeI18nService.get("commonText.serviceText", "服务",null);
		$scope.recordText = KyeeI18nService.get("commonText.recordText", "病史",null);
		$scope.walletText = KyeeI18nService.get("commonText.walletText", "我的钱包",null);
		$scope.centerText = KyeeI18nService.get("commonText.centerText", "个人中心",null);
		$scope.messageText = KyeeI18nService.get("commonText.msgTitle", "消息",null);
		$rootScope.unreadImMessageCount = $rootScope.unreadImMessageCount || 0; //病友圈未读消息数更新

		LoginService.UpdateUserService = UpdateUserService;

		HttpServiceBusService.LoginService = LoginService;

		//将$scope传入LoginService中，为了在LoginService中可以直接改变视图
		LoginService.tabsControllerScope = $scope;

		//延迟1秒自动登录
		$timeout(function(){
			if(LoginService.autoLoginFlag!=1){
				LoginService.autoLoginFlag=2;
				LoginService.autoLoad();
			}
		}, 2000);

		//打开模态窗口
		$scope.openModal = function(id, template){
			KyeeViewService.openModalFromUrl({
				id : id,
				url : template,
				scope : $scope
			});
		};

		//登陆或到个人中心
		$scope.loginOrToPersonalCenter = function(){
			//从cache取出用户信息判断是否登陆，如果未登陆跳转到登陆页面，否则跳转到个人信息页面
			var cache = CacheServiceBus.getMemoryCache();
			var isLogin = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN);
			if(!isLogin){
				$state.go("login");
			}else{
				$state.go("center->MAIN_TAB");
			}
			//设置从首页面跳转到登陆页
			LoginService.frontPage = "-1";
		};

		/**
		 * 打开服务页
		 * 任务号:KYEEAPPC-4374
		 */
		$scope.gotoHospitalTab = function () {
			OperationMonitor.record('healthServeTab', 'home->MAIN_TAB');
			$ionicViewSwitcher.nextTransition('none');
			$state.go("health->MAIN_TAB");
		};
		//跳转到我的 By  张家豪  KYEEAPPC-4404
		//程铄闵 KYEEAPPC-3921
		$scope.goMyWallet = function(){

			OperationMonitor.record('centerTab', 'home->MAIN_TAB');

			if(CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN)){
				$ionicViewSwitcher.nextTransition('none');
			}

			//MyWalletService.isRefresh = true;//跳转到我的钱包标记
			$state.go('center->MAIN_TAB');
		};
		/**
		 * 打开就医记录页面
		 */
		$scope.goMedicalrecord = function () {

			OperationMonitor.record('medicalrecordTab', 'home->MAIN_TAB');

			if(CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN)){
				$ionicViewSwitcher.nextTransition('none');
			}

			$state.go('myquyi->MAIN_TAB.medicalGuide');
		};
		/**
		 * 打开首页
		 */
		$scope.gotoHome = function () {

			OperationMonitor.record('homeTab', 'home->MAIN_TAB');

			$ionicViewSwitcher.nextTransition('none');
			$state.go('home->MAIN_TAB');
		};

		/**
		 * 打开消息tab页面
		 * add by wyn
		 * 2016-07-22
		 */
		$scope.goMessageTab = function () {
			OperationMonitor.record('messageTab', 'home->MAIN_TAB');
			$ionicViewSwitcher.nextTransition('none');
			var patientsGroupIsOpen = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH);
			if(patientsGroupIsOpen) {
				$state.go("message->MAIN_TAB");
			} else {
				$state.go("messagecenter");
			}
		};
		/**
         * 脏值检测及强制刷新
         */
        function checkApply(){
            if($scope.$$phase != '$apply' && $scope.$$phase != '$digest'){
                $scope.$apply();
            }
        };
        /**
		 * 接收病友圈未读消息数并相应更新tab红点标志
		 * @author liyanhui
		 * @date 2017年02月28日13:37:40
         */
		KyeeBroadcastService.doRegister($scope,'unreadImMessage', function (value) {
			$rootScope.unreadImMessageCount = value;
			checkApply();
		});
	})
	.build();