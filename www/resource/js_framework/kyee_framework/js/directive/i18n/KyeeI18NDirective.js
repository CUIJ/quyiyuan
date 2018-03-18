angular.module("kyee.framework.directive.i18n", ["ngSanitize"])
	.directive("kyeeI18nDirective", ["$state", "$compile", "KyeeFrameworkConfig", "KyeeI18nService", "$rootScope", function($state, $compile, KyeeFrameworkConfig, KyeeI18nService, $rootScope) {

		var def = {
			scope: {
				//编码
				//支持 all: 表达式，如果包含 all:，则使用全路径搜索，如果不包含，则使用当前路由 + code 的形式搜索
				//如果不配置此项，则仅应用 lookAndFeel（如果存在）
				code : "@",
				//默认值
				default : "@",
				//占位符值列表，例如：我叫{{name}}，我{{age}}岁了
				//values 值为 $scope 中的 map 类型的值
				params : "="
			},
			//保留原有元素
            replace: false,
            restrict: "A",
			link : function(scope, element, attrs){

				var code = scope.code;

				//如果不配置 code，则仅应用 lookAndFeel（如果存在）
				if(code != undefined){

					var key = null;
					if(code.indexOf("all:") != -1){
						//全路径
						key = code.replace("all:", "");
					}else{
						//使用当前路由 + code 作为 key
						key = $state.current.name + "." + code;
					}

					element.removeAttr("kyee-i18n-directive");
					element.removeAttr("code");
					element.removeAttr("default");
					element.removeAttr("params");
					element.removeAttr("ng-if");
					element.removeAttr("ng-show");
					element.removeAttr("ng-hide");
					element.addClass("{{$root.lookAndFeel}}");
					element.attr({
						"translate" : key,
						"translate-default" : scope.default,
						"translate-values" : "{{params}}"
					});

					$compile(element)(scope);
				} else {

					element.removeAttr("kyee-i18n-directive");
					element.addClass($rootScope.lookAndFeel);
				}

			}
        };
		return def;
	}]);