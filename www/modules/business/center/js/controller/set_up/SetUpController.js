/*
 * 产品名称：quyiyuan
 * 创建人: 付添
 * 创建日期:2015年12月10日09:08:42
 * 创建原因：设置页面控制
 * 任务号：KYEEAPPC-4225
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.setup.controller")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.account_authentication.service",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.aboutquyi.service",
        "kyee.quyiyuan.center.controller.administrator_login",
        "kyee.quyiyuan.center.administrator_login"
    ])
    .type("controller")
    .name("SetUpController")
    .params([
        "$scope",
        "$state",
        "KyeeViewService",
        "KyeeListenerRegister",
        "KyeeI18nService",
        "KyeeMessageService",
        "LoginService",
        "CacheServiceBus",
        "AccountAuthenticationService",
        "UpdateUserService",
        "AboutQuyiService",
        "ChangeLanguageService",
        "$rootScope"
    ])
    .action(function($scope, $state, KyeeViewService, KyeeListenerRegister, KyeeI18nService, KyeeMessageService, LoginService, CacheServiceBus, AccountAuthenticationService, UpdateUserService, AboutQuyiService, ChangeLanguageService,$rootScope){
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "set_up",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                enterFun();
            }
        });

        var cache = CacheServiceBus.getMemoryCache();
        var storageCache = CacheServiceBus.getStorageCache();
        $scope.userSource = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
        $scope.ysbzWxFlag = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.YSBZ_WX_FLAG);
        AccountAuthenticationService.setUpScope = $scope;
        //多语言功能是否开放的开关
        $scope.languageSwitch = false;
        //页面初始化
        var enterFun =function(){
            var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
            currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
            if(currentUserRecord && currentUserRecord.USER_TYPE && currentUserRecord.USER_TYPE== 2){
                $scope.displayAdministratorScope = "administrator_login";
            }else{
                $scope.displayAdministratorScope = "";
            };
            $scope.isLogin = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN);
            if( $scope.isLogin == false){
                $scope.phone="";
                $scope.user="";
                return ;
            }
            //用户缓存
            var currentUserRecord = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //缓存中手机号和user_id
            var phone=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER);
            $scope.user=phone;//普通用户
            if(currentUserRecord){
                $scope.phone=currentUserRecord.PHONE_NUMBER;
                if(currentUserRecord.USER_TYPE==1||currentUserRecord.USER_TYPE=="1"){
                    $scope.user=currentUserRecord.USER_CODE;
                }
                if(currentUserRecord.USER_TYPE==0||currentUserRecord.USER_TYPE=="0"){
                    if(currentUserRecord.PHONE_NUMBER){
                        $scope.user=currentUserRecord.PHONE_NUMBER;
                    }else{
                        $scope.user=currentUserRecord.USER_CODE;
                    }
                }
                var name=currentUserRecord.NAME;
                var idNo=currentUserRecord.ID_NO;
                if(name&&idNo){
                    $scope.authStatus= KyeeI18nService.get("set_up.success","已完善");
                    AccountAuthenticationService.isAuthSuccess = "1";

                }else{
                    AccountAuthenticationService.isAuthSuccess = "0";
                    $scope.authStatus= KyeeI18nService.get("set_up.noSuccess","未完善");
                }

            }else{
                AccountAuthenticationService.isAuthSuccess = "0";
                $scope.authStatus= KyeeI18nService.get("set_up.noSuccess","未完善");
            }
        };

        $scope.displayAdministratorLogin = function(){
            $state.go($scope.displayAdministratorScope);
        };
        /**
         *
         //注销登录点击事件
         * @constructor
         */
        $scope.Cancellation = function () {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("set_up.sms","消息"),
                content:KyeeI18nService.get("set_up.sureNeedAccount","确认需要退出？") ,
                onSelect: function (select) {
                    if (select) {
                        //清除缓存数据记录
                        LoginService.frontPage = "-1";
                        var cache = CacheServiceBus.getMemoryCache();
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
                        //storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE, "");
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD,undefined);  //MemoryCache中的密码
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO,undefined);
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO,undefined);
                        LoginService.logoff();
                        LoginService.logoutRongLian();
                        LoginService.phoneNumberFlag = undefined;
                        $state.go("login");
                        //add by wyn 病友圈：判断是否为外壳的退出方法;是:则退出容联服务
                        var patientsGroupIsOpen = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH);
                        if($rootScope.IS_SHELL_LOAD && patientsGroupIsOpen){
                            // LoginService.logoutRLService();
                        }
                    }
                }
            });
        };
        /**
         *  判断多语言开关是否开放
         */
        ChangeLanguageService.queryLanguageSwitch(function (result) {
            if(result == 1){
                $scope.languageSwitch = true;
            } else {
                $scope.languageSwitch = false;
            }
        });
        /**
         * 洛阳平台 健康档案查询 入口
         */
        $scope.openLuoYangNet = function () {
            AboutQuyiService.webUrl = "http://phr.lyjk.gov.cn/PHR5/";
            AboutQuyiService.name = KyeeI18nService.get("set_up.healthyArchive","健康档案查询");
            $state.go("jiankangdangan");
        };

    })
    .build();

