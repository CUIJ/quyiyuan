/**
 * 产品名称 KYMH
 * 创建用户: 邵鹏辉
 * 日期: 2015/6/8
 * 时间: 11:42
 * 创建原因：趣医微信对接
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.quyiwx.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.service_bus.cache",
        "kyee.quyiyuan.service_bus.http",
        "kyee.quyiyuan.login.service"
    ])
    .type("service")
    .name("QuYiWXService")
    .params([
        "$timeout",
        "$state",
        "KyeeMessageService",
        "CacheServiceBus",
        "HttpServiceBus",
        "LoginService"
    ])
    .action(function($timeout,$state,KyeeMessageService,CacheServiceBus,HttpServiceBus,LoginService){

        var def = {
            loginForWX:function(urlInfo){
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();
                HttpServiceBus.connect({
                    url : '/user/action/LoginAction.jspx',
                    params : {
                        op:'WXLogin',
                        userSource:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE),
                        PUBLIC_SERVICE_TYPE:urlInfo.PublicServiceType,
                        OPEN_ID:urlInfo.openid,
                        TOKEN : CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK)
                    },
                    onSuccess : function(retVal){
                        var isSuccess = retVal.success;
                        var retUserInfo = retVal.data;
                        var user = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER);
                        //修改缓存中记住密码存储明文问题 KYEEAPPC-3781 zhangjiahao
                        var pwd = LoginService.decrypt(storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PWD));
                        if(isSuccess){   //登录成功
                            //设置首页面的页签的标题和LoginService中userInfo的值,记录用户已经登录
                            LoginService.login(user, retUserInfo);
                            //用户信息存入CacheServiceBus中
                            if(retUserInfo){
                                LoginService.saveUserInfoToCache(retUserInfo, user, pwd);
                            }
                            //存储推送关联 bug此接口尚未联机测试
                            LoginService.savaPushUserId(retUserInfo, storageCache, cache);
                            //加载和医院相关后台配置
                            LoginService.queryUserHospital();
                            //在登录后，传递userId参数判断是否属于白名单用户，调用白名单apk升级接口。zm
                            LoginService.checkUserIsWhite(retUserInfo.USER_ID);

                        } else{        //登录失败
                            var errorMsg = retVal.message;
                            KyeeMessageService.broadcast({
                                content : errorMsg
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
