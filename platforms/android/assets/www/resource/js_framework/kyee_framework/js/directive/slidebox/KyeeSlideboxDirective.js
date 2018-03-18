/**
 * 图片展示板指令
 * 属性：
 * 		speed : 播放速度（单位 ms）
 * 		basepath : 图片基础路径
 * 		images : 图片数据
 * 可用方法：
 * 		load(json) 加载新图片
 * 可用事件：
 * 		kyeeSlidebox.event.click : 单击事件
 */
angular.module("kyee.framework.directive.slidebox", ["ionic", "kyee.framework.config"])
	.directive("kyeeSlideboxDirective", ["$ionicSlideBoxDelegate", "KyeeFrameworkConfig", function($ionicSlideBoxDelegate, KyeeFrameworkConfig) {
		
		var def = {
			scope: {
				images : "=",
				speed : "@",
				itemclick : "&"
			},
            templateUrl: KyeeFrameworkConfig.KYEE_FRAMEWORK_BASE_PATH + "js/directive/slidebox/templates/slidebox.html", 
            replace: true,
            restrict: "A",
			init : function(){

				if(def.attrs.speed == undefined){
					def.attrs.speed = 5000;
				}

				def.registEvents();
				def.registMethods();
			},
			controller : ["$scope", function($scope){
				
				def.innerScope = $scope;
			}],
			link : function(scope, element, attrs){
				
				def.element = element;
				def.attrs = attrs;
				
				def.init(element, attrs);
			},
			registMethods : function(){
				
				def.innerScope.$on("kyeeSlidebox.load", def.methods.load);
				def.innerScope.click = def.methods.click;
			},
			methods : {
				
				//bug：当放到第二张时，再更新出现问题
				load : function(evt){

					$ionicSlideBoxDelegate.stop();
					$ionicSlideBoxDelegate.slide(0);
					$ionicSlideBoxDelegate.update();
					$ionicSlideBoxDelegate.start();
				},

				click : function(id){

					def.innerScope.itemclick({
						params : {
							index : $ionicSlideBoxDelegate.currentIndex(),
							id : id
						}
					});
				}
			},
			registEvents : function(){
			},
			events : {
			}
        };
		
		return def;
	}]);