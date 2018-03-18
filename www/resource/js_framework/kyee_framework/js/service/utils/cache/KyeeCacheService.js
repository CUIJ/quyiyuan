/**
 * 缓存管理服务
 *
 * 对于内存变量，使用全局变量存储，以便于在 AppConfig.SERVICE_BUS.http.default_params 中的函数可以使用
 */
var MEMORY_CACHE_STORE = {};
new KyeeModule()
	.group("kyee.framework.service.utils.cache.base")
	.type("service")
	.name("KyeeCacheService")
	.action(function(){
		
		var def = {

			/**
			 * 获得内存 cache 对象
			 *
			 * @returns {{set: Function, get: Function, getObj: Function, getAll: Function, clear: Function}}
			 */
			getMemoryCache : function(){

				var me = this;

				return {

					/**
					 * 设置值
					 *
					 * @param key
					 * @param value
					 */
					set : function(key, value){

						MEMORY_CACHE_STORE[key] = {
							value : value,
							timestamp : new Date().getTime()
						};
					},

					/**
					 * 属性变更
					 * <br/>
					 * 1.拓展属性（例如 timestamp 等）将会自动更新；
					 * 2.仅在值为 json 类型时可使用，
					 * 例如：
					 * {
					 *   key : info,
					 *   value : {
					 *     name : string,
					 *     age : integer
					 *   }
					 * }，
					 * 属性动态添加或修改可使用：
					 * apply(key, attr, value)
					 *
					 * @param key
					 * @param attr
					 * @param value
					 */
					apply : function(key, attr, value){

						var me = this;

						var obj = me.getObj(key);
						if(obj != null){
							obj.value[attr] = value;
						}
					},

					/**
					 * 获取值
					 *
					 * @param key
					 * @returns {*|$value|s}
					 */
					get : function(key){

						var record = MEMORY_CACHE_STORE[key];
						//不存在时为 undefined，移除后为 null
						if(record == undefined || record == null){
							return null;
						}

						return record.value;
					},

					/**
					 * 获取值得完整信息
					 *
					 * @param key
					 * @returns {*}
					 */
					getObj : function(key){

						return MEMORY_CACHE_STORE[key];
					},

					/**
					 * 移除元素
					 *
					 * @param key
					 */
					remove : function(key){

						MEMORY_CACHE_STORE[key] = null;
					},

					/**
					 * 获得所有值
					 *
					 * @returns {def.memoryCache|{}}
					 */
					getAll : function(){

						return MEMORY_CACHE_STORE;
					},

					/**
					 * 清空所有值
					 */
					clear : function(){

						MEMORY_CACHE_STORE = {};
					}
				}
			},

			/**
			 * 获取本地存储对象
			 *
			 * @returns {{set: Function, get: Function, getObj: Function, getAll: Function, clear: Function}}
			 */
			getStorageCache : function(){

				return {

					/**
					 * 设置值
					 *
					 * @param key
					 * @param value
					 */
					set : function(key, value){

						var me = this;

						var serializeObj = {
							value : value,
							timestamp : new Date().getTime()
						};

						localStorage.setItem(key, JSON.stringify(serializeObj));

						//开发模式下打印空间使用信息
						if(AppConfig.MODE == "DEV"){
							me.printInfo();
						}
					},

					/**
					 * 属性变更
					 * <br/>
					 * 1.拓展属性（例如 timestamp 等）将会自动更新；
					 * 2.仅在值为 json 类型时可使用，
					 * 例如：
					 * {
					 *   key : info,
					 *   value : {
					 *     name : string,
					 *     age : integer
					 *   }
					 * }，
					 * 属性动态添加或修改可使用：
					 * apply(key, attr, value)
					 *
					 * @param key
					 * @param attr
					 * @param value
					 */
					apply : function(key, attr, value){

						var me = this;

						var obj = me.getObj(key);
						if(obj != null){
							obj.value[attr] = value;
							me.set(key, obj.value);
						}
					},

					/**
					 * 获取值
					 *
					 * @param key
					 * @returns {*|$value|s}
					 */
					get : function(key){

						var serializeObj = localStorage.getItem(key);
						if(serializeObj != null){
							return JSON.parse(serializeObj).value;
						}
						return null;
					},

					/**
					 * 获取值得完整信息
					 *
					 * @param key
					 * @returns {*}
					 */
					getObj : function(key){

						var serializeObj = localStorage.getItem(key);
						if(serializeObj != null){
							return JSON.parse(serializeObj);
						}
						return null;
					},

					/**
					 * 移除元素
					 *
					 * @param key
					 */
					remove : function(key){

						localStorage.removeItem(key);
					},

					/**
					 * 清空所有值
					 */
					clear : function(){

						localStorage.clear();
					},

					/**
					 * 打印空间使用信息
					 * Chrome 默认 localStorage 空间大小为 5M
					 */
					printInfo  :function(){

						var me = this;

						var freeSpace = me.freeSpace();
						var info = "KyeeCacheService.getStorageCache：已使用空间 " + freeSpace + " KB, 总计 5M，使用比例 " + (freeSpace / (5 * 1024)).toFixed(2)*100 + " %";
						KyeeLogger.info(info);
					},

					/**
					 * 获取剩余空间（单位 KB）
					 *
					 * @returns {number}
					 */
					freeSpace : function(){

						var allStrings = '';
						for(var key in localStorage){
							if(localStorage.hasOwnProperty(key)){
								allStrings += localStorage[key];
							}
						}
						return allStrings ? (3 + ((allStrings.length * 16) / (8 * 1024))).toFixed(2) : 0;
					}
				}
			}
		};
		
		return def;
	})
	.build();