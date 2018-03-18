new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor.select_patient_list.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.framework.service.message",
        "kyee.framework.device.message",
        "kyee.quyiyuan.patients_group.my_doctor.select_patient_list.service",
        "kyee.quyiyuan.dept.patient.relation.service",
        "kyee.quyiyuan.center.authentication.service"
    ])
    .type("controller")
    .name("SelectPatientListController")
    .params([
        "$scope","$state","KyeeMessageService","KyeeI18nService","SelectPatientListService","CacheServiceBus","KyeeListenerRegister",
        "AuthenticationService","DeptPatientRelationService","LoginService"
    ])
    .action(function($scope,$state,KyeeMessageService,KyeeI18nService,SelectPatientListService,CacheServiceBus,KyeeListenerRegister,
                     AuthenticationService,DeptPatientRelationService,LoginService){

        $scope.selectedObj = null;//当前选择的就诊者
        var storageCache = CacheServiceBus.getStorageCache();
        var memoryCache = CacheServiceBus.getMemoryCache();
        var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;//医院ID
        $scope.userInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
        $scope.deptType = SelectPatientListService.deptType;
        $scope.title="切换就诊者";
        $scope.pointMsg="请选择您的就诊者";
        KyeeListenerRegister.regist({
            focus: "select_patient_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.searchCustomPatient();
            }
        });

        /**
         * 初始化加载就诊者数据
         */
        $scope.searchCustomPatient = function () {
            var userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            //查询常用就诊者
            SelectPatientListService.queryCustomPatient(userId, function (data) {
                var patients;
                if (data && data.data && data.success) {
                    patients = data.data;
                    if (!patients || patients.length == 0) {
                        $scope.userInfo.isNot = true;
                    } else {
                        $scope.userInfo.isNot = false;
                        for (var i = 0; i < patients.length; ) {
                            var patient = patients[i];
                            if(patient.IS_SELECTED == 1){
                                $scope.selectedObj = patient;
                            }
                            if (hospitalId != 1001 && patient.PATIENT_TYPE == 0) {
                                patients.splice(i, 1);//非体验医院去除体验就诊者
                            }else{
                                i++;
                            }
                        }
                    }
                    $scope.patientsList = patients;
                } else {
                    $scope.userInfo.isNot = true;
                }
            });
        };

        /**
         * 选择就诊者
         * addBy liwenjuan 2016/12/01
         * @param patient
         */
        $scope.selectPatient = function(patient){
            if(patient == $scope.selectedObj){
                return;
            }
            $scope.selectedObj = patient; //记住选中就诊者
        };

        /**
         * 提交选中的就诊者信息并跳转到随访查询页面
         */
        $scope.submit = function(){
            if(!$scope.selectedObj){ //未选中任何就诊者
                KyeeMessageService.message({
                    title: KyeeI18nService.get("commonText.tipMsg","提示"),
                    content: "您还未选择任何就诊者不能提交"
                });
                return;
            }
            var customPatient = $scope.selectedObj;
            SelectPatientListService.updateSelectFlag(customPatient, hospitalId, function (data) {
                if (data && data.success) {
                    LoginService.setPatientName(customPatient.OFTEN_NAME);
                    var cardInfo;
                    if (!customPatient.IMAGE_PATH) {
                        customPatient.IMAGE_PATH = "";
                    }

                    customPatient.IS_SELECTED = 1;

                    if (customPatient.DETIAL_LIST && customPatient.DETIAL_LIST != "null" && JSON.parse(customPatient.DETIAL_LIST).length > 0) {
                        var detailList = JSON.parse(customPatient.DETIAL_LIST);
                        for (var i = 0; i < detailList.length; i++) {
                            if (detailList[i].IS_DEFAULT == 1) {
                                customPatient.CARD_NO = detailList[i].CARD_NO;
                                customPatient.CARD_SHOW = detailList[i].CARD_SHOW;
                                cardInfo = detailList[i];
                                memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, cardInfo);
                                break;
                            } else {
                                memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {});
                            }
                        }
                    } else {
                        memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, {});
                    }
                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, customPatient);

                    //返回到指定页面
                    $state.go("questionnaire_search");

                } else {
                    //begin 实名认证页面跳转   By  张家豪  KYEEAPPC-2861
                    if (data && data.message) {
                        if (data.resultCode == "0011401") {
                            //begin 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786
                            KyeeMessageService.confirm({
                                title: KyeeI18nService.get("update_user.sms", "消息"),
                                content: data.message,
                                cancelText:KyeeI18nService.get("custom_patient.giveUp","放弃"),
                                okText:KyeeI18nService.get("custom_patient.toCertification","去认证"),
                                onSelect: function (select) {
                                    if (select) {
                                        AuthenticationService.HOSPITAL_SM = {
                                            OFTEN_NAME: customPatient.OFTEN_NAME,
                                            ID_NO: customPatient.ID_NO,
                                            PHONE: customPatient.PHONE,
                                            USER_VS_ID: customPatient.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                            FLAG: customPatient.FLAG
                                        };
                                        AuthenticationService.lastClass = "CustomPatient";
                                        openModal('modules/business/center/views/authentication/authentication.html');
                                    }
                                    //end 实名认证消息提示按钮的修改，可统一实名认证消息提示   By  张家豪  KYEEAPPTEST-2786

                                }
                            });
                        } else {
                            //异常接收与提示
                            KyeeMessageService.message({
                                title: KyeeI18nService.get("update_user.sms", "消息"),
                                content: data.message,
                                okText: KyeeI18nService.get("custom_patient.iRealKnow", "我知道了！")
                            });
                        }
                    } else {
                        //异常接收与提示
                        KyeeMessageService.message({
                            title: KyeeI18nService.get("update_user.sms", "消息"),
                            content: KyeeI18nService.get("custom_patient.switchPatientsFailed", "切换就诊者失败！"),
                            okText: KyeeI18nService.get("custom_patient.iRealKnow", "我知道了！")
                        });
                    }
                }
            });

        };

        /**
         * 添加就诊者
         */
        $scope.addPatient = function(){
            DeptPatientRelationService.deptType = SelectPatientListService.deptType;
            DeptPatientRelationService.registType = SelectPatientListService.registType;
            DeptPatientRelationService.isChild = SelectPatientListService.isChild;
            $state.go("dept_patient_relation");
        };

        /**
         * 描述：返回到主页
         */
        $scope.goBack = function(){
            $state.go('home->MAIN_TAB');
        }
    })
    .build();