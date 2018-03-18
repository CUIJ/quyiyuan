/**
 * 全局配置文件
 */
angular.module("kyee.framework.config", [])
	.factory("KyeeFrameworkConfig", [function() {
		
		var def = {
			
			/**
			 * 框架基础路径
			 * 必须添加最后的分隔符
			 */
			KYEE_FRAMEWORK_BASE_PATH : "resource/js_framework/kyee_framework/"
		};
		
		return def;
	}]);