/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:24:38
 * 创建原因：医生登录页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.login.controller")
    .require([
        "kyee.quyiyuan.doctorRole.login.service",
        "kyee.quyiyuan.doctorRole.pwdInit.controller",
        "kyee.quyiyuan.doctorRole.home.controller"
    ])
    .type("controller")
    .name("DoctorLoginController")
    .params(["$rootScope", "$scope", "$state", "KyeeMessageService",
        "CacheServiceBus", "DoctorLoginService", "DoctorPwdInitService","KyeeI18nService"])
    .action(function ($rootScope, $scope, $state, KyeeMessageService,
                      CacheServiceBus, DoctorLoginService, DoctorPwdInitService,KyeeI18nService) {

        $scope.userInfo = {};
        $scope.placeholderDoctorCode = KyeeI18nService.get("doctor_login.placeholderDoctorCode","请输入医生编码");
        $scope.placeholderDoctorPassword = KyeeI18nService.get("doctor_login.placeholderDoctorPassword","请输入密码");

        /**
         * 登录按钮事件
         */
        $scope.doLogin = function () {
            if (!$scope.userInfo.userName) {
                showMessage(KyeeI18nService.get("doctor_login.doctorCodeNotNull", "医生编码不能为空！"));
                return;
            }

            if (!$scope.userInfo.passWord) {
                showMessage(KyeeI18nService.get("doctor_login.passwordNotNull", "密码不能为空！"));
                return;
            }

            DoctorLoginService.validateDoctorUser($scope.userInfo.userName, $scope.userInfo.passWord, function (resp) {

                if (resp.success && resp.data) {
                    var doctorInfo = {};
                    var isInit = undefined;
                    isInit = resp.data.IS_INIT;
                    doctorInfo.old_pwd = $scope.userInfo.passWord;
                    doctorInfo.doctor_user = resp.data.DOCTOR_CODE;
                    doctorInfo.phone_number = resp.data.DOCTOR_PHONE;
                    if (isInit != '' && isInit != undefined) {
                        //是否需要修改密码1：是 0:否
                        if (isInit == '1') {
                            DoctorPwdInitService.doctorUser = doctorInfo.doctor_user;
                            DoctorPwdInitService.doctorPwdOld = doctorInfo.old_pwd;
                            DoctorPwdInitService.phoneNum = doctorInfo.phone_number;
                            $state.go("doctor_pwd_init");
                        } else {
                            //正常登录，不需修改密码
                            setDoctorCacheInfo(false, doctorInfo.doctor_user);
                        }
                    } else {
                        showMessage();
                    }
                } else {
                    if (resp.resultCode && resp.resultCode == '0040105') {
                        showMessage(resp.message);
                    } else {
                        showMessage();
                    }
                }
            });
        };

        /**
         * 显示提示信息
         */
        var showMessage = function (message) {
            KyeeMessageService.message({
                content: message ? message : KyeeI18nService.get("doctor_login.networkAnomly", "网络异常！"),
                okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
            });
        };

        /**
         * 体验一下按钮事件
         */
        $scope.goExperience = function () {
            DoctorLoginService.getVirtualDoctorCode(function (doctorCode) {
                setDoctorCacheInfo(true, doctorCode);
            });
        };

        /**
         * 设置医生登录成功的缓存信息
         * @param doctorCode
         */
        var setDoctorCacheInfo = function (isVirtualDoctor, doctorCode) {

            // 获取全局变量
            var cur_patient = CacheServiceBus.getMemoryCache().
                get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            cur_patient.ROLE_CODE = 3;
            CacheServiceBus.getMemoryCache().
                set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, cur_patient);

            //更新缓存信息
            var currentUserRecord = CacheServiceBus.getMemoryCache().
                get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            var currentHospitalId = CacheServiceBus.getStorageCache().
                get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

            currentUserRecord.DOCTOR_CODE = doctorCode;
            currentUserRecord.DOCTOR_HOSPITAL_ID = currentHospitalId;
            currentUserRecord.ROLE_CODE = 3;//角色3为医生角色
            currentUserRecord.VIRTUAL_DOCTOR_FLAG = isVirtualDoctor;//虚拟医生

            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD,
                currentUserRecord);

            //更新全局视图角色code
            $rootScope.ROLE_CODE = 3;

            $state.go("doctorHome->MAIN_TAB");
        }

    })
    .build();
