/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015年12月12日21:09:51
 * 创建原因：门诊费用增加切换医院的功能(2.1.10)
 * 任务号：KYEEAPPC-4451
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaymentQueryController.controller")
    .require(["kyee.quyiyuan.myWallet.clinicPayment.service",
        "ngSanitize"])
    .type("controller")
    .name("ClinicPaymentQueryController")
    .params(["$scope","$state","HttpServiceBus","KyeeUtilsService","KyeeMessageService",
        "CacheServiceBus","ClinicPaymentService","KyeeI18nService","CommPatientDetailService","$timeout","$compile","$ionicHistory","ClinicPaymentReviseService"])
    .action(function ($scope,$state,HttpServiceBus,KyeeUtilsService,KyeeMessageService,
                      CacheServiceBus,ClinicPaymentService,KyeeI18nService,CommPatientDetailService,$timeout,$compile,$ionicHistory,ClinicPaymentReviseService) {
        $scope.queryObj = {
            patientId : ""
        };
        $scope.placeholder = {
            pHPatientId:KyeeI18nService.get("clinic_payment_query.pHPatientId","请输入就诊卡号")
        };
        var isRevise = false;//从新版待缴费进入

        var init = function(){
            var queryMsg = ClinicPaymentService.configTips;//查询类型 //程铄闵 KYEEAPPC-4560 修改提示
            if(queryMsg){
                $scope.resultMsg = queryMsg;//查询默认提示语
            }
            else{
                $scope.resultMsg = undefined;
            }
            //从新版待缴费进入
            if($ionicHistory.backView().stateId == 'clinic_payment_revise'){
                isRevise = true;
            }
        };

        //初始化点击事件 程铄闵 KYEEAPPTEST-3186
        var initClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("clinicPaymentQueryId"));
                    element.html($scope.resultMsg);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };

        init();
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
                    content:KyeeI18nService.get("clinic_payment_query.checkPatient","请输入就诊卡号！"),
                    okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
                });
                return;
            }

            var queryObj = {
                patientId : patientId
            };
            $ionicHistory.goBack();

            if(isRevise){
                ClinicPaymentReviseService.queryObj = queryObj;
            }
            else{
                ClinicPaymentService.queryObj = queryObj;
            }

        };
    })
    .build();