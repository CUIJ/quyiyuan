angular.module("kyee.framework.directive.slidebox.slidebox_image", ["ionic", "kyee.framework.config"])
	.directive("kyeeSlideboxImageDirective", ["$ionicScrollDelegate", "$location", "KyeeFrameworkConfig", "KyeeUtilsService", function($ionicScrollDelegate, $location, KyeeFrameworkConfig, KyeeUtilsService) {
		
		var def = {
			scope: {
				width : "@",
				height : "@",
				images : "=",
				speed : "@",
				isSetHash: "@",
				itemclick : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/slidebox/slidebox_image/templates/slidebox_image.html",
            replace: true,
            restrict: "A",
			controller : ["$scope","$state", function($scope, $state){

				//生成 id
				$scope.id = "kyee_framework_slidebox_image_" + new Date().getTime();

				//初始化滚动速度
				if($scope.speed == undefined){
					$scope.speed = 5000;
				}
				// 是否设置location.hash, 默认为true
				var isSetHash = ($scope.isSetHash !== "false");

				if($scope.width == undefined){
					$scope.width = "100%";
					isSetHash = true; // isSetHash为false时必须设置width的具体值
				}else{
					var offset = $scope.width;
				}
				if($scope.height == undefined){
					$scope.height = "150px";
				}

				var canSlide = true;

				$scope.$on("kyee.slideboxImageStop", function() {
					canSlide = false;
				});

				$scope.$on("kyee.slideboxImageBegin", function() {
					setTimeout(function(){
						canSlide = true;
					},2000);
				});

				//开启定时器
				var currImgIdx = 1;//下一个开始的图片为第 2 个
				var pImgIdx = 0;
				var isContinue = true;
				var currPosition = 0;
				var nextPosition = 0;

				setInterval(function(){

					if(!isContinue || !canSlide){
						return;
					}

					if(isSetHash){
						location.hash="#/" + $state.current.name + "#"+ $scope.id + "_" + currImgIdx;
						$ionicScrollDelegate.$getByHandle($scope.id).anchorScroll(true);
						if(currImgIdx >= $scope.images.length - 1){
							pImgIdx = $scope.images.length - 1;
							currImgIdx = 0;
						}else{
							pImgIdx = currImgIdx;
							currImgIdx ++;
						}
					} else {
						currPosition = $ionicScrollDelegate.$getByHandle($scope.id).getScrollPosition().left;
						currImgIdx = currPosition/offset;

						if(currImgIdx < $scope.images.length - 1){
							nextPosition = (currImgIdx+1)*offset;
							$ionicScrollDelegate.$getByHandle($scope.id).scrollTo(nextPosition, 0, true);
						}else{
							$ionicScrollDelegate.$getByHandle($scope.id).scrollTop();
						}
					}

				}, $scope.speed);

				/**
				 * 更新
				 */
				$scope.update = function(){

					$ionicScrollDelegate.$getByHandle($scope.id).scrollTop();
				};

				/**
				 * 播放
				 */
				$scope.play = function(){

					isContinue = true;
				};

				/**
				 * 停止播放
				 */
				$scope.stop = function(){

					isContinue = false;
				};

				/**
				 * 图片单击时
				 *
				 * @param item
				 */
				$scope.onImageClick = function(item){

					$scope.itemclick({
						params : {
							item : item
						}
					});
				};

				/**
				 * 去掉滚动容器的默认阻止事件，可以让容器的内部滚动触发外部滚动
				 */
				KyeeUtilsService.delay({
					
					action: function () {
						
						var sv = $ionicScrollDelegate.$getByHandle($scope.id).getScrollView();
						var container = sv.__container;

						if(container != undefined && container != null){
							
							var originaltouchStart = sv.touchStart;
							var originaltouchMove = sv.touchMove;

							container.removeEventListener("touchstart", sv.touchStart);
							document.removeEventListener("touchmove", sv.touchMove);

							sv.touchStart = function(e) {
								e.preventDefault = function(){};
								originaltouchStart.apply(sv, [e]);
							};

							sv.touchMove = function(e) {
								e.preventDefault = function(){};
								originaltouchMove.apply(sv, [e]);
							};
							
							container.addEventListener("touchstart", sv.touchStart, false);
							document.addEventListener("touchmove", sv.touchMove, false);
						}
					},
					time: 500
				});
				
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