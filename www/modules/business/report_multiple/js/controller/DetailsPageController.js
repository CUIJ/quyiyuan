new KyeeModule()
    .group("kyee.quyiyuan.report.detailsPage.controller")
    .require([])
    .type("controller")
    .name("DetailsPageController")
    .params(["$scope","ReportMultipleService","KyeeViewService","KyeeListenerRegister"])
    .action(function ($scope,ReportMultipleService,KyeeViewService,KyeeListenerRegister) {
        $scope.reportSupport = ReportMultipleService.reportSupport;
        ReportMultipleService.from = 1;
    })
    .build();