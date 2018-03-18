/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:24:38
 * 创建原因：医生主页控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.home.controller")
    .require([
        "kyee.quyiyuan.doctorRole.home.service",
        "kyee.quyiyuan.doctorRole.interaction.controller",
        "kyee.quyiyuan.doctor_role.patient_screening.controller",
        "kyee.quyiyuan.doctorRole.center.controller",
        "kyee.quyiyuan.doctor_role.controller.care_me",
        "kyee.quyiyuan.doctor_role.controller.evaluation_record"
    ])
    .type("controller")
    .name("DoctorHomeController")
    .params(["$scope", "$state", "KyeeMessageService",
        "KyeeListenerRegister", "HospitalService", "CacheServiceBus",
        "DoctorHomeService","KyeeI18nService"])
    .action(function($scope, $state, KyeeMessageService,
                     KyeeListenerRegister, HospitalService, CacheServiceBus,
                     DoctorHomeService,KyeeI18nService){

        KyeeListenerRegister.regist({
            focus: "doctorHome->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction: "both",
            action: function (params) {

                //离开页面时停止播放医院广告
                if($scope.stopSlideboxImage != undefined){
                    $scope.stopSlideboxImage();
                }
            }
        });

        //加载广告图片
        $scope.slideboxData = HospitalService.loadAdvData();

        //加载医生首页功能菜单数据
        DoctorHomeService.getDoctorMenuList(function (data) {
            $scope.menuList = data;
        });

        /**
         * 医院广告方法绑定
         *
         * @param params
         */
        $scope.bindSlideboxImageActions = function(params){
            $scope.updateSlideboxImage = params.update;
            $scope.playSlideboxImage = params.play;
            $scope.stopSlideboxImage = params.stop;
        };

        /**
         * 查看医院详情
         */
        $scope.viewHospitalDetail = function(params){

            var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            if(hospitalInfo != null && hospitalInfo.id != ""){

                //记录此广告的 id
                HospitalService.clickedAdvId = params.item.id;
                $state.go("hospital_detail");
            }
        };

        /**
         * 功能菜单点击事件
         * @param menu
         */
        $scope.onMenuClick = function (menu) {
            if(menu.enable == 1){
                $state.go(menu.href);
            } else {
                KyeeMessageService.message({
                    content: menu.disableInfo,
                    okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
                });
            }
        };

    })
    .build();
