/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：门诊满意度页面控制器
 *  修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionClinic.controller")
    .require([
        "kyee.quyiyuan.satisfaction.satisfactionMain.service"
        ,"kyee.quyiyuan.satisfaction.satisfactionHospital.service"
        ,"kyee.quyiyuan.satisfaction.satisfactionHospital.controller"
        ,"kyee.quyiyuan.satisfaction.satisfactionDoctor.service"
        ,"kyee.quyiyuan.satisfaction.satisfactionDoctor.controller"
        ,"kyee.quyiyuan.satisfaction.satisfactionMenu.controller"
        ,"kyee.quyiyuan.satisfaction.satisfactionMenu.service"
    ])
    .type("controller")
    .name("SatisfactionClinicController")
    .params(["$scope", "$state", "SatisfactionMainService",
        "SatisfactionDoctorService", "SatisfactionMenuService", "KyeeMessageService",
        "SatisfactionHospitalService", "CacheServiceBus", "$ionicScrollDelegate","KyeeI18nService"])
    .action(function($scope, $state, SatisfactionMainService,
                     SatisfactionDoctorService, SatisfactionMenuService, KyeeMessageService,
                     SatisfactionHospitalService, CacheServiceBus, $ionicScrollDelegate,KyeeI18nService){

        $scope.activityClass = 0;
        $scope.suggestStatus = "";
        $scope.page = "";
        $scope.limit = "";
        $scope.emptyText =   KyeeI18nService.get('satisfaction_clinic.emptyText', '您目前没有可评价的预约挂号记录！', null);

        if(SatisfactionMainService.data && SatisfactionMainService.data.doctorCode){
            var hospitalId = SatisfactionMainService.data.hospitalId;
            var doctorCode = SatisfactionMainService.data.doctorCode;
            SatisfactionMainService.data = undefined;
        } else {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var doctorCode = "";
        }

        /**
         * 判空显示函数
         * @param data
         * @param text
         */
        $scope.changeEmptyText = function (data, text) {
            if(!data || data.length == 0){
                $scope.showEmpty = true;
                $scope.emptyText = text;
            } else {
                $scope.showEmpty = false;
            }
        };

        /**
         * 已读未读筛选函数
         * @param status
         */
        $scope.selectStatus = function (status) {
            $scope.activityClass = status;
            $scope.suggestStatus = status;
            $scope.moreDataCanBeLoadedFlag = false;


            SatisfactionMainService.queryItems(doctorCode, hospitalId,
                $scope.suggestStatus, $scope.page, $scope.limit,
                function(data){
                    if(data && data.rows){
                        $scope.moreDataCanBeLoadedFlag = false;
                        $scope.appointItems = data.rows;
                    }
                    if(status == 0){
                        $scope.changeEmptyText($scope.appointItems,  KyeeI18nService.get('satisfaction_clinic.emptyText', '您目前没有可评价的预约挂号记录！', null));
                    } else {
                        $scope.changeEmptyText($scope.appointItems,  KyeeI18nService.get('satisfaction_clinic.emptyTextNoPingJia', '您目前没有已评价记录！', null));
                    }

                    $ionicScrollDelegate.scrollTop();
                });
        };

        //初始化显示未评价记录
        $scope.selectStatus(0);

        /**
         * 满意度记录点击事件
         * @param item
         */
        $scope.itemClick = function (item) {

            if (item.IS_SUGGEST=='0' || item.IS_SCORE == '0') {
                if (item.IS_SATISFIED_OPEN == 0) {
                    KyeeMessageService.message({
                        title:KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content: KyeeI18nService.get('satisfaction_clinic.weiKaiFangContent', '该医院暂未开放满意度评价功能！', null)
                    });
                    return;
                }
                if (item.VISIT_STATUS && item.IS_NEED_VISIT == 0 && item.VISIT_STATUS != '2') {
                    KyeeMessageService.message({
                        title:KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content:  KyeeI18nService.get('satisfaction_clinic.jiuZhenHouContent', '您就诊之后才可以评价该医生！', null)
                    });
                    return;
                }
            }
            if(item.IS_SUGGEST == '0'){
                SatisfactionMenuService.isTabActive = 1;
                SatisfactionDoctorService.data = item;
                $state.go("satisfaction_menu.satisfaction_doctor");
            } else if(item.IS_SCORE == '0'){
                SatisfactionMenuService.isTabActive = 2;
                SatisfactionHospitalService.data = item;
                $state.go("satisfaction_menu.satisfaction_hospital");
            } else {
                SatisfactionMenuService.isTabActive = 1;
                SatisfactionDoctorService.data = item;
                $state.go("satisfaction_menu.satisfaction_doctor");
            }
        };

    })
    .build();