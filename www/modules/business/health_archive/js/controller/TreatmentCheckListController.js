/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：检查检验单列表
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.treatment.check.list.controller")
    .require([
        "kyee.quyiyuan.health.archive.treatment.check.detail.controller"
    ])
    .type("controller")
    .name("TreatmentCheckListController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister","CacheServiceBus","TreatmentCheckDetailService","MyPersonalInformationService"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,CacheServiceBus,TreatmentCheckDetailService,MyPersonalInformationService) {

        KyeeListenerRegister.regist({
            focus: "treatment_check_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源
                $scope.DETAIL_CHECK_LIST = TreatmentCheckDetailService.DETAIL_CHECK_LIST;
                if ($scope.DETAIL_CHECK_LIST != "" && $scope.DETAIL_CHECK_LIST != null
                    && $scope.DETAIL_CHECK_LIST != undefined && $scope.DETAIL_CHECK_LIST.length > 0) {
                    $scope.showEmptCheck = false;
                }else{
                    $scope.showEmptCheck = true;
                }
            }
        });
        $scope.goToTreatmentCheckDetail = function(Detail){
            TreatmentCheckDetailService.CHECK_DETAIL =Detail;
            $state.go("treatment_check_detail");

        };

    })
    .build();

