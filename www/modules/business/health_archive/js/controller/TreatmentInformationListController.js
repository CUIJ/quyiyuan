/**
 * Created by wangwan on 2016/11/16.
 */
/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.treatment.information.list.controller")
    .require([
        "kyee.quyiyuan.health.archive.treatment.information.list.service",
        "kyee.quyiyuan.health.archive.treatment.check.list.controller",
        "kyee.quyiyuan.health.archive.clinic.hospital.detail.service",
        "kyee.quyiyuan.health.archive.clinic.hospital.detail.controller"
    ])
    .type("controller")
    .name("TreatmentInformationListController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister",
        "TreatmentInformationListService","ClinicHospitalDetailService","$ionicScrollDelegate","CacheServiceBus"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,
                      TreatmentInformationListService,ClinicHospitalDetailService,$ionicScrollDelegate,CacheServiceBus) {
        var noClinicData = function () {
             //1住院0门诊
             if($scope.isInhospital==0){
                 if($scope.diagClinc!=undefined&&$scope.diagClinc!=null&&$scope.diagClinc!=''&&$scope.diagClinc.length>0){
                     $scope.noData = false;
                 }else{
                     $scope.noData = true;                 }
             }else{
                 if($scope.diagHospital!=undefined&&$scope.diagHospital!=null&&$scope.diagHospital!=''&&$scope.diagHospital.length>0){
                     $scope.noData = false;
                 }else{
                     $scope.noData = true;
                 }
             }
        };
        $scope.initTreatmentPage = function(){
            $scope.noData = false;
            if(ClinicHospitalDetailService.isInhospital!=undefined&&ClinicHospitalDetailService.isInhospital!=null&&ClinicHospitalDetailService.isInhospital!=''){
                $scope.isInhospital = ClinicHospitalDetailService.isInhospital;
            }else{
                $scope.isInhospital = 0;
            }
            $scope.persionalData = null;
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
                idCardNo: idCardNo,
                name: name,
                phoneNumber: phoneNumber
            };
            TreatmentInformationListService.getTreatmentInfo(param,function(result){
                if(result.DIAG_CLINIC.length>0){
                    //门诊数据
                    $scope.diagClinc = result.DIAG_CLINIC;
                }
                if(result.DIAG_HOSPITAL.length>0){
                    //住院数据
                   $scope.diagHospital =result.DIAG_HOSPITAL;
                }
                if($scope.isInhospital==0){
                    $scope.dataList = $scope.diagClinc;
                }else{
                    $scope.dataList = $scope.diagHospital;
                }
                noClinicData();
            })

        };
        $scope.initTreatmentPage();
        //显示门诊还是住院
        $scope.changeInHospital = function(type){
            $scope.isInhospital = type;
            if($scope.isInhospital==0){
                $scope.dataList = $scope.diagClinc;
            }else{
                $scope.dataList = $scope.diagHospital;
            }
            noClinicData();
        };
        $scope.goToTreatmentDetail = function(data){
            ClinicHospitalDetailService.TREATMENT_INFO =data;
            ClinicHospitalDetailService.isInhospital = $scope.isInhospital;
            $state.go("clinic_hospital_detail");

        };

    })
    .build();

