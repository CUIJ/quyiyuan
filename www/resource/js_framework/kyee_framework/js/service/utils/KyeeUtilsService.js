/**
 * 工具类服务
 */
angular
	.module("kyee.framework.service.utils", [])
	.factory("KyeeUtilsService", ["$timeout", "$interval", "$sce", function($timeout, $interval, $sce){
		
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
				
				return $timeout(cfg.action, cfg.time);
			},

			/**
			 * 取消延迟执行器
			 *
			 * @param timer
			 */
			cancelDelay : function(timer){

				$timeout.cancel(timer);
			},

			/**
			 * 循环执行函数
			 *
			 * @param cfg
			 */
			interval : function(cfg){

				return $interval(cfg.action, cfg.time);
			},

			/**
			 * 取消循环定时器
			 *
			 * @param timer
			 */
			cancelInterval : function(timer){

				$interval.cancel(timer);
			},

			/**
			 * 条件定时器
			 *
			 * @param cfg{
			 * 	time : 循环判断时间（单位 ms）,
			 * 	conditionFunc : 延迟执行退出条件函数
			 * 	doFunc : 延迟执行函数
			 * }
			 */
			conditionInterval : function(cfg){

				if(cfg.conditionFunc()) {
					cfg.doFunc();
					return;
				}

				var timer = $interval(function() {
					if(cfg.conditionFunc()) {
						cfg.doFunc();
						$interval.cancel(timer);
					}
				}, cfg.time);
			},

			/**
			 * 获取浏览器可用区域大小
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
			 * 获取设备可用区域大小
			 *
			 * @returns {{width: Number, height: Number}}
			 */
			getInnerSizeForDevice : function(){

				var me = this;
				var innerSize = me.getInnerSize();

				if(window.device != undefined && ionic.Platform.platform() == "ios"){
					innerSize.height = innerSize.height  - 20;
				}

				return innerSize;
			},

			/**
			 * 判断当前设备是否是 PAD
			 * <br/>
			 * 假设屏幕宽度 >= 500 的，均为 PAD
			 *
			 * @returns {boolean}
			 */
			isPad : function(){

				var me = this;

				return me.getInnerSize().width >= 500;
			},

			/**
			 * 检查 JSON 是否包含语法错误
			 *
			 * @param jsonString
			 * @returns {boolean}
			 */
			isJSONError : function(jsonString){

				var checkResult = false;

				if(jsonString == undefined || jsonString == null || jsonString == ""){
					return checkResult;
				}

				try{

					//不要使用 var 声明，以免变量重复
					eval("kyee_json_test_result="+jsonString+";");

					checkResult = false;
				}catch(e){

					checkResult = true;
				}finally{

					return checkResult;
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
				 * @param pattern 格式化参数，例如：HH:mm:ss，如果不指定该参数，默认为 HH:mm（注意：HH 为 24 小时制，hh 为 12 小时制）
				 * @returns {*}
				 */
				getTime : function(pattern){

					if(pattern == undefined){
						pattern = "HH:mm";
					}

					return moment().format(pattern);
				},

				/**
				 * 获取当前日期时间
				 *
				 * @param pattern 格式化参数，例如：YYYY-MM-DD HH:mm:ss，如果不指定该参数，默认为 YYYY/MM/DD HH:mm（注意：HH 为 24 小时制，hh 为 12 小时制）
				 * @returns {*}
				 */
				getNow : function(pattern){

					if(pattern == undefined){
						pattern = "YYYY/MM/DD HH:mm";
					}

					return moment().format(pattern);
				},

				/**
				 * 日期格式化
				 *
				 * @param src 源日期字符串
				 * @param srcPattern 源日期格式（注意：HH 为 24 小时制，hh 为 12 小时制）
				 * @param targetPattern 目标日期格式（注意：HH 为 24 小时制，hh 为 12 小时制）
				 * @returns {*}
				 */
				formatFromString : function(src, srcPattern, targetPattern){

					return moment(src, srcPattern).format(targetPattern);
				},

				/**
				 * 日期格式化
				 *
				 * @param srcDate 源日期对象
				 * @param pattern 格式化参数（注意：HH 为 24 小时制，hh 为 12 小时制）
				 * @returns {*}
				 */
				formatFromDate : function(srcDate, pattern){

					return moment(srcDate).format(pattern);
				},

				/**
				 * 日期解析
				 *
				 * @param src 日期字符串
				 * @param pattern 格式化参数（注意：HH 为 24 小时制，hh 为 12 小时制）
				 * @returns {*}
				 */
				parse : function(src, pattern){

					return moment(src, pattern).toDate();
				}
			},

			/**
			 * 获取 url
			 * <br/>
			 * 此操作会对网址做安全检查
			 *
			 * @param url
			 * @returns {*}
			 */
			getUrl : function(url){

				return $sce.trustAsResourceUrl(url);
			},

			/**
			 * 安全类工具服务
			 */
			SecurityUtils : {

				/**
				 * md5 摘要算法
				 *
				 * @param str
				 * @returns {*}
				 */
				md5 : function(str){

					return MD5.encode(str);
				}
			},

			/**
			 * 构造 url
			 *
			 * @param url
			 * @param params
			 * @returns {*}
			 */
			buildUrl : function(url, params){

				var me = this;

				if (!params) return url;
				var parts = [];
				me._forEachSorted(params, function(value, key) {
					if (value === null || angular.isUndefined(value)) return;
					if (!angular.isArray(value)) value = [value];

					angular.forEach(value, function(v) {
						if (angular.isObject(v)) {
							if (angular.isDate(v)) {
								v = v.toISOString();
							} else {
								v = angular.toJson(v);
							}
						}
						parts.push(me._encodeUriQuery(key) + '=' +
							me._encodeUriQuery(v));
					});
				});
				if (parts.length > 0) {
					url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
				}
				return url;
			},

			_forEachSorted : function(obj, iterator, context){

				var me = this;

				var keys = me._sortedKeys(obj);
				for (var i = 0; i < keys.length; i++) {
					iterator.call(context, obj[keys[i]], keys[i]);
				}
				return keys;
			},

			_sortedKeys : function(obj) {
				return Object.keys(obj).sort();
			},

			_encodeUriQuery : function(val, pctEncodeSpaces) {
				return encodeURIComponent(val).
					replace(/%40/gi, '@').
					replace(/%3A/gi, ':').
					replace(/%24/g, '$').
					replace(/%2C/gi, ',').
					replace(/%3B/gi, ';').
					replace(/'/gi, '%27').
					replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
			},

			/**
			 * 退出应用程序
			 */
			exitApp : function(){

				if(ionic.Platform.platform() == "ios"){
					if(navigator.kyeeApp != undefined && navigator.kyeeApp != null){
						navigator.kyeeApp.exitApp();
					}
				}else{
					ionic.Platform.exitApp();
				}
			},

			/**
			 * 解析 url 的参数列表
			 *
			 * @param paramsStr 形如：name=Tom&age=21&...
			 * @returns {{}}
			 */
			parseUrlParams : function(paramsStr){

				var me = this;

				var params = {};
				if(paramsStr != undefined && paramsStr != null){

					var paramsArray = paramsStr.split("&");
					for(var i in paramsArray){

						var param = paramsArray[i];
						var paramValueArray = param.split("=");
						if(paramValueArray.length == 2){
							params[paramValueArray[0]] = paramValueArray[1];
						}
					}
				}

				return params;
			},

			/**
			 * 转换数字金额到大写中文金额
			 *
			 * @param money金额
			 */
			convertMoneyToChinese : function(money) {

				var cnNums = new Array("零","壹","贰","叁","肆","伍","陆","柒","捌","玖"); //汉字的数字
				var cnIntRadice = new Array("","拾","佰","仟"); //基本单位
				var cnIntUnits = new Array("","万","亿","兆"); //对应整数部分扩展单位
				var cnDecUnits = new Array("角","分","毫","厘"); //对应小数部分单位
				var cnInteger = "整"; //整数金额时后面跟的字符
				var cnIntLast = "元"; //整型完以后的单位
				var maxNum = 999999999999999; //最大处理的数字

				var integerNum; //金额整数部分
				var decimalNum; //金额小数部分
				var chineseStr = ""; //输出的中文金额字符串
				var parts; //分离金额后用的数组，预定义

				if (money == ""){
					return "";
				}

				money = parseFloat(money);

				if (isNaN(money)){
					return "输入不是一个数字";
				}

				if (money >= maxNum){
					return "超出最大处理数字";
				}

				if (money == 0){
					chineseStr = cnNums[0]+cnIntLast+cnInteger;
					return chineseStr;
				}

				//分别获取整数部分和小数部分
				money = money.toString(); //转换为字符串
				if (money.indexOf(".") == -1){
					integerNum = money;
					decimalNum = "";
				} else{
					parts = money.split(".");
					integerNum = parts[0];
					decimalNum = parts[1].substr(0,4);
				}

				//获取整型部分转换
				if (parseInt(integerNum,10) > 0){
					var zeroCount = 0;
					var intLen = integerNum.length;
					for (var i = 0; i < intLen; i++){
						var n = integerNum.substr(i,1);
						var p = intLen - i - 1;
						var q = p / 4;
						var m = p % 4;
						if (n == "0" ){
							zeroCount++;
						} else{
							if (zeroCount > 0 ){
								chineseStr += cnNums[0];
							}
							zeroCount = 0; //归零
							chineseStr += cnNums[parseInt(n)]+cnIntRadice[m];
						}
						if (m==0 && zeroCount<4 ){
							chineseStr += cnIntUnits[q];
						}
					}
					chineseStr += cnIntLast;
				}

				//获取小数部分转换
				if (decimalNum!= ""){
					var decLen = decimalNum.length;
					for (i=0; i<decLen; i++){
						n = decimalNum.substr(i,1);
						if (n != "0"){
							chineseStr += cnNums[Number(n)]+cnDecUnits[i];
						}
					}
				}

				//最后处理单位
				if (chineseStr == ""){
					chineseStr += cnNums[0]+cnIntLast+cnInteger;
				} else if (decimalNum == ""){
					chineseStr += cnInteger;
				}

				return chineseStr;
			}
		};
}]);