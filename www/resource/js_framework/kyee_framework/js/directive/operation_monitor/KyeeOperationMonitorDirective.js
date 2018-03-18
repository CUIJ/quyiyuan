/**
 * 用户操作监控指令
 */
angular.module("kyee.framework.directive.operation_monitor", ["ngSanitize"])
	.directive("kyeeOperationMonitorDirective", ["$compile", "KyeeOperationMonitorService", "$state", function($compile, KyeeOperationMonitorService, $state) {

		var def = {
			restrict : "A",
			link : function(scope, element, attrs){

				//监控器全称
				var monitor = "$root." + KyeeOperationMonitorService.monitorServiceName
					+ "." + KyeeOperationMonitorService.monitorMethodName;

				var pageCode =$state.current.name;
				var elementCode = attrs.kyeeOperationMonitorDirective;
				var immediate = attrs.immediate;

				if(immediate == "true"){
					attrs.$set("ngClick", monitor +"('"+ elementCode +"', '"+ pageCode +"', true)");
				} else {
					attrs.$set("ngClick", monitor +"('"+ elementCode +"', '"+ pageCode +"', false)");
				}

				element.removeAttr("kyee-operation-monitor-directive");
				element.removeAttr("immediate");
				element.removeAttr("ng-if");
				element.removeAttr("ng-repeat");
				$compile(element)(scope);
			}
		};
		return def;
	}]);