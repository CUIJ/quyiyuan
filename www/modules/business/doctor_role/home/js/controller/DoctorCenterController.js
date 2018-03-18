/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:24:38
 * 创建原因：医生个人中心控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.center.controller")
    .require([
        "kyee.quyiyuan.doctorRole.center.service",
        "kyee.quyiyuan.doctorRole.changePwd.controller"
    ])
    .type("controller")
    .name("DoctorCenterController")
    .params(["$scope", "$state", "KyeeMessageService",
        "CacheServiceBus", "DoctorCenterService","KyeeI18nService"])
    .action(function($scope, $state, KyeeMessageService,
                     CacheServiceBus, DoctorCenterService,KyeeI18nService){

        /**
         * 修改密码按钮点击事件
         */
        $scope.onChangePwdBtnClick = function () {

            var virtualDoctorFlag = CacheServiceBus.getMemoryCache().
                get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).VIRTUAL_DOCTOR_FLAG;

            if(virtualDoctorFlag){
                KyeeMessageService.message({
                    content: KyeeI18nService.get("doctorCenter->MAIN_TAB.experienceNotModifyPassword", "体验模式下不能进行修改密码操作！"),
                    okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
                });
            } else {
                $state.go("change_doctor_pwd");
            }
        };

        /**
         * 退出登录按钮点击事件
         */
        $scope.logoutDoctor = function () {
            DoctorCenterService.unDoctorBinding(function (result) {
                if (result.FLAG == 1) {
                    $state.go("home->MAIN_TAB");
                } else {
                    KyeeMessageService.message({
                        content: KyeeI18nService.get("doctorCenter->MAIN_TAB.exitFailed", "退出医生账号失败！"),
                        okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
                    });
                }
            });
        };
        /**
         * 切换角色按钮点击事件
         * KYEEAPPTEST-3152 程铄闵
         */
        $scope.changeRole = function() {
            DoctorCenterService.skipRoute = 'doctorCenter';
            $state.go('role_view');
        };

    })
    .build();
