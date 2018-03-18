/**
 * 日历组件
 */
angular.module("kyee.framework.directive.calendar", ["ngSanitize", "kyee.framework.config"])
	.directive("kyeeCalendarDirective", ["$compile", function($compile) {

		var def = {
			scope: {
				"bind" : "&",
				"mark" : "=",
				"itemClick" : "&"
			},
			replace: true,
			restrict: "A",
			controller : ["$scope", "$element", function($scope, $element){

				var me = this;

				//设置 mark
				if($scope.mark != undefined) {
					KyeeCalendarBuilder.setMark($scope.mark);
				}
				
				//默认绘制日历
				KyeeCalendarBuilder.today();
				$element.html(KyeeCalendarBuilder.run());
				$compile($element.contents())($scope);

				/**
				 * 上一月
				 */
				$scope.prevMonth = function(){

					KyeeCalendarBuilder.prevMonth();

					$element.html(KyeeCalendarBuilder.run());
					$compile($element.contents())($scope);
				};

				/**
				 * 下一月
				 */
				$scope.nextMonth = function(){

					KyeeCalendarBuilder.nextMonth();

					$element.html(KyeeCalendarBuilder.run());
					$compile($element.contents())($scope);
				};

				/**
				 * 获取当前所选的年月
				 *
				 * @returns {*|{year, month}}
				 */
				$scope.getYearAndMonth = function(){

					return KyeeCalendarBuilder.getYearAndMonth();
				};

				/**
				 * 设置年月
				 *
				 * @param parms
				 */
				$scope.setYearAndMonth = function(parms){

					KyeeCalendarBuilder.setYearAndMonth(parms);

					$element.html(KyeeCalendarBuilder.run());
					$compile($element.contents())($scope);
				};

				/**
				 * 跳转到本月
				 */
				$scope.today = function(){

					KyeeCalendarBuilder.today();

					$element.html(KyeeCalendarBuilder.run());
					$compile($element.contents())($scope);
				};

				/**
				 * 单击日期时
				 *
				 * @param day
				 */
				$scope.dayClick = function(day){

					var date = KyeeCalendarBuilder.getYearAndMonth();
					$scope.itemClick({
						params : {
							year : date.year,
							month : date.month,
							day : day
						}
					});
				};

				$scope.bind({
					params : $scope
				});
			}]
		};

		return def;
	}]);