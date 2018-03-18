/**
 * 通信服务
 */
angular
	.module("kyee.framework.service.messager", ["ionic", "kyee.framework.service.message", "kyee.framework.service.utils"])
	.factory("KyeeMessagerService", ["$http", "KyeeMessageService", "KyeeUtilsService", "$cacheFactory", function($http, KyeeMessageService, KyeeUtilsService, $cacheFactory){
		
		var def= {

			//记录 init() 方法是否曾执行
			isInit : false,

			//http 缓存池
			httpCache : null,

			//默认 http 缓存池大小
			DEFAULT_HTTP_CACHE_SIZE : 500,

			/**
			 * 初始化
			 *
			 * 应用程序生命周期中仅需要执行一次
			 */
			init : function(){

				var me = this;

				//设置 $http 请求中，对于 POST 请求默认设置属性，否则会使用 payload
				$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

				//初始化 http 缓存池
				me.httpCache = $cacheFactory("kyee.http.cache", {capacity: me.DEFAULT_HTTP_CACHE_SIZE});

				me.isInit = true;
			},

			/**
			 * 发送请求
			 *
			 * @param cfg{
			 * 	type : 请求类型（GET,POST）,
			 * 	onSuccess : 成功后的回调函数
			 * }
			 */
			send : function(cfg){

				var me = this;

				//应用周期中仅执行一次初始化操作
				if(!me.isInit){
					me.init();
				}

				//请求类型
				var type = cfg.type == undefined ? "POST" : cfg.type;
				//请求参数
				var params = cfg.params == undefined ? {} : cfg.params;
				//生产唯一 cache key
				var cacheKey = cfg.url + "?params=" + JSON.stringify(params);

				//如果配置缓存策略，则优先从缓存中取
				if(cfg.cache != undefined){

					var by = cfg.cache.by;
					var value = cfg.cache.value;

					var cacheObj = me.httpCache.get(cacheKey);
					if(cacheObj != undefined){

						var hit = cacheObj.hit;
						var timestamp = cacheObj.timestamp;

						//按数目策略控制
						if(by == "HIT" && hit < value){

							cacheObj.hit ++;
							cfg.onSuccess(cacheObj.data);
							return;
						}

						//按时间策略控制
						if(by == "TIME" && (new Date().getTime() - timestamp <= value * 1000)){

							cfg.onSuccess(cacheObj.data);
							return;
						}

						//一次策略
						if(by == "ONCE"){

							cfg.onSuccess(cacheObj.data);
							return;
						}
					}
				}else{

					KyeeLogger.info("温馨提示：亲，需要每次都请求服务器吗？（URL=" + cfg.url + "）");
				}

				//本地加载无需显示加载提示
				if(cfg.showLoading != undefined && cfg.showLoading == true && cfg.url.indexOf("http://") != -1){

					KyeeMessageService.loading({
						content : cfg.loadingText == undefined ? "正在加载，请稍后..." : cfg.loadingText,
						mask : false
					});
				}

				//解析参数值为函数类型的参数
				if(cfg.params != undefined){

					for(var name in cfg.params){

						if(typeof cfg.params[name] == "function"){

							cfg.params[name] = cfg.params[name]();
						}
					}
				}

				//http 配置对象
				var config = {
					method : type,
					url : cfg.url,
					//注意：
					//由于 angular 调用了 JSON.parse 执行 json 反序列化，
					//JSON.parse 要求 key 必须使用双引号，因此统一采用 text 处理，然后在 onSuccess 中执行类型转换
					//使用 transformResponse 函数要求 angular 不要对 response 做任何处理，直接返回字符串
					transformResponse : function(data){
						return data;
					},
					//注意：
					//由于 angular 调用了 JSON.parse 执行 json 反序列化，
					//JSON.parse 要求 key 必须使用双引号，因此统一采用 text 处理，然后在 onSuccess 中执行类型转换
					responseType : "text"
				};

				//如果是 GET 请求，参数追加到 url 上，使用 parmas 参数，如果使用 POST 请求，使用 data 属性发送
				if(type == "GET"){
					config.params = params;
				}else if(type == "POST"){
					config.data = params;
					config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
				}

				$http(config).success(function(data){

					//注意：
					//由于 angular 调用了 JSON.parse 执行 json 反序列化，
					//JSON.parse 要求 key 必须使用双引号，因此统一采用 text 处理，然后在 onSuccess 中执行类型转换
					var _data = data;
					//responseType 默认值为 text
					if(cfg.responseType != undefined && cfg.responseType == "json"){
						eval("var result=" + data + ";");
						_data = result;
					}

					//如果配置缓存策略，则优先从缓存中取
					if(cfg.cache != undefined){

						//将返回结果存入缓存
						me.httpCache.put(cacheKey, {
							timestamp : new Date().getTime(),
							hit : 0,
							data : _data
						});
					}

					//本地加载不会显示加载提示
					if(cfg.showLoading != undefined && cfg.showLoading == true && cfg.autoHideLoading != false && cfg.url.indexOf("http://") != -1){
						KyeeMessageService.hideLoading();
					}

					if(cfg.onSuccess != undefined){

						cfg.onSuccess(_data);
					}
				}).error(function(){

					if(cfg.showLoading != undefined && cfg.showLoading == true){

						//隐藏加载框 500 ms后显示错误信息
						KyeeMessageService.hideLoading();
						KyeeUtilsService.delay({
							time : 500,
							action  :function(){
								me._onSendError(cfg);
							}
						});
					}else{

						me._onSendError(cfg);
					}
				});
			},

			/**
			 * 错误回调方法
			 *
			 * @param cfg
			 * @private
			 */
			_onSendError : function(cfg){

				KyeeMessageService.broadcast({
					content : cfg.errorText == undefined ? "糟糕，加载失败，似乎网络出问题了！" : cfg.errorText
				});

				if(cfg.onError != undefined){
					cfg.onError();
				}
			}
		};

		return def;
}]);