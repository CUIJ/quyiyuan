/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：找回密码的service
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.findpassword.service")
    .require([
        "kyee.quyiyuan.login.regist.service",
        "kyee.quyiyuan.login.service"
    ])
    .type("service")
    .name("FindPasswordService")
    .params([
        "$state", "RegistService", "LoginService", "HttpServiceBus", "KyeeMessageService", "CacheServiceBus", "RsaUtilService", "KyeeI18nService", "CenterUtilService","$ionicHistory"
    ])
    .action(function ($state, RegistService, LoginService, HttpServiceBus, KyeeMessageService, CacheServiceBus, RsaUtilService,KyeeI18nService,CenterUtilService,$ionicHistory) {

        var def = {
            //用户信息
            userInfo: {
                phoneNum: ""
            },
            /**
             * 发送短信验证码数据处理
             * @param userInfo
             */
            getValiteCode: function (userInfo,needNameCheckFun) {
                var phoneNum = userInfo.phoneNum;
                //校验手机号
                if (!CenterUtilService.validateMobil(phoneNum)){
                    return;
                }
                if (phoneNum.length == 14) {
                    phoneNum = phoneNum.substring(3);
                }
                //检查手机号是否存在,存在则去获取验证码
                HttpServiceBus.connect({
                        url: '/user/action/LoginAction.jspx',
                        params: {
                            op: 'phoneNumExistForLogin',
                            PHONE_NUMBER: phoneNum
                        },
                        onSuccess: function (retVal) {
                            var success = retVal.success;
                            if (success) {
                                var retData = retVal.data;
                                if(retData){
                                    if(retData.IS_PHONE_BIND && retData.NEED_CHECK){//手机超过90天未登录,需要校验
                                        needNameCheckFun();
                                        KyeeMessageService.broadcast({
                                            content:KyeeI18nService.get("find_password.needNameCheck","该帐号长时间未登录，为确保账户安全请您输入账户下任意就诊者姓名验证。"),
                                            duration : 3000
                                        });
                                        def.getMsgData(userInfo);
                                    }else if(retData.IS_PHONE_BIND ){//手机号已经注册
                                        def.getMsgData(userInfo);
                                    }else{//手机号还没注册
                                        KyeeMessageService.broadcast({
                                            content:KyeeI18nService.get("find_password.canNotChangePass","该手机号未注册，不能修改密码！")
                                        });
                                    }
                                }
                            } else {        //请求失败
                                KyeeMessageService.broadcast({
                                    content:KyeeI18nService.get("login.netFailed","网络异常！")
                                });
                            }
                        }
                    });
                },
            /**
             * 发送短信验证码请求
             * @param userInfo
             */
            getMsgData: function (userInfo) {
                var phoneNum = userInfo.phoneNum;
                var hospitalId = "";
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo=  storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo){
                    hospitalId= hospitalInfo.id;
                }
                HttpServiceBus.connect({
                    url: '/user/action/DataValidationActionC.jspx',
                    params: {
                        op: 'sendRegCheckCodeActionC',
                        hospitalId: hospitalId,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(phoneNum),
                        modId: '10001',
                        messageType: '2',
                        businessType:'0'
                    },
                    onSuccess: function (retVal) {
                        var success = retVal.success;
                        var message = retVal.message;
                        if (success) {
                            userInfo.phoneNumDisabled = true;
                            userInfo.validateBtnDisabled = true;
                            def.onRefreshDataviewDelay(retVal);
                        } else {
                            KyeeMessageService.broadcast({
                                content: message
                            });
                        }
                    }
                });
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
             * 开启倒计时
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
                var validateMsgBtn = document.getElementById("findPassword.validateMsgBtn");
                var phoneNumInput = document.getElementById("findPassword.phoneNumInput");
                def.task = window.setInterval(def.setBtnState, 1000, validateMsgBtn, phoneNumInput);
            },
            /**
             * 倒计时时页面显示处理
             * @param validateMsgBtn
             * @param phoneNumInput
             */
            setBtnState: function (validateMsgBtn, phoneNumInput) {
                try {
                    if (def.second != -1) {
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
                        validateMsgBtn.innerText =  KyeeI18nService.get("regist.getCode","获取验证码");
                        clearInterval(def.task);
                    }
                } catch (e) {
                    clearInterval(def.task);
                }
            },
            /**
             * 修改密码请求
             * @param phoneNum
             * @param newPassword
             * @param securityCode
             */
            resetPassword : function(paraObj){
                HttpServiceBus.connect({
                    url : '/user/action/LoginAction.jspx',
                    showLoading : false,  //此属性必须设为false，否则小米2S严重卡帧
                    params : paraObj,
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        var message = retVal.message;
                        if(success){
                            KyeeMessageService.broadcast({
                                content :  KyeeI18nService.get("new_password.changPassSuccess","密码修改成功！")
                            });
                           def.afterChangePwd();
                            //缓存用户 清空密码 让用户重新输入
                            var storageCache = CacheServiceBus.getStorageCache();
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD,"");
                            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.USER, phoneNum);
                        }else{
                            if(message){
                                KyeeMessageService.broadcast({
                                    content : message
                                });
                            }else{
                                KyeeMessageService.broadcast({
                                    content : KyeeI18nService.get("new_password.changPassFail","用户密码重置失败！")
                                });
                            }
                        }
                    }
                });
                //将用户信息存入LoginService中，以便可以从同一的接口中取出
                LoginService.userInfo.user = phoneNum;
                LoginService.userInfo.password = newPassword;
            },
            /**
             * 修改密码后的回调方法
             */
            afterChangePwd : function () {
                LoginService.isQuickLogin = "1";   //是否需要密码登录标识
                var toFindPwdFrontPage = LoginService.toFindPwdFrontPage;
                if (toFindPwdFrontPage == "1") {   //从登录页面到找回密码页面,隔了两层调用两次hideModel方法
                    $ionicHistory.goBack();          //模态改路由 付添  KYEEAPPC-3658
                }
                if (toFindPwdFrontPage == "2") {  //从注册页面跳转到登录页面,隔了三层模态窗口因此调用两次hideModel方法
                    $ionicHistory.goBack(-2);// 模态改路由 付添  KYEEAPPC-3658
                }
                if (toFindPwdFrontPage == "3") {
                    $ionicHistory.goBack();
                    setTimeout(function (){
                        LoginService.frontPage = "4";  //标志从预约挂号确认跳转到登录页面
                        $state.go("login");// 模态改路由 付添  KYEEAPPC-3658
                    }, 1);
                }
                var validateMsgBtn = document.getElementById("findPassword.validateMsgBtn");
                validateMsgBtn.innerText =  KyeeI18nService.get("regist.getCode","获取验证码");
                def.clearTask();//取消倒计时任务,否则此任务一直在执行
            }
        };
        return def;
    })
    .build();
