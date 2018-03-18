/**
 * 产品名称：quyiyuan
 * 创建者：杨旭平
 * 创建时间： 2017/1/9
 * 创建原因：短信跳转控制页面
 */

new KyeeModule()
    .group("kyee.quyiyuan.messageSkip.controller")
    .require([
        "kyee.quyiyuan.messageSkip.service",
        "kyee.quyiyuan.messageSkip.extractCodeInfocontroller",
        "kyee.quyiyuan.messageSkip.extractAllInfoController",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.login.md5util.service"
    ])
    .type("controller")
    .name("MessageSkipController")
    .params(["$scope", "$state","KyeeListenerRegister","MessageSkipService","CenterUtilService","CacheServiceBus","KyeeMessageService","LoginService"])
    .action(function ($scope, $state,KyeeListenerRegister,MessageSkipService,CenterUtilService,CacheServiceBus,KyeeMessageService,LoginService) {
        KyeeListenerRegister.regist({
            focus: "message_skip_controller",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //清除上次登录信息
                loginOff();
                //根据用户ID和就诊者ID查询用户信息状态
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                var userId = objParams.userId;
                var userVsId = objParams.userVsId;
                var token = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);
                var skipRoute = objParams.skipRoute;
                if(skipRoute.indexOf("@_@") > 0 ){
                    var reg = /@_@/g;//g,表示全部替换。
                    skipRoute = skipRoute.replace(reg,"->");
                    objParams.skipRoute = skipRoute;
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL,objParams);
                }
                //记录用户关于就医全流程URL点击跳转的记录
                MessageSkipService.addRecord(objParams);
                MessageSkipService.queryUserInfoStatus(true, objParams, token, function(resultData){
                    if(null != resultData){
                        if(resultData.success){
                            LoginService.MDT_AND_RPP=resultData.MDT_AND_RPP;
                            //userIdStatus : 激活状态  1:未激活 2:已激活
                            if(resultData.userIdStatus == 1){
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL,objParams);
                                if(!CenterUtilService.isDataBlank(resultData.userVsIdStatus) && resultData.userVsIdStatus == 1){
                                    //自动注册的APP用户，包含就诊者信息，跳转到信息提取码录入界面
                                    $state.go('extract_code_info');
                                }else if(CenterUtilService.isDataBlank(userVsId)){
                                    //自动注册的APP用户，不包含就诊者信息，跳转到信息提取码+个人信息录入界面
                                    $state.go('extract_all_info');
                                }
                            }else if(resultData.userIdStatus == 2){
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL,objParams);
                                //userVsIdStatus : 激活状态  1:未激活 2:已激活
                                if(!CenterUtilService.isDataBlank(resultData.userVsIdStatus) && resultData.userVsIdStatus == 1){
                                    //原APP用户，自动注册的就诊者，跳转到信息提取码录入界面
                                    $state.go('extract_code_info');
                                }else if(!CenterUtilService.isDataBlank(resultData.userVsIdStatus) && resultData.userVsIdStatus == 2){
                                    //原APP用户，非自动注册的就诊者，自动登录到相应页面
                                    if(!CenterUtilService.isDataBlank(resultData.userData)){
                                        LoginService.messageAutoLogin(resultData, objParams.skipRoute, objParams.hospitalId);
                                    }
                                }else if(CenterUtilService.isDataBlank(userVsId)){
                                    //原APP用户，不包括就诊者信息
                                    $state.go('extract_all_info');
                                }
                            }else{
                                $state.go('home->MAIN_TAB');
                            }
                        }else{
                            KyeeMessageService.broadcast({
                                content: resultData.message
                            });
                            $state.go('home->MAIN_TAB');
                        }
                    }
                });
            }
        });
        var loginOff =function(){
            //清除缓存数据记录
            LoginService.frontPage = "-1";
            var cache = CacheServiceBus.getMemoryCache();
            var storageCache = CacheServiceBus.getStorageCache();
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD,undefined);  //MemoryCache中的密码
            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO,undefined);
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO,undefined);
            LoginService.logoff();
            LoginService.phoneNumberFlag = undefined;
        }
    })
    .build();