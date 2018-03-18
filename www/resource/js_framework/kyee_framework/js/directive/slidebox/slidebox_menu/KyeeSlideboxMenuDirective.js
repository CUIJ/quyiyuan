angular.module("kyee.framework.directive.slidebox.slidebox_menu", ["ionic", "kyee.framework.config"])
	.directive("kyeeSlideboxMenuDirective", ["$ionicScrollDelegate", "KyeeFrameworkConfig", function($ionicScrollDelegate, KyeeFrameworkConfig) {
		
		var def = {
			scope: {
				data : "=",
				perpage : "@",
				itemclick : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/slidebox/slidebox_menu/templates/slidebox_menu.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", "KyeeSlideboxService", "KyeeUtilsService", function($scope, KyeeSlideboxService, KyeeUtilsService){

				//记录当前页面的索引
				var currPageIndex = 0;

				//初始化内部使用数据
				$scope.innerData = [];
				$scope.menuBtnWidth = 0;

				//必须做非空验证
				if($scope.data != undefined && $scope.perpage != undefined){

					//数据格式转换，转换为二维数据，以便于视图分页渲染
					$scope.innerData = KyeeSlideboxService.convert($scope.data, $scope.perpage);
					$scope.menuBtnWidth = Math.round(100 / $scope.perpage) - 1;  // -1 防止折行
				}

				/**
				 * 上一组
				 */
				$scope.previousGroup = function(){

					if(currPageIndex <= 0){
						currPageIndex = $scope.innerData.length - 1;
					}else{
						currPageIndex --;
					}

					//由于使用了分页，所以使得 x 位于当页的下半页范围即可
					var positionX = (KyeeUtilsService.getInnerSize().width * currPageIndex) * 0.8;
					$ionicScrollDelegate.$getByHandle("kyee_framework_slidebox_menu").scrollTo(positionX, 0, true);
				};

				/**
				 * 下一组
				 */
				$scope.nextGroup = function(){

					if(currPageIndex >= $scope.innerData.length - 1){
						currPageIndex = 0;
					}else{
						currPageIndex ++;
					}

					//由于使用了分页，所以使得 x 位于当页的下半页范围即可
					var positionX = (KyeeUtilsService.getInnerSize().width * currPageIndex) * 0.8;
					$ionicScrollDelegate.$getByHandle("kyee_framework_slidebox_menu").scrollTo(positionX, 0, true);
				};

				/**
				 * 更新视图
				 */
				$scope.update = function(){

					var data = $scope.data;
					var perpage = parseInt($scope.perpage);

					//重置标志
					currPageIndex = 0;

					//数据格式转换，转换为二维数据，以便于视图分页渲染
					$scope.innerData = KyeeSlideboxService.convert(data, perpage);
					$scope.menuBtnWidth = Math.round(100 / perpage) - 1;  // -1 防止折行

					$ionicScrollDelegate.$getByHandle("kyee_framework_slidebox_menu").scrollTop();
				};

				/**
				 * 单击条目时
				 *
				 * @param params
				 */
				$scope.doItemclick = function(params){

					$scope.itemclick({
						params : {
							item : params
						}
					});
				}

				/**
				 * 作用域绑定
				 */
				$scope.bind({
					params : $scope
				});
			}]
        };
		
		return def;
	}]);