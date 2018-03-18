/**
 * http 服务总线
 * <br/>
 * 完整用法：
 * <br/>
 * HttpServiceBus.connect({
 *     url : "/area/action/AreaHospitalActionImplC.jspx",
 *     params : {
 *     		op : "queryProvince",
 *     		...
 *     },
 *     //参数擦除器，将会擦除所有配置的参数
 *     paramsWiper : ["xxx", ...],
 *     showLoading : true,
 *     autoHideLoading : false,
 *     //缓存策略，分为三种，分别为：TIME（根据时间）,HIT（击中次数）,ONCE（仅加载一次）
 *     //配置形如：cache : {by : "TIME", value : 60} | {by : "HIE", value : 10} | {by : "ONCE"}
 *     cache : {
 *     		by : "TIME",
 *     		value : 60
 *     },
 *     onBefore : function(config){},
 *     onSuccess : function(data){},
 *     onError : function(type){}
 * });
 */
new KyeeModule()
	.group("kyee.quyiyuan.service_bus.http")
	.require(["kyee.framework.service.messager", "kyee.quyiyuan.service_bus.http.service"])
	.type("service")
	.name("HttpServiceBus")
	.params(["HttpServiceBusService", "KyeeMessagerService","CacheServiceBus"])
	.action(function(HttpServiceBusService, KyeeMessagerService,CacheServiceBus){
		
		var def = {

			SHOW_LOADING_MODE : "NORMAL",

			/**
			 * 连接服务器
			 *
			 * @param cfg
			 */
			connect : function(cfg) {

				var me = this;

				//设置全局加载提示
				if (["NONE", "ALWAYS"].indexOf(me.SHOW_LOADING_MODE) != -1) {
					cfg.showLoading = me.SHOW_LOADING_MODE == "ALWAYS";
				}

				KyeeMessagerService.send({
					//默认使用 GET 请求
					type: cfg.type == undefined ? "GET" : cfg.type,
					url: HttpServiceBusService.parseUrl(cfg.url),
					cache: cfg.cache, //无需判断 undefined 情况
					showLoading: cfg.showLoading == undefined ? true : cfg.showLoading,
					autoHideLoading: cfg.autoHideLoading == undefined ? true : cfg.autoHideLoading,
					params: HttpServiceBusService.prepareParams(cfg),
					responseType: "json",
					responseSyntaxCheck: true,
					timeout: cfg.timeout,  //如果 cfg.timeout 没有定义，则使用框架默认值
					onBeforeCache : function(data){

						var isNext = true;
						if(cfg.onBeforeCache != undefined){
							isNext = cfg.onBeforeCache(data);
						}
						if(!isNext){
							return false;
						}

						return HttpServiceBusService.doDefaultBeforeCacheAction(data);
					},
					onBefore: function (config) {

						//对于 get 方式的请求，生成数据完整性校验的字段
						if (config.method == "GET") {

							config.url += "&QY_CHECK_SUFFIX=" + HttpServiceBusService.generateFullCheckCode4GET(config);
						}else if(config.method == "POST"){

							config.data.QY_CHECK_SUFFIX = HttpServiceBusService.generateFullCheckCode4POST(config);
						}

						if (cfg.onBefore != undefined) {
							cfg.onBefore(config);
						}
					},
					onSuccess: function (resp) {
						//wangwan
						if(resp&&resp!=undefined&&resp!=''&&resp!=null&&resp.time!=undefined&&resp.time!=''&&resp.time!=null){
							CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.SERVER_TIME,resp.time);
						}
						//执行请求过滤
						HttpServiceBusService.filter(resp, function () {

							if (cfg.onSuccess != undefined) {
								cfg.onSuccess(resp);
							}
						}, function(){

							if (cfg.onError != undefined) {
								cfg.onError(resp);
							}
						});
					},
					onError: function (type) {

						if (cfg.onError != undefined) {
							cfg.onError(type);
						}
					}
				});
			},

			/**
			 * 设置全局加载提示模式
			 * <br/>
			 * 可取值为：
			 * NORMAL、NONE、ALWAYS，
			 * 其中：
			 * NORMAL 为按照调用者配置执行；
			 * NONE 为所有请求没有提示，
			 * ALWAYS 为所有请求均有提示
			 */
			setShowLoadingMode : function(mode){

				var me = this;

				me.SHOW_LOADING_MODE = mode;
			}
		};
		
		return def;
	})
	.build();