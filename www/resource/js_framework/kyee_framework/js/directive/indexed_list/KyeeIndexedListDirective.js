/**
 * 索引列表
 */
angular.module("kyee.framework.directive.indexed_list", ["kyee.framework.config"])
	.directive("kyeeIndexedListDirective", ["KyeeFrameworkConfig", "KyeeUtilsService", "KyeeIndexedListService", function(KyeeFrameworkConfig, KyeeUtilsService, KyeeIndexedListService) {

		var def = {
			scope: {
				bind : "&",
				data : "=",
				itemclick : "&",
				emptyText : "@",
				height : "@",
				//items 排序器
				itemsComparator : "&"
			},
			replace: true,
			restrict: "A",
			templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/indexed_list/templates/indexed_list.html",
			controller : ["$scope", function($scope){

				var me = this;
                $scope.maxWidth = KyeeUtilsService.getInnerSize().width-66+'px';
				//默认不显示空提示
				$scope.isEmpty = false;

				//索引列表中每个字母的高度
				$scope.wordHeight = (KyeeUtilsService.getInnerSize().height - 50) / 26 - 2;

				//数据按照分组排序
				if($scope.data != undefined){

					$scope.data = $scope.data.sort(function(a, b){

						return a.group.charCodeAt() - b.group.charCodeAt();
					});

					//应用 items 排序器
					if($scope.itemsComparator != undefined && $scope.itemsComparator != null){

						for(var i in  $scope.data){

							var items = $scope.data[i].items;
							$scope.data[i].items = items.sort(function(a, b){

								return $scope.itemsComparator({
									params : {
										previous : a,
										next : b
									}
								});
							});
						}
					}
				}

				/**
				 * 列表项目单击时
				 *
				 * @param item
				 */
				$scope.doItemClick = function(item){

					$scope.itemclick({
						params : {
							item : item
						}
					});
				};

				/**
				 * 搜索
				 *
				 * @param keywords
				 */
				$scope.search = function(keywords){

					//显示全部数据
					if(keywords == undefined || keywords == ""){
						keywords = "";
					}

					for(var i in $scope.data){

						var group = $scope.data[i];

						for(var j in group.items){

							var item = group.items[j];

							//使用正则表达式模式匹配全拼或简拼
							var regExpress = "";
							for(var i = 0; i < keywords.length; i ++){

								regExpress += keywords.charAt(i) + ".*";
							}

							var reg = new RegExp(regExpress.toUpperCase());
							if(reg.test(item.pinyin.toUpperCase()) || item.text.indexOf(keywords) != -1){

								//保留此条目
								group.items[j].isDeleted = false;
							}else{

								//删除此条目
								group.items[j].isDeleted = true;
							}
						}
					}

					var deletedGroupCount = 0;
					for(var i in $scope.data){

						var group = $scope.data[i];

						var deletedCount = 0;
						for(var j in group.items){

							var item = group.items[j];

							if(item.isDeleted != undefined && item.isDeleted == true){

								deletedCount ++;
							}
						}

						if(deletedCount == group.items.length){

							group.isDeleted = true;
							deletedGroupCount ++;
						}else{
							group.isDeleted = false;
						}
					}

					//控制是否显示空提示
					$scope.isEmpty = deletedGroupCount == $scope.data.length;
				};

				$scope.doIndexedBarClick = function(evt){
					KyeeIndexedListService.doIndexedBarClick(evt, $scope.wordHeight);
				};

				$scope.doIndexedBarDrag = function(evt){
					KyeeIndexedListService.doIndexedBarDrag(evt, $scope.wordHeight)
				};

				$scope.doIndexedBarRelease = KyeeIndexedListService.doIndexedBarRelease;

				//重新生成分组映射
				$scope.$watch("data", function(newVal, oldVal){

					if(newVal != undefined){

						KyeeIndexedListService.groupCountMapping = {};

						//记录之前分组的所有条目之和
						var itemsCount = 0;
						for(var i in newVal){

							var group = newVal[i];
							KyeeIndexedListService.groupCountMapping[group.group] = {
								upItemsCount : itemsCount,
								groupCount : i
							};
							itemsCount += group.items.length;
						}
					}
				}, false);

				/**
				 * 作用域绑定
				 */
				$scope.bind({
					params : $scope
				});
			}]
		};

		return def;
	}]);