angular.module("kyee.framework.directive.picker.cascade_list_picker.impl.date_picker", ["kyee.framework.config"])
	.directive("kyeeDatePickerDirective", ["KyeeFrameworkConfig", "KyeeDatePickerService", "KyeeI18nService", "KyeeUtilsService", function(KyeeFrameworkConfig, KyeeDatePickerService, KyeeI18nService, KyeeUtilsService) {
		
		var def = {
			scope: {
				title : "@",
				cascade : "@",
				//模式，可取值为：YMD，其中，Y 代表年，M 代表月，D 代表天
				mode : "@",
				yearRange : "@",
				bottom : "@",
				onSelectFinash : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/picker/cascade-list-picker/impl/date_picker/templates/picker.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", function($scope){

				//保存当前的年份
				var currYear = 0;
				//保存当前的月份
				var currMonth = 0;

				if($scope.title == undefined){
					$scope.title = KyeeI18nService.get("commonText.selectDateText","请选择日期");
				}
				if($scope.mode == undefined){
					$scope.mode = "YMD";
				}
				if($scope.yearRange == undefined){
					$scope.yearRange = "1949->";
				}
				if($scope.bottom == undefined){
					if(KyeeUtilsService.isPad()){
						$scope.bottom = "5";
					} else {
						$scope.bottom = "0";
					}
				}
				if($scope.cascade == undefined){
					$scope.cascade = "false";
				}

				//生成标签
				$scope.group4Base = [];
				if($scope.mode.indexOf("Y") != -1){
					$scope.group4Base.push({
						text : KyeeI18nService.get("commonText.yearText","年")
					});
				}
				if($scope.mode.indexOf("M") != -1){
					$scope.group4Base.push({
						text : KyeeI18nService.get("commonText.monthText","月")
					});
				}
				if($scope.mode.indexOf("D") != -1){
					$scope.group4Base.push({
						text : KyeeI18nService.get("commonText.dayText","日")
					});
				}

				//from cascadeList method
				$scope.bind4Base = function(params){

					$scope.show4Base = params.show;
					$scope.updateData4Base = params.updateData;
				};

				//from cascadeList method
				$scope.onChange4Base = function(params){

					if(params.groupIndex == "0"){

						//存储当前所选的年份
						currYear = params.item.value;
						if(currMonth != 2){
							return;
						}

					}else if(params.groupIndex == "1" && $scope.mode.indexOf("D") != -1){

						//存储当前所选的月份
						currMonth = params.item.value;
					}

					//更新当前月的天数
					var dayCount = KyeeDatePickerService.getDayCount(currYear, currMonth);
					var days = [];
					for(var i = 1; i <= dayCount; i ++){
						days.push({
							text : i,
							value : i
						});
					}

					$scope.updateData4Base([
						{
							groupIndex : 2,
							items : days
						}
					]);
				};

				//from cascadeList method
				$scope.onFinash4Base = function(params){

					//生成时间序列化的值
					var fullDateString = "";
					var normalDateString = "";
					if($scope.mode.indexOf("D") != -1){

						normalDateString = params[0].value + "/" + params[1].value + "/" + params[2].value;
						fullDateString = params[0].value + "/" + (params[1].value < 10 ? "0" + params[1].value : params[1].value) + "/" + (params[2].value < 10 ? "0" + params[2].value : params[2].value)
					}else{

						normalDateString = params[0].value + "/" + params[1].value;
						fullDateString = params[0].value + "/" + (params[1].value < 10 ? "0" + params[1].value : params[1].value);
					}

					params.normalDateString = normalDateString;
					params.fullDateString = fullDateString;

					return $scope.onSelectFinash({
						params : params
					});
				};

				/**
				 * 显示
				 */
				$scope.show = function(defaultValue){

					$scope.data4Base = [];

					//生成年份
					var years = [];
					var yearPart = $scope.yearRange.trim().split("->");
					var start = parseInt(yearPart[0]);
					var end = yearPart.length == 1 || yearPart[1] == "" ? new Date().getFullYear() : parseInt(yearPart[1]);
					for(var i = start; i <= end; i ++){

						years.push({
							text : i,
							value : i
						});
					}

					//生成月份
					var months = [];
					for(var i = 1; i <= 12; i ++){
						months.push({
							text : i,
							value : i
						});
					}

					var dayCount = 0;
					if(defaultValue == undefined){

						//保存当前年份
						currYear = new Date().getFullYear();
						//保存当前月份
						currMonth = new Date().getMonth() + 1;

						//生成默认值
						if($scope.mode.indexOf("D") != -1){

							//如果没有设置默认值，则默认显示当前日期
							defaultValue = {
								"0" : new Date().getFullYear(),
								"1" : new Date().getMonth() + 1,
								"2" : new Date().getDate()
							};

							dayCount = KyeeDatePickerService.getDayCount(new Date().getFullYear(), new Date().getMonth() + 1);
						}else{

							//如果没有设置默认值，则默认显示当前日期
							defaultValue = {
								"0" : new Date().getFullYear(),
								"1" : new Date().getMonth() + 1
							};
						}
					}else{

						//保存当前年份
						currYear = defaultValue["0"];
						//保存当前月份
						currMonth = defaultValue["1"];
						dayCount = KyeeDatePickerService.getDayCount(defaultValue["0"], defaultValue["1"]);
					}

					//生成天
					var days = [];
					for(var i = 1; i <= dayCount; i ++){
						days.push({
							text : i,
							value : i
						});
					}

					//生成最终数据
					var dataset = [];
					if($scope.mode.indexOf("Y") != -1){
						dataset.push({
							groupIndex : "0",
							items : years
						});
					}
					if($scope.mode.indexOf("M") != -1){
						dataset.push({
							groupIndex : "1",
							items : months
						});
					}
					if($scope.mode.indexOf("D") != -1){
						dataset.push({
							groupIndex : "2",
							items : days
						});
					}
					$scope.data4Base = dataset;

					$scope.show4Base(defaultValue);
				};

				$scope.bind({
					params : $scope
				});
			}]
        };

		return def;
	}]);