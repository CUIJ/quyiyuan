/**
* 产品名称：quyiyuan
* 创建人: 张明
* 创建日期:2015年12月23日11:22:33
* 创建原因：报告单增加直接根据就诊卡查询的便捷方式
* 任务号：KYEEAPPC-4621
**/
new KyeeModule()
    .group("kyee.quyiyuan.report_multiple_querybycard.controller")
    .require(["kyee.quyiyuan.report_multiple.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view"])
    .type("controller")
    .name("ReportMultipleQueryByCardController")
    .params(["$scope","$state","HttpServiceBus","KyeeUtilsService","KyeeMessageService",
        "CacheServiceBus","KyeeI18nService","ReportMultipleService","$compile","$timeout","CommPatientDetailService"])
    .action(function ($scope,$state,HttpServiceBus,KyeeUtilsService,KyeeMessageService,
                      CacheServiceBus,KyeeI18nService,ReportMultipleService,$compile,$timeout,CommPatientDetailService) {
        $scope.queryObj = {
            card_no : ""
        };
        $scope.placeholder = {
            pHPatientId:KyeeI18nService.get("mulreport_query_by_card.checkPatient","请输入就诊卡号")
        };
        if(ReportMultipleService.setFlag){
            $scope.setFlag=ReportMultipleService.setFlag;
        }else{
            $scope.setFlag=undefined;
        }
        var initHtml = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("goPatientInfoId"));
                    element.html($scope.setFlag);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };
        initHtml();
        //修改个人信息跳转
        $scope.goPatientDetail = function(){
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var current = angular.copy(currentPatient);
            CommPatientDetailService.editPatient(current);
        };
        //提交按钮
        $scope.submit = function(){
            var card_no = $scope.queryObj.card_no.trim();
            //就诊卡号校验
            if(card_no==undefined||card_no==''){
                KyeeMessageService.message({
                    title: KyeeI18nService.get("commonText.msgTitle","消息"),
                    content:KyeeI18nService.get("mulreport_query_by_card.checkPatient","请输入就诊卡号！"),
                    okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
                });
                return;
            }

            var queryObj = {
                card_no : card_no
            };
            $state.go('report_multiple');
            ReportMultipleService.detialFlag=false;//查询的时候返回到主界面时，需要重新load刷新
            ReportMultipleService.queryObj = queryObj;

        };
    })
    .build();