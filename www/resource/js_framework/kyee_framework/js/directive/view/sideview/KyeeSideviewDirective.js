angular.module("kyee.framework.directive.view.sideview", ["ngSanitize"])
	.directive("kyeeSideviewDirective", ["KyeeFrameworkConfig", "KyeeSideviewService","$ionicScrollDelegate", function(KyeeFrameworkConfig, KyeeSideviewService,$ionicScrollDelegate) {

		var def = {
			scope: {
				config : "=",
				activeTabColor : "@",
				activeTab : "=",
				height : "@",
				border : "@",
				bgcolor : "@"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/view/sideview/templates/sideview.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", function($scope){

				if($scope.config == undefined){
					$scope.config = [];
				}
				if($scope.activeTabColor == undefined){
					$scope.activeTabColor = "#DDEFFE";
				}
				if($scope.activeTab == undefined){
					$scope.activeTab = $scope.config.length > 0 ? $scope.config[0].id : null;
				}
				KyeeSideviewService.activeTab($scope.activeTab, $scope);
				if($scope.height == undefined){
					$scope.height = 300
				}
				if($scope.border == undefined){
					$scope.border='1px double #cccccc';
				}
				if($scope.bgcolor == undefined){
					$scope.bgcolor="white";
				}
				$scope.height = parseInt($scope.height);
				$scope.barHeight = $scope.height + 18;
				$scope.ionScrollStyle = {
					"height" : $scope.barHeight+'px',
					"border" : $scope.border,
					"background-color": $scope.bgcolor
				};
				$scope.onInnerTabClick = function(tabItem){
					$ionicScrollDelegate.scrollTop();
					KyeeSideviewService.activeTab(tabItem.id, $scope);
				};
			}]
        };
		return def;
	}]);