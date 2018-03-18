angular.module("kyee.framework.directive.picker.list_picker", ["kyee.framework.config"])
	.directive("kyeeListPickerDirective", ["KyeeFrameworkConfig", "KyeeListPickerService", "$ionicScrollDelegate", "KyeeMessageService", "KyeeUtilsService", "KyeeI18nService", function(KyeeFrameworkConfig, KyeeListPickerService, $ionicScrollDelegate, KyeeMessageService, KyeeUtilsService, KyeeI18nService) {

		var def = {
			scope: {
				title : "@",
				cancelText : "@",
				okText : "@",
				height : "@",
				type : "@",
				data : "=",
				bottom : "@",
				//隐藏模式，可取值为 AUTO, BUTTON
				hideMode: "@",
				footerBar: "@",  // 选择控件底部样式
				footerBarTap: "&",  // 选择控件底部绑定的点击事件方法
				selectFinash : "&",
				bind : "&"
			},
			templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/picker/list_picker/templates/picker.html",
			replace: true,
			restrict: "A",
			controller : ["$scope", function($scope){

				//生成唯一标示符
				$scope.id = "picker_" + new Date().getTime();

				//计算组件位置信息
				$scope.posi = KyeeListPickerService.calcPosi();

				//存储当前所选的单选值
				$scope.currRadioValue = null;

				//设置默认值
				if($scope.title == undefined){
					$scope.title =  KyeeI18nService.get("commonText.pleaseSelectMsg","请选择");
				}
				if($scope.cancelText == undefined){
					$scope.cancelText = KyeeI18nService.get("commonText.cancelMsg","取消");
				}
				if($scope.okText == undefined){
					$scope.okText = KyeeI18nService.get("commonText.selectMsg","选择");
				}
				if($scope.height == undefined){
					$scope.height = 300;
				}
				if($scope.type == undefined){
					$scope.type = "radio";
				}
				if($scope.bottom == undefined){
					if(KyeeUtilsService.isPad()){
						$scope.bottom = "5";
					} else {
						$scope.bottom = "0";
					}
				}
				if($scope.hideMode == undefined){
					$scope.hideMode = "BUTTON";
				}

				if($scope.footerBar != undefined && $scope.footerBar != null && $scope.footerBar != ""){
					$scope.contentBottom = 64;
				} else {
					$scope.contentBottom = 3;
				}

				/**
				 * 显示选择器
				 */
				$scope.show = function(defaultValue){

					//设置默认值（单选模式）
					if($scope.type == "radio" && defaultValue != undefined){
						//延迟设置，以避免无法设置的问题
						KyeeUtilsService.delay({
							time : 200,
							action : function(){
								$scope.currRadioValue = defaultValue;
							}
						});
					}

					//设置默认值（多选模式）
					if($scope.type == "checkbox" && defaultValue != undefined && typeof defaultValue == "object"){

						for(var i in defaultValue){

							var value = defaultValue[i];

							for(var j in $scope.data){

								var item = $scope.data[j];

								if(item.value == value){

									item._kyee_checked = true;
									break;
								}
							}
						}
					}

					//将内容容器滚动到顶部
					$ionicScrollDelegate.$getByHandle("kyee_framework_picker_content").scrollTop();
					KyeeListPickerService.showPickerDom($scope.id);
				};

				/**
				 * 选项单击时事件
				 *
				 * @param type
				 * @param item
				 */
				$scope.itemClick = function(type, item){

					var me = this;

					if(type == "radio"){
						$scope.currRadioValue = item.value;

						if($scope.hideMode == "AUTO"){
							$scope.selectFinash({
								params : {
									item : KyeeListPickerService.getItemByValue($scope.data, item.value)
								}
							});
							me.cancel();
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

					if(type == "radio"){

						var value = $scope.currRadioValue;
						if(value == null){

							KyeeMessageService.broadcast({
								content : KyeeI18nService.get("commonText.pleaseSelOneTips","请选择一项")
							});
							return;
						}

						$scope.selectFinash({
							params : {
								item : KyeeListPickerService.getItemByValue($scope.data, value)
							}
						});
					}else if(type == "checkbox"){

						var selected = KyeeListPickerService.getSelectedCheckboxItems($scope.data);

						if(selected.length == 0){

							KyeeMessageService.broadcast({
								content : KyeeI18nService.get("commonText.pleasePickOneTips","请至少选择一项")
							});
							return;
						}

						$scope.selectFinash({
							params : {
								items : selected
							}
						});
					}

					me.cancel();
				},

				/**
				 * 取消
				 */
					$scope.cancel = function(){

						var me = this;

						//清空本次所选择的值
						$scope.currRadioValue = null;

						KyeeListPickerService.hidePickerDom($scope.id);
					};

				$scope.bind({
					params : $scope
				});
			}]
		};

		return def;
	}]);