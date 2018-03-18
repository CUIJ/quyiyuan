/**
 * 产品名称：quyiyuan.
 * 创建用户：吴伟刚
 * 日期：2015年6月26日11:41:21
 * 创建原因：满意度评价选择医院菜单控制器
 *  修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.hospitalMenu.controller")
    .require([])
    .type("controller")
    .name("HospitalMenuController")
    .params(["$scope", "$state", "HospitalDoctorService",
        "HospitalHospitalService", "HospitalMenuService", "KyeeMessageService",
        "CacheServiceBus","KyeeI18nService"])
    .action(function($scope, $state, HospitalDoctorService,
                     HospitalHospitalService, HospitalMenuService, KyeeMessageService,
                     CacheServiceBus,KyeeI18nService){

        $scope.isTabActive = HospitalMenuService.isTabActive;

        /**
         * 切换医生评价函数
         */
        $scope.gotoDoctor = function () {
            if(HospitalHospitalService.data.HOSPITAL_SUGGEST_SCORE == 0){

                var items = HospitalHospitalService.pageData.items;
                var suggest = HospitalHospitalService.pageData.suggest;

                // 判断是否有选择项
                var hasUnSelect = false;
                var hasUnCheck = false;
                var hasUnCheckIndex = -1;
                if(suggest){
                    hasUnSelect = true;
                }
                for(var index = 0; index <items.length; index++){
                    if(items[index].SCORE_VALUE==undefined&&items[index].SPECIAL_TYPE!=''){
                        hasUnCheck = true;
                        hasUnCheckIndex = index+1;
                        break;
                    }
                }
                for(var index = 0; index <items.length; index++){
                    if(items[index].SCORE_VALUE&&items[index].SCORE_VALUE!=0||items[index].SCORE_VALUE==0){
                        hasUnSelect = true;
                        break;
                    }
                }
                // 如果有则提示默认值
                if(hasUnSelect&&hasUnCheckIndex!=-1) {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content:  KyeeI18nService.get('satisfaction_hospital_menu.weiPingJiaMenuAlert', '您有未评价的必选项目，是否留在本页面继续评价？', null),
                        onSelect: function (res) {
                            if(res){
                                return;
                            }else{
                                $scope.jumpDoctor();
                            }
                        }
                    });
                    return;
                }
                // 如果有则提示默认值
                if(hasUnSelect){
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_weiXuanZeAlert', '您有未评价项，未评价项将默认为3颗星，确定要提交？', null),
                        onSelect: function (res) {
                            if(res){
                                for(var index = 0; index <items.length; index++){
                                    if(!items[index].SCORE_VALUE&&items[index].SCORE_VALUE!=0){
                                        items[index].SCORE_VALUE = 3;
                                    }
                                }
                                var postdata = HospitalHospitalService.data;
                                postdata.ITEM_SCORES = items;
                                postdata.SUGGEST_TYPE = 2;
                                postdata.SUGGEST_TEXT = suggest;
                                postdata.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                                HospitalHospitalService.saveSatisfactionData(
                                    postdata,
                                    function(data){
                                        if(data.data){
                                            HospitalHospitalService.data.HOSPITAL_SUGGEST_SCORE = data.data;
                                            $scope.SUGGEST_SCORE = data.data;
                                            //吴伟刚 KYEEAPPC-2753 住院满意度评价内容显示异常
                                            HospitalHospitalService.data.HOSPITAL_SUGGEST_TEXT = suggest;
                                            KyeeMessageService.message({
                                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医生的评价！', null)
                                            });
                                            $scope.jumpDoctor();
                                        }
                                    })
                            }else {
                                $scope.jumpDoctor();
                            }
                        }
                    });
                } else {
                    $scope.jumpDoctor();
                }
            } else {
                $scope.jumpDoctor();
            }
        };

        /**
         * 切换医生评价函数
         */
        $scope.jumpDoctor = function () {
            HospitalDoctorService.data = HospitalHospitalService.data;
            $scope.isTabActive = 1;

            // 判断如果评价过则直接跳转页面
            if(HospitalHospitalService.data.DOCTOR_SUGGEST_SCORE == 0){
                HospitalDoctorService.querySurveyData(
                    HospitalDoctorService.data.HOSPITAL_ID,
                    function(data){

                        if(data.success == false){
                            KyeeMessageService.message({
                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                content: data.message
                            });
                        } else {
                            HospitalDoctorService.pageData = {};
                            HospitalDoctorService.pageData.items = data.rows;
                            $state.go("satisfaction_hospital_menu.hospital_doctor");
                        }
                    })
            } else {
                $state.go("satisfaction_hospital_menu.hospital_doctor");
            }

        };

        /**
         * 切换医院评价函数
         */
        $scope.gotoHospital = function () {
            if(HospitalDoctorService.data.DOCTOR_SUGGEST_SCORE == 0){

                var items = HospitalDoctorService.pageData.items;
                var suggest = HospitalDoctorService.pageData.suggest;

                // 判断是否有选择项
                var hasUnSelect = false;
                var hasUnCheck = false;
                var hasUnCheckIndex = -1;
                for(var index = 0; index <items.length; index++){
                    if(items[index].SCORE_VALUE==undefined&&items[index].SPECIAL_TYPE!=''){
                        hasUnCheck = true;
                        hasUnCheckIndex = index+1;
                        break;
                    }
                }
                if(suggest){
                    hasUnSelect = true;
                }
                for(var index = 0; index <items.length; index++){
                    if(items[index].SCORE_VALUE&&items[index].SCORE_VALUE!=0||items[index].SCORE_VALUE==0){
                        hasUnSelect = true;
                        break;
                    }
                }
                // 如果有则提示默认值
                if(hasUnSelect&&hasUnCheckIndex!=-1) {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content:  KyeeI18nService.get('satisfaction_hospital_menu.weiPingJiaMenuAlert', '您有未评价的必选项目，是否留在本页面继续评价？', null),
                        onSelect: function (res) {
                            if(res){
                                return;
                            }else{
                                $scope.jumpHospital();
                            }
                        }
                    });
                    return;
                }
                // 如果有则提示默认值
                if(hasUnSelect){
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_weiXuanZeAlert', '您有未评价项，未评价项将默认为3颗星，确定要提交？', null),
                        onSelect: function (res) {
                            if(res){
                                for(var index = 0; index <items.length; index++){
                                    if(!items[index].SCORE_VALUE&&items[index].SCORE_VALUE!=0){
                                        items[index].SCORE_VALUE = 3;
                                    }
                                }
                                var postdata = HospitalDoctorService.data;
                                postdata.ITEM_SCORES = items;
                                postdata.SUGGEST_TYPE = 1;
                                postdata.SUGGEST_TEXT = suggest;
                                postdata.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;

                                HospitalDoctorService.saveSatisfactionData(
                                    postdata,
                                    function(data){
                                        if(data.data){
                                            HospitalDoctorService.data.DOCTOR_SUGGEST_SCORE  = data.data;
                                            //吴伟刚 KYEEAPPC-2753 住院满意度评价内容显示异常
                                            HospitalDoctorService.data.DOCTOR_SUGGEST_TEXT = suggest;
                                        }
                                        if(data.data){
                                            KyeeMessageService.message({
                                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医院的评价！', null)
                                            });
                                            $scope.jumpHospital();
                                        }
                                });
                            } else {
                                $scope.jumpHospital();
                            }
                        }
                    });
                } else {
                    $scope.jumpHospital();
                }
            } else {
                $scope.jumpHospital();
            }
        };

        /**
         * 切换医院评价函数
         */
        $scope.jumpHospital = function () {
            $scope.isTabActive = 2;
            HospitalHospitalService.data = HospitalDoctorService.data;

            // 判断如果评价过则直接跳转页面
            if(HospitalDoctorService.data.HOSPITAL_SUGGEST_SCORE == 0){
                HospitalHospitalService.querySurveyData(
                    HospitalHospitalService.data.HOSPITAL_ID,
                    function(data){

                        if(data.success == false){
                            KyeeMessageService.message({
                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                content: data.message
                            });
                        } else {
                            HospitalHospitalService.pageData = {};
                            HospitalHospitalService.pageData.items = data.rows;
                            $state.go("satisfaction_hospital_menu.hospital_hospital");
                        }
                    })
            } else {
                $state.go("satisfaction_hospital_menu.hospital_hospital");
            }
        };
    })
    .build();
