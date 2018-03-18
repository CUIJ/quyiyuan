/**
 * 产品名称：quyiyuan
 * 创建者：付添
 * 创建时间： 2015/11/30
 * 创建原因：账号实名信息
 * 任务号：KYEEAPPC-4398
 * 修改人：付添
 * 任务号：KYEEAPPC-4506
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.accountauthentication.controller")
    .require([
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.account_authentication.service",
        "kyee.quyiyuan.center.updateuser.service"
    ])
    .type("controller")
    .name("AccountAuthenticationController")
    .params([
        "$scope", "$state", "KyeeViewService", "LoginService", "KyeeListenerRegister", "KyeeI18nService", "CacheServiceBus", "UpdateUserService", "AccountAuthenticationService", "$ionicHistory", "AuthenticationService", "KyeeMessageService","KyeePhoneService"
    ,"OperationMonitor","HospitalSelectorService"])
    .action(function ($scope, $state, KyeeViewService, LoginService, KyeeListenerRegister, KyeeI18nService, CacheServiceBus, UpdateUserService, AccountAuthenticationService, $ionicHistory, AuthenticationService, KyeeMessageService,KyeePhoneService,OperationMonitor,HospitalSelectorService) {

        var memoryCache = CacheServiceBus.getMemoryCache(); //获取缓存
        var IdNo;                                           //身份证号全局
        $scope.user = [];                                     //用户未完善字段q全局
        $scope.userSuccess = [];                             //用户已完善全局
        AccountAuthenticationService.scope = $scope;
        $scope.branchVerCode=DeploymentConfig.BRANCH_VER_CODE;//分支版本号
        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "account_authentication",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.enterFun();
            }
        });
        /**
         * 刚进入页面所做操作
         */
        $scope.enterFun = function () {
            pageElementInit();                  //页面涉及元素初始化
            userIsFromSetUp();                  //用户是否从设置页面过来
            getUserIfInputNameAndIdNoStatus();  //获取用户是否完善个人信息
            queryUserInfoByUserID();            //查询用户认证状态及用户基本信息
        };
        /**
         * 提交用户信息点击事件
         */
        $scope.goAuthUser = function () {
            var phone = $scope.user.phone;
            var name = $scope.user.name;
            var idno = $scope.user.idNo;
            AccountAuthenticationService.goAuthUser(phone, name, idno, function (data) {
                if (data.success) {
                    if (AccountAuthenticationService.ifFromRegist == "1") {
                        if(LoginService.frontPage == "5"){
                            // 跳到保险页面
                            LoginService.goRiskWithUserInfo(LoginService.insuranceUrl);
                            LoginService.insuranceUrl = undefined;
                            LoginService.frontPage = "";
                        }else if(AccountAuthenticationService.smRegFlag==1){
                            OperationMonitor.record("notAppUserReport", "reportFromShortMessage",true);
                            if ($scope.user.name==AccountAuthenticationService.smRegName) {
                                if(LoginService.selectHospital(AccountAuthenticationService.smRegHospitalId)){
                                    HospitalSelectorService.loginFrom = true;
                                    LoginService.getSelectCustomInfo();
                                }else if(LoginService.isHospitalEqualsCache==1){
                                    LoginService.isHospitalEqualsCache=0;
                                    $state.go("index_hosp");
                                }else{
                                    $state.go("home->MAIN_TAB");
                                }
                            }else{
                                $state.go("home->MAIN_TAB");
                            }

                        } else {
                            //注册页面特殊处理回到首页
                            $state.go("home->MAIN_TAB");
                        }
                        AccountAuthenticationService.ifFromRegist = "0";   //清空注册页面标记
                    } else {
                        $ionicHistory.goBack(-1);
                    }
                    var rlLoginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
                    rlLoginInfo.userPetname = name;
                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO,rlLoginInfo);
                }
            });

        };
        /**
         * 以后再填点击事件
         */
        $scope.afterInput = function () {

            if(LoginService.frontPage == "5"){
                // 跳到保险页面
                LoginService.goRiskWithUserInfo(LoginService.insuranceUrl);
                LoginService.insuranceUrl = undefined;
                LoginService.frontPage = "";
            } else {
                if(LoginService.isShortMesReqFlag==2){  //检验检查单短信链接
                    LoginService.isShortMesReqFlag=0;
                }
                $state.go("home->MAIN_TAB");
            }

            AccountAuthenticationService.ifFromRegist = "0"; //清空注册页面标记
            if (memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD)) {
                memoryCache.apply(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, "ID_NO", "");
                memoryCache.apply(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, "NAME", "");
            }
        };
        /**
         *  点击上传身份证事件
         */
        $scope.goAuthUserPicture = function (selectClickType) {
            AuthenticationService.lastClass = "ACCOUNT_AUTHENTICATION"; //实名认证服务返回标记
            if ($scope.FLAG == -1 || $scope.FLAG == 2) { //未认证 或者认证失败 可以继续认证
                AuthenticationService.HOSPITAL_SM = {
                    OFTEN_NAME: $scope.userSuccess.name,
                    ID_NO: IdNo,
                    PHONE: $scope.user.phone,
                    FLAG: $scope.FLAG
                };
                if (selectClickType == 1) {
                    AuthenticationService.AUTH_TYPE = 0;
                    AuthenticationService.AUTH_SOURCE = 1;
                    $scope.openModal('modules/business/center/views/authentication/authentication.html');
                } else if (selectClickType == 2) {
                    AuthenticationService.AUTH_TYPE = 1;
                    AuthenticationService.AUTH_SOURCE = 1;
                    $scope.openModal('modules/business/center/views/authentication/authentication.html');
                }
            } else if ($scope.FLAG == 0) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("account_authentication.wait", " 审核中，请稍后再试！")
                });
            }
        };
        /**
         * 页面涉及元素初始化
         */
        var pageElementInit = function () {
            //用户未完善字段初始化
            $scope.user = {
                phone: "",
                name: "",
                idNo: "",
                isShow: "false",
                title: KyeeI18nService.get("account_authentication.hitTitle", "账号实名信息完善")
            };
            //用户已完善，字段初始化
            $scope.userSuccess = {name: "", idNo: ""};
            $scope.hitName = KyeeI18nService.get("account_authentication.hitName", "请输入本人真实姓名");
            $scope.hitIdno = KyeeI18nService.get("account_authentication.hitIdno", "请输入本人真实身份证号码");
            //从缓存中取手机号
            $scope.user.phone = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER);
            $scope.FLAG = "";                  //认证状态  -1未认证 0  正在处理  1 成功 2 失败
        };
        /**
         *用户是否从设置页面过来
         */
        var userIsFromSetUp = function () {
            //从设置页面过来不显示以后再填
            if ($ionicHistory.backView().stateName == "regist_user" || $ionicHistory.backView().stateName == "login") {
                $scope.user.isShow = "true";
            }
        };

        /**
         * 获取用户是否完善个人信息
         */
        var getUserIfInputNameAndIdNoStatus = function () {
            //获取当前是处于完善信息还是未完善信息  在设置页面可以拿到状态
            $scope.isAuthSuccess = AccountAuthenticationService.isAuthSuccess;
        };
        /**
         * 用户完善信息后，根据userId查用户认证状态
         */
        var queryUserInfoByUserID = function () {
            if ($scope.isAuthSuccess != "1") {
                return;
            }
            var currentUserRecord = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            AccountAuthenticationService.queryUserInfo(currentUserRecord.USER_ID, function (resp) {
                if ((resp.success && resp.data )) {
                    $scope.FLAG = resp.data.FLAG;
                    var name = resp.data.NAME;
                    IdNo = resp.data.ID_NO;
                    if (name && IdNo) {
                        $scope.userSuccess.name = name;
                        //页面显示隐藏中间11位身份证
                        var reg = /(\d{3})\d{11}(\w{4})/;
                        var perIdNo = IdNo.replace(reg, "$1***********$2");
                        $scope.userSuccess.idNo = perIdNo;
                        $scope.user.title = KyeeI18nService.get("account_authentication.hitTitle", "账号实名信息完善");
                    }
                    showCertificationStatus();          //展示认证状态的逻辑判断
                }
            })
        };
        /**
         * 展示认证状态的逻辑判断
         */
        var showCertificationStatus = function () {
            if ($scope.FLAG == 0) {
                $scope.CertificationStatus = KyeeI18nService.get("comm_patient_detail.isBeingProcessed", "正在处理...");
            } else if ($scope.FLAG == 1) {
                $scope.CertificationStatus = KyeeI18nService.get("comm_patient_detail.isBeingOk", "已通过");
            } else if ($scope.FLAG == 2) {
                $scope.CertificationStatus = KyeeI18nService.get("comm_patient_detail.isBeingFalse", "认证失败");
            } else {
                $scope.CertificationStatus = KyeeI18nService.get("comm_patient_detail.isBeingNoKnow", "未认证");
            }
        };
        /**
         * 页面回退监听
         */
        $scope.backToFrom = function () {
            if (AccountAuthenticationService.ifFromRegist == "1") {
                if(LoginService.frontPage == "5"){
                    // 跳到保险页面
                    LoginService.goRiskWithUserInfo(LoginService.insuranceUrl);
                    LoginService.insuranceUrl = undefined;
                    LoginService.frontPage = "";
                } else {
                    $state.go("home->MAIN_TAB");
                }
                AccountAuthenticationService.ifFromRegist = "0"; //清空注册页面标记
            } else {
                $ionicHistory.goBack(-1);
            }
        };
        /**
         * 监听身份证小写变大写
         */
        $scope.$watch('user.idNo', function () {
            $scope.user.idNo = $scope.user.idNo.toUpperCase();
        });
        /**
         *
         打开模态页面
         * @param url
         */
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };

        /**
         * 去意见反馈
         */
        $scope.goFeedback = function () {
            $state.go("aboutquyi_feedback");
            //统计意见反馈各入口点击数量  by 高萌  KYEEAPPC-5534
             OperationMonitor.record("aboutquyi_feedback", "completeAccountAuthenticationInfo");
        };

        /**
         * 拨打客服电话
         */
        $scope.callCustomerService = function () {
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("login.hint", "提示"),
                content:  KyeeI18nService.get("regist.isCall","拨打客服电话？"),
                onSelect: function (flag) {
                    if (flag) {
                        //拨打客服电话
                        KyeePhoneService.callOnly("4000801010");
                    }
                }
            });
        };
        /**
         *  监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "account_authentication",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToFrom();
            }
        });
    })
    .build();
