angular.module("kyee.framework.directive.picker.cascade_list_picker.impl.time_picker", ["kyee.framework.config"])
	.directive("kyeeTimePickerDirective", ["KyeeFrameworkConfig", "KyeeI18nService", "KyeeUtilsService", function(KyeeFrameworkConfig, KyeeI18nService, KyeeUtilsService) {
		
		var def = {
			scope: {
				title : "@",
				bottom : "@",
				onSelectFinash : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/picker/cascade-list-picker/impl/time_picker/templates/picker.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", function($scope){

				if($scope.title == undefined){
					$scope.title = KyeeI18nService.get("commonText.selectTimeTips","请选择时间");
				}
				if($scope.bottom == undefined){
					if(KyeeUtilsService.isPad()){
						$scope.bottom = "5";
					} else {
						$scope.bottom = "0";
					}
				}

				//生成标签
				$scope.group4Base = [
					{
						text : KyeeI18nService.get("commonText.hoursText","时")
					},
					{
						text : KyeeI18nService.get("ccommonText.minText","分")
					}
				];

				//from cascadeList method
				$scope.bind4Base = function(params){

					$scope.show4Base = params.show;
					$scope.updateData4Base = params.updateData;
				};

				//from cascadeList method
				$scope.onChange4Base = function(params){};

				//from cascadeList method
				$scope.onFinash4Base = function(params){

					return $scope.onSelectFinash({
						params : params
					});
				};

				/**
				 * 显示
				 */
				$scope.show = function(defaultValue){

					//生成小时
					var hours = [];
					for(var i = 0; i <= 23; i ++){

						hours.push({
							text : i,
							value : i
						});
					}

					//生成分钟
					var minutes = [];
					for(var i = 0; i <= 59; i ++){
						minutes.push({
							text : i,
							value : i
						});
					}

					//生成最终数据
					$scope.data4Base = [
						{
							groupIndex : "0",
							items : hours
						},
						{
							groupIndex : "1",
							items : minutes
						}
					];

					if(defaultValue == undefined){

						//默认显示当前时间
						var now = new Date();
						defaultValue = {
							"0" : now.getHours(),
							"1" : now.getMinutes()
						};
					}

					$scope.show4Base(defaultValue);
				};

				$scope.bind({
					params : $scope
				});
			}]
        };

		return def;
	}]);