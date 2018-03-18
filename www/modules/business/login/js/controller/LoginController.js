/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：登录页面的controller
 * 修改者：付添
 * 修改原因：代码整改
 * 任务号：KYEEAPPC-4506
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.controller")
    .require([
        "kyee.quyiyuan.login.regist.controller",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.login.findpassword.controller",
        "kyee.framework.service.view",
        "kyee.quyiyuan.home.user.service",
        "kyee.quyiyuan.login.regist.controller",
        "kyee.quyiyuan.login.findpassword.controller",
        "kyee.quyiyuan.login.verify_name.controller",
        "kyee.quyiyuan.login.accountauthentication.controller",
        "kyee.quyiyuan.login.setup.controller",
        "kyee.quyiyuan.login.changephone.controller",
        "kyee.quyiyuan.login.quicklogin.service",
        "kyee.quyiyuan.login.thirdParty.service",
        "kyee.quyiyuan.callforhelp.callAmbulance.controller",
        "kyee.quyiyuan.callforhelp.callAmbulance.service",
        "kyee.framework.service.third_party_auth"
    ])
    .type("controller")
    .name("LoginController")
    .params(["OperationMonitor","$ionicLoading","RegistService","AccountAuthenticationService","ThirdPartyRegisterService","KyeeMessageService","ThirdPartyAuthService","RsaUtilService","$scope","$timeout", "$state", "LoginService", "KyeeViewService", "UserFilterDef", "CacheServiceBus", "HomeUserService", "KyeeListenerRegister", "AppointmentDoctorDetailService", "KyeeI18nService", "$ionicHistory", "CenterUtilService", "QuickloginService", "KyeeDeviceMsgService"])
    .action(function (OperationMonitor,$ionicLoading,RegistService,AccountAuthenticationService,ThirdPartyRegisterService,KyeeMessageService,ThirdPartyAuthService,RsaUtilService,$scope,$timeout, $state, LoginService, KyeeViewService, UserFilterDef, CacheServiceBus, HomeUserService, KyeeListenerRegister, AppointmentDoctorDetailService, KyeeI18nService, $ionicHistory, CenterUtilService, QuickloginService, KyeeDeviceMsgService) {

        LoginService.UserFilterDef = UserFilterDef;                    //将登陆过滤器送入Service层操作
        var isFromFiler = false;                                        //判断登录页面是否从过滤器引导出来
        var storageCache = CacheServiceBus.getStorageCache();           //初始化取缓存方法
        var isFromFiler = LoginService.isFromFiler;    //全局-判断登录页面是否从过滤器引导出来
        $scope.user={}; // 初始化对象
        $scope.isShowRegist = LoginService.isShowRegist;//登录页面是否显示注册按钮
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "login",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
//                var loginType = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE); //获取登录类型
                //只允许密码登录  KYEEAPPC-10866   by-yangxuping
                var loginType = 0;
                if(loginType == "1"){
                    LoginService.isQuickLogin = "0"
                }else if(loginType == "0"){
                    LoginService.isQuickLogin = "1"
                }else{
                    LoginService.isQuickLogin = "0"
                }
                inteview();
                //增加用户来源判断
               if( window.device ){
                   if( window.device.platform=='Android'||'iOS'== window.device.platform){
                     var cache=CacheServiceBus.getMemoryCache();
                       if(cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE)=="0"){
                          if('iOS'== window.device.platform){
                              if(navigator.ThirdPartyLogin != undefined){
                                  navigator.ThirdPartyLogin.isTirdPartyPlatform(
                                      function(param){
                                        //成功回调
                                       if(param.isInstallQQ=="YES"){
                                           $scope.isAndOrIos="1";
                                           $scope.isShowQQ="1";
                                       }else{
                                           $scope.isShowQQ="0";
                                       }
                                       if(param.isInstallWeiXin=="YES"){
                                           $scope.isAndOrIos="1";
                                           $scope.isShowWeixin="1";
                                       }else{
                                           $scope.isShowWeixin="0";
                                       }
                                      },
                                      function(param){
                                        //失败回调
                                          $scope.isAndOrIos="0";
                                      }
                                  )}
                          }else{
                              $scope.isAndOrIos="1";
                              $scope.isShowWeixin="1";
                              $scope.isShowQQ="1";
                          }
                       }
                   }else{
                       $scope.isAndOrIos="0";
                   }
               }
            }
        });

        /**
         * 进入当前页面初始化方法
         */
        var inteview = function () {
            var cache = CacheServiceBus.getMemoryCache();
            //清除缓存数据记录
            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CHECK_USER, undefined);
            if (LoginService.isQuickLogin == "1") {  // 需要密码登录
                pageInit();                       // 页面元素初始化
                pageInitByCache();               //根据缓存初始化页面
            } else {                               //验证码登录
                enterFunCodeLogin();
            }
            //个性化APP不显示趣医logo
            // 安庆市第一人民医院微信不显示logo
            var userSource = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
            var publicSreviceType = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
            if(userSource == 0 && publicSreviceType != "020064"){
                $scope.isShowLogo=true;
            }else{
                $scope.isShowLogo=false;
            }

        };
        /**
         * 页面元素初始化
         */
        var pageInit = function () {
            $scope.hintPhone = KyeeI18nService.get("login.hintPhone", "请输入您注册的手机号码");
            $scope.hintPass = KyeeI18nService.get("login.hintPass", "请输入密码");
            $scope.userInfo = {user: "", pwd: ""}; //页面参数初始化
            $scope.isQuickLogin = "0";
        };

        /**
         * 根据缓存信息初始化页面
         */
        var pageInitByCache = function () {
            isFromFiler = LoginService.isFromFiler;                  //判断登录页面是否从过滤器引导出来
            $scope.userInfo = LoginService.getLocalUserInfo();       //获取本地存储的用户信息
        };
        /**
         * 进入当前页面初始化方法
         */
        var enterFunCodeLogin = function () {
            //初始化用户注册信息
            $scope.user = {
                phone: "",
                hintPhone: KyeeI18nService.get("login.hintPhone", "请输入您注册的手机号码"),
                phoneNumDisabled: false,
                validateBtnDisabled: false,
                checkCode: "",
                btnShow: KyeeI18nService.get("login.newGetCode", "获取验证码"),
                hintCode: KyeeI18nService.get("login.newHintCode", "请输入接收到的验证码")
            };
            var storageCache = CacheServiceBus.getStorageCache();
            if (!CenterUtilService.isDataBlank(storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER))) {
                $scope.user.phone = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER);
            }
            $scope.isQuickLogin = "1";
            QuickloginService.clearTask();
        };
        /**
         * 快捷登录点击事件
         */
        $scope.quick_login = function () {
            LoginService.isQuickLogin = "0";
            $scope.isQuickLogin = "1";
            inteview();

        };
        /**
         * 密码登录点击事件
         */
        $scope.loginByPwd = function () {
            LoginService.isQuickLogin = "1";
            $scope.isQuickLogin =  "0";
            inteview();
        };
        /**
         * 用户登录点击事件   '0': 密码登录 '1'：验证码登录
         */
        $scope.doLogin = function (loginType) {
            if (loginType == '1') {
                var userInfo = $scope.user;
            } else {
                var userInfo = $scope.userInfo;
                loginType = '0';
            }
            if(LoginService.isShortMesReqFlag==2){  //检验检查单短信链接中非APP注册用户转登录后取消引导
                LoginService.isShortMesReqFlag=3;
            }
            LoginService.doLogin(userInfo, afterLogin, loginType);
        };
        /**
         * 登录后跳转处理
         */
        var afterLogin = function (loginType) {
            if(loginType=="2"){
                bindPageInit();
                return;
            }
            LoginService.afterLogin();
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK); //卸载一次性事件
        };
        /**
         * 忘记密码监听事件
         */
        $scope.findPassword = function () {
            LoginService.userInfo.user = $scope.userInfo.user;  //将手机号存储到LoginService中的userInfo中,以便带入到找回密码页面
            LoginService.toFindPwdFrontPage = "1";  //记录从登录页面跳转到找回密码页面
            $state.go("find_password");                          //跳转到找回密码页面
        };
        /**
         * 页面回退键监听
         */
        $scope.backToHome = function () {
            if( $scope.isQuickLogin=='2'){
                $scope.isQuickLogin =$scope.lastPage;
                inteview();
                ThirdPartyRegisterService.clearTask();
                return;
            }
            if( $scope.isQuickLogin=='3'){ //确认绑定退出页面回退
                $scope.isQuickLogin='2';
                bindPageInit();
                ThirdPartyRegisterService.clearTask();
                return;
            }
            LoginService.backToHome();
            clearInterval(ThirdPartyRegisterService.task);
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK); //卸载一次性事件
        };
        /**
         * 新注册用户监听事件
         */
        $scope.doRegist = function () {
            LoginService.toRegistFrontPage = "1"; //记录从登陆页面到注册页面
            $state.go("regist_user");
        };
        /**
         * 获取验证码点击事件
         */
        $scope.getValiteCode = function () {
            QuickloginService.getCodeByPhone($scope.user,function(){
                pageInit();
            });
            //手机验证码自动回填
            KyeeDeviceMsgService.getMessage(
                function (validateNum) {
                    $scope.user.checkCode = validateNum;
                    $scope.$apply();
                    $scope.doLogin('1');
                }
            );
        };

        /**
         * 用户输入框监听事件 ，用户一旦输入显示密码
         */
        $scope.userChange = function () {
            var user = $scope.userInfo.user;
            if (user == storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER)) {
                $scope.userInfo.pwd = CenterUtilService.decrypt(storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PWD));  //修改缓存中记住密码存储明文问题 KYEEAPPC-3781 zhangjiahao
            } else {
                $scope.userInfo.pwd = "";
            }
        };
        /**
         * 监听物理返回键保证和页面返回键一样
         */
        KyeeListenerRegister.regist({
            focus: "login",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToHome();
            }
        });
        /**
         * 监听返回事件
         */
        KyeeListenerRegister.regist({
            focus: "login",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if((LoginService.toFindPwdFrontPage == "1" || LoginService.toRegistFrontPage == "1") && LoginService.frontPage == "5"){
                    // 保险进入登录页面的标志不清空
                } else {
                    LoginService.frontPage = "";
                    LoginService.insuranceUrl = undefined;
                }
            }
        });
        /**
         * 第三方绑定页面初始化
         */
        var bindPageInit = function(){
            $scope.user.thirdHintPhone = KyeeI18nService.get("login.thirdHintPhone", "请输入手机号码");
            $scope.user.thirdHintCode = KyeeI18nService.get("login.thirdHintCode", "请输入验证码");
            $scope.user.thirdBtnShow = KyeeI18nService.get("login.thirdHintCode", "获取验证码");
            $scope.user.thirdCheckCode="";
            var storageCache = CacheServiceBus.getStorageCache();
            if (!CenterUtilService.isDataBlank(storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER))) {
                $scope.user.thirdPhone = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER);
            }
            var phone = $scope.user.thirdPhone;
            $scope.user.thirdPhoneNumDisabled=false;
            $scope.user.thirdValidateBtnDisabled=true;
            $scope.user.isLogin=true;

            if(phone&&phone.length>0){
                $scope.user.thirdValidateBtnDisabled=false;//获取验证码框可输入
            }
            //记录上一次所在页面
            $scope.lastPage= $scope.isQuickLogin;
            $scope.isQuickLogin =  "2";
            if(LoginService.thirdUserInfo.HEAD_IMG_URL&&LoginService.thirdUserInfo.HEAD_IMG_URL!=""
                &&LoginService.thirdUserInfo.HEAD_IMG_URL!=null){
                $scope.userIcon = LoginService.thirdUserInfo.HEAD_IMG_URL;
            }else{
                if(LoginService.thirdUserInfo.HEAD_IMG_URL=="2"||LoginService.thirdUserInfo.HEAD_IMG_URL==2){
                    $scope.userIcon= 'resource/images/healthArchive/lady.png';
                } else {
                    $scope.userIcon= 'resource/images/healthArchive/mr.png';
                }
            }
            $scope.$apply();
        };
        //显示遮罩3s
        var loading = function(){
            KyeeMessageService.loading({
                duration: 3000,
                mask: true
            });
        };
        /**
         * 微信登录
         */
        $scope.loginByWeixin = function () {
            loading();//进入页面显示
            $scope.THIRD_LOGIN_TYPE = "0";
            OperationMonitor.record("clickByWeixin", "login");
            getThirdUser("0");

        };

        /**
         * QQ登录
         */
        $scope.loginByQQ = function () {
            loading();//进入页面显示
            $scope.THIRD_LOGIN_TYPE = "1";
            OperationMonitor.record("clickByQQ", "login");
            getThirdUser("1");
        };

        /**
         * 获取验证码点击事件
         */
        $scope.getValiteCodeOnWeixin = function () {
            ThirdPartyRegisterService.getCodeByPhoneWinXin($scope.user,function(){
                $scope.isAndOrIos="0";
                pageInit();
            });
            //手机验证码自动回填
            KyeeDeviceMsgService.getMessage(
                function (validateNum) {
                    $scope.user.thirdCheckCode = validateNum;
                    $scope.$apply();
                    $scope.getAPPuserOrRegister();
                }
            );
        };
        var getThirdUser = function(type){
            //第三方登录页面初始化
            //bindPageInit();
            //LoginService.thirdUserInfo.AUTHS_CODE="123456";
            //LoginService.thirdUserInfo.AUTHS_NAME="付添";
            //LoginService.thirdUserInfo.AUTHS_SEX="1";
            //LoginService.thirdUserInfo.HEAD_IMG_URL="http://q.qlogo.cn/qqapp/1103454878/B806BFF780C7FAF51E682977736CE8BF/100";
            //LoginService.thirdUserInfo.THIRD_LOGIN_TYPE=type;
            //LoginService.doLogin(null, afterLogin, "2");

            var typeName="wxlogin";
            if(type=="1"){
                typeName="qqlogin";
            }
            ThirdPartyAuthService.getPlatformInfo(
                typeName, function (info) {
                    if(info){
                        var paltformInfo = ThirdPartyAuthService.formatPlatformUserInfo(typeName,info);
                        LoginService.thirdUserInfo.AUTHS_CODE=paltformInfo.unionid;
                        LoginService.thirdUserInfo.AUTHS_NAME=paltformInfo.name;
                        LoginService.thirdUserInfo.U_ID=paltformInfo.uid;
                        if(paltformInfo.sex="1"){
                            LoginService.thirdUserInfo.AUTHS_SEX="2";
                        }else{
                            LoginService.thirdUserInfo.AUTHS_SEX="1";
                        }
                        LoginService.thirdUserInfo.HEAD_IMG_URL=paltformInfo.iconurl;
                        LoginService.thirdUserInfo.THIRD_LOGIN_TYPE=type;
                        LoginService.doLogin(null, afterLogin, "2");
                        //bindPageInit();
                    }
                },
                function (info) {
                     if(info=="2"){
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("regist.bigOperation","授权登录失败")
                        });
                    }
                }
            )
        };
        /**
         * 用户手机号码监听事件
         */
        $scope.phoneChange = function () {
            var phone = $scope.user.thirdPhone;
            if(phone&&phone.length>0){
                $scope.user.thirdValidateBtnDisabled=false;//获取验证码框可输入
            }
        };
        /**
         * 验证码监听事件
         */
        $scope.codeChange = function () {
            var checkCode = $scope.user.thirdCheckCode;
            if(checkCode&&checkCode.length>=0&& $scope.user.thirdPhone.length>0){
                $scope.user.isLogin=false;
            }
        };
        /**
         * 获取APP账号信息事件
         */
        $scope.getAPPuserOrRegister = function () {
            ThirdPartyRegisterService.getAPPuserOrRegister($scope, function(data){
                //获取成功
                if(data&&data.USER_ID!=""&&data.USER_ID!=null&&data.USER_ID!=0){
                    LoginService.thirdUserInfo.USER_ID=data.USER_ID;
                    LoginService.thirdUserInfo.PHONE_NUMBER=data.PHONE_NUMBER;
                    LoginService.thirdUserInfo.IS_NEW_APP_USER=data.IS_NEW_APP_USER;
                    $scope.isQuickLogin = "3";
                    $scope.phoneNumber= $scope.user.thirdPhone;
                    $scope.$apply();
                    var storageCache = CacheServiceBus.getStorageCache();
                    var cache=CacheServiceBus.getMemoryCache();//缓存
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER, $scope.phoneNumber);
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER,$scope.phoneNumber);
                }
            }); //注册并登录后调用afterRegistAndLog
        };
        /**
         * 注册并登录后页面跳转
         */
        var afterRegistAndLogin = function () {
            AccountAuthenticationService.isAuthSuccess = "0"; //完善信息标识  --刚注册完不可能完善信息
            AccountAuthenticationService.ifFromRegist="1";    //来源标识
            if (isFromFiler) {                                 //不是从过滤器产生的注册页面
                UserFilterDef.doFinashIfNeed();                 //通知此过滤节点完成
                LoginService.isFromFiler = false;              //重置此状态位
            }
            if(LoginService.frontPage == "5"){
                // 记录通过保险的注册量
                LoginService.recordRiskOperation("registFromInsurance", "regist", LoginService.insuranceUrl);
            }
            $state.go("account_authentication");
        };
        /**
         * 第三方登录事件
         */
        $scope.thirdPartyLogin = function () {

            ThirdPartyRegisterService.bindThirdPartyUser(function(data){
                if(data){
                    if(data=="1"||data==1){
                           //是新注册用户 --引导完善信息
                        if(LoginService.thirdUserInfo.IS_NEW_APP_USER=="1"||LoginService.thirdUserInfo.IS_NEW_APP_USER==1){
                            var userRegistInfo = {
                                USER_CODE:  $scope.user.thirdCheckCode
                            };
                            RegistService.getUMengInfo(userRegistInfo);                    //友盟渠道信息获取
                            AccountAuthenticationService.isAuthSuccess = "0";
                            LoginService.doLogin(null, afterRegistAndLogin, "2"); //注册成功自动登录

                            if(LoginService.thirdUserInfo.THIRD_LOGIN_TYPE=="0"){
                                OperationMonitor.record("newBindSuccessByWeixin", "login");
                            }else{
                                OperationMonitor.record("newBindSuccessByQQ", "login");
                            }
                        }else{//自动登录
                            LoginService.doLogin(null, afterLogin, "2");//注册成功自动登录

                            if(LoginService.thirdUserInfo.THIRD_LOGIN_TYPE=="0"){
                                OperationMonitor.record("oldBindSuccessByWeixin", "login");
                            }else{
                                OperationMonitor.record("oldBindSuccessByQQ", "login");
                            }
                        }
                    }
                }
            });
        };
    })
    .build();
