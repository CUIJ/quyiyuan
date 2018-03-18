/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:24:38
 * 创建原因：医生密码初始化页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.pwdInit.controller")
    .require([
        "kyee.quyiyuan.doctorRole.pwdInit.service"
    ])
    .type("controller")
    .name("DoctorPwdInitController")
    .params(["$scope", "$state", "KyeeMessageService", "DoctorPwdInitService", "CacheServiceBus", "Md5UtilService","KyeeUtilsService","KyeeI18nService"])
    .action(function ($scope, $state, KyeeMessageService, DoctorPwdInitService, CacheServiceBus, Md5UtilService,KyeeUtilsService,KyeeI18nService) {

        $scope.placeholderPhoneCode = KyeeI18nService.get("doctor_pwd_init.placeholderPhoneCode","请输入手机验证码");
        $scope.placeholderPassword = KyeeI18nService.get("doctor_pwd_init.placeholderPassword","密码（6-16位）");
        $scope.isActive = false; //点击眼睛图标状态
        $scope.pwdInfo = {}; //初始化密码变量
        $scope.inputType = 'password';
        $scope.innerText =  KyeeI18nService.get("doctor_pwd_init.getVerificationCode", "获取验证码");


        $scope.userInfo = {};
        $scope.userInfo.phoneNum = DoctorPwdInitService.phoneNum;

        var second = 120;
        var task;
        $scope.userInfo.validateBtnDisabled = false;

        var onRefreshDataviewDelay = function () {
            second = 120;
            setBtnState();
            $scope.userInfo.validateBtnDisabled = true;
            var timer = KyeeUtilsService.interval({
                time: 1000,
                action: function () {
                    second--;
                    setBtnState(timer);
                }
            });
        };

        var setBtnState = function (timer) {
            try {
                if (second != -1) {
                    $scope.innerText = '剩余' + second + '秒';
                } else {
                    $scope.userInfo.validateBtnDisabled = false;
                    $scope.innerText =  KyeeI18nService.get("doctor_pwd_init.getVerificationCode", "获取验证码");
                    //关闭定时器
                    KyeeUtilsService.cancelInterval(timer);
                }
            } catch (e) {
                //关闭定时器
                KyeeUtilsService.cancelInterval(timer);
            }
        };

        /**
         * 自动获取验证码
         */
        $scope.getValiteCode = function () {
            DoctorPwdInitService.getValiteCode(function (result) {
                showMessage(result.message);
                if (result.success) {
                    onRefreshDataviewDelay();
                    showMessage(result.message);
                }
            });
        };
        //有电话号码则直接发送验证码
        if ($scope.userInfo.phoneNum) {
            $scope.getValiteCode();//页面初始化过程中自动获取验证码
        }

        /**
         * 输入可视事件
         */
        $scope.iconClick = function () {
            if ($scope.isActive) {
                $scope.inputType = 'password';
                $scope.isActive = false;
            } else {
                $scope.inputType = 'text';
                $scope.isActive = true;
            }
        };

        /**
         * 提交修改密码请求
         */
        $scope.submentClick = function () {
            if(DoctorPwdInitService.phoneNum){
                if ($scope.userInfo.validateCode == "" || $scope.userInfo.validateCode == undefined) {
                    showMessage(KyeeI18nService.get("doctor_pwd_init.validateCodeNotNull", "验证码不能为空！"));
                    return;
                }//KYEEAPPTEST-3125 程铄闵 未校验验证码
            }
            if ($scope.pwdInfo.new_pwd == "" || $scope.pwdInfo.new_pwd == undefined) {
                showMessage(KyeeI18nService.get("doctor_pwd_init.passwordNotNull", "密码不能为空！"));
                return;
            }
            if ($scope.pwdInfo.new_pwd.length > 17) {
                showMessage(KyeeI18nService.get("doctor_pwd_init.maxPasswordLength", "密码必须小于17位！"));
                return;
            } else if ($scope.pwdInfo.new_pwd.length < 6) {
                showMessage(KyeeI18nService.get("doctor_pwd_init.minPasswordLength", "密码必须大于5位！"));
                return;
            }

            var currentUser = CacheServiceBus.getMemoryCache().
                get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER);
            var currentHospitalId = CacheServiceBus.getStorageCache().
                get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

            DoctorPwdInitService.updateDoctorPwd(currentUser, currentHospitalId, $scope.pwdInfo.new_pwd,$scope.userInfo.validateCode,
                function (result) {

                    if (result.success) {
                        if (result.data.FLAG > -1) {//医生编码或旧密码错误标识,请重新输入
                            showMessage(result.message);
                            $state.go("doctor_login");
                        } else {
                            showMessage(result.message);
                            $scope.pwdInfo = {};
                        }

                    } else {
                        showMessage(result.message);
                    }
                });
        };

        /**
         * 显示提示信息
         */
        var showMessage = function (message) {
            KyeeMessageService.broadcast({
                content: message ? message : KyeeI18nService.get("doctor_pwd_init.networkAnomly", "网络异常！")
            });
        };

    })
    .build();
