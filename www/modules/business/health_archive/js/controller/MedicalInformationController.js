/*
 * 产品名称：健康档案—用药及处方详情
 * 创建人: 高萌
 * 创建日期:2016年11月17日15:36:22
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.medication.information.controller")
    .require([
        "kyee.quyiyuan.health.archive.clinic.hospital.detail.service"
    ])
    .type("controller")
    .name("MedicalInformationController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister",
        "MyPersonalInformationService","CacheServiceBus","ClinicHospitalDetailService"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,
                      MyPersonalInformationService,CacheServiceBus,ClinicHospitalDetailService) {
        KyeeListenerRegister.regist({
            focus: "medical_information",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源
                $scope.detailAdvicesList = ClinicHospitalDetailService.DETAIL_ADVICES_LIST;
            }
        });
    })
    .build();

