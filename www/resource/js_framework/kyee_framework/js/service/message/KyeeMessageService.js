/**
 * 消息服务
 */
angular
	.module("kyee.framework.service.message", [])
	.factory("KyeeMessageService", ["KyeeFrameworkConfig", "$ionicLoading", "$ionicPopup", "$ionicBackdrop", "KyeeUtilsService", "$http", "$ionicPopover", "$ionicActionSheet", "KyeeEnv", "$document", "KyeeI18nService", function(KyeeFrameworkConfig, $ionicLoading, $ionicPopup, $ionicBackdrop, KyeeUtilsService, $http, $ionicPopover, $ionicActionSheet, KyeeEnv, $document, KyeeI18nService){

		return {

			//记录 broadcast 是否已被初始化
			isInstanceBroadcast : false,

			//通知定时器
			broadcastTimer : null,

			//记录正在显示的 popup 对象，如果不存在，则为 null
			currPopup : null,

			//记录当前正在显示的 actionsheet
			currActionsheet : null,

			/**
			 * 通知
			 */
			broadcast : function(cfg){

				var me = this;

				if(!me.isInstanceBroadcast){

					//仅在第一次使用时插入 dom
					$http.get(KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/service/message/templates/broadcast.html")
						.success(function(html){

							angular.element(document.body).append(html)
							me.isInstanceBroadcast = true;

							me._showBroadcast(cfg);
						});
				}else{
					me._showBroadcast(cfg);
				}
			},

			/**
			 * 显示消息提示信息
			 * 内部方法
			 *
			 * @param cfg
			 * @private
			 */
			_showBroadcast : function(cfg){

				var me = this;

				//是否延迟显示
				if(cfg.delay != undefined){

					KyeeUtilsService.delay({
						time : cfg.delay,
						action : function(){
							me._showBroadcastAction(cfg);
						}
					});
				}else{
					me._showBroadcastAction(cfg);
				}
			},

			/**
			 * 显示消息提示信息
			 * 内部方法
			 *
			 * @param cfg
			 * @private
			 */
			_showBroadcastAction : function(cfg){

				var me = this;

				//设置图标
				angular.element(document.getElementById("kyee_framework_broadcast_icon")).attr("class", "icon " + (cfg.icon == undefined ? "ion-android-bulb" : cfg.icon));
				angular.element(document.getElementById("kyee_framework_broadcast_content")).html(cfg.content);
				//200 为 broadcast 的宽度
				angular.element(document.getElementById("kyee_framework_broadcast")).css("left", (KyeeUtilsService.getInnerSize().width / 2 - 260 / 2) + "px");
				angular.element(document.getElementById("kyee_framework_broadcast")).css("display", "block");

				//停止之前正在运行的定时器
				if(me.broadcastTimer != null){
					KyeeUtilsService.cancelDelay(me.broadcastTimer);
				}

				me.broadcastTimer = KyeeUtilsService.delay({
					time : cfg.duration == undefined ? 5000 : cfg.duration,
					action : function(){
						angular.element(document.getElementById("kyee_framework_broadcast")).css("display", "none");
						me.broadcastTimer = null;
					}
				});
			},

			/**
			 * 显示加载信息框
			 *
			 * @param cfg{
			 * 	content : 内容,
			 * 	mask : 是否显示遮罩层,
			 * 	duration : 显示事件（单位 ms）,
			 * 	delay : 延迟显示（单位 ms）
			 * }
			 */
			loading : function(cfg){

				var html = "";
				if (cfg != undefined && cfg.content != undefined && cfg.content != "") {

					html += "<div class='row' style='margin:0px;padding: 0px;'>" +
					"	 <div class='col' style='margin:0px;padding: 0px;'><ion-spinner icon='android'></ion-spinner></div>" +
					"</div>"+
					"<div class='row' style='margin:0px;'>" +
					"    <div class='col' style='margin:0px;padding: 0px;color:#cccccc;'>" + cfg.content + "</div>" +
					"</div>";
				}else{

					html = "<ion-spinner icon='android'></ion-spinner>";
				}

				$ionicLoading.show({
					template : html,
					hideOnStateChange : true,
					noBackdrop : cfg == undefined || cfg.mask == undefined ? false : !cfg.mask,
					//如果没有配置，则默认时间较长，避免出现使用在网络加载情境中提前隐藏的问题
					duration : cfg == undefined || cfg.duration == undefined ? 30000 : cfg.duration,
					delay : cfg == undefined || cfg.delay == undefined ? 0 : cfg.delay
				});
			},

			/**
			 * 隐藏加载提示
			 */
			hideLoading : function(){
				$ionicLoading.hide();
			},

			/**
			 * 显示确认对话框
			 *
			 * @param cfg{
			 * 	title : 标题,
			 * 	content : 内容,
			 * 	template : 样式布局文件路径
			 * 	cssClass : 自定义css样式类,
			 * 	onSelect : 选择后的回调函数
			 * }
			 */
			confirm : function(cfg){

				var me = this;

				//显示前动作
				me.beforePopupShownAction();

				var config = {
					title : cfg.title == undefined ?
						KyeeI18nService.get("commonText.tipMsg","提示") : cfg.title,
					cssClass: cfg.cssClass,
					buttons: [
						{
							text: cfg.cancelText == undefined ?
								KyeeI18nService.get("commonText.cancelMsg","取消") : cfg.cancelText,
							type: cfg.cancelButtonClass == undefined ? "kyee_framework_message_dialog_cancel_button" : cfg.cancelButtonClass,
							onTap : function(){
								return false;
							}
						},
						{
							text: cfg.okText == undefined ?
								KyeeI18nService.get("commonText.ensureMsg","确定") : cfg.okText,
							//自定义按钮样式
							type: cfg.okButtonClass == undefined ? "kyee_framework_message_dialog_ok_button" : cfg.okButtonClass,
							onTap: function() {
								return true;
							}
						}
					]
				};

				if(cfg.content) {
					config.template = cfg.content;
				} else if(cfg.template){
					config.templateUrl = cfg.template;
				}

				//修改按钮样式默认显示 modifyBy lwj 2016/07/23
				me.currPopup = $ionicPopup.confirm(config);

				me.currPopup.then(cfg.onSelect);

				if(cfg.tapBgToClose){
					me._registerPopupClose();
				}
			},

			/**
			 * 显示消息对话框
			 *
			 * @param cfg {
			 * 	title : 标题,
			 * 	content : 内容,
			 * 	okText : 确认按钮文本,
			 * 	onOk : 单击确认后的回调事件
			 * }
			 * @returns
			 */
			message : function(cfg){

				var me = this;

				//显示前动作
				me.beforePopupShownAction();

				me.currPopup = $ionicPopup.alert({
					title : cfg.title == undefined ?
						KyeeI18nService.get("commonText.tipMsg","提示") : cfg.title,
					template : cfg.content,
					buttons: [
						{
							text: cfg.okText == undefined ?
								KyeeI18nService.get("commonText.ensureMsg","确定") : cfg.okText,
							//自定义按钮样式
							type: cfg.okButtonClass == undefined ? "kyee_framework_message_dialog_ok_button kyee_framework_message_dialog_single_button" : cfg.okButtonClass
						}
					]
				});

				if(cfg.onOk != undefined){
					me.currPopup.then(cfg.onOk);
				}

				if(cfg.tapBgToClose){
					me._registerPopupClose();
				}

				return me.currPopup;
			},

			/**
			 * 输入对话框
			 *
			 * @param cfg
			 */
			input : function(cfg){

				var me = this;

				//显示前动作
				me.beforePopupShownAction();
				//修改按钮样式默认显示 modifyBy lwj 2016/07/23
				var config = {
					title: cfg.title == undefined ? KyeeI18nService.get("commonText.pleaseInputTips","请输入") : cfg.title,
					inputType: cfg.type == undefined ? "text" : cfg.type,
					inputPlaceholder: cfg.placeholder == undefined ? "" : cfg.placeholder,
					okText : KyeeI18nService.get("commonText.ensureMsg","确定"),
					okType : cfg.okButtonClass == undefined ? "kyee_framework_message_dialog_ok_button" : cfg.okButtonClass,
					cancelText : KyeeI18nService.get("commonText.cancelMsg","取消"),
					cancelType : cfg.cancelButtonClass == undefined ? "kyee_framework_message_dialog_cancel_button" : cfg.cancelButtonClass
				};

				if(cfg.content != undefined){
					config.template = cfg.content;
				}

				me.currPopup = $ionicPopup.prompt(config);

				me.currPopup.then(function(input) {

					//单击取消时 input 为 undefined
					if(input != undefined && cfg.onFinash != undefined){
						cfg.onFinash(input);
					}
				});

				if(cfg.tapBgToClose){
					me._registerPopupClose();
				}
			},

			/**
			 * 对话框
			 *
			 * @param cfg
			 * @returns {*}
			 */
			dialog : function(cfg){

				var me = this;

				//按钮不超过三个，否则抛出异常
				if(cfg.buttons != undefined && cfg.buttons.length > 3 && cfg.direction != "|"){
					throw new Error("按钮不能超过三个");
				}

				//显示前动作
				me.beforePopupShownAction();

				var config = {
					title : cfg.title == undefined ? "" : cfg.title,
					templateUrl : cfg.template,
					scope : cfg.scope
				};

				//按钮转换
				if(cfg.buttons != undefined && cfg.buttons.length > 0){

					var buttonList = [];
					//按钮单击事件映射表
					//使用按钮的 innerHTML 作为 key，click funciton 作为 value
					var buttonsClickActionMapping = {};

					for(var i in cfg.buttons){

						var button = cfg.buttons[i];

						//添加到事件映射表
						buttonsClickActionMapping[button.text] = button.click;

						//修改按钮样式默认显示 modifyBy lwj 2016/07/23
						buttonList.push({
							text : button.text,
							type : button.style == undefined ? "kyee_framework_message_dialog_cancel_button" : button.style,
							onTap : function(e){

								//禁止单击任何按钮都隐藏的默认行为
								e.preventDefault();

								//执行此按钮对应的 click 事件
								//注意，使用 innerHTML 而不是 innerText
								buttonsClickActionMapping[e.target.innerHTML]();
							}
						});
					}

					config.buttons = buttonList;
				}

				//根据包含的不同部分，显示不同的样式
				//由于 buttons 没有设置时默认不会显示 footer 空白位，因此可以仅使用 title 判断
				if(cfg.title == undefined){

					config.cssClass = "kyee_framework_message_dialog_only_body ";
				}else{

					config.cssClass = "kyee_framework_message_dialog_all ";
				}

				if(cfg.direction == "|"){
					config.cssClass += " kyee_framework_message_dialog_button_vertical";
				}

				if(cfg.buttons != undefined && cfg.direction != "|"){
					if(cfg.buttons.length == 1){
						config.cssClass += " kyee_framework_message_dialog_button_one";
					} else if(cfg.buttons.length == 3){
						config.cssClass += " kyee_framework_message_dialog_button_three";
					}
				}

				// scope销毁前，判断popup状态，如果为显示，则关闭
				cfg.scope.$on("$destroy", function() {
					if (!me.currPopup || !me.currPopup.close) {
						return;
					}

					me.currPopup.close();
				});

				me.currPopup = $ionicPopup.show(config);

				if(cfg.tapBgToClose){
					me._registerPopupClose();
				}

				return me.currPopup;
			},

			/**
			 * 是否有弹出窗口正在显示
			 *
			 * @returns {boolean}
			 */
			isPopupShown : function(){

				var me = this;

				return me.currPopup != null && me.currPopup.$$state.status == 0;
			},

			/**
			 * 关闭当前正在显示的弹出窗口
			 */
			closePopup : function(){

				var me = this;

				if(me.currPopup != null){

					me.currPopup.close();
					me.currPopup = null;
				}
			},

			/**
			 * Popup 显示前动作
			 */
			beforePopupShownAction : function(){

				var me = this;

				if(me.isPopupShown()){
					me.closePopup();
				}
			},

			/**
			 * 显示上下文菜单
			 *
			 * @param cfg{
			 *	title : 标题,
			 *	scope : $scope,
			 * 	menus : 菜单数据,
			 * 	onSelect : 单击项目后的回调函数
			 * }
			 */
			contextmenu : function(cfg){

				var me = this;

				var content = "<ul class='list'>";
				if (cfg.menus != undefined && cfg.menus.length > 0) {

					for(var i in cfg.menus){

						var menu = cfg.menus[i];

						if(menu.icon == undefined){
							content += "<a ng-click='onSelect(\"" + menu.value + "\")' class='item'>" + menu.text + "</a>";
						}else{
							content += "<a ng-click='onSelect(\"" + menu.value + "\")' class='item item-icon-left'><i class='icon " + menu.icon + "'></i>" + menu.text + "</a>";
						}
					}
				}

				if(cfg.cancelButton != undefined){

					if(cfg.cancelButton.icon == undefined){
						content += "<a ng-click='onSelect(\"CANCEL\")' class='item' style='background-color:#F5F5F5;'>" + cfg.cancelButton.text + "</a>";
					}else{
						content += "<a ng-click='onSelect(\"CANCEL\")' class='item item-icon-left' style='background-color:#F5F5F5;'><i class='icon " + cfg.cancelButton.icon + "'></i>" + cfg.cancelButton.text + "</a>";
					}
				}

				content += "</ul>";

				var view = $ionicPopup.show({
					title : cfg.title == undefined ?
						KyeeI18nService.get("commonText.menuText","菜单") : cfg.title,
					template : content,
					scope : cfg.scope
				});

				cfg.scope.onSelect = function(select){

					view.close();
					cfg.onSelect(select);
				}
			},

			/**
			 * 显示浮动菜单
			 *
			 * @param cfg
			 */
			floatmenu : function(cfg){

				//初始化数据以及事件到 scope 中
				cfg.scope.popoverItemsData = cfg.data;
				cfg.scope.popoverWidth = cfg.width;
				cfg.scope.popoverHeight = cfg.height;
				cfg.scope.onPopoverItemClick = function(item){

					cfg.scope.popover.hide();
					cfg.onClick(item);
				};

				$ionicPopover.fromTemplateUrl(KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/service/message/templates/floatmenu.html", {
					scope: cfg.scope
				})
					.then(function(popover) {
						cfg.scope.popover = popover;
						cfg.scope.popover.show(cfg.event);

						//指向 KyeeEnv.ROOT_SCOPE.kyee_framework_popover，以便于全局统一管理
						KyeeEnv.ROOT_SCOPE.kyee_framework_popover = popover;
					});
			},

			/**
			 * 是否浮动菜单已显示
			 *
			 * @returns {*}
			 */
			isFloatmenuShown : function(){

				var popover = KyeeEnv.ROOT_SCOPE.kyee_framework_popover;
				if(popover == undefined || popover == null){
					return false;
				}

				return popover.isShown();
			},

			/**
			 * 隐藏浮动菜单
			 */
			hideFloatmenu : function(){

				var popover = KyeeEnv.ROOT_SCOPE.kyee_framework_popover;
				if(popover != undefined && popover != null){
					popover.hide();
				}
			},

			/**
			 * 动作菜单
			 *
			 * @param cfg
			 */
			actionsheet : function(cfg){

				var me = this;

				var config = {
					buttons: cfg.buttons,
					titleText: cfg.title,
					buttonClicked: function(index){

						if(cfg.onClick != undefined){

							cfg.onClick(index);
						}

						//返回 true 隐藏 actionsheet
						return true;
					}
				};

				if(cfg.cancelButton == true){
					config.cancelText = KyeeI18nService.get("commonText.cancelMs","取消");
					config.cancel = function(){

						//单击取消按钮返回 -1
						cfg.onClick(-1);

						//更新标志
						me.currActionsheet = null;
					}
				}

				me.currActionsheet = $ionicActionSheet.show(config);

				return me.currActionsheet;
			},

			/**
			 * 判断 actionsheet 当前是否正在显示
			 *
			 * @returns {boolean}
			 */
			isActionsheetShown : function(){

				var me = this;

				return me.currActionsheet != null;
			},

			/**
			 * 隐藏 actionsheet
			 */
			hideActionsheet : function(){

				var me = this;

				if(me.currActionsheet != null){

					me.currActionsheet();
					me.currActionsheet = null;
				}
			},

			/**
			 * 注册弹出框关闭事件
			 * <br/>
			 * 内部方法
			 * @param popup
			 */
			_registerPopupClose : function() {

				var me = this;

				KyeeUtilsService.delay({
					action : function () {

						//判断当前是否有弹出框
						if (!me.currPopup || !me.currPopup.close) {
							return;
						}

						var outsideHandler = function (evt) {
							if(evt.target.nodeName === "HTML" && me.currPopup && me.currPopup.close) {
								me.currPopup.close();
							}
						}

						//注册监听事件
						$document.on("click", outsideHandler);

						//卸载监听事件
						me.currPopup.then(function() {
							$document.off("click", outsideHandler);
						});
					},
					time : 500
				});
			}

		};
	}]);