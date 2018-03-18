/*
 * 产品名称：健康档案—门诊、住院详情
 * 创建人: 高萌
 * 创建日期:2016年11月17日14:18:58
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.clinic.hospital.detail.controller")
    .require([
        "kyee.quyiyuan.health.archive.clinic.hospital.detail.service",
        "kyee.quyiyuan.health.archive.medication.prescription.detail.controller",
        "kyee.quyiyuan.health.archive.treatment.check.detail.controller",
        "kyee.quyiyuan.health.archive.medication.information.controller"
    ])
    .type("controller")
    .name("ClinicHospitalDetailController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister",
        "MyPersonalInformationService","ClinicHospitalDetailService","CacheServiceBus","TreatmentCheckDetailService","$ionicHistory"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,
                      MyPersonalInformationService,ClinicHospitalDetailService,CacheServiceBus,TreatmentCheckDetailService,$ionicHistory) {
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "clinic_hospital_detail",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backHealth();
            }
        });
        $scope.backHealth = function(){
            MyPersonalInformationService.BACK_ID = 'treatment_information_list';
            $ionicHistory.goBack(-1);
        };

        KyeeListenerRegister.regist({
            focus: "clinic_hospital_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            //direction: "both",
            action: function (params) {
                $scope.showDetailsCheckList = false;//默认就诊者没有检查检验单信息
                $scope.showDetailsAdvicesList = false;//默认就诊者没有医嘱信息
                $scope.showRecipeNum = false;//默认就诊者没有用药处方信息
                $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源
                $scope.showDetailDate = false;
                $scope.treatmentInfo = "";
                $scope.isInHospital = "";
                $scope.refreshView();

            }
        });
            $scope.refreshView = function(){
            $scope.treatmentInfo = ClinicHospitalDetailService.TREATMENT_INFO;
            $scope.isInHospital = $scope.treatmentInfo.IS_IN_HOSPITAL; //0、门诊  1住院
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
                NUMBER:$scope.treatmentInfo.NUMBER,// 门诊则为就诊流水号，住院则为住院号
                MAINDETAIL_TYPE:$scope.treatmentInfo.MAINDETAIL_TYPE,//主子诊断标识
                DISEASE_NAME:$scope.treatmentInfo.DISEASE_NAME,  //疾病名称
                idCardNo: idCardNo,
                name: name,
                phoneNumber: phoneNumber
            };
            ClinicHospitalDetailService.getClinicHospitalDetail(param,function(result){
                $scope.clincHospitalDetail = result;
                //检查检验单列表
                $scope.detailsCheckList = result.DETAIL_CHECK_LIST;
                $scope.showDetailDate = true;
                if($scope.detailsCheckList != undefined && $scope.detailsCheckList!= null && $scope.detailsCheckList!="" && $scope.detailsCheckList.length >= 1){
                        $scope.showDetailsCheckList = true;
                }else{
                    $scope.showDetailsCheckList = false;
                }
                //医嘱列表
                if($scope.isInHospital == '1'){
                    $scope.detailsAdvicesList = result.DETAIL_ADVICE_LIST;
                    if($scope.detailsAdvicesList != undefined && $scope.detailsAdvicesList!= null && $scope.detailsAdvicesList!="" && $scope.detailsAdvicesList.length >= 1){
                            $scope.showDetailsAdvicesList = true;
                    }else{
                        $scope.showDetailsAdvicesList = false;
                    }
                }
                //处方总个数
                $scope.recipeNum = result.RECIPENUM;
                if($scope.recipeNum >= 1){
                    $scope.showRecipeNum = true;
                }else{
                    $scope.showRecipeNum = false;
                }
            })
        };
        // 查看检查检验单详情
        $scope.goCheckListDetail = function(){
            if( $scope.showDetailsCheckList == true){
                TreatmentCheckDetailService.DETAIL_CHECK_LIST = $scope.detailsCheckList;
                $state.go("treatment_check_list");
            }
        };
        // 查看用药及处方详情
        $scope.goMediPrescripDetail = function(){
            if( $scope.showRecipeNum == true){
                $state.go("medication_prescription_detail");
            }
        };
        // 查看医嘱信息
        $scope.goMedicalInformation = function(){
            if( $scope.showDetailsAdvicesList == true){
                ClinicHospitalDetailService.DETAIL_ADVICES_LIST = $scope.detailsAdvicesList;
                $state.go("medical_information");
            }
        }
    })
    .build();

