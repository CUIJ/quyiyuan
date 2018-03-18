angular.module("kyee.framework.directive.picker.cascade_list_picker.base", ["kyee.framework.config"])
	.directive("kyeeCascadeListPickerDirective", ["KyeeFrameworkConfig", "KyeeListPickerService", "$ionicScrollDelegate", "KyeeMessageService", "KyeeUtilsService", "KyeeCascadeListPickerService", "KyeeI18nService", function(KyeeFrameworkConfig, KyeeListPickerService, $ionicScrollDelegate, KyeeMessageService, KyeeUtilsService, KyeeCascadeListPickerService, KyeeI18nService) {
		
		var def = {
			scope: {
				title : "@",
				cancelText : "@",
				okText : "@",
				group : "=",
				data : "=",
				cascade : "@",
				bottom : "@",
				onSelectFinash : "&",
				onChange : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/picker/cascade-list-picker/base/templates/picker.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", function($scope){


				//记录所有分组所选的条目索引
				//结构为：{group_index:item_index}
				var currSelectedIndex = {};

				//生成唯一标示符
				$scope.id = "picker_" + new Date().getTime();

				//计算组件位置信息
				$scope.posi = KyeeCascadeListPickerService.calcPosi();

				//记录当前是否正在滚动，如果是，则禁用确认按钮
				$scope.isScrolling = false;

				//记录当前滚动条目的索引
				$scope.scrollingItem = -1;


				//设置默认值
				if($scope.title == undefined){
					$scope.title = KyeeI18nService.get("commonText.pleaseSelectMsg","请选择");
				}
				if($scope.cancelText == undefined){
					$scope.cancelText = KyeeI18nService.get("commonText.cancelMsg","取消");
				}
				if($scope.okText == undefined){
					$scope.okText = KyeeI18nService.get("commonText.selectMsg","选择");
				}
				if($scope.cascade == undefined){
					$scope.cascade = "true";
				}
				if($scope.bottom == undefined){
					if(KyeeUtilsService.isPad()){
						$scope.bottom = "5";
					} else {
						$scope.bottom = "0";
					}
				}

				/**
				 * 强制对齐
				 *
				 * @param index
				 */
				var alignWatcherTimer = null;
				$scope.forceAlign = function(index){

					var scrollCom = $ionicScrollDelegate.$getByHandle("kyee_framework_cascade_picker_item" + index);

					if(scrollCom.freezeScroll()){
						return;
					}

					//更新滚动标志
					$scope.isScrolling = true;
					$scope.scrollingItem = index;

					//关闭之前正在运行的定时器
					if(alignWatcherTimer != null){
						KyeeUtilsService.cancelInterval(alignWatcherTimer);
					}

					var previousY = -1;
					alignWatcherTimer = KyeeUtilsService.interval({
						time : 200,
						action : function(){

							var y = scrollCom.getScrollPosition().top;
							if(y == previousY){

								KyeeUtilsService.cancelInterval(alignWatcherTimer);
								alignWatcherTimer = null;

								doForceAlign(index);
							}

							previousY = y;
						}
					});
				};

				/**
				 * 强制对齐动作
				 *
				 * @param index
				 */
				var doForceAlign = function(index){

					var offset = 53; //偏移量
					var scrollCom = $ionicScrollDelegate.$getByHandle("kyee_framework_cascade_picker_item" + index);
					var itemIndex = Math.round(scrollCom.getScrollPosition().top / offset);

					//对其当前滚动列
					scrollCom.scrollTo(0, itemIndex * offset, true);

					//后面所有的列表滚动到顶部
					if($scope.cascade == "true"){
						for(var i = index + 1; i < $scope.group.length; i ++){
							$ionicScrollDelegate.$getByHandle("kyee_framework_cascade_picker_item" + i).scrollTop(false);
							currSelectedIndex[i] = 0;
						}
					}

					//记录当前所选条目的索引
					currSelectedIndex[index] = itemIndex;

					//回调 onChange 事件
					var currItem = angular.copy($scope.innerData[index][itemIndex]);
					if(currItem != undefined){

						currItem.index = itemIndex;
						$scope.onChange({
							params : {
								groupIndex : index,
								item : currItem
							}
						});
					}

					//更新滚动标志
					$scope.isScrolling = false;
					$scope.scrollingItem = -1;
				};

				$scope.onTouch=function(index){
					if($scope.isScrolling && $scope.scrollingItem != index){
						$ionicScrollDelegate.$getByHandle("kyee_framework_cascade_picker_item"+index).freezeScroll(true);
					} else {
						$ionicScrollDelegate.$getByHandle("kyee_framework_cascade_picker_item"+index).freezeScroll(false);
					}
				};
				
				/**
				 * 更新数据
				 *
				 * @param data
				 */
				$scope.updateData = function(data){

					//数据转换
					var _data = KyeeCascadeListPickerService.convertData(data);
					for(var i in _data){

						$scope.innerData[i] = _data[i];

						var items = $scope.innerData[i];

						if($scope.cascade == "true"){
							//由于是为该分组重新设置的数据，因此需要级联触发，传递的数据为 items 的第一项
							//注意考虑 items 为空的情况
							var currItem = {
								 text : null,
								 value : null
							 };
							if(items.length > 0){
							 	currItem = items[0];
							}

							currSelectedIndex[i] = 0;

							 $scope.onChange({
								 params : {
									 groupIndex : i,
									 item : currItem
								 }
							 });
						}
					}
				};

				/**
				 * 显示选择器
				 */
				$scope.show = function(defaultValue){

					$scope.$apply();

					//初始化选择值
					currSelectedIndex = {};
					for(var i = 0; i < $scope.group.length; i ++){
						currSelectedIndex[i] = 0;
					}

					//数据转换
					$scope.innerData = KyeeCascadeListPickerService.convertData($scope.data);

					KyeeListPickerService.showPickerDom($scope.id);

					//设置默认值
					if(defaultValue != undefined){

						for(var i in defaultValue){

							var defaultRecord = defaultValue[i];
							var groupData = $scope.innerData[i];

							//不一定每个分组都被定义或存在数据
							if(groupData == undefined || groupData == null){
								continue;
							}

							var j;
							for(j = 0; j < groupData.length; j ++){
								var record = groupData[j];
								if(record.value == defaultRecord){
									break;
								}
							}

							//如果没有查找到默认值则默认选中第一个
							if(j >= groupData.length){
								j = 0;
							}
							currSelectedIndex[i] = j;

							var offset = 53; //偏移量
							var scrollCom = $ionicScrollDelegate.$getByHandle("kyee_framework_cascade_picker_item" + i);


							scrollCom.scrollTo(0, j * offset, true);
						}
					}
				};

				/**
				 * 选择完成
				 *
				 * @param type
				 * @param item
				 */
				$scope.finash = function(type){

					var me = this;

					//生成返回值
					var selection = {};
					for(var index in currSelectedIndex){

						var item = angular.copy($scope.innerData[index][currSelectedIndex[index]]);

						// 非级联的日期组件
						if($scope.cascade == "false" && item.value == "KYEE_PLACEHOLDER_ITEM"){
							item = angular.copy($scope.innerData[index][(currSelectedIndex[index]-1)]);
						}

						//如果 item 为空，则使用默认值
						if(item == undefined){
							item = {
								text : null,
								value : null
							};
						}

						selection[index] = item
					}

					var isContinue = $scope.onSelectFinash({
						params : selection
					});

					if(isContinue){
						me.cancel();
					}
				},

				/**
				 * 取消
				 */
				$scope.cancel = function(){

					var me = this;

					KyeeListPickerService.hidePickerDom($scope.id);
				};

				$scope.bind({
					params : $scope
				});
			}]
        };

		return def;
	}]);