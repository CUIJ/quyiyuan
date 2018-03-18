/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：满意度评价选择菜单控制器
 *  修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionMenu.controller")
    .require(["kyee.quyiyuan.appointment.purchase_medince.service"])
    .type("controller")
    .name("SatisfactionMenuController")
    .params(["$scope", "$state", "SatisfactionDoctorService",
        "SatisfactionHospitalService", "SatisfactionMenuService", "KyeeMessageService",
        "CacheServiceBus","KyeeI18nService","PurchaseMedinceService","$ionicHistory"])
    .action(function($scope, $state, SatisfactionDoctorService,
                     SatisfactionHospitalService, SatisfactionMenuService, KyeeMessageService,
                     CacheServiceBus,KyeeI18nService,PurchaseMedinceService,$ionicHistory){

        $scope.isTabActive = SatisfactionMenuService.isTabActive;
        $scope.goBack = function () {
            if(PurchaseMedinceService.wxJoin){
                PurchaseMedinceService.wxJoin = false;
                $state.go('home->MAIN_TAB');
            }else {
                $ionicHistory.goBack(-1);
            }
        }

        /**
         * 切换医生评价函数
         */
        $scope.gotoDoctor = function () {
            if(SatisfactionHospitalService.data.IS_SCORE == 0){

                var items = SatisfactionHospitalService.pageData.items;
                var suggest = SatisfactionHospitalService.pageData.suggest;

                // 判断是否有选择项
                var hasSelect = false;
                for(var index = 0; index < items.length; index++){
                    if(items[index].SCORE_VALUE){
                        hasSelect = true;
                        break;
                    }
                }

                if(suggest){
                    hasSelect = true;
                }

                // 如果有则提示提交
                if(hasSelect){
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content: KyeeI18nService.get('satisfaction_menu.statAlertText', '是否提交已填写的医院评价（未选择项将默认为五颗星）？', null),
                        onSelect: function (res) {
                            if(res){
                                for(var index = 0; index < items.length; index++){
                                    if(!items[index].SCORE_VALUE){
                                        items[index].SCORE_VALUE = 5;
                                    }
                                }
                                var postdata = SatisfactionHospitalService.data;
                                postdata.ITEM_SCORES = items;
                                postdata.OTHER = suggest;
                                var hosptialId=SatisfactionHospitalService.data.HOSPITAL_ID;
                                SatisfactionHospitalService.calculateDataScore(postdata,hosptialId,
                                    function(data){
                                        if(data.data){
                                            if(data.data.score<3&&data.data.isBadPopup==1&&(postdata.OTHER==""||postdata.OTHER==null||postdata.OTHER==undefined)){
                                                KyeeMessageService.confirm({
                                                    title:  KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                    cancelText:KyeeI18nService.get("commonText.upMsg", "坚持提交"),
                                                    okText: KyeeI18nService.get("commonText.backwriteMsg", "去填写"),
                                                    content: KyeeI18nService.get('satisfaction_menu.satisfaction.selectAlertTxt',"就医体验不满意？写下您的评价意见可以帮助医院提升医疗服务哦~", null),
                                                    onSelect: function (res) {
                                                        if(res){
                                                            //return;
                                                            var aCtrl3 = document.getElementById("hospitalSuggestId");
                                                            setTimeout(function() {
                                                                aCtrl3.setSelectionRange(0, 0); //将光标定位在textarea的开头，需要定位到其他位置的请自行修改
                                                                aCtrl3.focus();
                                                            }, 0);
                                                        }else{
                                                            SatisfactionHospitalService.saveSatisfactionData(postdata, function () {
                                                                /*KyeeMessageService.message({
                                                                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                                    okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                                    content: KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医院的评价！', null),
                                                                    onOk:function(res){ */
                                                                            SatisfactionHospitalService.data.IS_SCORE = 1;
                                                                            $scope.jumpDoctor();
                                                                   // }
                                                                //});
                                                            });
                                                        }
                                                    }

                                                });
                                            }else{
                                                SatisfactionHospitalService.saveSatisfactionData(postdata, function () {
                                                   /* KyeeMessageService.message({
                                                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                        okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                        content: KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医院的评价！', null),
                                                        onOk:function(res){ */
                                                                SatisfactionHospitalService.data.IS_SCORE = 1;
                                                                $scope.jumpDoctor();
                                                       // }
                                                   // });
                                                });
                                            }
                                        }else{
                                            SatisfactionHospitalService.saveSatisfactionData(postdata, function () {
                                               /* KyeeMessageService.message({
                                                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                    okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                    content: KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医院的评价！', null),
                                                    onOk:function(res){  */
                                                            SatisfactionHospitalService.data.IS_SCORE = 1;
                                                            $scope.jumpDoctor();
                                                   // }
                                                //});
                                            });
                                        }
                                    }
                                )
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
            $scope.isTabActive = 1;
            SatisfactionDoctorService.data = SatisfactionHospitalService.data;
            $state.go("satisfaction_menu.satisfaction_doctor");
        };

        /**
         * 切换医院评价函数
         */
        $scope.gotoHospital = function () {
            if(SatisfactionDoctorService.data.IS_SUGGEST == 0){

                var items = SatisfactionDoctorService.pageData.items;
                var suggest = SatisfactionDoctorService.pageData.suggest;

                // 判断是否有选择项
                var hasSelect = false;
                for(var index = 0; index < items.length; index++){
                    if(items[index].SCORE_VALUE){
                        hasSelect = true;
                        break;
                    }
                }

                if(suggest){
                    hasSelect = true;
                }

                // 如果有则提示提交
                if(hasSelect){
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        content:  KyeeI18nService.get('satisfaction_menu.statAlertTextDoctor', '是否提交已填写的医生评价（未选择项将默认为五颗星）？', null),
                        onSelect: function (res) {
                            if(res){
                                for(var index = 0; index < items.length; index++){
                                    if(!items[index].SCORE_VALUE){
                                        items[index].SCORE_VALUE = 5;
                                    }
                                }
                                var postdata = SatisfactionDoctorService.data;
                                var hospitalId=SatisfactionDoctorService.data.HOSPITAL_ID;
                                postdata.ITEM_SCORES = items;
                                postdata.SUGGEST_VALUE = suggest;
                                postdata.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                                SatisfactionDoctorService.calculateDataScore(postdata,hospitalId,
                                    function(data){
                                        if(data.data){
                                            if(data.data.score<3&&data.data.isBadPopup==1&&(postdata.SUGGEST_VALUE==""||postdata.SUGGEST_VALUE==null||postdata.SUGGEST_VALUE==undefined)){
                                                KyeeMessageService.confirm({
                                                    title:  KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                    cancelText:KyeeI18nService.get("commonText.upMsg", "坚持提交"),
                                                    okText: KyeeI18nService.get("commonText.backwriteMsg", "去填写"),
                                                    content: KyeeI18nService.get('satisfaction_menu.satisfaction.selectAlertTxt',"就医体验不满意？写下您的评价意见可以帮助医院提升医疗服务哦~", null),
                                                    onSelect: function (res) {
                                                        if(res){
                                                            //return;
                                                            var aCtrl4 = document.getElementById("doctorSuggestId");
                                                            setTimeout(function() {
                                                                aCtrl4.setSelectionRange(0, 0); //将光标定位在textarea的开头，需要定位到其他位置的请自行修改
                                                                aCtrl4.focus();
                                                            }, 0);
                                                        }else {
                                                            SatisfactionDoctorService.saveSatisfactionData(postdata, function () {
                                                               /* KyeeMessageService.message({
                                                                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                                    okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                                    content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医生的评价！', null),
                                                                    onOk:function(res){ */
                                                                            SatisfactionDoctorService.data.IS_SUGGEST = 1;
                                                                            $scope.jumpHospital();
                                                                   // }
                                                               // });
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                            else{
                                                SatisfactionDoctorService.saveSatisfactionData(postdata, function () {
                                                   /* KyeeMessageService.message({
                                                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                        okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                        content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医生的评价！', null),
                                                        onOk:function(res){ */
                                                                SatisfactionDoctorService.data.IS_SUGGEST = 1;
                                                                $scope.jumpHospital();
                                                       // }
                                                    //});
                                                });
                                            }
                                        }else{
                                            SatisfactionDoctorService.saveSatisfactionData(postdata, function () {
                                               /* KyeeMessageService.message({
                                                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                    okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                                    content:  KyeeI18nService.get('satisfaction_hospital_menu.hospital_doctor.zhuYuan_pingLunOkDoctor', '您已成功完成对医生的评价！', null),
                                                    onOk:function(res){ */
                                                            SatisfactionDoctorService.data.IS_SUGGEST = 1;
                                                            $scope.jumpHospital();
                                                    //}
                                              //  });
                                            });
                                        }
                                    }
                                )
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
            SatisfactionHospitalService.data = SatisfactionDoctorService.data;
            $state.go("satisfaction_menu.satisfaction_hospital");
        };
    })
    .build();
