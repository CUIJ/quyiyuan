/*
 * 产品名称：健康档案—用药及处方详情
 * 创建人: 高萌
 * 创建日期:2016年11月17日15:36:22
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.medication.prescription.detail.controller")
    .require([
        "kyee.quyiyuan.health.archive.clinic.hospital.detail.service"
    ])
    .type("controller")
    .name("MedicationPrescriptionDetailController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister",
        "MyPersonalInformationService","CacheServiceBus","ClinicHospitalDetailService"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,
                      MyPersonalInformationService,CacheServiceBus,ClinicHospitalDetailService) {
        KyeeListenerRegister.regist({
            focus: "medication_prescription_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.mediPresDetailShow = false; //用药及处方默认不显示（收缩）
                $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源
                $scope.refreshView();
            }
        });
        $scope.refreshView = function(){
            $scope.treatmentInfo = ClinicHospitalDetailService.TREATMENT_INFO;
            //$scope.isInHospital = $scope.treatmentInfo.IS_IN_HOSPITAL; //0、门诊  1住院
            var idCardNo = "";
            var name = "";
            var phoneNumber = "";
            var idNo = "";
            var patientName = "";
            if(CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL)&& CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).state=="my_health_archive"){
                idCardNo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).idCard;
                name = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).name;
                phoneNumber = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).phoneNumber;
            }else{
                var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                idNo = currentCustomPatient.ID_NO;
                patientName = currentCustomPatient.OFTEN_NAME;
            }
            var param={
                ID_NO:idNo,
                PATIENT_NAME:patientName,
                ORGANIZATION_CODE:$scope.treatmentInfo.ORGANIZATION_CODE,//组织机构代码
                IS_IN_HOSPITAL:$scope.treatmentInfo.IS_IN_HOSPITAL,//0门诊, 1住院
                NUMBER:$scope.treatmentInfo.NUMBER,//// 门诊则为就诊流水号，住院则为住院号
                MAINDETAIL_TYPE:$scope.treatmentInfo.MAINDETAIL_TYPE,//主子诊断标识
                DISEASE_NAME:$scope.treatmentInfo.DISEASE_NAME,  //疾病名称
                idCardNo: idCardNo,
                name: name,
                phoneNumber: phoneNumber
            };
            ClinicHospitalDetailService.getDetailsRecipeInfo(param,function(result){
                $scope.noMediPresDetail = true;//是否查到用药处方信息的标识
                $scope.mediPresDetaiList = result;
                if ($scope.mediPresDetaiList != null && $scope.mediPresDetaiList != "" && $scope.mediPresDetaiList != undefined && $scope.mediPresDetaiList.length >=1) {
                    $scope.noMediPresDetail = false;
                }else{
                    $scope.noMediPresDetail = true;
                }
            })
        };

        /**
         * 展开或收缩用药及处方
         */
        $scope.showMediPresDetail = function (index) {
            $scope.DetailsRecipeIndex=index;
            $scope.showdeptBool = true;
            OperationMonitor.record("mediPresDetailShow", "medication_prescription_detail");
        };
        /**
         * 点击【收起】隐藏医生叫号
         */
        $scope.hideMediPresDetail=function(){
            $scope.DetailsRecipeIndex=-1;
            $scope.showdeptBool = false;
        };

    })
    .build();

