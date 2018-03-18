new KyeeModule()
    .group("kyee.quyiyuan.center.administrator_login")
    .require([
        "kyee.framework.service.message"])
    .type("service")
    .name("AdministratorLoginService")
    .params([
        "$state", "KyeeMessageService", "HttpServiceBus", "KyeeI18nService", "CacheServiceBus", "CenterUtilService", "LoginService", "RsaUtilService"])
    .action(function ($state, KyeeMessageService, HttpServiceBus, KyeeI18nService, CacheServiceBus, CenterUtilService, LoginService, RsaUtilService) {
        var def = {
            cache: CacheServiceBus.getMemoryCache(),         //内存
            storageCache: CacheServiceBus.getStorageCache(),//缓存
            floatingLayerParameters: undefined,            //备份浮动层显示关闭方法
            /**
             * 短信验证
             * @param PHONE_NUMBER
             * @param onSuccess
             */
            sendRegCheckCodeActionC: function (PHONE_NUMBER, onSuccess) {
                if (CenterUtilService.validateMobil(PHONE_NUMBER)) {
                    HttpServiceBus.connect({
                        url: "/user/action/DataValidationActionC.jspx",
                        params: {
                            messageType: 2,
                            PHONE_NUMBER: RsaUtilService.getRsaResult(PHONE_NUMBER),
                            modId: 10001,
                            VALID_TYPE:1,//1:使用特殊模板
                            businessType:'0',
                            op: "sendRegCheckCodeActionC"
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                onSuccess(data);
                            } else {
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        }
                    });
                }
            },
            /**
             * 查询授权人
             * @param PHONE_NUMBER
             * @param onSuccess
             */
            queryAuthorizedPerson: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        op: "queryManagerInfo"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            /**
             * 传值参数判空
             * @param userInfo
             * @param afterLogin
             */
            doLogin: function (userInfo, afterLogin) {
                if (CenterUtilService.isDataBlankAndHint(userInfo.phoneNumber, KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号不能为空！"))
                    && CenterUtilService.validateCheckCode(userInfo.securityCode)
                    && CenterUtilService.isDataBlankAndHint(userInfo.userCode, "用户账号不能为空！")) {
                    LoginService.toLoginAfter = afterLogin;            //登陆成功跳转传值
                    LoginService.onTestBtnBtnTap();                     //初始化手机版本信息
                    def.requestLogin(userInfo);
                }
            },
            /**
             * 用户登录操作
             */
            requestLogin: function (userInfo) {
                var params = {
                    loc: "c",
                    op: "loginUserBySuper",
                    USER_SOURCE: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE),//用户来源
                    USER_ID: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,  //用户ID
                    USER_CODE: userInfo.userCode,
                    PHONE_NUMBER: userInfo.phoneNumber,
                    SECURITY_CODE: userInfo.securityCode
                };
                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: params,
                    showLoading: true,
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var retUserInfo = retVal.data;
                        var message = retVal.message;
                        if (success) {
                            var userId = def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;  //用户ID
                            def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CHECK_USER, userId);
                            if (retUserInfo) {
                                def.saveUserInfoToCacheQuyiApp(retUserInfo, userInfo);      //用户信息存入CacheServiceBus中
                                //LoginService.savaPushUserId(retUserInfo, def.storageCache, def.cache);     //存储推送关联
                                LoginService.getSelectCustomInfo(retUserInfo, def.cache, def.storageCache);//登陆成功，查询登陆账户下选择的就诊者
                                //LoginService.checkUserIsWhite(retUserInfo.USER_ID); //在登录后，传递userId参数判断是否属于白名单用户，调用白名单apk升级接口。zm
                            }
                        } else {
                            if (message) {                                              //根据后台返回信息，提示用户
                                KyeeMessageService.broadcast({
                                    content: message
                                });
                            } else {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("login.noInternet","网络不给力，请稍后重试！")
                                });
                            }
                        }
                    }
                });
            },
            /**
             * 清空无意义缓存
             */
            saveUserInfoToCacheQuyiApp: function (retUserInfo) {
                /**
                 * 以下为记录账号密码所开辟缓存
                 */
                //def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE, "");
                //def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
                //def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
                //def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
                //def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER, "");
                //def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD, "");
                var cache = CacheServiceBus.getMemoryCache();
                //清除缓存数据记录
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
                def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN, true);   //记录已经登录
                def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, retUserInfo);
                def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_GNQ_USER_TYPE, retUserInfo.USER_TYPE);
            }
        };
        return def;

    })
    .build();

