/**
 * 通知消息栏指令
 * 属性：
 * 		id : 唯一标示符
 * 		speed : 速度
 * 		direction : 滚动方向（up, down, left, right）
 * 		closeable : 是否可关闭
 * 		skin : 自定义样式
 * 		content : 通知内容
 * 可用方法：
 * 		close() : 关闭
 * 可用事件：
 * 		kyeeNotification.event.close : 关闭事件
 */
angular.module("kyee.framework.directive.notification", ["kyee.framework.service.utils", "kyee.framework.config"])
	.directive("kyeeNotificationDirective", ["KyeeUtilsService", "KyeeFrameworkConfig", function(KyeeUtilsService, KyeeFrameworkConfig) {
		
		var def = {
			scope: {
				id : "@",
				speed : "@",
				direction : "@",
				closeable : "@",
				content : "@",
				skin : "@",
				autoHideDelay : "@"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/notification/templates/notification.html", 
            replace: true,
            restrict: "A",
			init : function(){

				if(def.attrs.speed == undefined){
					def.attrs.speed = 2;
				}
				if(def.attrs.direction == undefined){
					def.attrs.direction = "left";
				}
				if(def.attrs.closeable == undefined){
					def.attrs.closeable = false;
				}

				//设置自动隐藏
				if (def.attrs.autoHideDelay != undefined) {
					
					KyeeUtilsService.delay({
						time : parseInt(def.attrs.autoHideDelay),
						do : function(){
							def.listeners.close_notification();
						}
					});
				}
				
				def.registEvents();
				def.registMethods();
			},
			controller : ["$scope", function($scope){
				
				def.innerScope = $scope;
			}],
			link : function(scope, element, attrs){
				
				def.element = element;
				def.attrs = attrs;
				
				def.init();
			},
			registMethods : function(){
				
				def.innerScope.$on("kyeeNotification.close", def.methods.close);
			},
			methods : {
				
				close : function(evt, params){
					
					document.getElementById(def.innerScope.id).style.display="none";
				}
			},
			registEvents : function(){
				
				def.innerScope.doOnClose = def.events.close;
			},
			events : {
				
				close : function(){

					console.log(def.attrs.speed);

					def.innerScope.$emit("kyeeNotification.event.close");
				}
			}
        };
		
		return def;
	}]);