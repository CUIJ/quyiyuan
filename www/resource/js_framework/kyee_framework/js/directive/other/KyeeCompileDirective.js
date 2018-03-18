/**
 * 延迟加载指令
 * 属性：
 * 		loadingStyle : 是否显示加载提示
 * 		template : 待加载的模板路径
 * 		delay : 延迟加载事件（默认 1500 ms）
 * 可用方法：
 * 		无
 * 可用事件：
 * 		无
 */
angular.module("kyee.framework.directive.compile", ["ngSanitize", "kyee.framework.service.utils", "kyee.framework.service.messager"])
	.directive("kyeeCompileDirective", ["$compile", "KyeeMessagerService", "KyeeUtilsService", function ($compile, KyeeMessagerService, KyeeUtilsService) {
		
		return function(scope, element, attrs){
			
			//是否显示加载提示
			//默认不要显示此提示
			if (attrs.showLoading == "true") {
				
				element.html("<div style='text-align: center;" + (attrs.loadingStyle == undefined ? "" : attrs.loadingStyle) + "'>" + (attrs.loadingContent == undefined ? "<ion-spinner icon='dots' class='spinner-dark'></ion-spinner>" : attrs.loadingContent) + "</div>");
				$compile(element.contents())(scope);
			}
			
			KyeeUtilsService.delay({
				time : attrs.delay == undefined ? 1000 : parseInt(attrs.delay),
				action :  function(){
					
					//bind 和 template 配置互斥，如果两个都配置，则优先使用 template
					if (attrs.template != undefined) {

						KyeeMessagerService.send({
							type : "GET",
							url : attrs.template,
							onSuccess : function(data){
								
								element.html(data);
								$compile(element.contents())(scope);
							}
						});
						
					}else{
						
						element.html(scope.$eval(attrs.bind));
						$compile(element.contents())(scope);
					}
				}
			});
		};
	}]);