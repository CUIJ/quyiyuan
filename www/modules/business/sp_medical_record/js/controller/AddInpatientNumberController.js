new KyeeModule()
    .group("kyee.quyiyuan.sat.add_sat_extend_patient_info.controller")
    .require([])
    .type("controller")
    .name("addSatExtendPatientInfoController")
    .params(["CenterUtilService","KyeeMessageService","MedicalRecordService","$ionicHistory","$state","$scope","KyeeViewService","KyeeListenerRegister","HttpServiceBus","CacheServiceBus","KyeeI18nService"])
    .action(function (CenterUtilService,KyeeMessageService,MedicalRecordService,$ionicHistory,$state,$scope,KyeeViewService,KyeeListenerRegister,HttpServiceBus,CacheServiceBus,KyeeI18nService) {

        $scope.sat={};
        $scope.title = "新增患者信息";
        $scope.sat= MedicalRecordService.satInfo;
        $scope.submit = function(){
            var PHONE_NUMBER = $scope.sat.PHONE_NUMBER;
            if(PHONE_NUMBER&&!CenterUtilService.validateMobil(PHONE_NUMBER)){
                return;
            }
            if(PHONE_NUMBER||$scope.sat.TREATMENT_CARD_NO){
                MedicalRecordService.addOrEditExtendPatientInfo($scope.sat.TREATMENT_CARD_NO, $scope.sat.PHONE_NUMBER,function (data) {
                    if(data.success){
                        $ionicHistory.goBack();
                    }
                });
            }else{
                KyeeMessageService.broadcast({
                    content:"请输入手机号或就诊卡号！",
                    duration: 500
                });
            }
        };
        KyeeListenerRegister.regist({
            focus: "add_sat_extend_patient_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.title = "新增患者信息";
                if(MedicalRecordService.satInfo&&MedicalRecordService.satInfo.PHONE_NUMBER){
                    $scope.sat.PHONE_NUMBER=MedicalRecordService.satInfo.PHONE_NUMBER;
                    $scope.title = "编辑患者信息";
                }
                if(MedicalRecordService.satInfo&&MedicalRecordService.satInfo.TREATMENT_CARD_NO){
                    $scope.sat.TREATMENT_CARD_NO=MedicalRecordService.satInfo.TREATMENT_CARD_NO;
                    $scope.title = "编辑患者信息";
                }
            }
        });
    })
    .build();