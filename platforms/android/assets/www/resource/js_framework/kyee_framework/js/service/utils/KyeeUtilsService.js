/**
 * 工具类服务
 */
angular
	.module("kyee.framework.service.utils", [])
	.factory("KyeeUtilsService", ["$timeout", function($timeout){
		
		return {

			/**
			 * 延迟执行函数
			 *
			 * @param cfg{
			 * 	time : 延迟时间（单位 ms）,
			 * 	do : 延迟执行函数
			 * }
			 */
			delay : function(cfg){
				
				$timeout(cfg.action, cfg.time);
			},

			/**
			 * 获取浏览器可视区域大小
			 *
			 * @returns {{width: Number, height: Number}}
			 */
			getInnerSize : function(){

				return {
					width : window.innerWidth,
					height : window.innerHeight
				}
			},

			/**
			 * 获取日期工具
			 *
			 * @returns {{}}
			 */
			DateUtils : {

				/**
				 * 获取当前日期
				 *
				 * @param pattern 格式化参数，例如：YYYY-MM-DD，如果不指定该参数，默认为 YYYY/MM/DD
				 * @returns {*}
				 */
				getDate : function(pattern){

					if(pattern == undefined){
						pattern = "YYYY/MM/DD";
					}

					return moment().format(pattern);
				},

				/**
				 * 获取当前时间
				 *
				 * @param pattern 格式化参数，例如：hh:mm:ss，如果不指定该参数，默认为 hh:mm
				 * @returns {*}
				 */
				getTime : function(pattern){

					if(pattern == undefined){
						pattern = "hh:mm";
					}

					return moment().format(pattern);
				},

				/**
				 * 获取当前日期时间
				 *
				 * @param pattern 格式化参数，例如：YYYY-MM-DD hh:mm:ss，如果不指定该参数，默认为 YYYY/MM/DD hh:mm
				 * @returns {*}
				 */
				getNow : function(pattern){

					if(pattern == undefined){
						pattern = "YYYY/MM/DD hh:mm";
					}

					return moment().format(pattern);
				},

				/**
				 * 日期格式化
				 *
				 * @param src 源日期字符串
				 * @param srcPattern 源日期格式
				 * @param targetPattern 目标日期格式
				 * @returns {*}
				 */
				formatFromString : function(src, srcPattern, targetPattern){

					return moment(src, srcPattern).format(targetPattern);
				},

				/**
				 * 日期格式化
				 *
				 * @param srcDate 源日期对象
				 * @param pattern 格式化参数
				 * @returns {*}
				 */
				formatFromDate : function(srcDate, pattern){

					return moment(srcDate).format(pattern);
				},

				/**
				 * 日期解析
				 *
				 * @param src 日期字符串
				 * @param pattern 格式化参数
				 * @returns {*}
				 */
				parse : function(src, pattern){

					return moment(src, pattern).toDate();
				}
			}
		};
}]);