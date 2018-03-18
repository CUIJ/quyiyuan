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
			controller : ["$scope", function($scope){

				if($scope.speed == undefined){
					$scope.speed = 2;
				}
				if($scope.direction == undefined){
					$scope.direction = "left";
				}
				if($scope.closeable == undefined){
					$scope.closeable = false;
				}

				//设置自动隐藏
				if ($scope.autoHideDelay != undefined) {

					KyeeUtilsService.delay({
						time : parseInt($scope.autoHideDelay),
						do : function(){
							$scope.close();
						}
					});
				}

				/**
				 * 关闭
				 */
				$scope.close = function(){
					document.getElementById($scope.id).style.display="none";
				}
			}]
        };
		
		return def;
	}]);