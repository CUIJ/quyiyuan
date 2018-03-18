var KyeeApp = function(){
	
	var def = {
		
		appName : null,
		rounterName : null,
		homeUrl : null,
		requireList : [],
		hasSplashscreenVal : true,
		onMenubuttonAction : null,
		onBackbuttonAction : null,
		onFinashAction : null,
		useCacheCfg : null,
		
		name : function(name){
			this.appName = name;
			return this;
		},
		
		rounter : function(rounter){
			this.rounterName = rounter;
			return this;
		},
		
		home : function(home){
			this.homeUrl = home;
			return this;
		},

		require : function(require){
			this.requireList = require;
			return this;
		},
		
		hasSplashscreen : function(has){
			this.hasSplashscreenVal = has;
			return this;
		},
		
		onMenubutton : function(action){
			this.onMenubuttonAction = action;
			return this;
		},
		
		onBackbutton : function(onBackbutton){
			this.onBackbuttonAction = onBackbutton;
			return this;
		},
		
		onFinash : function(onFinash){
			this.onFinashAction = onFinash;
			return this;
		},
		
		useCache : function(cfg){
			this.useCacheCfg = cfg;
			return this;
		},
		
		build : function(){
			
			var me = this;

			//导入系统级别的包
			me.requireList.push("kyee.framework.base.env");
			me.requireList.push("kyee.framework.service.utils.cache.template_cache");

			angular
				.module(me.appName, me.requireList)
				.config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", this.rounterName, function($stateProvider, $urlRouterProvider, $ionicConfigProvider, RouterConfigProvider){

					//统一指定 tab 的样式
					$ionicConfigProvider.tabs.position("bottom");
					$ionicConfigProvider.tabs.style("standard");

					//统一取消导航返回按钮的文字
					$ionicConfigProvider.backButton.text("");
					$ionicConfigProvider.backButton.previousTitleText(false);

					//统一指定导航返回按钮的图标
					$ionicConfigProvider.backButton.icon("ion-android-arrow-back");

					//统一修改过渡效果为 ios 样式（较为平滑）
					$ionicConfigProvider.views.transition("ios");

					//最大缓存的视图数（过小需要频繁的重新编译视图，过大可导致整体试图切换缓慢）
					$ionicConfigProvider.views.maxCache(6);

					//缓存前进的视图
					//此设置将会导致控制器不会二次实例化
					//$ionicConfigProvider.views.forwardCache(true);

					//最大的模板预取设置
					$ionicConfigProvider.templates.maxPrefetch(15);

					//设置路由
					var tables = RouterConfigProvider.getTables();
					for(var i in tables){

						var table = tables[i];

						for(var state in table){

							$stateProvider.state(state, table[state]);
						}
					}

					$urlRouterProvider.otherwise(me.homeUrl);
				}])
				.run(["$rootScope", "$ionicPlatform", "KyeeTemplateCacheService", "KyeeUtilsService", "KyeeEnvSetter", "$http", function($rootScope, $ionicPlatform, KyeeTemplateCacheService, KyeeUtilsService, KyeeEnvSetter, $http) {

					//初始化环境变量
					KyeeEnvSetter.set($rootScope);
					
					//控制主页标签的展示与隐藏
					$rootScope.$on('$ionicView.beforeEnter', function(){

						setTimeout(function(){
							var url = location.href;

							//如果是默认页面、主页或者显示指定 MAIN_TAB 的页面均显示 tabs
							if(url.indexOf("/home") != -1 || url.indexOf("MAIN_TAB") != -1){
								document.getElementById("tabbar").style.display = "block";
							}else{
								document.getElementById("tabbar").style.display = "none";
							}
						},300);
					});

					//发送广播
					$rootScope.call = function(cfg){
						$rootScope.$broadcast(cfg.name, cfg.params)
					}
					
					//侦听广播
					$rootScope.listen = function(cfg){
						$rootScope.$on(cfg.on, cfg.action);
					}
					
					$ionicPlatform.ready(function() {
						
						if (me.hasSplashscreen && navigator.splashscreen != undefined) {
							navigator.splashscreen.hide();
						}
						
						if (me.onFinashAction != undefined) {
							me.onFinashAction();
						}
						
						//使用 cache
						if (me.useCacheCfg != null && me.useCacheCfg.templates != undefined && me.useCacheCfg.templates.length > 0) {
							KyeeTemplateCacheService.setTemplates(me.useCacheCfg.templates).build();
						}
					});
					
					if (me.onMenubuttonAction != null) {
						
						$ionicPlatform.on("menubutton", me.onMenubuttonAction);
					}
					
					if (me.onBackbuttonAction != null) {
						
						$ionicPlatform.registerBackButtonAction(me.onBackbuttonAction, 100);
					}
				}]);
		}
	};
	
	return def;
};