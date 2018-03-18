/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:24:38
 * 创建原因：医生角色修改密码控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.changePwd.controller")
    .require([
        "kyee.quyiyuan.doctorRole.pwdInit.service"
    ])
    .type("controller")
    .name("DoctorChangePwdController")
    .params(["$scope", "$state", "KyeeMessageService", "DoctorPwdInitService", "CacheServiceBus","KyeeI18nService"])
    .action(function($scope, $state, KyeeMessageService, DoctorPwdInitService, CacheServiceBus,KyeeI18nService){

        $scope.placeholderOldPassword = KyeeI18nService.get("change_doctor_pwd.placeholderOldPassword","请输入您的原始密码");
        $scope.placeholderNewPassword = KyeeI18nService.get("change_doctor_pwd.placeholderNewPassword","请输入6-16位新密码");

        $scope.isActive = false; //点击眼睛图标状态
        $scope.pwdInfo = {}; //初始化密码变量

        /**
         * 输入可视事件
         */
        $scope.iconClick = function () {
            if ($scope.isActive) {
                new_pwd.type = 'password';
                old_pwd.type = 'password';
                $scope.isActive = false;
            } else {
                new_pwd.type = 'text';
                old_pwd.type = 'text';
                $scope.isActive = true;
            }
        };

        /**
         * 提交修改密码请求
         */
        $scope.submentClick = function () {
            if ($scope.pwdInfo.old_pwd == "" || $scope.pwdInfo.old_pwd == undefined) {
                showMessage(KyeeI18nService.get("change_doctor_pwd.oldPasswordNotNull", "旧密码不能为空！"));
                return;
            }
            if ($scope.pwdInfo.new_pwd == "" || $scope.pwdInfo.new_pwd == undefined) {
                showMessage(KyeeI18nService.get("change_doctor_pwd.newPasswordNotNull", "新密码不能为空！"));
                return;
            }
            if ($scope.pwdInfo.new_pwd.length > 16) {//KYEEAPPTEST-3152 程铄闵
                showMessage(KyeeI18nService.get("change_doctor_pwd.maxNewPasswordLength", "新密码必须小于17位！"));
                return;
            } else if ($scope.pwdInfo.new_pwd.length < 6) {
                showMessage(KyeeI18nService.get("change_doctor_pwd.minNewPasswordLength", "新密码必须大于5位！"));
                return;
            }

            var currentUser = CacheServiceBus.getMemoryCache().
                get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER);
            var currentUserRecord = CacheServiceBus.getMemoryCache().
                get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            var currentHospitalId = CacheServiceBus.getStorageCache().
                get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

            DoctorPwdInitService.doctorUser = currentUserRecord.DOCTOR_CODE;
            DoctorPwdInitService.doctorPwdOld = $scope.pwdInfo.old_pwd;

            DoctorPwdInitService.updateDoctorPwd(currentUser, currentHospitalId, $scope.pwdInfo.new_pwd,'',
                function (result) {
                    if (result.success) {

                        if(result.data.FLAG > -1){//医生编码或旧密码错误标识,请重新输入
                            showMessage(KyeeI18nService.get("change_doctor_pwd.modifyPasswordSuccess", "修改医生密码成功！"));
                            $state.go("doctorCenter->MAIN_TAB");
                        }else{
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
                content : message ? message: KyeeI18nService.get("change_doctor_pwd.networkAnomaly", "网络异常！")
            });
        };

    })
    .build();
