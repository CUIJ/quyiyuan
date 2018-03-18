/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016年6月24日14:17:30
 * 创建原因：2.2.40版住院费用查询（就医记录入口）控制
 * 任务号：KYEEAPPC-6607
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientGeneralQuery.controller")
    .require([])
    .type("controller")
    .name("InpatientGeneralQueryController")
    .params(["$scope","$state","HospitalSelectorService","InpatientPaidService","KyeeListenerRegister",
    "KyeeMessageService","$ionicHistory","KyeeUtilsService","KyeeI18nService","InpatientGeneralService"])
    .action(function ($scope,$state,HospitalSelectorService,InpatientPaidService,KyeeListenerRegister,
                      KyeeMessageService,$ionicHistory,KyeeUtilsService,KyeeI18nService,InpatientGeneralService) {

        $scope.isEmpty = true;
        $scope.emptyText = undefined;

        //初始化查询页数据
        var initQueryData = function(){
            //$scope.isEmpty = false;
            $scope.placeholder = {
                pHInvoice:KyeeI18nService.get("inpatient_general_query.pHInvoice","请输入发票号"),
                pHHospitalCode:KyeeI18nService.get("inpatient_general_query.pHHospitalCode","请输入住院号")
            };
            $scope.queryObj = {
                hospitalCode : "",
                invoiceNo:""
            };
            $scope.queryData = InpatientGeneralService.queryData;
        };

        initQueryData();


        //返回按钮
        $scope.back = function(){
            InpatientGeneralService.changeHospitalId = undefined;//清除医院
            //$ionicHistory.goBack();
            $state.go('inpatient_general');
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "inpatient_general_query",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

        //下一步按钮
        $scope.nextStep = function(){
            var hospitalCode = $scope.queryObj.hospitalCode.trim();
            var invoiceNo = $scope.queryObj.invoiceNo.trim();
            //住院号和发票号校验
            if($scope.queryData.SHOW_INP == 1&&$scope.queryData.SHOW_INVOICE == 1){
                if((hospitalCode==undefined||hospitalCode=='')&&(invoiceNo==undefined||invoiceNo=='')){
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("inpatient_general_query.warnEmpty1","请输入住院号或发票号")
                    });
                    return;
                }
            }
            //住院号校验
            if(($scope.queryData.SHOW_INP == 1)&&($scope.queryData.SHOW_INVOICE != 1)){
                if(hospitalCode==undefined||hospitalCode==''){
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("inpatient_general_query.warnEmpty2","请输入住院号")
                    });
                    return;
                }
            }
            //发票号校验
            if(($scope.queryData.SHOW_INP != 1)&&($scope.queryData.SHOW_INVOICE == 1)){
                if(invoiceNo==undefined||invoiceNo==''){
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("inpatient_general_query.warnEmpty3","请输入发票号")
                    });
                    return;
                }
            }
            var queryObj = {
                hospitalCode : hospitalCode.trim(),
                invoiceNo : invoiceNo.trim()
            };
            InpatientGeneralService.loadData(function(){
                InpatientGeneralService.nextStepFlag = true;//从下一步到inpatient_general
                $state.go('inpatient_general');
            },false,queryObj);
        };

        //清空住院号
        $scope.clearNo = function(flag){
            if(flag == 0){
                $scope.queryObj.hospitalCode = "";
            }
            if(flag == 1){
                $scope.queryObj.invoiceNo = "";
            }
        };

    })
    .build();