/**
 * 产品名称：quyiyuan
 * 修改者：付添
 * 创建时间： 2015年12月8日16:28:15
 *  修改人：付添
 *  任务号：KYEEAPPC-4506
 */

new KyeeModule()
    .group("kyee.quyiyuan.login.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.framework.service.push",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.network",
        "kyee.quyiyuan.home.noticeCenter.service",
        "kyee.quyiyuan.home.user.service",
        "kyee.quyiyuan.appointment.autoSign.service",
        "kyee.quyiyuan.center_util.service",
        "kyee.quyiyuan.home.service",
        "kyee.quyiyuan.hospital.hospital_selector.service",
        "kyee.quyiyuan.home.insurance_web.controller",
        "kyee.quyiyuan.appointment.doctor_info.controller",
        "kyee.quyiyuan.consultation.consult_order_detail.controller",
        "kyee.quyiyuan.consultation.wait_chatting.controller",
        "kyee.quyiyuan.consultation.consult_pay.controller",
        "kyee.quyiyuan.consultation.consult_satisfaction.controller",
        "kyee.quyiyuan.appointment.purchase_medincine.controller",
        "kyee.quyiyuan.consultation.order.controller"
    ])
    .type("service")
    .name("LoginService")
    .params([
        "$state",
        "KyeeUmengChannelService",
        "KyeeMessageService",
        "RsaUtilService",
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeePushService",
        "KyeeDeviceInfoService",
        "KyeeNetworkService",
        "NoticeCenterService",
        "HomeUserService",
        "KyeeI18nService",
        "HomeService",
        "$rootScope",
        "AppointmentAutoSignService",
        "$ionicHistory",
        "AppointmentDoctorDetailService",
        "CenterUtilService",
        "OperationMonitor",
        "HospitalSelectorService",
        "PatientsGroupMessageService",
        "CustomPatientService",
        "AccountAuthenticationService",
        "Md5UtilService",
        "AppointmentDeptGroupService",
        "KyeeUtilsService",
        "QRCodeSkipService",
        "PatientCardRechargeService",
        "$filter",
        "ConsultDoctorListService"
    ])
    .action(function (
        $state,
        KyeeUmengChannelService,
        KyeeMessageService,
        RsaUtilService,
        HttpServiceBus,
        CacheServiceBus,
        KyeePushService,
        KyeeDeviceInfoService,
        KyeeNetworkService,
        NoticeCenterService,
        HomeUserService,
        KyeeI18nService,
        HomeService,
        $rootScope,
        AppointmentAutoSignService,
        $ionicHistory,
        AppointmentDoctorDetailService,
        CenterUtilService,
        OperationMonitor,
        HospitalSelectorService,
        PatientsGroupMessageService,
        CustomPatientService,
        AccountAuthenticationService,
        Md5UtilService,
        AppointmentDeptGroupService,
        KyeeUtilsService,
        QRCodeSkipService,
        PatientCardRechargeService,
        $filter,
        ConsultDoctorListService
    ) {

        var def = {
            thirdUserInfo: {},
            autoLoginFlag: undefined, //自动登录异步防范标致
            tabsControllerScope: {}, //TabsController中的scope,此处哪它是为了注销时将首页页签中的“选择就诊卡”改为“未登录”
            UpdateUserService: {}, //传入的服务，因为UpdateUserService需要注入LoginService,因此无法直接注入
            phoneNumberFlag: undefined,
            userInfo: { //用户信息
                user: "",
                password: ""
            },
            cache: CacheServiceBus.getMemoryCache(), //缓存
            storageCache: CacheServiceBus.getStorageCache(), //内存
            isQuickLogin: "0", //是否需要
            pageName: {},
            UserFilterDef: {}, //登录过滤器
            isFromFiler: false, //判断登录页面是否从过滤器引导出来
            isFromRequest: false, //判断登陆页面是否从请求失效(用户锁定)引导出来
            frontPage: "", //跳转到登陆页面的上一个页面  (-1:首页面或注销 1:关于趣医 2:切换角色 3:个人中心 4：预约挂号确认页面 5: 保险)
            insuranceUrl: undefined, // 跳转保险的链接
            toFindPwdFrontPage: "-1", //跳转到找回密码的上一个页面  (1:登录页面 2:注册页面)
            toLoginAfter: undefined, // 登陆跳转方法 当前用户所附加就诊者超过三个以上，从登录注册集成页面，登录后返回到预约确认页面，没有获取到用户信息。  By  张家豪  KYEEAPPTEST-3031
            isAutoLogin: undefined, //是否自动登录标识
            hasNetRecord: false, //
            imLoginFlag: false, //容联登录状态标识
            registByPhone: 0, //电话预约标示
            retUserInfo: undefined, //登录后获取到的用户信息
            wxParamObj: {}, //微信公共号跳转携带参数对象
            isWeiXinReqFlag: 0, //从微信链接进入标识 默认为0,1为是从微信过来的
            smParamObj: {}, //短信跳转携带参数对象
            isShortMesReqFlag: 0, //短信链接进入标识，默认为0，1表示短信进入
            isHospitalEqualsCache: 0, // 判断是否短信链接登录后医院与缓存医院相等
            //设置首页页签的就诊者姓名 --- 可以删除通知其他业务组删除
            setPatientName: function (name) {},
            isMessageSkip: false,
            skipRoute: null,
            isQrcodeSkip: 0,
            isQrNoSign: 0, //1、二维码扫描过来后，不给定位自动签到；0、给自动签到
            IS_MDT_PATIENT: 0, //“我的”是否显示会诊记录0:不显示，1：显示
            isAfterConsultInfo: 0, //判断是否是微信诊后详情点击 0：不是 1：是
            MDT_AND_RPP: "NONE", //就诊者的会诊记录: 'NONE', 'MDT', 'RPP', 'BOTH'
            isShowRegist: true, //登录页面是否显示注册按钮
            REGISTER_INFO: {
                HOSPITAL_ID: "",
                IS_RECORD_REGISTER: 0,
                REGISTER_SOURCE: 0,
                DEPT_CODE: "",
                DOCTOR_CODE: ""
            },
            /**
             * 注销登录
             */
            logoff: function () {
                this.frontPage = "-1"; //标志注销跳到登录页面
                this.userInfo.user = ""; //表示当前无登录人
                this.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN, false);
                this.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ID, undefined); //清除缓存中userId
                this.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, undefined);
                def.IS_MDT_PATIENT = 0;
                this.MDT_AND_RPP = 'NONE';
                def.logOutNIM();
            },
            //登录
            login: function (user, userInfo) {
                this.userInfo.user = user; //表示当前有登录人
                this.tabsControllerScope.loginState = userInfo.NAME ||
                    KyeeI18nService.get("login.selectCard", "选择就诊卡"); //改变首页页签的值
            },
            /**
             * 初始化手机版本信息 （此接口测试通过，如有需要可以随时放开）
             */
            onTestBtnBtnTap: function () {
                var cache = CacheServiceBus.getMemoryCache();
                KyeeDeviceInfoService.getInfo(
                    function (device) {
                        var deviceType = device.platform;
                        if (deviceType == "Android") {
                            var model = device.model;
                            var version = device.version;
                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.PHONE_TYPE, model);
                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.VERSION_NUM, version);
                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.OPERATING_SYS, "0");
                        }
                        if (deviceType == "iOS") {
                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.PHONE_TYPE, undefined);
                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.VERSION_NUM, undefined);
                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.OPERATING_SYS, "1");
                        }
                    }
                );
            },
            /**
             *  获取本地存储的用户信息
             * @returns {{user: (*|$value|s), pwd: *, rememberPwd: boolean, autoLogin: boolean}}
             */
            getLocalUserInfo: function () {
                var storageCache = CacheServiceBus.getStorageCache();
                return {
                    user: storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER),
                    //修改缓存中记住密码存储明文问题 KYEEAPPC-3781 zhangjiahao
                    pwd: def.decrypt(storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PWD))
                };
            },

            /**
             * 用户登录手动服务层
             * @param userInfo
             * @param afterLogin
             * @param loginType
             */
            doLogin: function (userInfo, afterLogin, loginType) {
                if (loginType == '1') { //验证码登录
                    if (!CenterUtilService.isDataBlankAndHint(userInfo.phone, KyeeI18nService.get("add_patient_info.phoneNotNull", "手机号不能为空！")) ||
                        !CenterUtilService.validateCheckCode(userInfo.checkCode)) {
                        return;
                    }
                    var phone = userInfo.phone;
                    var checkCode = userInfo.checkCode; //原始验证码
                    var timeRandom = new Date().getTime();
                    var checkCodeAndSalt = checkCode + '$$@@' + timeRandom; //验证码和盐值
                    def.storageCache.remove(phone + '_KY'); //去掉旧盐值盐值
                    def.storageCache.set(phone + '_KY', timeRandom); //保存盐值
                    userInfo.checkCodeAndSalt = checkCodeAndSalt;

                } else if (loginType == '2') { //第三方登录
                    var authCode = def.thirdUserInfo.AUTHS_CODE;
                    var timeRandom = new Date().getTime();
                    var authCodeAndSalt = authCode + '$$@@' + timeRandom; //UID和盐值
                    def.storageCache.remove(authCode + '_KY'); //去掉旧盐值盐值
                    def.storageCache.set(authCode + '_KY', timeRandom); //保存盐值

                    var userInfo = {};
                    def.thirdUserInfo.ENCRY_AUTHS_CODE = authCodeAndSalt;
                    userInfo.ENCRY_AUTHS_CODE = authCodeAndSalt;
                    userInfo.AUTHS_CODE = def.thirdUserInfo.AUTHS_CODE;
                    userInfo.AUTHS_NAME = def.thirdUserInfo.AUTHS_NAME;
                    userInfo.THIRD_LOGIN_TYPE = def.thirdUserInfo.THIRD_LOGIN_TYPE;
                    userInfo.AUTHS_SEX = def.thirdUserInfo.AUTHS_SEX;
                    userInfo.HEAD_IMG_URL = def.thirdUserInfo.HEAD_IMG_URL;
                    userInfo.U_ID = def.thirdUserInfo.U_ID;
                } else { //密码登录
                    var user = userInfo.user;
                    var pwd = userInfo.pwd; //原始密码
                    var timeRandom = new Date().getTime();
                    var pwdAndSalt = pwd + '$$@@' + timeRandom;
                    def.storageCache.remove(user + '_KY');
                    def.storageCache.set(user + '_KY', timeRandom);
                    userInfo.pwdAndSalt = pwdAndSalt;
                }
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, undefined);                
                def.toLoginAfter = afterLogin; // 当前用户所附加就诊者超过三个以上，从登录注册集成页面，登录后返回到预约确认页面，没有获取到用户信息。  By  张家豪  KYEEAPPTEST-3031
                def.onTestBtnBtnTap(); //初始化手机版本信息（此接口测试通过，如有需要可以随时放开）
                def.requestLogin(userInfo, loginType, false);
            },
            /**
             *  自动登录登入
             */
            autoLoad: function () {
                var cache = CacheServiceBus.getMemoryCache();
                //清除缓存数据记录
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CHECK_USER, undefined);
                var loginType = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE); //获取登录类型
                var user = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER); //获取用户名
                def.wxReqUserCheck();
                //微信菜单过来根据openID自动登录

                def.autoLoginByOpenId();

                //从微信公共号跳转过来进行userId校验
                if (loginType == '1') { // 验证码自动登录登录
                    var security_code = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE);
                    if (CenterUtilService.isDataBlank(user) || CenterUtilService.isDataBlank(security_code)) {
                        return;
                    }
                    var code = CenterUtilService.decrypt(security_code); //获取解码后验证码
                    var cookieCode = this.storageCache.get(user + '_KY');
                    if (!cookieCode) {
                        var timeRandom = new Date().getTime();
                        var securityCode = code + '$$@@' + timeRandom;
                    } else {
                        var securityCode = code + '$$@@' + cookieCode;
                    }
                    var userInfo = { //为了和手动登录参数值保持一致
                        phone: user,
                        checkCode: code, //原始验证码
                        checkCodeAndSalt: securityCode //验证码和盐值
                    };
                } else if (loginType == '2') { //第三方登录
                    var authCode = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.AUTHS_CODE);
                    var uId = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.U_ID);

                    if (CenterUtilService.isDataBlank(authCode)) {
                        return;
                    }
                    var code = CenterUtilService.decrypt(authCode);
                    var cookieCode = this.storageCache.get(code + '_KY');
                    if (!cookieCode) {
                        var timeRandom = new Date().getTime();
                        var securityCode = code + '$$@@' + timeRandom;
                    } else {
                        var securityCode = code + '$$@@' + cookieCode;
                    }

                    if (uId) {
                        uId = CenterUtilService.decrypt(uId);
                    }
                    def.thirdUserInfo.ENCRY_AUTHS_CODE = securityCode;
                    var userInfo = {
                        ENCRY_AUTHS_CODE: securityCode,
                        AUTHS_CODE: code,
                        THIRD_LOGIN_TYPE: this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.THIRD_LOGIN_TYPE),
                        U_ID: uId
                    };
                } else {
                    var padInit = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PWD);
                    if (CenterUtilService.isDataBlank(user) || CenterUtilService.isDataBlank(padInit)) {
                        return;
                    }
                    var pwd = def.decrypt(padInit); //解密
                    var localPwd = pwd;
                    var cookiePwd = this.storageCache.get(user + '_KY');
                    if (!cookiePwd) {
                        var timeRandom = new Date().getTime();
                        pwd = pwd + '$$@@' + timeRandom;
                    } else {
                        pwd = pwd + '$$@@' + cookiePwd;
                    }
                    var userInfo = { //为了和手动登录参数值保持一致
                        user: user,
                        pwd: localPwd, //原始密码
                        pwdAndSalt: pwd //验证码和盐值
                    };
                    loginType = '0'; //记录密码自动登录
                }
                def.onTestBtnBtnTap();
                def.requestLogin(userInfo, loginType, true);
            },
            /**
             *  通过openID自动登录
             */
            autoLoginByOpenId: function () {
                var cache = CacheServiceBus.getMemoryCache();
                //清除缓存数据记录
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CHECK_USER, undefined);
                var loginType = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE); //获取登录类型
                var user = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER); //获取用户名
                var isAutoRe = "0";
                if (loginType == '1') { // 验证码自动登录登录
                    var security_code = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE);
                    if (CenterUtilService.isDataBlank(user) || CenterUtilService.isDataBlank(security_code)) {
                        isAutoRe = "1";
                    }
                } else if (loginType == '2') { //第三方登录
                    var authCode = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.AUTHS_CODE);
                    if (CenterUtilService.isDataBlank(authCode)) {
                        isAutoRe = "1";
                    }
                } else {
                    var padInit = this.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PWD);
                    if (CenterUtilService.isDataBlank(user) || CenterUtilService.isDataBlank(padInit)) {
                        isAutoRe = "1";
                    }
                }
                /**
                 * 根据缓存内容未自动登录成功，则根据openId登录
                 */
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if (objParams && objParams != null && objParams != undefined && objParams != '') {
                    var openId = objParams.openid;
                    var isNeedAutoRegister = objParams.isNeedAutoRegister;
                    var token = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);

                    //微信公众号过来的需要自动注册
                    if (openId && "1" == isNeedAutoRegister && "1" == isAutoRe) {
                        def.queryUserInfoByOpenId(true, openId, token, function (data) {
                            var resultData = "";
                            if (data) {
                                resultData = data.loginUser;
                            }
                            if (resultData && resultData.USER_ID && resultData.USER_ID != 0) {
                                def.goToAutoLogin(resultData);
                            } else {
                                $state.go("doctor_patient_relation");
                                def.addRecord(objParams);
                            }
                        });
                    }
                }
            },
            addRecord: function (objParams) {
                var opRecords = [];
                var record = {
                    "PAGE_CODE": "MenuMessageSkip",
                    "ELEMENT_CODE": objParams.wx_forward,
                    "OPERATE_TIME": KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD HH:mm:ss")
                };
                opRecords.push(record);
                // 延迟5秒向后台发送操作记录
                setTimeout(
                    function () {
                        HttpServiceBus.connect({
                            type: "POST",
                            url: "/CloudManagement/operation/action/OperationRecordsActionC.jspx?",
                            showLoading: false,
                            params: {
                                op: "monitorRecords",
                                monitorRecords: opRecords
                            }
                        });
                    },
                    5000);
            },
            goToAutoLogin: function (resultData) {
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);

                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, resultData);
                def.saveUserInfoToCacheQuyiApp(resultData, "", 0);
                if (!resultData.ID_NO) {
                    AccountAuthenticationService.isAuthSuccess = '0';
                }
                def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
            },
            /**
             * 根据用户ID和就诊者ID查询用户信息状态
             */
            queryUserInfoByOpenId: function (showLoadingFlag, openId, token, onSuccess) {
                var timestamp = (Date.parse(new Date()) / 1000000).toString().split(".")[0];
                var mdKey = Md5UtilService.md5("openId=" + openId + "&timestamp=" + timestamp + "&key=quyi");
                HttpServiceBus.connect({
                    url: "/user/action/QRCodeBusinessActionC.jspx",
                    showLoading: showLoadingFlag,
                    params: {
                        op: "checkUserExist",
                        openId: openId,
                        token: token,
                        key: mdKey
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            $state.go("home->MAIN_TAB");
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            /**
             *微信公共号跳转过来用户ID校验匹配
             */
            wxReqUserCheck: function () {
                if (1 != def.isWeiXinReqFlag) {
                    return;
                }
                if (1 == def.isAfterConsultInfo) {
                    return;
                }
                var userId = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ID);
                if (CenterUtilService.isDataBlank(userId) || def.wxParamObj.wxUserId != userId) {
                    //userId不匹配注销当前登录。跳转至登录页面
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
                    def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD, undefined); //MemoryCache中的密码
                    def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
                    def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
                    def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO, undefined);
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO, undefined);
                    def.logoff();
                    def.logoutRongLian();
                    def.isWeiXinReqFlag = 2; //从微信跳转过来为2：用于用户校验不通过，手动登录后引导跳转到首页
                    $state.go("login");
                }
            },
            /**
             * 用户登录操作
             * @param user
             * @param pwd
             * @param flag
             */
            requestLogin: function (userInfo, loginType, isAutoPwdLogin) { //  param:  1密码手动登录 2验证码手动登录 3密码自动 4 验证码自动
                def.isAutoLogin = isAutoPwdLogin;
                //共同参数
                var params = {
                    loc: "c",
                    op: "login",
                    isAutoPwdLogin: isAutoPwdLogin, //自动登录标识 true:自动登录
                    LOGIN_FLAG: loginType, //登录类型标识 '1':验证码登录 ‘0’：密码登录
                    userSource: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE), //用户来源
                    TOKEN: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK), //
                    OPEN_ID: def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID) //global.currentUserOpenId //开放平台类型
                };
                if (loginType == '1') { //验证码登录
                    params.USER_CODE = userInfo.phone;
                    params.SECURITY_CODE = RsaUtilService.getRsaResult(userInfo.checkCodeAndSalt);
                    //zhangjiahao 2016年2月29日10:04:49  KYEEAPPC-5264  修改登录按钮触发ID，保证不同登录方式的统计
                    OperationMonitor.record("loginBySecurityCode", "login");
                } else if (loginType == '2') { //第三方登录
                    params.AUTHS_CODE = RsaUtilService.getRsaResult(userInfo.ENCRY_AUTHS_CODE);
                    params.AUTHS_NAME = userInfo.AUTHS_NAME;
                    params.LOGIN_TYPE = userInfo.THIRD_LOGIN_TYPE;
                    params.AUTHS_SEX = userInfo.AUTHS_SEX;
                    params.HEAD_IMG_URL = userInfo.HEAD_IMG_URL;

                    if (userInfo.U_ID) {
                        params.U_ID = RsaUtilService.getRsaResult(userInfo.U_ID); //添加  U_ID 参数
                    }
                } else {
                    params.USER_CODE = userInfo.user;
                    params.PASSWORD = RsaUtilService.getRsaResult(userInfo.pwdAndSalt);
                    OperationMonitor.record("loginByPassword", "login");
                }
                //获取手机类型 oppo vivo huawei xiaomi
                if (window.device && window.device.model) {
                    params.PHONE_TYPE = window.device.model;
                }
                //获取系统版本号
                if (window.device && window.device.version) {
                    params.PHONE_VERSION = window.device.version;
                }
                //获取手机平台类型
                if (window.device && window.device.platform) {
                    if (window.device.platform == "Android") {
                        params.PHONE_PLATFORM = "1";
                    } else if (window.device.platform == "iOS") {
                        params.PHONE_PLATFORM = "2";
                    } else {
                        params.PHONE_PLATFORM = "3";
                    }
                }
                //Android用户获取渠道信息 修改人 ：futian  任务号：KYEEAPPC-6145 2016年5月17日10:23:09
                if (window.device && window.device.platform == "Android") {
                    if (navigator != undefined && navigator.umengchannel != undefined) {
                        try {
                            KyeeUmengChannelService.getChannel(
                                function (channel) {
                                    params.CHANNEL = channel;
                                    def.requestLoginHttp(params, userInfo, loginType, isAutoPwdLogin);
                                },
                                //此函数不能删除，外壳不判空,否则获取不到
                                function (retVal) {
                                    def.requestLoginHttp(params, userInfo, loginType, isAutoPwdLogin);
                                }, []
                            );
                        } catch (e) {
                            console.log(KyeeI18nService.get("regist.failGetFriend", "登录时获取渠道来源失败"));
                        }
                    } else {
                        def.requestLoginHttp(params, userInfo, loginType, isAutoPwdLogin);
                    }
                } else {
                    def.requestLoginHttp(params, userInfo, loginType, isAutoPwdLogin);
                }
            },
            requestLoginHttp: function (params, userInfo, loginType, isAutoPwdLogin) {
                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: params,
                    showLoading: true,
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var retUserInfo = retVal.data;
                        var message = retVal.message;
                        if (success) {
                            if (retUserInfo) {
                                def.saveUserInfoToCacheQuyiApp(retUserInfo, userInfo, loginType); //用户信息存入CacheServiceBus中
                                def.savaPushUserId(retUserInfo, def.storageCache, def.cache); //存储推送关联
                                //KYEEAPPC-11354
                                def.isAutoPwdLogin = isAutoPwdLogin;
                                def.handleSelectHos(retUserInfo); //选择医院操作
                                def.checkUserIsWhite(retUserInfo.USER_ID); //在登录后，传递userId参数判断是否属于白名单用户，调用白名单apk升级接口。zm

                                def.hasNetRecord = retUserInfo.HAS_VIS_RECORD;
                                //“我的”是否显示会诊记录
                                def.IS_MDT_PATIENT = retUserInfo.IS_MDT_PATIENT;
                                def.MDT_AND_RPP = retUserInfo.MDT_AND_RPP;
                                var patientsGroupIsOpen = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH);
                                //判断是否为外壳，病友圈开关是否打开，若是，则获取登录容联参数
                                if ($rootScope.IS_SHELL_LOAD && patientsGroupIsOpen) {
                                    def.getIMLoginInfo(); //登录云成功后，获取登录IM相关参数
                                }
                                //判断用户是否完善实名认证信息  By-杨旭平   KYEEAPPTEST-3984
                                if (!retUserInfo.ID_NO) {
                                    AccountAuthenticationService.isAuthSuccess = '0';
                                }
                                def.loginTY(retUserInfo); //登录成功后，登录天翼插件

                                //获取用户可访问的试上线医院 KYEEAPPC-11825
                                var userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                                if (userId != '' && userId != undefined && userId != null && retUserInfo.USER_HOSPITAL_LIST && retUserInfo.USER_HOSPITAL_LIST.length > 0) {
                                    var cUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                                    var userType = '0';
                                    if (cUser) {
                                        userType = cUser.USER_TYPE;
                                    }
                                    var hospitalAddList = [];
                                    def.filterUserHospitalId(hospitalAddList, userType, retUserInfo.USER_HOSPITAL_LIST)
                                }
                            }
                        } else {
                            if ("2" == loginType && retVal.resultCode == "0013501") { //第三方用户首次登录失败 引导用户绑定账号
                                if (def.toLoginAfter) { //手动登录后页面跳转
                                    def.toLoginAfter(loginType); // 当前用户所附加就诊者超过三个以上，从登录注册集成页面，登录后返回到预约确认页面，没有获取到用户信息。  By  张家豪  KYEEAPPTEST-3031
                                    def.toLoginAfter = undefined;
                                    return;
                                }
                            }
                            if (message) { //根据后台返回信息，提示用户
                                KyeeMessageService.broadcast({
                                    content: message
                                });
                            } else {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("login.noInternet", "网络不给力，请稍后重试！")
                                });
                            }
                            if (isAutoPwdLogin) { //自动登录失败后自动引导到登陆页面
                                def.redirectToLoginPage();
                            }

                        }
                    }
                });
            },
            //普通用户可以使用的试上线医院列表 KYEEAPPTEST-4400
            filterUserHospitalId: function (hospitalAddList, userType, userTempHospital) {
                var currentUserInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userId = '';
                if (currentUserInfo) {
                    userId = currentUserInfo.USER_ID;
                }
                //非超户、个性化、用户id不能为空、用户可访问的试上线医院数据不能为空
                if (userType != '1' && userId != '' && userId != undefined && userId != null && userTempHospital && userTempHospital.length > 0) {
                    var initHospitalList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                    for (var i = 0; i < userTempHospital.length; i++) {
                        var temHospitalId = userTempHospital[i].HOSPITAL_ID;
                        var temHospitalName = userTempHospital[i].HOSPITAL_NAME;
                        //从总医院列表筛选出
                        var hospitalAdd = $filter('filter')(initHospitalList, {
                            HOSPITAL_NAME: temHospitalName,
                            HOSPITAL_ID: temHospitalId
                        });
                        for (var j = 0; j < hospitalAdd.length; j++) {
                            hospitalAddList.push(hospitalAdd[j]);
                        }
                    }
                }
                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.USER_TEMP_HOSPITAL, hospitalAddList);
            },

            /**
             *
             * 选择医院操作
             */
            handleSelectHos: function (retUserInfo) {
                var urlInfoHospital = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                //是否是医疗云APP单家医院模式
                var singleHospitalId = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.CURRENT_UNIQUE_HOSPITAL_ID);

                if (def.isWeiXinReqFlag == 1) { //从微信公共号跳转过来分支
                    var currentHospitalInfo = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if (0 == def.wxParamObj.wxPatientType) { //请求患者为体验就诊者
                        if ("1001" != currentHospitalInfo.id) {
                            HospitalSelectorService.toSelectCustomer = def.getSelectCustomInfo; //切换医院完成后查询就诊者信息
                            if (def.selectHospital("1001")) { //切换到虚拟医院
                                HospitalSelectorService.loginFrom = true;
                            } else {
                                HospitalSelectorService.toSelectCustomer = undefined;
                                def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                            }
                        } else {
                            def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                        }
                    } else {
                        if ("1001" == currentHospitalInfo.id || "1001" == retUserInfo.HOSPITAL_ID) {
                            //微信请求患者为非虚拟就诊者,请求回来或者本地缓存为虚拟医院,切换医院为非虚拟医院
                            //选择就诊者操作 赋值给HospitalSelectorService对象用于
                            HospitalSelectorService.toSwitchCustomer = def.handleSelectPatient; //切换医院成功后切换就诊者信息
                            HospitalSelectorService.toSelectCustomer = def.getSelectCustomInfo; //防止切换医院走onError函数不查询就诊者信息
                            if (def.selectHospital(def.wxParamObj.wxHospitalId)) {
                                HospitalSelectorService.loginFrom = true;
                            } else {
                                HospitalSelectorService.toSwitchCustomer = undefined;
                                HospitalSelectorService.toSelectCustomer = undefined;
                                def.handleSelectPatient(); //将要切换的医院跟缓存中的医院匹配，只进行切换就诊者操作。
                            }
                        } else {
                            //如果当前医院不为体验医院则不切换医院
                            if (def.selectHospital(retUserInfo.HOSPITAL_ID)) {
                                def.handleSelectPatient(); //只进行切换就诊者
                                HospitalSelectorService.loginFrom = true;
                            } else {
                                def.handleSelectPatient(); //选择就诊者操作 赋值给HospitalSelectorService对象用于
                            }
                        }
                    }
                } else if (def.isShortMesReqFlag == 1) {
                    HospitalSelectorService.toSwitchCustomer = def.handleSelectPatient; //切换医院成功后切换就诊者信息
                    if (def.selectHospital(def.smParamObj.smHospitalId)) {
                        HospitalSelectorService.loginFrom = true;
                    } else if (def.isHospitalEqualsCache == 1) {
                        def.isHospitalEqualsCache = 0;
                        def.handleSelectPatient();
                    } else {
                        def.isShortMesReqFlag = 3;
                        def.getSelectCustomInfo();
                    }
                    OperationMonitor.record("appUserReport", "reportFromShortMessage", true);
                } else if (def.frontPage == "4" || (urlInfoHospital && urlInfoHospital.hospitalFilterEnable && urlInfoHospital.hospitalFilterEnable == 0)) {
                    if (urlInfoHospital && urlInfoHospital.hospitalID) {
                        if (!(retUserInfo.HOSPITAL_ID && retUserInfo.HOSPITAL_ID == urlInfoHospital.hospitalID)) {
                            HospitalSelectorService.saveHidInUserInfo(retUserInfo.USER_ID, urlInfoHospital.hospitalID);
                        }
                    } else {
                        var hospInfoNow = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                        if (retUserInfo.HOSPITAL_ID) {

                            if (hospInfoNow && hospInfoNow.id && retUserInfo.HOSPITAL_ID != hospInfoNow.id) {
                                HospitalSelectorService.saveHidInUserInfo(retUserInfo.USER_ID, hospInfoNow.id);
                            }
                        } else {
                            if (hospInfoNow && hospInfoNow.id) {
                                HospitalSelectorService.saveHidInUserInfo(retUserInfo.USER_ID, hospInfoNow.id);
                            }
                        }
                    }
                    def.getSelectCustomInfo(); //查询就诊者信息操作
                } else if (def.isQrcodeSkip == 1) { //扫描二维码过来的
                    var cache = CacheServiceBus.getMemoryCache();
                    var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                    var hospitalId = "";
                    if (objParams && objParams.hospitalID) {
                        hospitalId = objParams.hospitalID;
                    }

                    def.isQrcodeSkip = 0;
                    HospitalSelectorService.toSelectCustomer = def.getSelectCustomInfo;
                    def.retUserInfo = retUserInfo;
                    if (def.selectHospital(hospitalId)) {
                        HospitalSelectorService.loginFrom = true;
                    } else {
                        def.isQrNoSign = 1; //二维码扫码初次进入不进行自动签到
                        HospitalSelectorService.toSelectCustomer = undefined;
                        def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                    }
                } else if (def.isAutoPwdLogin == true) {
                    //自动登录不切换医院 KYEEAPPC-11354
                    def.isAutoPwdLogin = undefined;
                    HospitalSelectorService.toSelectCustomer = undefined;
                    def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                } else {
                    HospitalSelectorService.toSelectCustomer = def.getSelectCustomInfo;
                    def.retUserInfo = retUserInfo;
                    if (def.isShortMesReqFlag == 2) {
                        AccountAuthenticationService.smRegFlag = 1;
                        AccountAuthenticationService.smRegHospitalId = def.smParamObj.smHospitalId;
                        AccountAuthenticationService.smRegName = def.smParamObj.smName;
                    }
                    if (singleHospitalId != null && singleHospitalId != undefined && singleHospitalId != "" && singleHospitalId != "null" && singleHospitalId != "NULL" && singleHospitalId != "1001") {
                        if (def.selectHospital(singleHospitalId)) {
                            HospitalSelectorService.loginFrom = true;
                            def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.CURRENT_UNIQUE_HOSPITAL_ID, "");
                        } else {
                            HospitalSelectorService.toSelectCustomer = undefined;
                            def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                        }
                    } else {
                        if (def.selectHospital(retUserInfo.HOSPITAL_ID)) {
                            HospitalSelectorService.loginFrom = true;
                        } else {
                            HospitalSelectorService.toSelectCustomer = undefined;
                            def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                        }
                    }
                }
            },
            /**
             * 选择就诊者操作
             */
            handleSelectPatient: function () {
                //微信公共号跳转过来进行切换就诊者处理
                var patient = {
                    USER_ID: def.wxParamObj.wxUserId,
                    USER_VS_ID: def.wxParamObj.wxUserVsId
                };
                //短信链接跳转进行切换就诊者处理
                if (def.isShortMesReqFlag == 1) {
                    patient.USER_ID = def.smParamObj.smUserId;
                    patient.USER_VS_ID = def.smParamObj.smUserVsId;
                }
                CustomPatientService.updateSelectFlag(patient, "", function (data) { //切换就诊者
                    if (data && !data.success) {
                        if (def.isWeiXinReqFlag == 1) {
                            def.isWeiXinReqFlag = 2; //切换失败引导跳转至首页2：表示由微信跳转过来并设置其跳转至首页
                        } else if (def.isShortMesReqFlag == 1) {
                            def.isShortMesReqFlag = 3; //3表示 短信链接切换失败引导至首页
                        }
                    }
                    def.getSelectCustomInfo(); //切换就诊者完成后或去就诊者信息
                });
            },
            /**
             * 根据用户表中HID切换医院
             * @param hid
             * @returns {boolean}
             */
            selectHospital: function (hid) {
                //针对医院个性化apk不需要默认选择上次选择的医院
                if (AppConfig.BRANCH_VERSION == '50' || AppConfig.BRANCH_VERSION == '51' ||
                    AppConfig.BRANCH_VERSION == '52' || AppConfig.BRANCH_VERSION == '53' || AppConfig.BRANCH_VERSION == '54') {
                    return false;
                }

                //内存医院列表
                var hospListCache = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                //缓存医院详情
                var hospInfoNow = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if (hospInfoNow && hospInfoNow.id && hospInfoNow.id == hid) {
                    def.isHospitalEqualsCache = 1;
                    return false;
                }

                // 链接中有hospitalID时切换成链接中的医院
                var urlData = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if (urlData && urlData.hospitalID && urlData.hospitalID != hid) {
                    hid = urlData.hospitalID;
                }
                if (hospListCache) {
                    var hospList = hospListCache;
                    for (var i = 0; i < hospList.length; i++) {
                        if (hospList[i].HOSPITAL_ID == hid) {
                            def.selectHospitalAll(
                                hospList[i].HOSPITAL_ID,
                                hospList[i].HOSPITAL_NAME,
                                hospList[i].MAILING_ADDRESS,
                                hospList[i].PROVINCE_CODE,
                                hospList[i].PROVINCE_NAME,
                                hospList[i].CITY_CODE,
                                hospList[i].CITY_NAME,
                                hospList[i]);
                            return true;
                        }
                    }
                }
                return false;
            },
            /**
             * 切换医院
             * @param hospitalId
             * @param hospitalName
             * @param hospitalAddress
             * @param provinceCode
             * @param provinceName
             * @param cityCode
             * @param cityName
             * @param hospital
             */
            selectHospitalAll: function (hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName, hospital) {
                var storageCache = CacheServiceBus.getStorageCache();
                var result = {
                    CITY_NAME: cityName,
                    CITY_CODE: cityCode,
                    PROVINCE_NAME: provinceName,
                    PROVINCE_CODE: provinceCode,
                    LOCAL_TYPE: 0
                };
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, result);
                //普通选择医院
                HospitalSelectorService.selectHospital(hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName,
                    "正在加载医院信息...",
                    function (disableInfo) {
                        //切换医院判断是否要做维语切换提示
                        HospitalSelectorService.changeLaguage(true, $rootScope);
                        /**
                         * 扫描医院二维码跳转进来需手动切换医院
                         * @type {*|$value|s}
                         */
                        var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                        if (urlInfo && urlInfo.hospitalID && urlInfo.businessType == 0) {
                            $state.go("home->MAIN_TAB");
                        }
                        if (urlInfo && urlInfo.hospitalID && urlInfo.businessType == 6) {
                            $state.go("doctor_info");
                        }
                        if(urlInfo&&urlInfo.wx_forward == 'consult_doctor_list'&&urlInfo.pushType){
                            ConsultDoctorListService.hospitalId = '';
                            ConsultDoctorListService.doctorTypeTmp = 'ALL';
                            ConsultDoctorListService.queryText1Tmp = '全部';
                            if(def.wxParamObj.wxDeptCode == '0'){
                                ConsultDoctorListService.defaultDept = {
                                    code: def.wxParamObj.wxDeptCode,
                                    name: '全部科室'
                                };
                            }else{
                                ConsultDoctorListService.defaultDept = {
                                    code: def.wxParamObj.wxDeptCode,
                                    name: ConsultDoctorListService.deptList[parseInt(def.wxParamObj.wxDeptCode)].name
                                };
                            }

                            $state.go("consult_doctor_list");
                        }
                    }, hospital)
            },
            /**
             * 成登录后操作，包括页面跳转
             */
            afterLoginOperation: function () {
                //用户缓存
                var currentUserRecord = def.cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var patientsGroupIsOpen = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH);
                if (currentUserRecord && currentUserRecord.USER_TYPE == '1') {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("login.superLoginInfo", "您当前登录的用户为超级用户！")
                    });
                }
                if (def.isAutoLogin == true || HomeService.isSyncHospitalData == false) {
                    if ($rootScope.IS_SHELL_LOAD && patientsGroupIsOpen) {
                        // 加载app,病友群未读消息数
                        PatientsGroupMessageService.loadUnreadMessageNum();
                    } else {
                        HomeService.loadMessageNum(); //c端首页的消息数量
                    }
                }
                if (def.isFromFiler) { //如果过滤器引导出来再通知结束此过滤节点
                    def.isFromFiler = false; //重置此状态位
                    if (def.isDefaultLogin) { //静默登录
                        def.UserFilterDef.doFinashIfNeed(); //无需路由操作
                        def.isDefaultLogin = false;
                    } else {
                        def.UserFilterDef.doFinashIfNeed({
                            onBefore: function (params) {
                                def.isFromFiler = false; //重置此状态位
                                $ionicHistory.currentView($ionicHistory.backView());
                            }
                        });
                    }
                } else {
                    if (def.toLoginAfter) { //手动登录后页面跳转
                        def.toLoginAfter(); // 当前用户所附加就诊者超过三个以上，从登录注册集成页面，登录后返回到预约确认页面，没有获取到用户信息。  By  张家豪  KYEEAPPTEST-3031
                        def.toLoginAfter = undefined;
                    }
                }
                def.isQuickLogin = "0";
            },
            /**
             * 自动登录失败后自动引导到登陆页面，并设置
             */
            redirectToLoginPage: function () {
                if (def.frontPage != "5") { //从保险过来，自动登录失败，跳转保险页面
                    def.frontPage = "-1"; //与从首页登录跳转逻辑相同，所以设置从首页面跳转到登陆页
                }
                $state.go("login"); //模态改路由 付添  KYEEAPPC-3658
            },
            /**
             * 缓存用户信息
             */
            saveUserInfoToCacheQuyiApp: function (retUserInfo, userInfo, loginType) {
                if (loginType == '1') { //验证码登录
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE, "1"); //存储登录方式 1 ：手机号+ 验证码
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, CenterUtilService.encrypt(userInfo.checkCode)); //存储验证码  ：手机号+ 验证码
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, userInfo.phone);
                    def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER, userInfo.phone);
                } else if (loginType == '2') { //第三方登录
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE, "2"); //存储登录方式 2：第三方登录

                    if (def.thirdUserInfo && def.thirdUserInfo.THIRD_LOGIN_TYPE) {
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.THIRD_LOGIN_TYPE, (def.thirdUserInfo.THIRD_LOGIN_TYPE));
                    } else {
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.THIRD_LOGIN_TYPE, (userInfo.THIRD_LOGIN_TYPE));
                    }
                    if (def.thirdUserInfo && def.thirdUserInfo.AUTHS_CODE) {
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.AUTHS_CODE, CenterUtilService.encrypt(def.thirdUserInfo.AUTHS_CODE));
                    } else {
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.AUTHS_CODE, CenterUtilService.encrypt(userInfo.AUTHS_CODE));
                    }
                    if (def.thirdUserInfo && def.thirdUserInfo.U_ID) {
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.U_ID, CenterUtilService.encrypt(def.thirdUserInfo.U_ID));
                    } else {
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.U_ID, CenterUtilService.encrypt(userInfo.U_ID));
                    }
                } else {
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, userInfo.user);
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, def.encrypt(userInfo.pwd)); //修改缓存中记住密码存储明文问题 KYEEAPPC-3781 zhangjiahao
                    def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TYPE, "0"); //记录登录方式  0 密码登录 1 验证码登录
                    def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER, userInfo.user);
                    def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD, def.encrypt(userInfo.pwd)); //MEMORY_CACHE存入用户信息
                }
                def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ID, retUserInfo.USER_ID); //记录用户ID 微信跳转过来时进行判断
                def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN, true); //记录已经登录
                def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, retUserInfo);
                def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_GNQ_USER_TYPE, retUserInfo.USER_TYPE);
            },
            /**
             * 存储推送关联
             * @param userInfo
             * @param storageCache
             * @param cache
             */
            savaPushUserId: function (userInfo, storageCache, cache) {
                var userId = "0";
                var channelId = "0";
                var deviceType = "0";
                if (window.device && window.device.platform == "Android") {
                    navigator.pushparams.getPushParams(
                        function (res) {
                            userId = res.userid;
                            channelId = res.channelid;
                            deviceType = "3";
                            def.savaPushUserIdToYun(userInfo, userId, channelId, deviceType);
                        },
                        function () {}
                    );
                } else if (window.device && window.device.platform == "iOS") {
                    userId = KyeePushService.getUserId();
                    channelId = KyeePushService.getChannelId();
                    deviceType = "4";
                    def.savaPushUserIdToYun(userInfo, userId, channelId, deviceType);
                } else {
                    def.savaPushUserIdToYun(userInfo, userId, channelId, deviceType);
                }
            },

            /**
             * 存储百度云推送设备参数到云
             */
            savaPushUserIdToYun: function (userInfo, userId, channelId, deviceType) {
                var savePushVsUser = {
                    "APP_USER_ID": userInfo.USER_ID,
                    "BAIDU_USER_ID": userId,
                    "BAIDU_CHANNEL_ID": channelId,
                    "Device_Type": deviceType
                };
                HttpServiceBus.connect({
                    url: '/baidupush/action/AppPushActionC.jspx',
                    showLoading: false,
                    params: {
                        op: "registerBaiduPushUserActionC",
                        postdata: savePushVsUser
                    },
                    onSuccess: function (retVal) {
                        if (retVal) {
                            var success = retVal.success;
                            var message = retVal.message;
                            if (!success) {
                                if (message) {
                                    KyeeMessageService.broadcast({
                                        content: message
                                    });
                                } else {
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get("login.noInternet", "网络连接断开，请检查网络")
                                    });
                                }
                            }
                        }
                    }
                });
            },

            /**
             *  查询登陆账户下选择的就诊者
             */
            getSelectCustomInfo: function () {
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();
                var currentUserRecord = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userId = currentUserRecord.USER_ID;
                HttpServiceBus.connect({
                    url: '/center/action/CustomPatientAction.jspx',
                    showLoading: true,
                    params: {
                        op: 'selectedCustomPatient',
                        loc: 'c',
                        userId: userId,
                        hospitalId: function () {
                            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                            var newHospital = "";
                            if (hospitalInfo) {
                                newHospital = hospitalInfo.id;
                            }
                            if (HospitalSelectorService.hospitalIsOpen == 1) { //将要切换的医院开启 则根据将要切换的医院查询选中就诊者
                                if (def.retUserInfo && def.retUserInfo.HOSPITAL_ID) { //将要切换的医院ID
                                    newHospital = def.retUserInfo.HOSPITAL_ID;
                                }
                            }
                            // 链接中有hospitalID时切换成链接中的医院
                            var urlData = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                            if (urlData && urlData.hospitalID && urlData.hospitalID != newHospital) {
                                newHospital = urlData.hospitalID;
                            }
                            return newHospital;
                        },
                        USER_VS_ID: storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_VS_ID_BEFORE_1001)
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var data = retVal.data;
                        var message = retVal.message;
                        if (success) {
                            if (data && data.length > 0) {
                                var cardNo = data[0].CARD_NO; //该就诊者的默认卡号
                                var cardInfo = undefined;
                                //成功并且有数据，解析该就诊者的卡信息
                                angular.forEach(data, function (item, index, items) {
                                    var detialList = item.DETIAL_LIST;
                                    if (detialList) {
                                        detialList = JSON.parse(detialList);
                                    }
                                    item.PATIENT_CARD = [];
                                    if (detialList && detialList.length > 0) {
                                        angular.forEach(detialList, function (detialItem, detialIndex, detialItems) {
                                            detialItem.USER_VS_ID = item.USER_VS_ID;
                                            //排除重复的卡号，并且清理空的身份证
                                            var isExist = true;
                                            angular.forEach(item.PATIENT_CARD, function (patItem) {
                                                if (patItem.PATIENT_ID == detialItem.PATIENT_ID) {
                                                    if (patItem.ID_NO == null || patItem.ID_NO == undefined) {
                                                        patItem = detialItem;
                                                    } else {
                                                        isExist = false;
                                                    }
                                                }
                                            });
                                            if (isExist) {
                                                item.PATIENT_CARD.push(detialItem);
                                            }
                                        });
                                    }
                                    if (cardNo) { //根据该就诊者的默认卡号选择该医院下的卡信息
                                        angular.forEach(item.PATIENT_CARD, function (item, index, items) {
                                            if (item.CARD_NO == cardNo) {
                                                cardInfo = item;
                                            }
                                        });
                                    }
                                });
                                cache = CacheServiceBus.getMemoryCache();
                                var patientInfo = def.updatePatientInfo(data[0]); //修改就诊者信息（后台生日错误）
                                def.updateUserInfo(patientInfo, currentUserRecord); //修改用户信息（USER_ID）,解决USER_ID和USER_VS_ID对不上的问题
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, patientInfo);

                                if (cardInfo) { //有就诊卡信息存入缓存
                                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, cardInfo);
                                }
                                if (data[0].PATIENT_CARD && data[0].PATIENT_CARD.length > 0 &&
                                    cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT)) {
                                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, data[0].PATIENT_CARD[0]);
                                    cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).CARD_NO = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO).CARD_NO;
                                }
                                var urlInfoHospital = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                                if (!urlInfoHospital || (urlInfoHospital && def.isQrNoSign != 1)) {
                                    AppointmentAutoSignService.autoSign(); //   自动签到
                                } else if (def.isQrNoSign == 1) {
                                    def.isQrNoSign = 0;
                                }
                            } else { //如果没有查询到就诊者,则往缓存中放入一个空json对象，避免后续判断不严谨报错
                                cache = CacheServiceBus.getMemoryCache();
                                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, {});
                                storageCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, {});
                            }
                            //C_ACCOUNT_USER   电话预约标识 REGIST_BY_PHONE  0：正常用户  1：电话预约用户 2：经过电话预约后注册的用户
                            if (def.registByPhone == 1) {
                                $state.go("appointment_regist_list");
                                def.registByPhone = 0;
                            }else if((1 == def.isWeiXinReqFlag || 2 == def.isWeiXinReqFlag) && def.wxParamObj.wxForward == 'consult_doctor_list' && def.wxParamObj.wxPushType){
                                ConsultDoctorListService.hospitalId = '';
                                ConsultDoctorListService.doctorTypeTmp = 'ALL';
                                ConsultDoctorListService.queryText1Tmp = '全部';
                                if(def.wxParamObj.wxDeptCode == '0'){
                                    ConsultDoctorListService.defaultDept = {
                                        code: def.wxParamObj.wxDeptCode,
                                        name: '全部科室'
                                    };
                                }else{
                                    ConsultDoctorListService.defaultDept = {
                                        code: def.wxParamObj.wxDeptCode,
                                        name: ConsultDoctorListService.deptList[parseInt(def.wxParamObj.wxDeptCode)].name
                                    };
                                }

                                if(def.wxParamObj.wxPushType == '31'){//新增预约挂号成功后点击微信咨询提醒跳转咨询医生列表点击次数
                                    OperationMonitor.record("countAppointRegistSuccessToDoctorList", "consult_doctor_list");
                                }else if(def.wxParamObj.wxPushType == '32'){//新增取消预约挂号成功后点击微信咨询提醒跳转咨询医生列表点击次数
                                    OperationMonitor.record("countAppointRegistCancleToDoctorList", "consult_doctor_list");
                                }else if(def.wxParamObj.wxPushType == '33'){//新增预约挂号就诊7天后点击微信咨询提醒跳转咨询医生列表点击次数
                                    OperationMonitor.record("countAppointRegist7DaysToDoctorList", "consult_doctor_list");
                                }else if(def.wxParamObj.wxPushType == '34'){//新增扫码随访点击微信咨询提醒跳转咨询医生列表点击次数
                                    OperationMonitor.record("countFollowUpToDoctorList", "consult_doctor_list");
                                }else if(def.wxParamObj.wxPushType == '35'){//新增报告单点击微信咨询提醒跳转咨询医生列表点击次数
                                    OperationMonitor.record("countCheckToDoctorList", "consult_doctor_list");
                                }

                                $state.go('consult_doctor_list');
                            }else if(1 == def.isWeiXinReqFlag){
                                def.wxReqRedirectPage()
                            } else if (2 == def.isWeiXinReqFlag) {
                                //从微信跳转过来为2：用于用户校验不通过，手动登录后引导跳转到首页
                                $state.go("home->MAIN_TAB");
                                def.isWeiXinReqFlag = 0;
                            } else if (1 == def.isShortMesReqFlag) {
                                def.isShortMesReqFlag = 0;
                                $state.go("index_hosp");
                            } else if (2 == def.isShortMesReqFlag) {
                                def.isShortMesReqFlag = 0;
                                def.afterLoginOperation();
                            } else if (3 == def.isShortMesReqFlag) {
                                def.isShortMesReqFlag = 0;
                                $state.go("home->MAIN_TAB");
                            } else if (AccountAuthenticationService.smRegFlag == 1) {
                                $state.go("index_hosp");
                                AccountAuthenticationService.smRegFlag = 0;
                            } else if (def.isMessageSkip) {
                                def.isMessageSkip = false;
                                if (def.skipRoute == "doctor_info") {
                                    var cache = CacheServiceBus.getMemoryCache();
                                    var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                                    var deptData = {};
                                    if (objParams) {
                                        deptData.DEPT_CODE = decodeURI(objParams.deptCode);
                                        deptData.DEPT_NAME = decodeURI(objParams.deptName);
                                        deptData.HOSPITAL_ID = objParams.hospitalId;
                                        deptData.DOCTOR_CODE = decodeURI(objParams.doctorCode);
                                        deptData.DOCTOR_NAME = decodeURI(objParams.doctorName);
                                        deptData.DOCTOR_TITLE = decodeURI(objParams.doctorTitle);
                                    }
                                    AppointmentDoctorDetailService.doctorInfo = deptData;
                                    AppointmentDoctorDetailService.doctorInfo.DOCTOR_SCHEDULE_LIST = null;
                                    AppointmentDoctorDetailService.doctorInfo.ROOT_NAME = "doctor_patient_relation";

                                    //跳到医生列表页，将科室放入
                                    AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                                    AppointmentDoctorDetailService.activeTab = 1; //跳转到医生主页"咨询医生"页面

                                }
                                $state.go(def.skipRoute);
                            } else {
                                def.afterLoginOperation(); //登录后操作包括页面跳转
                            }
                        } else {
                            if (message) {
                                KyeeMessageService.broadcast({
                                    content: message
                                });
                            }
                        }
                    }
                });

            },
            /**
             * 微信跳转过来页面转发流程
             */
            wxReqRedirectPage: function () {

                if ("report_multiple" == def.wxParamObj.wxForward) {
                    $state.go("report_multiple");
                } else if ("appoint_medicalGuide" == def.wxParamObj.wxForward) {
                    $state.go("myquyi->MAIN_TAB.medicalGuide");
                } else if ("appoint_mainTab" == def.wxParamObj.wxForward) {
                    $state.go("home->MAIN_TAB");
                } else if ("medical_record_reminder" == def.wxParamObj.wxForward) {
                    $state.go("medical_record_reminder");
                } else if ("medical_orders_reminder" == def.wxParamObj.wxForward) {
                    $state.go("medical_orders_reminder");
                } else if ("report_reminder" == def.wxParamObj.wxForward) {
                    $state.go("report_reminder");
                } else if ("myquyi_inpatient_payment" == def.wxParamObj.wxForward) {
                    $state.go("myquyi_inpatient_payment");
                } else if ("medication_push" == def.wxParamObj.wxForward) {
                    if (def.wxParamObj.wxHcrmMsgType) { //大通道推送的用药到消息中心页面
                        $state.go("message->MAIN_TAB");
                    } else {
                        $state.go("medication_push");
                    }
                } else if ("message_main" == def.wxParamObj.wxForward) {
                    $state.go("message->MAIN_TAB");
                } else if ('doctor_info' == def.wxParamObj.wxForward) {
                    $state.go("doctor_info");
                } else if ('appointment_regist_detil' == def.wxParamObj.wxForward) {
                    $state.go("appointment_regist_detil");
                } else if ('appointment_doctor' == def.wxParamObj.wxForward) {
                    $state.go("appointment_doctor");
                } else if ('rush_clinic_detail' == def.wxParamObj.wxForward) {
                    $state.go("rush_clinic_detail");
                } else if ('rush_clinic_success' == def.wxParamObj.wxForward) {
                    $state.go("rush_clinic_success");
                } else if ('aboutquyi_feedback' == def.wxParamObj.wxForward) {
                    $state.go("aboutquyi_feedback");
                } else if ('patient_card_records' == def.wxParamObj.wxForward) {
                    PatientCardRechargeService.getRecordModule(function (route) {
                        PatientCardRechargeService.fromView == 'home->MAIN_TAB';
                        $state.go(route);
                    }, $state);
                } else if ('purchase_medince' == def.wxParamObj.wxForward) {
                    $state.go("purchase_medince");
                } else if ('video_interrogation' == def.wxParamObj.wxForward) {
                    $state.go("video_interrogation");
                } else if ('consult_order_detail' == def.wxParamObj.wxForward) {
                    $state.go("consult_order_detail");
                } else if ('wait_chatting' == def.wxParamObj.wxForward) {
                    if (!def.isAutoLogin) {
                        $state.go('wait_chatting');
                    }
                } else if ('consult_satisfaction' == def.wxParamObj.wxForward) {
                    if (!def.isAutoLogin) {
                        $state.go('consult_satisfaction');
                    }
                } else if ('consult_pay' == def.wxParamObj.wxForward) {
                    if (!def.isAutoLogin) {
                        $state.go('consult_pay');
                    }
                } else if ('consultation_order' == def.wxParamObj.wxForward) {
                    $state.go('consultation_order');
                } else {
                    $state.go("home->MAIN_TAB");
                }
                def.isWeiXinReqFlag = 0; //当前页面跳转完成重置微信请求过来的标识
            },
            /**
             * 修改用户信息（USER_ID）,解决USER_ID和USER_VS_ID对不上的问题
             * @param patientInfo
             * @param currentUserRecord
             */
            updateUserInfo: function (patientInfo, currentUserRecord) {
                if(patientInfo&&patientInfo.USER_ID){
                    currentUserRecord.USER_ID = patientInfo.USER_ID;
                }
            },
            /**
             * 修改就诊者信息（后台生日错误）
             * @param patientInfo
             * @returns {*}
             */
            updatePatientInfo: function (patientInfo) {
                if(def&&def.UpdateUserService&&def.UpdateUserService.convertIdNo){
                    patientInfo.DATE_OF_BIRTH = def.UpdateUserService.convertIdNo(patientInfo.ID_NO);
                    return patientInfo;
                }

            },
            /**
             * 获取设备类型(3:Android 4:IOS)
             * @param storageCache
             * @param cache
             * @returns {*}
             */
            getDeviceType: function (storageCache, cache) {
                var operatingSys = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.OPERATING_SYS);
                if (operatingSys == "0") { //android
                    return "3";
                }
                if (operatingSys == "1") { //ios
                    return "4";
                }
            },

            /**
             *  在登录后，传递userId参数判断是否属于白名单用户，调用白名单apk升级接口。zm
             * @param userId
             */
            checkUserIsWhite: function (userId) {
                // 修改人：朱学亮
                // 修改时间：2015-7-15 9:22
                // 任务号：KYEEAPPC-2748
                // 白名单升级js，请求中添加PHONE_SYSTEM字段，以区分ios和android的白名单
                var cache = CacheServiceBus.getMemoryCache();
                var operatingSys = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.OPERATING_SYS);
                var phoneSystem = "ANDROID";
                if (operatingSys == "1") { //ios
                    phoneSystem = "IOS";
                }
                HttpServiceBus.connect({
                    url: '/version/action/VersionManagerActionC.jspx',
                    showLoading: false,
                    params: {
                        op: 'checkUserIsWhite',
                        USER_ID: userId,
                        userSource: cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE),
                        PHONE_SYSTEM: phoneSystem
                    },
                    onSuccess: function (dataVal) {
                        if (dataVal && dataVal.success && dataVal.data && dataVal.data.FLAG) {
                            var isSuccess = dataVal.success;
                            var checkIsWhiteFlag = dataVal.data.FLAG;
                            if (isSuccess && checkIsWhiteFlag == 'true' && navigator.versioncheck != undefined) {

                                var operatingSys = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.OPERATING_SYS);
                                if (operatingSys == "0") { //android

                                    navigator.versioncheck.checkVersion(function () {}, function () {}, userId);
                                } else if (operatingSys == "1") { //ios

                                    navigator.versioncheck.updateJS4WhiteList(function () {}, function () {}, [userId]);
                                }
                            }
                        }
                    },
                    onError: function () {

                    }
                });
            },

            /**
             * [loginTY 登录天翼视频插件]
             * @return {[type]} [description]
             */
            loginTY: function (userInfo) {
                try {
                    if (device && (device.platform === "Android" || device.platform === "iOS")) {
                        if (!TyRtc) {
                            return;
                        }
                        var user = userInfo ? userInfo : CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD),
                            imgUrl = "http://quyiyuanoss.oss-cn-qingdao.aliyuncs.com/Official/PublicResource/DefaultDoctorPic/" + (parseInt(user.SEX) === 1 ? "user_male.png" : "user_female.png"),
                            loginInfo = [user.PHONE_NUMBER, user.NAME, user.SEX, imgUrl];
                        TyRtc.login(function (info) {

                        }, function (info) {

                        }, loginInfo);
                    }
                } catch (e) {
                    KyeeLogger.info(KyeeI18nService.get("login.FailLoadInetDep", "*******登录失败！*******"));
                }
            },

            /**
             * 网络医院登出荣联
             * 修改：网络医院使用天翼插件登出 sph
             */
            logoutRongLian: function () {
                try {
                    if (def.hasNetRecord && typeof (device) != "undefined" && (device.platform == "Android" || device.platform == "iOS")) {
                        if (typeof (TyRtc) == null || typeof (TyRtc) == undefined || typeof (TyRtc) == "undefined") {
                            KyeeLogger.info(KyeeI18nService.get("login.failLoadComponents", "*******视频插件初始化失败！*******"));
                            return;
                        }
                        TyRtc.logout(
                            function (info) {},
                            function (info) {}, []
                        );
                    }
                } catch (e) {
                    KyeeLogger.info(KyeeI18nService.get("login.FailLoadInetDep", "*******网络科室登出失败！*******"));
                }
            },
            /**
             * 待删除代码防止个性化出错
             */
            queryUserHospital: function () {
                //查询登陆账户下选择的就诊者
                this.getSelectCustomInfo();
            },
            /**
             * 个性化调用
             * @param userInfo
             * @param user
             * @param localPwd
             */
            saveUserInfoToCache: function (userInfo, user, localPwd) {
                var cache = CacheServiceBus.getMemoryCache();
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER, user);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD, def.encrypt(localPwd));
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, userInfo);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN, true);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_GNQ_USER_TYPE, userInfo.USER_TYPE);
            },
            /**
             * 个性化调用
             * @param userInfo
             * @param storageCache
             */
            saveUserInfo: function (userInfo, storageCache) {
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.REMEMBER_PWD, userInfo.rememberPwd);
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.AUTO_LOGIN, userInfo.autoLogin);
                this.userInfo.user = userInfo.user;
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, userInfo.user);
                if (userInfo.rememberPwd) {
                    //修改缓存中记住密码存储明文问题 KYEEAPPC-3781 zhangjiahao
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, def.encrypt(userInfo.pwd));
                } else {
                    storageCache.remove(CACHE_CONSTANTS.STORAGE_CACHE.PWD);
                }
            },

            /**
             * 页面回退监听
             */
            backToHome: function () {
                def.isQuickLogin = "0";
                if (this.isFromRequest) { //判断登陆页面是否从请求失效(用户锁定)引导出来
                    this.isFromRequest = false;
                    $state.go("home->MAIN_TAB");
                    return;
                } else {
                    this.isFromFiler = false;
                    //从首页或注销跳转到登陆页
                    if (this.frontPage == "-1") {
                        $state.go("home->MAIN_TAB");
                        this.frontPage = "";
                    } else {
                        $ionicHistory.goBack(-1); // 	模态改路由 付添  KYEEAPPC-3658
                    }
                }
            },
            /**
             * 登录后跳转逻辑处理
             */
            afterLogin: function () {
                if (this.frontPage == "4") {
                    var bussinessType = AppointmentDoctorDetailService.selSchedule.BUSSINESS_TYPE;
                    if (bussinessType === '0') { //预约
                        $state.go('appoint_confirm');
                    } else {
                        $state.go('regist_confirm'); //挂号
                    }
                } else if (this.frontPage == "5") {
                    // 记录通过保险登录量
                    def.recordRiskOperation("loginFromInsurance", "login", this.insuranceUrl);
                    // 跳到保险页面
                    def.goRiskWithUserInfo(this.insuranceUrl);

                    this.insuranceUrl = undefined;
                    this.frontPage = "";
                } else {
                    $state.go("home->MAIN_TAB");
                }
            },

            /**
             * 打开保险链接
             * @param insuranceUrl
             * @returns {*}
             */
            goRiskWithUserInfo: function (insuranceUrl) {
                var currentUserRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var isFromWeiXin = HomeService.isWeiXin();

                if (insuranceUrl) {
                    var url = HomeService.getRiskUrl(insuranceUrl, currentUserRecord);

                    if (window.device && device.platform == "iOS") {
                        var cache = CacheServiceBus.getMemoryCache();
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_VIEW_ROUTER, "home->MAIN_TAB");
                        window.open(url, "_blank", "location=yes");
                    } else if (isFromWeiXin) {
                        window.location.href = url;
                    } else {
                        HomeService.insuranceWeb = {
                            url: url
                        };
                        $state.go('insuranceWeb');
                    }
                }
            },

            /**
             * 记录用户关于保险的业务操作
             * @param elementCode:  registFromInsurance, loginFromInsurance
             * @param pageCode
             * @param url
             * @returns {*}
             */
            recordRiskOperation: function (elementCode, pageCode, url) {
                if (url.indexOf("advertisement") > -1) {
                    elementCode = elementCode + "Adv";
                } else if (url.indexOf("submenu") > -1) {
                    elementCode = elementCode + "Submenu";
                } else if (url.indexOf("article") > -1) {
                    elementCode = elementCode + "Article";
                }

                OperationMonitor.record(elementCode, pageCode, true);
            },

            /**
             * 密码加密
             * @param pwd
             * @returns {*}
             */
            encrypt: function (pwd) {
                if (!pwd || pwd.length <= 0) {
                    return "";
                }
                var monyer = new Array();
                var i;
                for (i = 0; i < pwd.length; i++) {
                    monyer += "\\" + pwd.charCodeAt(i).toString(8);
                }
                return monyer;
            },
            /**
             * 密码解密
             * @param pwd
             * @returns {*}
             */
            decrypt: function (pwd) {
                if (!pwd || pwd.length <= 0) {
                    return "";
                }
                var monyer = new Array();
                var i;
                var s = pwd.split("\\");
                for (i = 1; i < s.length; i++) {
                    monyer += String.fromCharCode(parseInt(s[i], 8));
                }
                return monyer;
            },

            /**
             * 获取登录IM相关参数
             * add by wyn 20160801
             * modify liwenjuan 2016/11/14 先获取用户信息之后登陆容联
             */
            getIMLoginInfo: function () {
                HttpServiceBus.connect({
                    url: 'third:userManage/user/accountinfo/get/yx',
                    showLoading: false,
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            //缓存设置容联登录参数
                            def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO, retVal.data);
                            if (null != retVal.data.userPetname) {
                                def.getIMUserInfo(retVal.data); //add by wyn 20161110 获取用户信息,解决后台请求参数并发问题
                            }
                            var receipts = {};
                            sessionStorage.setItem("receipts-" + retVal.data.yxUser, JSON.stringify(receipts));
                            def.loginNIM(retVal.data);
                        } else {
                            //如果病友圈服务器在升级  则跳过此网络错误的广播
                            if (retVal.resultCode != "0000503") {
                                KyeeMessageService.broadcast({
                                    content: message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                    duration: 2000
                                });
                            }
                        }
                    }
                });
            },
            /**
             * 获取登录病友圈用户信息 modifyBy liwenjuan 2016/11/14 在获取信息后登录时关闭数据库
             */
            getIMUserInfo: function (yxInfo) {
                HttpServiceBus.connect({
                    url: 'third:userManage/user/accountinfo/get',
                    showLoading: false,
                    params: {},
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            var userActInfo = retVal.data;
                            def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO, userActInfo);
                            // YX 登录云信
                            CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.LOGIN_TIME, new Date().getTime());                            
                        } else {
                            KyeeMessageService.broadcast({
                                content: retVal.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },
            /**
             * 登录云信
             */
            loginNIM: function (loginInfo) {
                var appkey = loginInfo.appkey;
                var account = loginInfo.yxUser;
                var token = loginInfo.yxToken;
                IMDispatch.loginNIM(appkey, account, token);
            },
            /**
             * 登出云信
             */
            logOutNIM: function () {
                IMDispatch.logOutNIM();
            },
            //就医全流程短信自动登录
            messageAutoLogin: function (resultData, skipRoute, hospitalid) {
                def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, resultData.userData);

                def.saveUserInfoToCacheQuyiApp(resultData.userData, "", 0);
                if (!resultData.userData.ID_NO) {
                    AccountAuthenticationService.isAuthSuccess = '0';
                }
                if (hospitalid && hospitalid != "") {
                    //切换医院
                    //缓存医院详情
                    var hospInfoNow = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    def.isMessageSkip = true;
                    def.skipRoute = decodeURIComponent(skipRoute);
                    if (hospInfoNow && hospInfoNow.id && hospInfoNow.id == hospitalid) {
                        def.handleSelectHos(resultData.userData);
                    } else {
                        if (!def.selectHospitalFromMessage(hospitalid, resultData)) {
                            setTimeout(function () {
                                if (!def.selectHospitalFromMessage(hospitalid, resultData)) {
                                    $state.go('home->MAIN_TAB');
                                }
                            }, 1000);
                        }
                    }
                } else {
                    def.isMessageSkip = true;
                    def.skipRoute = decodeURIComponent(skipRoute);
                    def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                }
            },
            //切换医院
            selectHospitalFromMessage: function (hospitalid, resultData) {
                //切换医院
                var hospListCache = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                if (hospListCache) {
                    var hospList = hospListCache;
                    var newHospital = {};
                    for (var i = 0; i < hospList.length; i++) {
                        if (hospList[i].HOSPITAL_ID == hospitalid) {
                            newHospital.HOSPITAL_NAME = hospList[i].HOSPITAL_NAME;
                            newHospital.MAILING_ADDRESS = hospList[i].MAILING_ADDRESS;
                            newHospital.PROVINCE_CODE = hospList[i].PROVINCE_CODE;
                            newHospital.PROVINCE_NAME = hospList[i].PROVINCE_NAME;
                            newHospital.CITY_CODE = hospList[i].CITY_CODE;
                            newHospital.CITY_NAME = hospList[i].CITY_NAME;
                            break;
                        }
                    }
                    // 切换医院
                    HospitalSelectorService.selectHospital(hospitalid, newHospital.HOSPITAL_NAME,
                        newHospital.MAILING_ADDRESS, newHospital.PROVINCE_CODE, newHospital.PROVINCE_NAME,
                        newHospital.CITY_CODE, newHospital.CITY_NAME, "医院正在切换中...",
                        function () {
                            resultData.userData.HOSPITAL_ID = hospitalid;
                            def.handleSelectHos(resultData.userData);
                        });
                    return true;
                } else {
                    return false;
                }
            },
            /**
             * 自动注册并登录
             * @param userInfo  自动注册的用户/就诊者信息
             * @param skipRoute 将要跳转的路由
             * @param hospitalId 医院
             * userInfo包含信息
             * PHONE_NUMBER，ID_NO，NAME，REGISTER_SOURCE
             */
            autoRegisterAndLogin:function(userInfo,skipRoute,hospitalId){
                if(userInfo.PHONE_NUMBER&&(userInfo.ID_NO||(userInfo.IS_CHILD&&userInfo.IS_CHILD=="1"))&&userInfo.NAME&&userInfo.REGISTER_SOURCE){
                    //校验手机号
                    if (!CenterUtilService.validateMobil(userInfo.PHONE_NUMBER)) {
                        return;
                    }
                    def.submitUserAndPatient(userInfo, hospitalId, function (retUser) {
                        def.loginOff();
                        def.cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, userInfo.USER_INFO);

                        def.saveUserInfoToCacheQuyiApp(retUser, "", 0);

                        if (!retUser.ID_NO) {
                            AccountAuthenticationService.isAuthSuccess = '0';
                        }
                        if (hospitalId && hospitalId != "") {
                            //切换医院
                            def.isMessageSkip = true;
                            def.skipRoute = decodeURIComponent(skipRoute);
                            def.handleSelectHos(retUser);
                        } else {
                            def.isMessageSkip = true;
                            def.skipRoute = decodeURIComponent(skipRoute);
                            def.getSelectCustomInfo(); //登陆成功，查询登陆账户下选择的就诊者
                        }

                        var cache = CacheServiceBus.getMemoryCache();
                        var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                        //记录各个业务登录成功
                        objParams.USER_ID = retUser.USER_ID;
                        objParams.isLogin = 1;
                        def.getIMLoginInfo();
                        QRCodeSkipService.addRecord(objParams);
                    })
                }
            },
            /**
             * 自动注册请求
             * @param userInfo
             * @param hospitalId
             * @param onSuccess
             */
            submitUserAndPatient: function (userInfo, hospitalId, onSuccess) {
                if (!userInfo.PHONE_NUMBER) {
                    return;
                }
                var timestamp = (Date.parse(new Date()) / 1000000).toString().split(".")[0];
                var mdKey = Md5UtilService.md5("phoneNumber=" + userInfo.PHONE_NUMBER + "&timestamp=" + timestamp + "&key=quyi");
                var cache = CacheServiceBus.getMemoryCache();
                var token = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.TOKEN_4_FULL_CHECK);

                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: {
                        op:"registUserAndPatient",
                        HOSPITAL_ID:hospitalId,
                        PHONE_NUMBER:userInfo.PHONE_NUMBER,
                        ID_NO:userInfo.ID_NO,
                        NAME:userInfo.NAME,
                        REGISTER_SOURCE:userInfo.REGISTER_SOURCE,
                        OPEN_ID:userInfo.OPEN_ID,
                        key:mdKey,
                        CHECK_CODE:userInfo.CHECK_CODE,
                        token:token,
                        DEPT_CODE:def.REGISTER_INFO.DEPT_CODE,
                        DOCTOR_CODE:def.REGISTER_INFO.DOCTOR_CODE,
                        isCheckSecurityCode:userInfo.isCheckSecurityCode,
                        DATE_OF_BIRTH:userInfo.DATE_OF_BIRTH,
                        SEX:userInfo.SEX,
                        IS_CHILD:userInfo.IS_CHILD
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            if (retVal.data.USER_INFO && retVal.data.USER_INFO.USER_ID) {
                                onSuccess(retVal.data.USER_INFO);

                            } else {
                                $state.go('home->MAIN_TAB');
                            }
                        } else {
                            KyeeMessageService.broadcast({
                                content: message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },
            loginOff: function () {
                //清除缓存数据记录
                def.frontPage = "-1";
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST, undefined);
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, "");
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, "");
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.SECURITY_CODE, "");
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_PWD, undefined); //MemoryCache中的密码
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO, undefined);
                storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO, undefined);
                def.logoff();
                def.phoneNumberFlag = undefined;
            },
            /**
             * 丢失IM连接
             */
            onDisconnect: function (state) {
                switch (state) {
                    case 0:
                        break;
                    case 1:
                        break;
                    case 2:
                        // $state.go("login");
                        break;
                    case 6:
                        break;
                    case 7:
                        def.storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO,undefined);
                        break;
                    case 8:
                        break;
                    case 9:
                        // $state.go("login");
                        break;
                    case 10:
                        // $state.go("login");
                        break;
                    case 11:
                        // $state.go("login");
                }
            }
        };
        return def;
    })
    .build();