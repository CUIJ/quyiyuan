angular.module("kyee.framework.directive.picker.calendar_picker", ["kyee.framework.config"])
	.directive("kyeeCalendarPickerDirective", ["KyeeFrameworkConfig", "KyeeCalendarPickerService", "$compile", "KyeeMessageService", "KyeeI18nService", function(KyeeFrameworkConfig, KyeeCalendarPickerService, $compile, KyeeMessageService, KyeeI18nService) {
		
		var def = {
			scope: {
				cancelText : "@",
				okText : "@",
				//模式，可取值为 YM（年月可选）、M（月可选）
				mode : "@",
				bottom : "@",
				onSelectFinish : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/picker/calendar_picker/templates/picker.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", "$element", function($scope, $element){

				//存储当前所选的日期，结构为：{year: interger, month: integer, day: integer}
				var currSelected = null;

				//生成唯一标示符
				$scope.id = "picker_" + new Date().getTime();

				//计算组件位置信息
				$scope.posi = KyeeCalendarPickerService.calcPosi();

				//默认 YM 模式
				if($scope.mode == undefined){
					$scope.mode = "YM";
				}

				if($scope.bottom == undefined){
					$scope.bottom = "5";
				}

				if($scope.cancelText == undefined){
					$scope.cancelText = KyeeI18nService.get("commonText.cancelMsg","取消");
				}

				if($scope.okText == undefined){
					$scope.okText = KyeeI18nService.get("commonText.selectMsg","选择");
				}

				/**
				 * 绘制日期
				 */
				$scope.draw = function(){

					$element.find("calendar-tag").html(KyeeCalendarBuilder.run());
					$compile($element.find("calendar-tag").contents())($scope);
				},

				/**
				 * 上一月
				 */
				$scope.prevMonth = function(){

					KyeeCalendarBuilder.prevMonth();
					$scope.draw();
				};

				/**
				 * 下一月
				 */
				$scope.nextMonth = function(){

					KyeeCalendarBuilder.nextMonth();
					$scope.draw();
				};

				/**
				 * 上一年
				 */
				$scope.prevYear = function(){

					KyeeCalendarBuilder.prevYear();
					$scope.draw();
				};

				/**
				 * 下一年
				 */
				$scope.nextYear = function(){

					KyeeCalendarBuilder.nextYear();
					$scope.draw();
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
				 * 跳转到本月
				 */
				$scope.today = function(){

					KyeeCalendarBuilder.today();
					$scope.draw();
				};

				/**
				 * 单击日期时
				 *
				 * @param day
				 */
				$scope.dayClick = function(day){

					var yearAndMonth = KyeeCalendarBuilder.getYearAndMonth();

					//存储所选数据
					currSelected = {
						year : yearAndMonth.year,
						month : yearAndMonth.month,
						day : day
					};

					//高亮单击的天
					var mark = {};
					mark[yearAndMonth.year + "/" + (yearAndMonth.month < 10 ? "0" + yearAndMonth.month : yearAndMonth.month) + "/" + (day < 10 ? "0" + day : day)] = "calendar-mark-day";
					KyeeCalendarBuilder.setMark(mark);
					$scope.draw();
				};

				/**
				 * 选择完成
				 *
				 * @param type
				 * @param item
				 */
				$scope.finash = function(type){

					var me = this;

					if(currSelected == null){

						KyeeMessageService.broadcast({
							content : KyeeI18nService.get("commonText.selectDateTips","请选择日期！")
						});

						return;
					}

					//根据返回值判断是否继续
					var isContinue = $scope.onSelectFinish({
						params : currSelected
					});
					if(!isContinue){
						return;
					}

					me.cancel();
				},

				/**
				 * 取消
				 */
				$scope.cancel = function(){

					var me = this;

					KyeeCalendarPickerService.hidePickerDom($scope.id);
				};

				/**
				 * 显示选择器
				 */
				$scope.show = function(defaultValue){

					//设置默认值
					if(defaultValue == undefined){

						//清空上次所选择的值
						currSelected = null;

						//清空标志
						KyeeCalendarBuilder.setMark({});

						$scope.today();
					}else{

						currSelected = defaultValue;

						//高亮默认值中的天
						var mask = {};
						mask[defaultValue.year + "/" + (defaultValue.month < 10 ? "0" + defaultValue.month : defaultValue.month) + "/" + (defaultValue.day < 10 ? "0" + defaultValue.day : defaultValue.day)] = "calendar-mark-day";
						KyeeCalendarBuilder.setMark(mask);

						KyeeCalendarBuilder.setYearAndMonth(defaultValue);
						$scope.draw();
					}

					KyeeCalendarPickerService.showPickerDom($scope.id);
				};

				//初始化绘制
				$scope.draw();

				$scope.bind({
					params : $scope
				});
			}]
        };

		return def;
	}]);