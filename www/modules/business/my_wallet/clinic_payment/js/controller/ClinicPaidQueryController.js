/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015年12月12日21:09:51
 * 创建原因：门诊费用增加切换医院的功能(2.1.10)
 * 任务号：KYEEAPPC-4451
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaidQueryController.controller")
    .require(["ngSanitize"])
    .type("controller")
    .name("ClinicPaidQueryController")
    .params(["$scope","$state","HttpServiceBus","KyeeUtilsService","KyeeMessageService",
        "CacheServiceBus","KyeeI18nService","ClinicPaidService","$compile","$timeout","CommPatientDetailService"])
    .action(function ($scope,$state,HttpServiceBus,KyeeUtilsService,KyeeMessageService,
                      CacheServiceBus,KyeeI18nService,ClinicPaidService,$compile,$timeout,CommPatientDetailService) {
        $scope.queryObj = {
            patientId : ""
        };
        $scope.placeholder = {
            pHPatientId:KyeeI18nService.get("clinic_paid_query.pHPatientId","请输入就诊卡号")
        };
        var queryMsg = ClinicPaidService.configTips;//查询类型 //程铄闵 KYEEAPPC-4560 修改提示
        if(queryMsg){
            $scope.resultMsg = queryMsg;//查询默认提示语
        }
        else{
            $scope.resultMsg = undefined;
        }
        //初始化点击事件 程铄闵 KYEEAPPTEST-3186
        var initClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("clinicPaidQueryId"));
                    element.html($scope.resultMsg);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };
        initClick();
        //修改个人信息跳转
        $scope.goPatientDetail = function(){
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
            CommPatientDetailService.editPatient(current);
        };
        //提交按钮
        $scope.submit = function(){
            var patientId = $scope.queryObj.patientId.trim();
            //就诊卡号校验
            if(patientId==undefined||patientId==''){
                KyeeMessageService.message({
                    title: KyeeI18nService.get("commonText.msgTitle","消息"),
                    content:KyeeI18nService.get("clinic_paid_query.checkPatient","请输入就诊卡号！"),
                    okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
                });
                return;
            }

            var queryObj = {
                patientId : patientId
            };
            $state.go('clinicPaid');

            ClinicPaidService.queryObj = queryObj;

        };
    })
    .build();