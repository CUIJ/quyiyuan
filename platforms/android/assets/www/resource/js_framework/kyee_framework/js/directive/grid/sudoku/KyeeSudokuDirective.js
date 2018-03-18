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
			init : function(){

				def.registEvents();
				def.registMethods();
			},
			controller : ["$scope", function($scope){

				def.innerScope = $scope;
			}],
			link : function(scope, element, attrs){

				def.element = element;
				def.attrs = attrs;

				def.init(element, attrs);
			},
			registMethods : function(){

				def.innerScope.click = def.methods.click;
			},
			methods : {
				click : function(item){

					def.innerScope.itemclick({params : item});
				}
			},
			registEvents : function(){
			},
			events : {
			}
        };

		return def;
	}]);