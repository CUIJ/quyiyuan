new KyeeModule()
    .group("kyee.quyiyuan.report.add_inpatient_number.controller")
    .require([])
    .type("controller")
    .name("AddInpatientNumberController")
    .params(["$ionicHistory","$state","$scope","ReportMultipleService","KyeeViewService","KyeeListenerRegister","HttpServiceBus","CacheServiceBus","KyeeI18nService"])
    .action(function ($ionicHistory,$state,$scope,ReportMultipleService,KyeeViewService,KyeeListenerRegister,HttpServiceBus,CacheServiceBus,KyeeI18nService) {
        $scope.hosp = {
            INP_NO:"",
            USER_VS_ID:ReportMultipleService.addNo.USER_VS_ID
        };
        $scope.hosNum=KyeeI18nService.get('add_inpatient_number.pleaseInputHosNum','请输入住院号');
        ReportMultipleService.from = 1;
        $scope.submit = function(){
            ReportMultipleService.addHospNo($scope.hosp,function (data) {
                if(data.success){
                    ReportMultipleService.addNo = $scope.hosp;
                }
                $ionicHistory.goBack();
            });
        };
    })
    .build();