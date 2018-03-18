angular.module("kyee.framework.directive.view.overlay", [])
	.directive("kyeeOverlayDirective", ["KyeeFrameworkConfig", "KyeeOverlayService", "KyeeUtilsService", function(KyeeFrameworkConfig, KyeeOverlayService, KyeeUtilsService) {

		var def = {
			scope: {
				//可取值：left,right,top,bottom,center
				location : "@",
				width : "@",
				height : "@",
				top : "@",
				left : "@",
				backdropTop : "@",
				backdropLeft : "@",
				//仅在使用 content 属性指定浮动框内容时此项才有意义
				contentBackgroundColor : "@",
				animate : "@",
				data : "=",
				//template 与 content 配置互斥
				template : "@",
				content : "=",
				//是否单击空白处可自动隐藏
				autoHide : "@",
				onHide : "&",
				bind : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/view/overlay/templates/overlay.html",
            replace: true,
            restrict: "A",
			controller : ["$scope", function($scope){

				//生成唯一标示符
				$scope.id = "picker_" + new Date().getTime();

				//默认居中显示
				if($scope.location == undefined){
					$scope.location = "center";
				}
				//默认启用动画
				if($scope.animate == undefined){
					$scope.animate = "true";
				}
				
				//默认遮罩层位置
				if($scope.backdropTop == undefined){
					$scope.backdropTop = 0;
				}
				if($scope.backdropLeft == undefined){
					$scope.backdropLeft = 0;
				}

				//默认背景色透明
				if($scope.contentBackgroundColor == undefined){
					$scope.contentBackgroundColor = "transparent";
				}

				if($scope.autoHide == undefined){
					$scope.autoHide = "true";
				}

				/**
				 * 显示
				 */
				$scope.show = function(){

					KyeeOverlayService.calcSizeAndPosition($scope);
					KyeeOverlayService.showOverlayDom($scope.id, $scope.location, $scope.animate);
				};

				/**
				 * 隐藏
				 */
				$scope.hide = function(){

					var me = this;

					if($scope.onHide != undefined){
						$scope.onHide();
					}

					KyeeOverlayService.hideOverlayDom($scope.id, $scope.location, $scope.animate);
				};

				/**
				 * 内部调用的隐藏方法
				 */
				$scope.innerHide = function(){

					var me = this;

					if($scope.autoHide != "true"){
						return;
					}

					$scope.hide();
				};

				/**
				 * 注册方法
				 *
				 * @param funcs
				 */
				$scope.regist = function(funcs){
					for(var name in funcs){
						$scope[name] = funcs[name];
					}
				};

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