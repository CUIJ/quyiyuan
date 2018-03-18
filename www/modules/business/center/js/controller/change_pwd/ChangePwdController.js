/**
 * Created by Administrator on 2015/4/26.
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.change_pwd")
    .require(["kyee.quyiyuan.center.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.center.service.ChangePwdService",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.quyiyuan.login.service"])
    .type("controller")
    .name("ChangePwdController")
    .params([
        "$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "ChangePwdService",
        "RsaUtilService",
        "CacheServiceBus",
        "LoginService",
        "KyeeI18nService",
        "KyeeListenerRegister"])
    .action(function (
        $scope,
        $state,
        KyeeMessageService,
        KyeeViewService,
        ChangePwdService,
        RsaUtilService,
        CacheServiceBus,
        LoginService,
        KyeeI18nService,
        KyeeListenerRegister) {
        //监听进入当前页面
        KyeeListenerRegister.regist({
            focus: "change_pwd",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                enterFun();
            }
        });
        //页面初始化调用
        var enterFun = function(){
            $scope.isActive = false; //点击眼睛图标状态
            oldPwd.type = 'password';
            newPwd.type = 'password';
            $scope.pwdInfo={old_pwd:null, new_pwd: null}; //初始化密码变量
            $scope.placeholderInfo = {
                purInto:KyeeI18nService.get("change_pwd.purInto","请输入您的原始密码"),
                purInto616:KyeeI18nService.get("change_pwd.purInto616","请您输入6-16位新密码")
            };
        };
        //输入可视事件
        $scope.iconClick = function () {
            if ($scope.isActive == true) {
                //oldPwd.type = 'password';
                newPwd.type = 'password';
                $scope.isActive = false;
            } else {
                //oldPwd.type = 'text';
                newPwd.type = 'text';
                $scope.isActive = true;
            }
        };

        //提交按钮事件
        $scope.submentClick = function () {
            var strOldPwd =$scope.pwdInfo.old_pwd;
            var strNewPwd =$scope.pwdInfo.new_pwd;
            var checkedNewPwd = undefined;//KYEEAPPTEST-2243

            var flag=validate(strNewPwd,strOldPwd);  //验证输入格式是否正确（未验证特殊字符）
            if(flag)
            {
                var timeRandom = new Date().getTime();
                strNewPwd = RsaUtilService.getRsaResult(strNewPwd);   //rsa加密 密码
                strOldPwd = RsaUtilService.getRsaResult(strOldPwd);   //rsa加密 密码

                //获取缓存数据
                var Cache = CacheServiceBus.getMemoryCache();
                var currentUserRecord = Cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var currentUser=Cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER);
                //封装发往后台数据
                var data = {
                    USER_ID:currentUserRecord.USER_ID,
                    PASSWORD: strNewPwd,
                    OLDPASSWORD:strOldPwd,
                    ConfirmPASSWORD:null,
                    USER_CODE:currentUser
                };

                ChangePwdService.checkOldPwd(function(rsp){
                    //处理和服务器交互后回调返回的值
                    if(rsp.success){
                        if(data.USER_ID!=""&&data.USER_ID!=undefined)
                        {
                            checkedNewPwd = $scope.pwdInfo.new_pwd;//KYEEAPPTEST-2243
                            $scope.pwdInfo={old_pwd:null, new_pwd: null};
                            $scope.changeService(data,checkedNewPwd);//KYEEAPPTEST-2243
                        }
                        else
                        {
                            if(rsp.message!=""&&rsp.message!=undefined){
                                $scope.warnMessage(rsp.message);
                            }
                            else
                            {
                                $scope.warnMessage(KyeeI18nService.get("change_pwd.validationFailure","验证失败！"));
                            }
                        }
                    }else
                    {
                        var message=KyeeI18nService.get("change_pwd.oldValidationFailure","旧密码验证失败！");
                        $scope.warnMessage(message);
                    }
                },data.USER_CODE,data.OLDPASSWORD,$scope)
            }
        };
        //修改密码
        $scope.changeService=function(data,checkedNewPwd){
            ChangePwdService.changePwdService(function(rsp){
                //处理和服务器交互后回调返回的值
                if(rsp.success){
                    //修改密码成功后，注销登陆状态
                    LoginService.logoff();
                    LoginService.logoutRongLian();
                    var message=KyeeI18nService.get("change_pwd.changeSuccess","用户密码修改成功，请重新登录！");
                    $scope.warnMessage(message);
                    var storageCache = CacheServiceBus.getStorageCache(); //Storage缓存
                    storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.PWD,undefined);//密码栏制空   By  张家豪  KYEEAPPTEST-3044
                    LoginService.changePwd = checkedNewPwd;//KYEEAPPTEST-2243
                    LoginService.isQuickLogin = "1";   //是否需要密码登录标识
                    $state.go("login");//模态改路由 付添  KYEEAPPC-3658
                }else
                {
                    if(rsp.message!=""&&rsp.message!=undefined){
                        $scope.warnMessage(rsp.message);
                    }
                    else
                    {
                        $scope.warnMessage(KyeeI18nService.get("change_pwd.changeFalse","修改密码失败！"));
                    }
                }
            },data,$scope);
        };
        //验证密码输入格式
        var validate=function(newPwd,oldPwd) {
            if (oldPwd == "" || oldPwd == null) {
                message = KyeeI18nService.get("change_pwd.oldPwdNoNull","旧密码不能为空！");
                $scope.warnMessage(message);
                return false;
            } else {
                if (newPwd == "" || newPwd == null) {
                    message = KyeeI18nService.get("change_pwd.newPwdNoNull","新密码不能为空！");
                    $scope.warnMessage(message);
                    return false;
                }
                else {
                    var patrn = /^[!@#$*_A-Za-z0-9]+$/;
                    if (!patrn.test(newPwd)) {
                        message =KyeeI18nService.get("change_pwd.specialCharacters", "密码必须字母、数字或者特殊字符(!@#$*_ )！");
                        $scope.warnMessage(message);
                        return false;
                    }
                    else {
                        if (newPwd.length > 16) {
                            message =KyeeI18nService.get("change_pwd.newLess17","新密码必须小于17位！");
                            $scope.warnMessage(message);
                            return false;
                        }
                        if (newPwd.length < 6) {
                            message =KyeeI18nService.get("change_pwd.newMore5","新密码必须大于5位！");
                            $scope.warnMessage(message);
                            return false;
                        }
                        return true;
                    }
                }
            }
        };
        //预警提示
        $scope.warnMessage = function (message) {
            KyeeMessageService.broadcast({
                content: message
            });
        };
        //跳转页面
        $scope.openModal = function(url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };

    })
    .build();