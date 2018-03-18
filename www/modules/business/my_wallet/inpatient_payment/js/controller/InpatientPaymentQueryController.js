/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015年12月10日18:02:30
 * 创建原因：住院每日清单查询控制
 * 任务号：KYEEAPPC-4453
 * 修改者：程铄闵
 * 修改时间：2016年6月17日10:22:51
 * 修改原因：2.2.40版住院费用（医院首页入口）
 * 任务号：KYEEAPPC-6603
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientPaymentQueryController.controller")
    .require(["ngSanitize"])
    .type("controller")
    .name("InpatientPaymentQueryController")
    .params(["$scope","$state","HttpServiceBus","KyeeUtilsService","KyeeMessageService",
        "CacheServiceBus","InpatientPaymentService","KyeeI18nService","InpatientPaidService","$timeout","PerpaidPayInfoService","KyeeListenerRegister"])
    .action(function ($scope,$state,HttpServiceBus,KyeeUtilsService,KyeeMessageService,
                      CacheServiceBus,InpatientPaymentService,KyeeI18nService,InpatientPaidService,$timeout,PerpaidPayInfoService,KyeeListenerRegister) {

        KyeeListenerRegister.regist({
            focus: "inpatient_payment_query",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                // 安庆市第一人民医院查询方式为住院号查询，如果查询方式改变需修改代码
                if(urlInfo && urlInfo.hospitalID == "5560001" && urlInfo.wx_forward == "inpatient_payment_query"){
                    InpatientPaymentService.loadPermission(function(route){});
                    $scope.topTip = "需要您输入住院号查询住院费用详情";
                }
            }
        });

        $scope.userInfo = {
            hospitalCode : ""
        };
        $scope.placeholder = {
            pHHospitalCode:KyeeI18nService.get("inpatient_payment_query.pHHospitalCode","请输入住院号")
        };
        var permission = InpatientPaymentService.permissionData;
        $scope.permission = permission;
        var paymentData = InpatientPaymentService.paymentData;
        $scope.paymentData = paymentData;

        //初始化默认住院号
        if(InpatientPaymentService.fromModifyMode){
            //从切换查询条件切换到查住院号页，不显示默认住院号
            InpatientPaymentService.fromModifyMode = false;
        }
        else{
            if(permission && permission.INP_NO){
                $scope.userInfo.hospitalCode = permission.INP_NO;
            }
            //若住院号方式&&直连无数据来
            else if(paymentData && paymentData.INP_NO){
                $scope.userInfo.hospitalCode = paymentData.INP_NO;
            }
        }

        //初始化提示语
        if(paymentData&&paymentData.TOP_TIP){
            $scope.topTip = paymentData.TOP_TIP;
        }
        else if(permission&&permission.TOP_TIP){
            $scope.topTip = permission.TOP_TIP;
        }

        //提交按钮
        $scope.submit = function(){
            var hospitalCode = $scope.userInfo.hospitalCode.trim();
            if(hospitalCode==undefined||hospitalCode==''){
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get("inpatient_payment_query.checkHospitalCode","请输入住院号")
                });
                return;
            }
            var patientName = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).OFTEN_NAME;
            var queryObj = {
                hospitalCode : hospitalCode,
                patientName : patientName,
                searchFlag : '1'
            };
            InpatientPaymentService.loadRecordData(false,function(route){
                if(route!='inpatient_payment_query'){
                    $state.go(route);
                }
            },queryObj);
        };

        //清空住院号
        $scope.clearNo = function(){
            $scope.userInfo.hospitalCode = "";
        };

        //跳转到住院费用历史页面
        $scope.goPaidRecord = function(){
            //预缴开通
            if($scope.permission.PRECHARGE_PERMISSION == 1){
                $state.go('inpatient_paid_record');
            }
            else{
                InpatientPaidService.loadRecordData(function(){
                    $state.go('inpatient_paid_record');
                });
            }
        };

        //点击住院预缴记录事件
        $scope.goPerpaidRecord = function () {
            PerpaidPayInfoService.inpatientEntrance = true;
            PerpaidPayInfoService.inpatientToPerpaidRecord = true;//已结算未开通，跳转预缴记录标记
            $state.go('perpaid_record');
        };
    })
    .build();