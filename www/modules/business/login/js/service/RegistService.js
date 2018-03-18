/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：注册的service
 *  修改人：付添
 * 任务号：KYEEAPPC-4506
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.regist.service")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.login.md5util.service",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.framework.service.umengchannel",
        "kyee.framework.device.deviceinfo"
    ])
    .type("service")
    .name("RegistService")
    .params(["$state", "KyeeMessageService", "KyeeViewService", "LoginService", "HttpServiceBus", "CacheServiceBus", "Md5UtilService", "RsaUtilService", "KyeeUmengChannelService", "KyeeDeviceInfoService", "KyeeUtilsService", "KyeeI18nService","CenterUtilService","AccountAuthenticationService"
    ])
    .action(function ($state, KyeeMessageService, KyeeViewService, LoginService, HttpServiceBus, CacheServiceBus, Md5UtilService, RsaUtilService, KyeeUmengChannelService, KyeeDeviceInfoService,KyeeUtilsService,KyeeI18nService,CenterUtilService,AccountAuthenticationService) {
        var def = {
            memoryCache: CacheServiceBus.getMemoryCache(),              //缓存
            storageCache: CacheServiceBus.getStorageCache(),            //内存
            IS_PHONE_NUMBER: undefined,                                 //手机号流转
            NORMAL_PROCESS: undefined,                                  //从姓名验证第二次过来走正常流程
            isFlag: undefined,                                            //是否从验证用户姓名过来
            timeCtrl :60,                                                 //定时器定时 60秒  By  付添  KYEEAPPC-3540
            isTimer :undefined,                                           //倒计时60s是否结束  By  付添  KYEEAPPC-3540
            timer:undefined,
            voiceCode:{                                                   //语音验证码
                voiceCode:undefined,                                      //是否是语音验证码
                isCountdown:undefined                                     //是否倒计时
            },
            /**
             * 发送短信验证码判断手机号90天流程
             * @param phoneNumber
             * @param $scope
             */
            mobilePhoneNumberIsInvalid: function (phoneNumber, $scope,onSuccess) {
                var isAgree = $scope.userInfo.isAgree;
                //效验是否同意协议 以及 手机号
                if (!CenterUtilService.isDataBlankAndHint(isAgree,KyeeI18nService.get("regist.needAgrement","您需要同意我们的协议！"))
                   ||!CenterUtilService.validateMobil(phoneNumber) ){
                    return;
                }
                var phoneNum = phoneNumber.trim();
                if (phoneNum.length == 14) {
                    phoneNum = phoneNum.substring(3);
                }
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        PHONE_NUMBER: phoneNum,
                        isRead: 1,
                        op: "checkPhoneNumDiff"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            /**
             * 验证用户信息校验姓名
             * @param name
             * @param phoneNumber
             * @param securityCode
             * @param PASSWORD
             * @param onSuccess
             */
            verifyName: function (name, phoneNumber, securityCode, PASSWORD, onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        NAME: name,
                        PHONE_NUMBER: phoneNumber,
                        PASSWORD: PASSWORD,
                        securityCode: securityCode,
                        op: "checkNameAndScd"
                    },
                    onSuccess: function (data) {
                        if (data != null && data != undefined) {
                            onSuccess(data);
                        }
                    }
                });
            },
            /**
             *发送短信验证码逻辑处理
             * @param $scope
             */
            getValiteCode: function ($scope) {
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();
                var phoneNum = $scope.userInfo.phoneNum;
                if (!CenterUtilService.validateMobil(phoneNum)) {
                    return;
                }
                if (phoneNum.length == 14) {
                    phoneNum = phoneNum.substring(3);
                }
                //发送短信获取验证码
                def.getMsgData(phoneNum, cache, storageCache, $scope);
            },
            /**
             * 发送验证码请求
             * @param phoneNum
             * @param cache
             * @param storageCache
             * @param $scope
             * @param onSuccess
             */
            getMsgData: function (phoneNum, cache, storageCache, $scope, onSuccess) {

                var hospitalId = "";
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo=  storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo){
                    hospitalId= hospitalInfo.id;
                }

                if(def.voiceCode.voiceCode == 1){                   //语音验证码
                    var url = '/user/action/DataValidationActionC.jspx'
                    var params = {
                        op: 'requestVoiceCodeActionC',
                        HOSPITAL_ID: hospitalId,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(phoneNum),
                        MOD_ID: '100698',
                        VOICE_TYPE: '6',
                        businessType:'0'
                    };
                    def.voiceCode.voiceCode = undefined;
                    def.voiceCode.isCountdown = 1 ;
                }else{                                                   //短信验证码
                    var url = '/user/action/DataValidationActionC.jspx';
                    var params = {
                        op: 'sendRegCheckCodeActionC',
                        hospitalId:hospitalId,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(phoneNum),
                        modId: '10001',
                        messageType: '3',
                        businessType:'0'
                    };
                }
                HttpServiceBus.connect({
                    url: url,
                    params: params,
                    onSuccess: function (retVal) {
                        if (!def.isFlag) {                              //验证用户性别不调用此处
                            var success = retVal.success;
                            var message = retVal.message;
                            if (success) {
                                if(def.voiceCode.isCountdown == 1){  //语音验证分支 KYEEAPPC-3540
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get("regist.voiceCall","请您稍等，[语音验证码]电话马上就来"),
                                        duration: 5000
                                    });
                                    $scope.userInfo.phoneNumDisabled = true;
                                    def.voiceCode.isCountdown = undefined;
                                    def.Countdown();
                                }else  {
                                    if('007'!=retVal.data.SECURITY_CODE)
                                    {
                                    KyeeMessageService.broadcast({
                                        content: message
                                    });}
                                    $scope.userInfo.phoneNumDisabled = true;
                                    $scope.userInfo.validateBtnDisabled = true;
                                    def.onRefreshDataviewDelay(retVal);
                                }
                            } else {
                                KyeeMessageService.broadcast({
                                    content: message
                                });
                            }
                        } else {
                            onSuccess(retVal);
                            def.isFlag = undefined;
                        }
                    }
                });
            },
            /**
             * 短语验证进入倒计时
             */
            onRefreshDataviewDelay: function (retVal) {
                if(retVal){
                    if('007'==retVal.data.SECURITY_CODE){
                        def.second=retVal.data.secondsRange;
                    }
                    else{
                        def.second = 120;
                    }
                }
                var validateMsgBtn = document.getElementById("regist.validateMsgBtn");
                var phoneNumInput = document.getElementById("regist.phoneNumInput");
                def.task = window.setInterval(def.setBtnState, 1000, phoneNumInput, validateMsgBtn);
            },
            /**
             * 短信验证码计时时逻辑控制
             * @param phoneNumInput
             * @param validateMsgBtn
             */
            setBtnState: function (phoneNumInput, validateMsgBtn) {
                try {
                    if (def.second != -1) {
                        validateMsgBtn.setAttribute("disabled","disabled");
                        phoneNumInput.setAttribute("disabled","disabled");
                        //直接操作$scope中的模型效率低下并且页面无法更新,因此直接操作dom
                        validateMsgBtn.innerText =
                            KyeeI18nService.get("regist.Surplus","剩余 ")+
                            def.second +
                            KyeeI18nService.get("regist.seconds","秒") ;
                        def.second--;
                    } else {
                        //直接操作$scope中的模型使页面无法更新,因此直接操作dom
                        validateMsgBtn.removeAttribute("disabled");
                        phoneNumInput.removeAttribute("disabled");
                        validateMsgBtn.innerText = KyeeI18nService.get("regist.getCode","获取验证码");
                        clearInterval(def.task);
                    }
                } catch (e) {
                    clearInterval(def.task);
                }
            },
            /**
             * 语音验证进入倒计时
             * @constructor
             */
            Countdown:function(){
                def.timeCtrl = 60;
                timer = KyeeUtilsService.interval({
                    time: 1000,
                    action: function () {
                        def.setBtnStateVoice(timer);
                    }
                });
                def.isTimer = 1;
            },
            /**
             * 验证语音倒计时时逻辑控制
             * @param timer
             */
            setBtnStateVoice :function (timer) {
                try {
                    if (def.timeCtrl != -1) {
                        def.timeCtrl--;
                    } else {
                        def.isTimer = undefined;
                        //关闭定时器
                        KyeeUtilsService.cancelInterval(timer);
                    }

                } catch (e) {
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            },
            /**
             *  取消倒计时任务
             */
            clearTask: function () {
                if (def.task) {
                    clearInterval(def.task);
                }
            },
            /**
             * 注册并登陆请求
             * @param $scope
             * @param afterRegistAndLogin
             * @returns {boolean}
             */
            registAndLogin: function ($scope, afterRegistAndLogin) {
                var isAgree = $scope.userInfo.isAgree;
                var phoneNum = $scope.userInfo.phoneNum;
                var loginNum = $scope.userInfo.loginNum;
                var password = $scope.userInfo.password;
                var guideNum = $scope.userInfo.guideNum;
                var remark = $scope.userInfo.remark;
                var isCheckMsg = $scope.userInfo.isCheckMsg;

                if(false ==CenterUtilService.validateGuideNum($scope.userInfo.guideNum)){
                    guideNum="";
                }
                //效验是否同意协议、 手机号、密码
                if (!CenterUtilService.isDataBlankAndHint(isAgree,KyeeI18nService.get("regist.needAgrement","您需要同意我们的协议！"))
                    ||!CenterUtilService.validateMobil(phoneNum) || !CenterUtilService.validatePassWord(password)){
                    return;
                }
                if (phoneNum.length == 14) {
                    phoneNum = phoneNum.substring(3);
                }
                if (!isCheckMsg) {     // 后台参数控制不开启发送短信验证码
                    def.notHaveMeassageCode(isCheckMsg,phoneNum, password, guideNum, remark, loginNum, afterRegistAndLogin);
                } else {              //效验验证码
                    if (!CenterUtilService.validateCheckCode(loginNum) ){
                        return false;
                    }
                    //提交注册信息
                    def.submitRegistInfo(phoneNum, password, guideNum, remark, loginNum, afterRegistAndLogin);
                }
            },
            /**
             * 后台参数不开启短信验证码
             * @param phoneNum
             * @param password
             * @param guideNum
             * @param remark
             * @param loginNum
             * @param afterRegistAndLogin
             */
            notHaveMeassageCode :function(isCheckMsg,phoneNum, password, guideNum, remark, loginNum, afterRegistAndLogin){
                var cache = CacheServiceBus.getMemoryCache();
                if (!isCheckMsg) {                      // 后台参数控制不开启发送短信验证码
                    HttpServiceBus.connect({
                        url: '/user/action/LoginAction.jspx',
                        params: {
                            op: 'PhoneNumExist',
                            PHONE_NUMBER: phoneNum,
                            userSource: cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE)
                        },
                        onSuccess: function (retVal) {
                            var success = retVal.success;
                            var status = retVal.data;
                            if (success) {
                                if (status == 0) {    //手机号不存在  提交注册信息
                                    def.submitRegistInfo(phoneNum, password, guideNum, remark, loginNum, afterRegistAndLogin);
                                }
                            } else {
                                try {
                                    if (status == 1) {
                                        KyeeMessageService.confirm({
                                            title: KyeeI18nService.get("login.hint","提示"),
                                            content: KyeeI18nService.get("login.phoneUsedTip","该手机号已注册，是否继续注册并清除原帐号中的手机号码？"),
                                            onSelect: function (flag) {
                                                if (flag) {
                                                    //提交注册信息
                                                    def.submitRegistInfo(phoneNum, password, guideNum, remark, loginNum, afterRegistAndLogin);
                                                } else {
                                                    KyeeMessageService.confirm({
                                                        title: KyeeI18nService.get("login.hint", "提示"),
                                                        content: KyeeI18nService.get("regist.isFindPaass", "是否去找回密码？"),
                                                        onSelect: function (flag) {
                                                            if (flag) {
                                                                $state.go("find_password");             //模态改路由 付添  KYEEAPPC-3658
                                                                LoginService.userInfo.user = phoneNum;   //存储phoneNum，以便带入到找回密码页面
                                                                LoginService.toFindPwdFrontPage = "2";  //记录从注册页面跳转到找回密码页面
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        KyeeMessageService.broadcast({
                                            content: message
                                        });
                                    }
                                } catch (e) {
                                    KyeeMessageService.broadcast({
                                        content: message
                                    });

                                }
                            }
                        }
                    });
                }
            },

            /**
             *  提交注册信息请求并登陆
             * @param phoneNum
             * @param password
             * @param guideNum
             * @param remark
             * @param loginNum
             * @param afterRegistAndLogin
             */
            submitRegistInfo: function (phoneNum, password, guideNum, remark, loginNum, afterRegistAndLogin) {
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();
                var userRegistInfo = {
                    USER_CODE: phoneNum,
                    PASSWORD: RsaUtilService.getRsaResult(password),
                    PHONE_NUMBER: phoneNum,
                    USER_SOURCE: cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE),
                    SECURITY_CODE: loginNum
                };
                if (guideNum.trim()) {
                    userRegistInfo.MEDICAL_GUIDE = guideNum.trim() + '$' + storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                }
                if (remark.trim()) {
                    userRegistInfo.REMARK = remark.trim();
                }
                HttpServiceBus.connect({
                    url: '/user/action/LoginAction.jspx',
                    params: {
                        op: 'register',
                        postdata: userRegistInfo,
                        HOSPITAL_ID:LoginService.REGISTER_INFO.HOSPITAL_ID,
                        IS_RECORD_REGISTER:LoginService.REGISTER_INFO.IS_RECORD_REGISTER,
                        REGISTER_SOURCE:LoginService.REGISTER_INFO.REGISTER_SOURCE,
                        DEPT_CODE:LoginService.REGISTER_INFO.DEPT_CODE,
                        DOCTOR_CODE:LoginService.REGISTER_INFO.DOCTOR_CODE
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, phoneNum);
                            //修改缓存中记住密码存储明文问题 KYEEAPPC-3781 zhangjiahao
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD, LoginService.encrypt(password));
                            //调用登录接口
                            var userInfo = {
                                user: phoneNum,
                                pwd: password
                            };
                            def.getUMengInfo(userRegistInfo);                    //友盟渠道信息获取
                            AccountAuthenticationService.isAuthSuccess = "0";
                            if(LoginService.isShortMesReqFlag==1){             //检验检查单短信链接中APP登录用户转注册后取消引导
                                LoginService.isShortMesReqFlag=0;
                            }
                            LoginService.doLogin(userInfo, afterRegistAndLogin); //注册成功自动登录
                        } else {
                            KyeeMessageService.broadcast({
                                content: message
                            });
                        }
                    }
                });
            },
            //友盟渠道信息获取
            getUMengInfo : function(userRegistInfo){
                try{
                    KyeeDeviceInfoService.getInfo(
                        function(device){
                            var deviceType = device.platform;
                            if(deviceType == "Android"){  //目前只支持android
                                KyeeUmengChannelService.getChannel(
                                    function(channel){
                                        HttpServiceBus.connect({
                                            url : '/umeng/action/ChannelUserRegActionC.jspx',
                                            params : {
                                                op : "addChannelUser",
                                                user_code : userRegistInfo.USER_CODE,
                                                channel : channel
                                            },
                                            onSuccess : function(){  //此请求没有返回
                                            },
                                            onError : function(){
                                            }
                                        });
                                    },
                                    //此函数不能删除，外壳不判空,否则获取不到
                                    function(retVal){},[]
                                );
                            }
                        },
                        function(){

                        }
                    );
                }catch(e){
                    console.log( KyeeI18nService.get("regist.failGetFriend","友盟渠道信息获取失败"));
                }
            },
            /**
             *   判断是否显示“导医”“备注”“发送短信验证码”
             * @param userInfo
             */
            isShow: function (userInfo) {
                def.isCheckMsg(userInfo)
                def.isGuideShow(userInfo);
                def.isRemarkShow(userInfo);
            },
            /**
             *  判断是否显示“导医”
             * @param userInfo
             */
            isGuideShow: function (userInfo) {
                var hospId = "";
                if(def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO)
                    && def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id){
                    hospId = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id
                }
                HttpServiceBus.connect({
                    url: "/user/action/LoginAction.jspx",
                    params: {
                        op: 'ifShowGuid',
                        hospitalId: hospId
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var data = retVal.data;
                        if (success && data && data.IS_SHOW == "1") {
                            userInfo.isGuideShow = true;
                        }
                    },
                    onError: function (retVal) {
                    }
                });
            },
            /**
             * 判断是否显示“备注”
             * @param userInfo
             */
            isRemarkShow: function (userInfo) {
                var hospId = "";
                if(def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO)
                    && def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id){
                    hospId = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id
                }
                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        op: "queryHospitalParam",
                        hospitalId: hospId,
                        paramName: "REMARK_USER"
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var data = retVal.data;
                        if (success && data && data.REMARK_USER == "1") {
                            userInfo.isRemarkShow = true;
                        }
                    },
                    onError: function (retVal) {
                    }
                });
            },
            /**
             *   判断是否显示“验证码”
             * @param userInfo
             */
            isCheckMsg: function (userInfo) {
                HttpServiceBus.connect({
                    url: "/config/action/ParamsystemActionC.jspx",
                    params: {
                        op: "querySysParams",
                        PARA_CODE: "REG_ENABLED_SECURITYCODE"
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            if(retVal.data.REG_ENABLED_SECURITYCODE == 'true') {
                                userInfo.isCheckMsg = true;
                            }else {
                                userInfo.isCheckMsg = false;
                            }
                        } else {
                            userInfo.isCheckMsg = true;
                        }
                    },
                    onError: function () {
                        userInfo.isCheckMsg = true;
                    }
                });
            },
            /**
             * 消息提示
             * @param title
             * @param content
             * @param okText
             */
            remind: function (title, content) {
                KyeeMessageService.broadcast({
                    content: content
                });
            }
        };
        return def;
    })
    .build();
