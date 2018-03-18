var AppConfig = {

    //版本号
    VERSION: DeploymentConfig.VERSION,

    //分支版本号
    //00:核心版本；01:114家；02:福建12320；03：我家亳州；04：健康河北；05：乐健康；
    BRANCH_VERSION: DeploymentConfig.BRANCH_VER_CODE,

    //服务端地址注册表
    //开发库：http://kyeexian.oicp.net:8088/APP/
    //测试库：http://115.28.131.22/APP/
    //发布库：http://115.28.175.236/APP/
    //正式库：http://app.quyiyuan.com:8888/APP/
    SERVER_URL_REGISTRY: DeploymentConfig.SERVER_URL_REGISTRY,

    //默认的主服务器地址
    SERVER_URL: DeploymentConfig.SERVER_URL_REGISTRY.default,

    //服务总线配置
    SERVICE_BUS: {
        http: {
            //默认参数
            default_params: {
                loc: "c",
                opVersion: DeploymentConfig.VERSION,
                //预约来源
                APPOINT_SOURCE:function(){
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var appointSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                    if(appointSource!=null){
                        return appointSource;
                    }else{
                        return "0";
                    }
                },
                //以下为临时参数
                isLogin: function () {
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    return memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN);
                },
                operateCurrent_UserId: function(){
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                    if(currentUserRecord){
                        return currentUserRecord.USER_ID;
                    }
                    return null;
                },
                operateUserSource: function(){//用户来源参数【***】
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var currentUserSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                    if(currentUserSource!=null){
                        return currentUserSource;
                    }else{
                        return "0";
                    }
                },
                hospitalID: function () {

                    //获取 StorageCache 服务
                    var storageCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getStorageCache();
                    var hospitalInfo = storageCache.get("hospitalInfo");

                    if (hospitalInfo != null) {

                        return hospitalInfo.id;
                    }

                    return null;
                },
                USER_ID : function(){
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                    if(currentUserRecord){
                        return currentUserRecord.USER_ID;
                    }
                    return null;
                },
                USER_VS_ID : function(){
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var currentCustomPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    if(currentCustomPatient){
                        return currentCustomPatient.USER_VS_ID;
                    }
                    return null;
                },
                APP_UUID : function(){
                    var storageCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getStorageCache();
                    return storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.APP_UUID);
                },
                CHANNEL_ID : function(){
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var channelId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CHANNEL_ID);
                    if(channelId == undefined && channelId == null){
                        return "";
                    }
                    return channelId;
                },
                PHONETYPE : function() {
                    if (window.device && window.device.model) {
                        return window.device.model;
                    } else {
                        return "";
                    }
                },
                PHONEVERSIONNUM : function() {
                    if (window.device && window.device.version) {
                        return window.device.version;
                    } else {
                        return "";
                    }
                },
                PHONEOPERATINGSYS : function() {
                    if (window.device && window.device.platform) {
                        if (window.device.platform == "Android") {
                            return "1";
                        } else if (window.device.platform == "iOS") {
                            return "2";
                        } else {
                            return "0";
                        }
                    } else {
                        return "0";
                    }
                },
                PUBLIC_SERVICE_TYPE:function(){
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var publicServiceType = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
                    return publicServiceType;
                },
                //增加移动设备唯一标识。android设备可能为：IMEI，MEID或者ESN码。ios设备为：identity_id      KYEEAPPC-3164  张明
                IMEI_ID:function(){
                    if (window.device && window.device.uuid) {
                        return window.device.uuid;
                    } else {
                        return "";
                    }
                },
                LANG_TYPE:function(){
                    var langType = localStorage.getItem(CACHE_CONSTANTS.STORAGE_CACHE.LANG_TYPE);
                    
                    if (langType) {
                        return langType;
                    } else {
                        return null;
                    }
                },
                CHECK_USER:function(){
                    var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                    var checkUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CHECK_USER);
                    if (checkUser) {
                        return checkUser;
                    }
                }
            }
        }
    },

    //当前模式，可取值为 DEV、DEPLOYMENT
    //如果为 DEV，则部分辅助开发功能会打开，例如日志输出，DEPLOYMENT 下将会关闭这些特性
    MODE: "DEV",

    //日志级别，可取值为 DEBUG、INFO、WARN、ERROR
    LOG_LEVEL: "ERROR"
};