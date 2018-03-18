/**
 * 产品名称 KYMH
 * 创建用户: 邵鹏辉
 * 日期: 2015/6/8
 * 时间: 110:42
 * 创建原因：114家个性化APP入口
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.homefor114.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.framework.service.push",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.network",
        "kyee.quyiyuan.home.noticeCenter.service",
        "kyee.quyiyuan.home.user.service",
        "kyee.quyiyuan.login.service"
    ])
    .type("service")
    .name("HomeFor114Service")
    .params([
        "$state",
        "KyeeMessageService",
        "RsaUtilService",
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeePushService",
        "KyeeDeviceInfoService",
        "KyeeNetworkService",
        "NoticeCenterService",
        "HomeUserService",
        "LoginService"
    ])
    .action(function($state, KyeeMessageService, RsaUtilService, HttpServiceBus, CacheServiceBus, KyeePushService, KyeeDeviceInfoService, KyeeNetworkService, NoticeCenterService, HomeUserService,LoginService){

        var def = {
            //传参：{用户名，用户ID，邮箱，平台认证名，平台认证密码, 公众平台类型}
            Form114ToRegisterOrLogin:function(user,userId,email,pubUSer,pubPwd,PublicServiceType,openid){
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.AUTO_LOGIN, "false");
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, 1);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_ID_FROM_114, userId);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID, openid);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, PublicServiceType);
                var pwdRas = RsaUtilService.getRsaResult(pubPwd);   //rsa加密 密码
                var userInfo = {
                    USER_CODE : user,
                    EMAIL : email,
                    SEX : 1,
                    USER_SOURCE : cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE),
                    CO_USERCODE:userId,
                    PUBLIC_SERVICE_TYPE: PublicServiceType,
                    OPEN_ID:openid,
                    P_USER_CODE:pubUSer,//吴伟刚 KYEEAPPC-2840 APP接入安全认证前台整改
                    P_PASSWORD:pwdRas
                };
                def.loginAutoFor114(userInfo);
            },

            //个人账号登录数据验证
            loginAutoFor114 : function(userInfo){
                var user = userInfo.USER_CODE;
                var localPwd ="";
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();

                userInfo.TOKEN = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);

                HttpServiceBus.connect({
                    url : '/user/action/LoginAction.jspx',
                    params : {
                        op:'loginFor114',
                        postdata: userInfo
                    },
                    onSuccess : function(retVal){
                        var isSuccess = retVal.success;
                        var retUserInfo = retVal.data;
                        if(isSuccess){   //登录成功
                            //判断是否需要记住密码与自动登录,并将信息写入localStorage
                            LoginService.saveUserInfo(userInfo, storageCache);
                            //设置首页面的页签的标题和LoginService中userInfo的值,记录用户已经登录
                            LoginService.login(user, retUserInfo);
                            //用户信息存入CacheServiceBus中
                            if(retUserInfo){
                                LoginService.saveUserInfoToCache(retUserInfo, user, localPwd);
                            }
                            //存储推送关联 bug此接口尚未联机测试
                            LoginService.savaPushUserId(retUserInfo, storageCache, cache);
                            //加载和医院相关后台配置
                            LoginService.queryUserHospital();
                            //在登录后，传递userId参数判断是否属于白名单用户，调用白名单apk升级接口。zm
                            LoginService.checkUserIsWhite(retUserInfo.USER_ID);

                        } else{        //登录失败
                            var errorMsg = retVal.message;
                            KyeeMessageService.message({
                                title : "提示",
                                content : errorMsg,
                                okText : "知道了"
                            });
                        }
                    },
                    onError : function(retVal){
                    }
                });
            }
        };
        return def;
    })
    .build();
