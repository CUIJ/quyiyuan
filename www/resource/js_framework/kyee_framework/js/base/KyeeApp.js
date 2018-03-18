var KyeeApp = function(){
	
	var def = {

		//导入系统级别的包
		globalPackage : [
			"ionic",
			"ngIOS9UIWebViewPatch",
			"ngSanitize",
			"pascalprecht.translate",
			"kyee.framework.config",
			"kyee.framework.service.utils",
			"kyee.framework.base.env",
			"kyee.framework.base.support.listener",
			"kyee.framework.base.support.filter",
			"kyee.framework.directive.compile",
			"kyee.framework.directive.action_holder.delegate",
			"kyee.framework.directive.action_holder",
			"kyee.framework.directive.slidebox.slidebox_image",
			"kyee.framework.directive.slidebox.slidebox_menu.service",
			"kyee.framework.directive.slidebox.slidebox_menu",
			"kyee.framework.directive.sudoku",
			"kyee.framework.directive.picker.list_picker.service",
			"kyee.framework.directive.picker.list_picker",
			"kyee.framework.directive.picker.cascade_list_picker.base.service",
			"kyee.framework.directive.picker.cascade_list_picker.base",
			"kyee.framework.directive.picker.cascade_list_picker.impl.area_picker.service",
			"kyee.framework.directive.picker.cascade_list_picker.impl.area_picker",
			"kyee.framework.directive.picker.cascade_list_picker.impl.date_picker.service",
			"kyee.framework.directive.picker.cascade_list_picker.impl.date_picker",
			"kyee.framework.directive.picker.cascade_list_picker.impl.time_picker",
			"kyee.framework.directive.picker.calendar_picker.service",
			"kyee.framework.directive.picker.calendar_picker",
			"kyee.framework.directive.calendar",
			"kyee.framework.directive.indexed_list.service",
			"kyee.framework.directive.indexed_list",
			"kyee.framework.directive.notification",
			"kyee.framework.directive.form.fields.dropdown.service",
			"kyee.framework.directive.form.fields.dropdown",
			"kyee.framework.directive.view.overlay.service",
			"kyee.framework.directive.view.overlay",
			"kyee.framework.directive.view.sideview.service",
			"kyee.framework.directive.view.sideview",
			"kyee.framework.directive.i18n.service",
			"kyee.framework.directive.i18n",
			"kyee.framework.directive.share",
			"kyee.framework.service.messager",
			"kyee.framework.service.message",
			"kyee.framework.service.view",
			"kyee.framework.service.view.effect"
		],

		appName : null,
		rounterName : null,
		homeUrl : null,
		homePartnerList : null,
		requireList : [],
		hasSplashscreenVal : true,
		i18nConfig : null,
		listenersCfg : {},

		//是否开启退出提示，默认开启
		exitConfirm : true,

		//init、run 函数的自定义参数列表
		paramList : [],

		//保存主页与同级页面的映射关系，结构如下：
		//{partner1:home1, partner2:home1, ...}
		_homePartnersMapping : null,

		//用户存储最后一次使用的语种编号的缓存键名
		_cacheKey4Lang : "KYEE_LATEST_LANG_VALUE",

		//当前用户使用的语种编号
		_currLangValue : null,

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

		homePartners : function(partners){
			this.homePartnerList = partners;
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

		params : function(params){
			this.paramList = params;
			return this;
		},

		i18n : function(config){
			this.i18nConfig = config;
			return this;
		},

		/**
		 * 全局事件监听器
		 *
		 * @param cfg
		 * @returns {def}
		 */
		listeners : function(cfg){
			this.listenersCfg = cfg;
			return this;
		},

		/**
		 * 初始化定时器
		 *
		 * @param rootScope
		 * @param state
		 * @param register
		 * @private
		 */
		_initListeners : function(rootScope, state, register, history){

			var me = this;

			rootScope.$on("$ionicView.loaded", function(a, b){

				var config = {
				};

				//执行已注册的事件监听器
				me._execListener(register, KYEE_LISTENER_WHEN_TYPES.VIEW.LOADED, b, history, config);
			});

			rootScope.$on("$ionicView.unloaded", function(a, b){

				var config = {
				};

				//执行已注册的事件监听器
				me._execListener(register, KYEE_LISTENER_WHEN_TYPES.VIEW.UNLOADED, b, history, config);
			});

			//控制主页标签的展示与隐藏
			rootScope.$on("$ionicView.beforeEnter", function(a, b){

				//获取当前路由地址
				var url = state.href(state.current.name);

				//如果是显式指定 MAIN_TAB 的页面均显示 tabs
				if(url.indexOf("MAIN_TAB") != -1){
					angular.element(document.getElementById("tabbar")).css("display", "block");
				}else{
					angular.element(document.getElementById("tabbar")).css("display", "none");
				}

				var config = {
					from : history.viewHistory().backView == null ? null : history.viewHistory().backView.stateId
				};

				//执行已注册的事件监听器
				me._execListener(register, KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER, b, history, config);
			});

			rootScope.$on("$ionicView.enter", function(a, b){

				var config = {
					from : history.viewHistory().backView == null ? null : history.viewHistory().backView.stateId
				};

				//执行已注册的事件监听器
				me._execListener(register, KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER, b, history, config);
			});

			rootScope.$on("$ionicView.afterEnter", function(a, b){

				var config = {
					from : history.viewHistory().backView == null ? null : history.viewHistory().backView.stateId
				};

				//执行已注册的事件监听器
				me._execListener(register, KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER, b, history, config);
			});

			rootScope.$on("$ionicView.leave", function(a, b){

				var config = {
					to : history.viewHistory().currentView == null ? null : history.viewHistory().currentView.stateId
				};

				//执行已注册的事件监听器
				me._execListener(register, KYEE_LISTENER_WHEN_TYPES.VIEW.LEAVE, b, history, config);
			});

			rootScope.$on("$ionicView.afterLeave", function(a, b){

				var config = {
					to : history.viewHistory().currentView == null ? null : history.viewHistory().currentView.stateId
				};

				//执行已注册的事件监听器
				me._execListener(register, KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_LEAVE, b, history, config);
			});
		},

		/**
		 * 执行指定的事件监听器
		 *
		 * @param register
		 * @param when
		 * @param b
		 * @private
		 */
		_execListener : function(register, when, b, history, config){

			//当前跳转方向
			var dir = b.direction;

			var handler = register.queryHandler(b.stateName, when);
			if(handler != null){

				//按照跳转方向过滤
				if(when == KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER || when == KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER || when == KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER){

					if(handler.direction == "back" && dir == "forward"){
						return;
					}
					if(handler.direction == "forward" && dir == "back"){
						return;
					}
					//如果没有设置，则默认方向为 forward
					if(handler.direction == undefined && dir == "back"){
						return;
					}
				}

				handler.action(config);
			}
		},

		/**
		 * 框架级别的 before backbutton 动作
		 *
		 * @param params
		 * @returns {boolean}
		 * @private
		 */
		_doFrameworkBeforeBackbuttonAction : function(params){

			//判断是否关闭右侧功能栏
			var slidemenuState = params.KyeeViewService.isSideMenuOpened();
			if(slidemenuState){
				params.KyeeViewService.toggleSideMenu({
					direction : "RIGHT",
					status : false
				});
				return false;
			}

			//判断是否显示浮动菜单
			var floatmenuState = params.KyeeMessageService.isFloatmenuShown();
			if(floatmenuState){
				params.KyeeMessageService.hideFloatmenu();
				return false;
			}

			//判断是否有正在显示的弹出框
			var popupState = params.KyeeMessageService.isPopupShown();
			if(popupState){
				params.KyeeMessageService.closePopup();
				return false;
			}

			//判断是否有正在显示的 actionsheet
			var actionsheetState = params.KyeeMessageService.isActionsheetShown();
			if(actionsheetState){
				params.KyeeMessageService.hideActionsheet();
				return false;
			}

			return true;
		},

		/**
		 * 获取主页同级页面的所属主页
		 *
		 * @returns {*}
		 */
		getHomeUrlByPartner : function(partnerUrl){

			var me = this;

			//首次初始化 _homePartnersMapping 数据
			if(me.homePartnerList != null && me._homePartnersMapping == null){

				me._homePartnersMapping = {};

				for(var i in me.homePartnerList){

					var partners = me.homePartnerList[i];
					if(partners != null){

						for(var j in partners){

							var partner = partners[j];

							//partner 必然不会重复
							me._homePartnersMapping[partner] = i;
						}
					}
				}
			}

			if(me._homePartnersMapping != null){
				return me._homePartnersMapping[partnerUrl];
			}

			return null;
		},

		/**
		 * 初始化第三方类库
		 */
		initThirdPartyLibs : function(){

			var me = this;

			//初始化 underscore
			if(window._ != undefined){
				window.KyeeKit = window._.noConflict();
			}
		},

		/**
		 * 构建启动器
		 */
		build : function(){
			
			var me = this;

			//赋值到 window 对象，以便外部可以调用
			window._KyeeApp = me;

			//初始化第三方类库
			me.initThirdPartyLibs();

			//导入系统级别的包
			for(var i in me.globalPackage){

				me.requireList.push(me.globalPackage[i]);
			}

			//config 声明体
			var configFn = ["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", "$compileProvider", "$translateProvider", this.rounterName, function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider, $translateProvider, RouterConfigProvider){

				/**
				 * 同系版本标志
				 * 此变量主要用于区分之前覆盖安装的版本是否为同系版本，如果不是，则此变量不存在，
				 * 则首次安装此版本时清空旧版遗留的所有 localStorage，以解决部分机型中出现的 1.x 升迁至 2.x 所出现的问题
				 */
				var versionFlag = "KYEE_SAME_VERSION_FLAG";
				var value = localStorage.getItem(versionFlag);
				if(value == null){

					localStorage.clear();
					localStorage.setItem(versionFlag, "true");
				}

				//仅在开发模式下开启调试辅助功能
				$compileProvider.debugInfoEnabled(AppConfig.MODE == "DEV");

				//链接白名单
				$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|sms|tel):/);

				//图片ng-src白名单（包含微信文件返回路径）
				$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content|blob|ms-appx|x-wmapp0|mailto|assets-library|wxlocalresource|weixin):|data:image\//);

				//统一指定 tab 的样式
				$ionicConfigProvider.tabs.position("bottom");
				$ionicConfigProvider.tabs.style("standard");

				//统一取消导航返回按钮的文字
				$ionicConfigProvider.backButton.text("");
				$ionicConfigProvider.backButton.previousTitleText(false);

				//统一指定导航返回按钮的图标
				$ionicConfigProvider.backButton.icon("ion-android-arrow-back");

				//android 下不启用 ionic 默认动画（兼容性以及性能问题），将会在 ion-view loaded 事件触发时启用自定义动画
				$ionicConfigProvider.views.transition("platform");

				//最大缓存的视图数（过小需要频繁的重新编译视图，过大可导致整体试图切换缓慢）
				$ionicConfigProvider.views.maxCache(10);

				//缓存前进的视图
				//此设置将会导致控制器不会二次实例化
				//$ionicConfigProvider.views.forwardCache(true);

				//禁用 ios 手势返回（会造成界面问题）
				$ionicConfigProvider.views.swipeBackEnabled(false);

				//最大的模板预取设置
				$ionicConfigProvider.templates.maxPrefetch(30);

				//配置 i18n 服务
				//不要放在 me.i18nConfig != null 内
				$translateProvider.useSanitizeValueStrategy("escaped");

				//初始化 i18n
				if(me.i18nConfig != null){

					$translateProvider.useStaticFilesLoader({
						prefix: me.i18nConfig.path.prefix,
						suffix: me.i18nConfig.path.suffix
					});

					//如果启用缓存，则优先使用缓存值
					if(me.i18nConfig.lang.cache != undefined && me.i18nConfig.lang.cache == true){
						me._currLangValue = localStorage.getItem(me._cacheKey4Lang);
					}
					if(me._currLangValue == null){
						me._currLangValue = me.i18nConfig.lang.default;
					}

					$translateProvider.preferredLanguage(me._currLangValue);
				}

				//设置路由
				var tables = RouterConfigProvider.getTables();
				for(var i in tables){

					var table = tables[i];

					for(var state in table){

						$stateProvider.state(state, table[state]);
					}
				}

				$urlRouterProvider.otherwise(me.homeUrl[0]);
			}];

			//run 声明体
			var runFn = ["$rootScope", "$ionicPlatform", "KyeeEnv", "$state", "$location", "KyeeListenerRegister", "$ionicHistory", "FilterChainInvoker", "KyeeMessageService", "KyeeActionHolderDelegate", "KyeeUtilsService", "KyeeViewService", "KyeeI18nService"];

			//插入自定义参数
			if(me.paramList != null && me.paramList.length > 0){

				for(var i in me.paramList){
					runFn.push(me.paramList[i]);
				}
			}

			runFn.push(function($rootScope, $ionicPlatform, KyeeEnv, $state, $location, KyeeListenerRegister, $ionicHistory, FilterChainInvoker, KyeeMessageService, KyeeActionHolderDelegate, KyeeUtilsService, KyeeViewService, KyeeI18nService) {

				//初始化 init, finash, menu 的函数参数列表
				var _parmaList = {
					urlParams : $location.search()
				};
				for(var i in arguments){

					//runFn[i] 为参数名称
					//runFn.length = arguments.length + 1
					//1 为 run 函数
					_parmaList[runFn[i]] = arguments[i];
				}

				//执行初始化方法
				if(me.listenersCfg.onInit != null){
					me.listenersCfg.onInit(_parmaList);
				}

				//全局监听器
				$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {

					//执行 before leave 事件
					var currState = $state.current.name;
					if(currState == fromState.name){

						var handler = KyeeListenerRegister.queryHandler(currState, KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE);
						if(handler != null){
							handler.action({
								to : toState.name,
								targetScope : event.targetScope,
								stopAction : function(){
									event.preventDefault();
								}
							});
						}
					}

					var listener = me.listenersCfg.onStateChangeStart;
					if(listener != undefined){

						listener({
							event : event,
							toState : toState,
							toParams : toParams,
							fromState : fromState,
							fromParams : fromParams,
							state : $state,
							filterChainInvoker : FilterChainInvoker,
							params : _parmaList
						});
					}
				});

				//初始化事件监听器
				me._initListeners($rootScope, $state, KyeeListenerRegister, $ionicHistory);

				//初始化页面元素控制执行器
				$rootScope.KAH = KyeeActionHolderDelegate.invokeAction;

				//发送广播
				$rootScope.call = function(cfg){
					$rootScope.$broadcast(cfg.name, cfg.params)
				}

				//侦听广播
				$rootScope.listen = function(cfg){
					$rootScope.$on(cfg.on, cfg.action);
				}

				$ionicPlatform.ready(function() {

					//该变量应该在外壳就绪后更新
					KyeeEnv.IS_IN_DEVICE = window.device != undefined;

					//初始化环境变量
					KyeeEnv.initScopeEnv($rootScope);

					if (me.hasSplashscreen && navigator.splashscreen != undefined) {
						KyeeUtilsService.delay({
							time : 1000,
							action : function(){
								navigator.splashscreen.hide();
							}
						});
					}

					if (me.listenersCfg.onFinash != undefined) {
						me.listenersCfg.onFinash(_parmaList);
					}
				});

				//绑定物理菜单事件
				if (me.listenersCfg.onMenubutton != null) {

					$ionicPlatform.on("menubutton", function(){

						me.listenersCfg.onMenubutton(_parmaList);
					});
				}

				//注册默认物理返回按钮事件
				var isBackBtnFirstPressed = false;  //记录返回按钮是否第一次被单击，用于双击退出的判断
				$ionicPlatform.registerBackButtonAction(function(e){

					//终止事件
					e.preventDefault();

					//框架级别的 before backbutton 动作
					var isContinue4DoFrameworkBeforeBackbuttonAction = me._doFrameworkBeforeBackbuttonAction(_parmaList);
					if(!isContinue4DoFrameworkBeforeBackbuttonAction){
						return;
					}

					//触发 onBeforeBackbutton 事件
					if (me.listenersCfg.onBeforeBackbutton != undefined) {
						var isContinue = me.listenersCfg.onBeforeBackbutton(_parmaList);
						if(!isContinue){
							return;
						}
					}

					//查询一次性事件，如果定义，则执行
					var onceHandler = KyeeListenerRegister.queryOnceHandler(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
					if(onceHandler != null){

						//卸载此一次性事件
						KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);

						var isContinue = true;
						onceHandler.action({
							stopAction : function(){
								isContinue = false;
							}
						});

						if(!isContinue){
							return;
						}
					}

					//当前页面路由
					var currState = $state.current.name;

					//主页面提示退出
					if(me.homeUrl.indexOf(currState) != -1){

						if(me.exitConfirm){

							if(!isBackBtnFirstPressed){

								isBackBtnFirstPressed = true;

								//2 s 内再次单击有效
								KyeeMessageService.broadcast({
									content : KyeeI18nService.get("commonText.logoutTips","再按一次退出"),
									icon : "ion-android-walk",
									duration : 2000
								});
								KyeeUtilsService.delay({
									time : 2000,
									action : function(){

										isBackBtnFirstPressed = false;
									}
								});
							}else{

								ionic.Platform.exitApp();
							}
						}else{
							//ionic.Platform.exitApp();
							navigator.pubplugin.goHome();
						}
					}else{

						//触发物理返回键监听事件
						var handler = KyeeListenerRegister.queryHandler(currState, KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
						if(handler != null){

							var isContinue = true;
							handler.action({
								stopAction : function(){
									isContinue = false;
								}
							});

							if(!isContinue){
								return;
							}
						}

						//如果是主页伙伴，则直接跳转到主页
						var targetHomeUrl = me.getHomeUrlByPartner(currState);
						if(me.homePartnerList != null && targetHomeUrl != undefined && targetHomeUrl != null){

							$state.go(targetHomeUrl);
						}else{

							//非伙伴页面返回历史
							$ionicHistory.goBack();
						}
					}
				}, 501);

				//应用 i18n 感官
				if(me.i18nConfig != null){
					KyeeI18nService.applyLookAndFeel(me._currLangValue, $rootScope);
				}
				
			});

			angular
				.module(me.appName, me.requireList)
				.config(configFn)
				.run(runFn);

			return me;
		}
	};
	
	return def;
};
