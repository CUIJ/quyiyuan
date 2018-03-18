angular.module("kyee.framework.directive.picker.cascade_list_picker.impl.area_picker", ["kyee.framework.config"])
.directive("kyeeAreaPickerDirective", ["KyeeFrameworkConfig", "KyeeAreaPickerService","KyeeI18nService","KyeeUtilsService", function(KyeeFrameworkConfig, KyeeAreaPickerService, KyeeI18nService, KyeeUtilsService) {
		
		var def = {
			scope: {
				title : "@",

				//模式，可取值为：PCA，其中，P 代表省，C 代表城市，A 代表区/县
				mode : "@",
				allow : "=",
				bottom : "@",
				onSelectFinash : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/picker/cascade-list-picker/impl/area_picker/templates/picker.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", function($scope){

				if($scope.title == undefined){
					$scope.title = KyeeI18nService.get("commonText.selectCityText","请选择地区");
				}
				if($scope.mode == undefined){
					$scope.mode = "PCA";
				}
				if($scope.bottom == undefined){
					if(KyeeUtilsService.isPad()){
						$scope.bottom = "5";
					} else {
						$scope.bottom = "0";
					}
				}

				//分组标签
				$scope.group4Base = [];
				if($scope.mode.indexOf("P") != -1){
					$scope.group4Base.push({
						text : KyeeI18nService.get("commonText.proviceText","省份")
					});
				}
				if($scope.mode.indexOf("C") != -1){
					$scope.group4Base.push({
						text : KyeeI18nService.get("commonText.cityText","城市")
					});
				}
				if($scope.mode.indexOf("A") != -1){
					$scope.group4Base.push({
						text : KyeeI18nService.get("commonText.areaText","区/县")
					});
				}

				//from cascadeList method
				$scope.bind4Base = function(params){

					$scope.show4Base = params.show;
					$scope.updateData4Base = params.updateData;
				};

				//from cascadeList method
				$scope.onChange4Base = function(params){

					if(params.groupIndex == 0){

						var rawData = CITY_DATA_4_CITY_PICKER.citys[params.item.value];
						if($scope.allow != undefined && $scope.allow.city != undefined && $scope.allow.city.length > 0){

							rawData = KyeeAreaPickerService.filter(rawData, $scope.allow.city);
						}

						$scope.updateData4Base([{
							groupIndex : 1,
							items : rawData == undefined ? [] : rawData
						}]);
					}
					if(params.groupIndex == 1){

						var rawData = CITY_DATA_4_CITY_PICKER.areas[params.item.value];
						if($scope.allow != undefined && $scope.allow.area != undefined && $scope.allow.area.length > 0){

							rawData = KyeeAreaPickerService.filter(rawData, $scope.allow.area);
						}

						$scope.updateData4Base([{
							groupIndex : 2,
							items : rawData == undefined ? [] : rawData
						}]);
					}
				};

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

					//待加载的所在省份、所在市的编号
					//默认使用北京
					var groupValues = {
						"P" : "110000",
						"C" : "110100"
					};

					//如果用户指定默认值，则优先使用该值
					//用户指定值得格式为：{0:"10000",1:"10100",2:"10101"}，并且 model 为 PCA，则 0 = P，1 = C，2 = A（注意位置对应）
					if(defaultValue != undefined){

						for(var value in defaultValue){

							//取到对应的编码（注意位置对应）
							var code = $scope.mode.charAt(parseInt(value));
							groupValues[code] = defaultValue[value];
						}
					}

					//数据
					//默认选择北京
					$scope.data4Base = [];
					var rawDataProvince = [];
					var rawDataCity = [];
					var rawDataArea = [];

					//查找过滤省份数据
					if($scope.mode.indexOf("P") != -1){

						rawDataProvince = CITY_DATA_4_CITY_PICKER.provinces;
						if($scope.allow != undefined && $scope.allow.province != undefined && $scope.allow.province.length > 0){

							rawDataProvince = KyeeAreaPickerService.filter(rawDataProvince, $scope.allow.province);
						}

						$scope.data4Base.push({
							groupIndex : 0,
							items : rawDataProvince
						});
					}

					//查找过滤城市数据
					if($scope.mode.indexOf("C") != -1 && rawDataProvince != undefined
						&& rawDataProvince.length > 0){

						//省份列表中是否有默认省份
						var selectedProvince = null;
						var hasDefaultProvince = false;
						for(var province in rawDataProvince){
							if(rawDataProvince[province].value == groupValues.P){
								selectedProvince = rawDataProvince[province].value;
								hasDefaultProvince = true;
								break;
							}
						}

						//没有默认省份则选第一个为默认省份
						if(!selectedProvince){
							selectedProvince = rawDataProvince[0].value;
						}

						rawDataCity = CITY_DATA_4_CITY_PICKER.citys[selectedProvince];
						if($scope.allow != undefined && $scope.allow.city != undefined && $scope.allow.city.length > 0){

							rawDataCity = KyeeAreaPickerService.filter(rawDataCity, $scope.allow.city);
						}

						$scope.data4Base.push({
							groupIndex : 1,
							items : rawDataCity
						});
					}

					//查找过滤地区数据
					if($scope.mode.indexOf("A") != -1 && rawDataCity != undefined
						&& rawDataCity.length > 0){

						//有默认省份的情况下检查城市列表中是否有默认城市
						var selectedCity = null;
						if(hasDefaultProvince){
							for(var city in rawDataCity){
								if(rawDataCity[city].value == groupValues.C){
									selectedCity = rawDataCity[city].value;
									break;
								}
							}
						}

						//没有默认城市则选第一个为默认城市
						if(!selectedCity){
							selectedCity = rawDataCity[0].value;
						}

						rawDataArea = CITY_DATA_4_CITY_PICKER.areas[selectedCity];
						if($scope.allow != undefined && $scope.allow.area != undefined && $scope.allow.area.length > 0){

							rawDataArea = KyeeAreaPickerService.filter(rawDataArea, $scope.allow.area);
						}

						$scope.data4Base.push({
							groupIndex : 2,
							items : rawDataArea
						});
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