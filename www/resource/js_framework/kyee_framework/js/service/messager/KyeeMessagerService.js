/**
 * 通信服务
 */
angular
	.module("kyee.framework.service.messager", ["ionic", "kyee.framework.service.message", "kyee.framework.service.utils"])
	.factory("KyeeMessagerService", ["$http", "KyeeMessageService", "KyeeUtilsService", "$cacheFactory", "KyeeI18nService",function($http, KyeeMessageService, KyeeUtilsService, $cacheFactory, KyeeI18nService){
		
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

				//设置 post 请求默认 header 值
				$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";

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

				//如果 url 中包含双斜线，则替换为单斜线
				cfg.url = cfg.url.replace(/\/\//g,"/").replace("http:/","http://").replace("https:/","https://");

				//设置 timeout
				cfg.timeout = cfg.timeout == undefined ? 30000 : cfg.timeout

				//请求类型
				var type = cfg.type == undefined ? "POST" : cfg.type;

				//生产唯一 cache key（不包含动态函数参数）
				var cacheKey = cfg.url + "?params=" + JSON.stringify(cfg.params == undefined ? {} : cfg.params);

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
				}

				//本地加载无需显示加载提示
				if(cfg.showLoading != undefined && cfg.showLoading == true
					&& (cfg.url.indexOf("http://") != -1 || cfg.url.indexOf("https://") != -1)){

					//显示时间应 >= http timeout
					KyeeMessageService.loading({
						content : cfg.loadingText,
						mask : false,
						duration : cfg.timeout
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
					transformRequest: function(data){

						//对 POST 类型执行参数序列化
						if(type == "POST"){
							return KyeeUtilsService.buildUrl("", data).substring(1);
						}

						return data;
					},
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
					responseType : "text",
					timeout : cfg.timeout
				};

				//如果是 GET 请求，参数追加到 url 上，如果使用 POST 请求，使用 data 属性发送
				//注意，对于 get 类型请求，没有使用 angualr 中的 params 参数，因为需要操作最终的带参数的 url
				if(type == "GET"){

					config.url = KyeeUtilsService.buildUrl(cfg.url, cfg.params);
					config.urlParamsString = config.url.substring(config.url.indexOf("?") + 1);
				}else if(type == "POST"){

					config.data = cfg.params;
				}

				//执行 onBefore 方法
				if(cfg.onBefore != undefined){
					cfg.onBefore(config);
				}

				$http(config).success(function(data){

					//执行语法检查，以免服务器响应的 json 格式错误
					//仅当从服务器请求数据时启用语法检查，排除本地加载页面的情况
					if(cfg.responseSyntaxCheck == true && (cfg.url.indexOf("http://") != -1 || cfg.url.indexOf("https://") != -1)) {

						var isError = KyeeUtilsService.isJSONError(data);
						if (isError) {

							KyeeLogger.error("[KyeeMessagerService]:检测到服务器返回结果语法错误，已回调 onError 方法！");
							if (cfg.onError != undefined) {
								cfg.onError("RESPONSE_SYNTAX_ERROR");
							}
							return;
						}
					}

					//注意：
					//由于 angular 调用了 JSON.parse 执行 json 反序列化，
					//JSON.parse 要求 key 必须使用双引号，因此统一采用 text 处理，然后在 onSuccess 中执行类型转换
					var _data = data;
					//responseType 默认值为 text

                    if(cfg.responseType != undefined && cfg.responseType == "json"){
                        if(data){
                            eval("var result=" + data + ";");
                            _data = result;
                        }else{
                            _data = "";
                        }
                    }

					//如果配置缓存策略，则将此次结果存入缓存
					if(cfg.cache != undefined){

						var isNext = true;
						if(cfg.onBeforeCache != undefined){

							isNext = cfg.onBeforeCache(_data);
						}

						if(isNext){

							//将返回结果存入缓存
							me.httpCache.put(cacheKey, {
								timestamp : new Date().getTime(),
								hit : 0,
								//注意使用深拷贝
								data : angular.copy(_data)
							});
						}
					}

					//本地加载不会显示加载提示
					if(cfg.showLoading != undefined && cfg.showLoading == true && cfg.autoHideLoading != false
						&& (cfg.url.indexOf("http://") != -1 || cfg.url.indexOf("https://") != -1)){

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
					content : cfg.errorText == undefined ?
						KyeeI18nService.get("commonText.httpErrTips","加载失败，似乎网络出问题了！" ) : cfg.errorText,
					duration : 2000
				});

				if(cfg.onError != undefined){
					cfg.onError("NETWORK_ERROR");
				}
			}
		};

		return def;
}]);