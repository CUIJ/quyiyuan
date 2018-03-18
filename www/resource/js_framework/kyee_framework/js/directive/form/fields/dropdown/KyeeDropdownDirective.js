/**
 * 下拉菜单组件
 */
angular.module("kyee.framework.directive.form.fields.dropdown", [])
	.directive("kyeeDropdownDirective", ["KyeeDropdownService", function(KyeeDropdownService) {

		var def = {
			scope: {
				"mode" : "@",
				"data" : "=",
				"offsetTop" : "@",
				"offsetLeft" : "@",
				"onSelectFinish" : "&"
			},
			replace: false,
			restrict: "A",
			controller : ["$scope", "$element", function($scope, $element){

				var me = this;

				//默认值
				if($scope.mode == undefined){
					$scope.mode = "radio";
				}
				if($scope.offsetTop == undefined){
					$scope.offsetTop = "0";
				}
				if($scope.offsetLeft == undefined){
					$scope.offsetLeft = "0";
				}

				//保存当前所选的 checkbox 列表
				//数据格式：{item.value : item}
				$scope.checkboxValues = {};

				//保存当前所选的 checkbox item 列表
				var checkboxItemsArr = [];

				//生成当前 combobox 的配置信息
				var id = "combobox_" + new Date().getTime();
				KyeeDropdownService.config[id] = {
					//唯一标示符
					//对应 dropmenu 的 id 命名规则为：id_dropmenu
					id : id,
					//是否编译
					isCompiled : false,
					//是否禁用失去焦点事件
					disableBlurEvent : false,
					//top 偏移量
					offsetTop : $scope.offsetTop,
					offsetLeft : $scope.offsetLeft,
					scope : $scope
				};

				//为该元素添加 id 以及事件
				$element.attr("id", id);
				$element.attr("onfocus", "onKyeeframeworkComboboxFocus(this.id)");
				$element.attr("onblur", "onKyeeframeworkComboboxBlur(this.id)");

				//定义 onfocus 事件
				KyeeDropdownService.initFocusEvent();

				//定义失去焦点事件
				KyeeDropdownService.initBlurEvent();

				//首次加载模板
				KyeeDropdownService.initTemplate(KyeeDropdownService.config[id]);

				/**
				 * 单击选择
				 *
				 * @param item
				 */
				$scope.selectItem = function(item){

					if($scope.mode == "radio"){

						$element.val(item.text);

						if($scope.onSelectFinish != undefined){
							$scope.onSelectFinish({
								params : {
									item : item
								}
							});
						}
					}else if($scope.mode == "checkbox"){

						KyeeDropdownService.config[id].disableBlurEvent = true;

						$scope.checkboxValues[item.value] = $scope.checkboxValues[item.value] == undefined ? item : undefined;

						var values = [];
						var valueStr = "";
						for(var key in $scope.checkboxValues){

							var _item = $scope.checkboxValues[key];
							if(_item != undefined){
								values.push(_item);

								valueStr += _item.text + ",";
							}
						}
						checkboxItemsArr = values;

						if(valueStr.length > 0){
							valueStr = valueStr.substring(0, valueStr.length - 1);
						}

						$element.val(valueStr);
					}
				};

				/**
				 * checkbox 模式下的选择完毕事件
				 */
				$scope.selectCheckboxFinish = function(){

					KyeeDropdownService.getDropdownEle(id + "_dropmenu").css("display", "none");

					if($scope.onSelectFinish != undefined){
						$scope.onSelectFinish({
							params : {
								items : checkboxItemsArr
							}
						});
					}

					//清空所选择的值
					$scope.checkboxValues = {};
				};
			}]
		};

		return def;
	}]);