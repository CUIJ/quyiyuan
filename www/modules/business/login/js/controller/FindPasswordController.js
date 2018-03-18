/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：忘记密码controller
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.findpassword.controller")
    .require([
        "kyee.quyiyuan.login.regist.service",
        "kyee.quyiyuan.login.findpassword.service",
        "kyee.quyiyuan.login.service",
        "kyee.framework.service.view"
    ])
    .type("controller")
    .name("FindPasswordController")
    .params(["$scope", "$rootScope", "RegistService", "FindPasswordService", "LoginService", "KyeeViewService", "KyeeDeviceMsgService", "KyeeListenerRegister",  "$state", "KyeeI18nService", "$ionicHistory","RsaUtilService","CenterUtilService","KyeeMessageService"
    ])
    .action(function ($scope, $rootScope, RegistService, FindPasswordService, LoginService, KyeeViewService, KyeeDeviceMsgService, KyeeListenerRegister, $state,KyeeI18nService,$ionicHistory,RsaUtilService,CenterUtilService,KyeeMessageService) {
        $scope.userInfo=[];


        /**
         * 监听进入当前页面
         */
        KyeeListenerRegister.regist({
            focus: "find_password",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                inteview();
            }
        });
        var inteview= function(){
            $scope.userInfo = {              //初始化用户注册信息
                phoneNum: LoginService.userInfo.user,
                loginNum: "",                //验证码
                phoneNumDisabled: false,
                validateBtnDisabled: false,
                pwdType: "password",
                userName:""
            };
            $scope.isActive = false;        //点击眼睛图标状态
            $scope.isNeedNameCheck = false; //用户是否需要进行用户名校验标识，针对90天未登录用户。
            $scope.hintPhone= KyeeI18nService.get("login.hintPhone","请输入您注册的手机号");
            $scope.hintCode=KyeeI18nService.get("regist.hintCode","请输入验证码");
            $scope.hintPass=KyeeI18nService.get("regist.hintPassFormat","请设置密码（6到16位数字或字母）");
            $scope.userName = KyeeI18nService.get("login.userNameReminder","请输入账户下任意就诊者姓名");
            FindPasswordService.clearTask();
        }
        /**
         *  密码眼睛点击事件
         */
        $scope.iconClick = function () {
            if ($scope.isActive == true) {
                $scope.userInfo.pwdType = "password";
                $scope.isActive = false;
            } else {
                $scope.userInfo.pwdType = "text";
                $scope.isActive = true;
            }
        };
        /**
         * 获取验证码点击事件
         */
        $scope.getValiteCode = function () {
            $scope.isNeedNameCheck = false; //初始化需要用户名校验标识。
            FindPasswordService.getValiteCode($scope.userInfo,function(){
                $scope.isNeedNameCheck = true;
                $scope.userInfo.userName = "";
            });
            //手机验证码自动回填
            KyeeDeviceMsgService.getMessage(
                function (validateNum) {
                    $scope.userInfo.loginNum = validateNum;
                    $scope.$digest();
                }
            );
        };
        /**
         * 提交点击事件
         */
        $scope.submit = function () {
            //将手机号存入到FindPasswordService中，以便在下个页面可以取出
            FindPasswordService.userInfo.phoneNum = $scope.userInfo.phoneNum;
            var securityCode = $scope.userInfo.loginNum;
            var phoneNum = FindPasswordService.userInfo.phoneNum;
            var newPassword = $scope.userInfo.newPassword;
            var userName = $scope.userInfo.userName;
            //手机号、密码、验证码校验
            if (!CenterUtilService.validateMobil(phoneNum) || !CenterUtilService.validatePassWord(newPassword)){
                return;
            }
            if (!CenterUtilService.validateCheckCode(securityCode) ){
                return false;
            }
            var paraObj = {
                op : 'changepwdByphone',
                PHONE_NUMBER : phoneNum,
                PASSWORD : RsaUtilService.getRsaResult(newPassword),
                SECURITY_CODE : securityCode   // 忘记密码问题   By  张家豪  KYEEAPPC-2887
            };
            if($scope.isNeedNameCheck){
                if( !CenterUtilService.isDataBlank(userName)){
                    paraObj.USER_NAME = userName;
                    paraObj.NEED_NAME_CHECK = 'true';
                }else{
                    KyeeMessageService.broadcast({
                        content : KyeeI18nService.get("new_password.changPassFail","用户名不能为空")
                    });
                    return;
                }
            }

            FindPasswordService.resetPassword(paraObj); //重新设置密码
        };
    })
    .build();
