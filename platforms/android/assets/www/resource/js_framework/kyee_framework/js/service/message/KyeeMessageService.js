/**
 * 消息服务
 */
angular
	.module("kyee.framework.service.message", ["ionic"])
	.factory("KyeeMessageService", ["$ionicLoading", "$ionicPopup", "$ionicBackdrop", function($ionicLoading, $ionicPopup, $ionicBackdrop){
		
		return {

			/**
			 * 通知
			 */
			broadcast : function(cfg){
				
				$ionicLoading.show({
					template : cfg.content,
					noBackdrop : true,
					duration : cfg.duration == undefined ? 3000 : cfg.duration
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
				if (cfg != undefined && cfg.content != undefined) {
					
					html += "<div class='row' style='margin:0px;padding: 0px;'>" +
							"	 <div class='col' style='margin:0px;padding: 0px;padding-top: 5px;height:50px;'><ion-spinner icon='android'></ion-spinner></div>" +
							"</div>"+
							"<div class='row' style='margin:0px;padding: 5px;>" +
							"    <div class='col' style='margin:0px;padding: 0px;'><span style='color:#D8D8D8;'>" + cfg.content + "</span></div>" +
							"</div>";
				}else{
					
					html = "<ion-spinner icon='android'></ion-spinner>";
				}
				
				$ionicLoading.show({
					template : html,
					noBackdrop : cfg == undefined || cfg.mask == undefined ? false : !cfg.mask,
					//如果没有配置，则默认时间较长，避免出现使用在网络加载情境中提前隐藏的问题
					duration : cfg == undefined || cfg.duration == undefined ? 30000 : cfg.duration,
					delay : cfg == undefined || cfg.delay == undefined ? 0 : cfg.delay
				});
			},
			
			hideLoading : function(){
				$ionicLoading.hide();
			},

			/**
			 * 显示确认对话框
			 *
			 * @param cfg{
			 * 	title : 标题,
			 * 	content : 内容,
			 * 	onSelect : 选择后的回调函数
			 * }
			 */
			confirm : function(cfg){
				
				$ionicPopup.confirm({
					title : cfg.title == undefined ? "询问" : cfg.title,
					template : cfg.content,
					buttons: [
						{
							text: "取消",
							onTap : function(){
								return false;
							}
						},
						{
							text: "确定",
							//自定义按钮样式
							type: cfg.okButtonClass == undefined ? "kyee_framework_message_dialog_ok_button" : cfg.okButtonClass,
							onTap: function() {
								return true;
							}
						}
					]
				})
				.then(cfg.onSelect);
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
				
				var view = $ionicPopup.alert({
					title : cfg.title == undefined ? "消息" : cfg.title,
					template : cfg.content,
					buttons: [
						{
							text: cfg.okText == undefined ? "确定" : cfg.okText,
							//自定义按钮样式
							type: cfg.okButtonClass == undefined ? "kyee_framework_message_dialog_ok_button" : cfg.okButtonClass
						}
					]
				})
				.then(cfg.onOk);
				
				return view;
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
					title : cfg.title == undefined ? "菜单" : cfg.title,
					template : content,
					scope : cfg.scope
				});
				
				cfg.scope.onSelect = function(select){
					
					view.close();
					cfg.onSelect(select);
				}
			}
		};
}]);