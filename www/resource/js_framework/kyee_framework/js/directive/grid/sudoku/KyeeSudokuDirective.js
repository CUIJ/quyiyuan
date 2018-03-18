/**
 * 九宫格指令
 */
angular.module("kyee.framework.directive.sudoku", ["kyee.framework.config"])
	.directive("kyeeSudokuDirective", ["KyeeFrameworkConfig", function(KyeeFrameworkConfig) {
		
		var def = {
			scope: {
				data : "=",
				height : "@",
				itemclick : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/grid/sudoku/templates/sudoku.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", function($scope){

				/**
				 * 项目单击时
				 *
				 * @param item
				 */
				$scope.click = function(item){

					$scope.itemclick({params : item});
				}
			}]
        };

		return def;
	}]);