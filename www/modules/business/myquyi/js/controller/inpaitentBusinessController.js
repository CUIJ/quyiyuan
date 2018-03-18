/*
 * 产品名称：quyiyuan
 * 创建人: 杜巍巍
 * 创建日期:2015年9月28日16:13:30
 * 创建原因：就医记录住院业务首页控制
 * 任务号：KYEEAPPC-3438
 */
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.inpatientBusiness.controller")
    .require([
        "kyee.quyiyuan.myquyi.inpatientBusiness.service",
        "kyee.quyiyuan.satisfaction.hospitalList.service",
        "kyee.quyiyuan.satisfaction.hospitalMenu.service",
        "kyee.quyiyuan.satisfaction.hospitalDoctor.service",
        "kyee.quyiyuan.satisfaction.hospitalHospital.service",
        "kyee.quyiyuan.report.service",
        "kyee.quyiyuan.myWallet.inpatientPayment.service",
        "kyee.quyiyuan.myWallet.inpatientPaidRecord.controller"
    ])
    .type("controller")
    .name("inpatientBusinessController")
    .params(["$scope", "$state", "inpatientBusinessService", 'KyeeMessageService',
        'HttpServiceBus', 'CacheServiceBus', 'KyeeUtilsService',
        "InpatientPaymentService", "FilterChainInvoker", "MyquyiService", "HomeService","InpatientPaidService","KyeeI18nService"])
    .action(function ($scope, $state, inpatientBusinessService, KyeeMessageService,
                      HttpServiceBus, CacheServiceBus, KyeeUtilsService,
                      InpatientPaymentService, FilterChainInvoker, MyquyiService, HomeService,InpatientPaidService,KyeeI18nService) {
        $scope.isShowHistroy = false;
        //页面数据
        $scope.refresh = function (showLoadingFlag) {
	            //begin by gyl 如果缓存中存在数据，则直接从缓存中获取  KYEEAPPC-3962
            if(undefined !== inpatientBusinessService.showInp&&showLoadingFlag){
                $scope.inPaymentData = inpatientBusinessService.inPaymentData;
                $scope.SHOW_INP = inpatientBusinessService.showInp;
                $scope.isShowHistroy = true;
                return;
            }
            //end by gyl KYEEAPPC-3962
            inpatientBusinessService.loadData(showLoadingFlag, true, function (data) {
                if (data) {
                    $scope.inPaymentData = inpatientBusinessService.inPaymentData;
                    $scope.SHOW_INP = inpatientBusinessService.showInp;
                    $scope.isShowHistroy = true;
                }
                $scope.$broadcast('scroll.refreshComplete');
            }, $scope);
            // inpatientBusinessService.scope = $scope;
            MyquyiService.scope = $scope;
        };
        $scope.refresh(true);
        //切换住院号
        $scope.changeHospitalNo = function () {
            InpatientPaymentService.fromBusiness = true;
            $state.go('inpatient_payment_record');
        };
        //转换金额
        $scope.convertMoney = function (v) {
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };
        //日期格式转换
        $scope.convertDate = function (v) {
            if (v == undefined || v == '') {
                return v;
            }
            else {
                return KyeeUtilsService.DateUtils.formatFromDate(v, 'YYYY/MM/DD');
            }
        };
        //日期格式转换
        $scope.convertSex = function (v) {
            if (v != undefined) {
                if (v == 1) {
                    return KyeeI18nService.get('commonText.man','男');
                }
                else if (v == 2) {
                    return KyeeI18nService.get('commonText.woman','女');
                }
                else {
                    return v;
                }
            }
            else {
                return v;
            }
        };
        //跳转我的钱包中住院业务
        $scope.goInpaitentDetail = function () {
            $state.go('inpatient_payment_record');
        };
        //跳转到输入住院号和姓名来查询住院信息
        $scope.goQueryView = function () {
            $state.go('inpatient_payment_record');
        };
        //跳转住院记录页面
        $scope.inpaitentPayment = function () {
            InpatientPaidService.afterMore = 'more';//程铄闵 KYEEAPPC-3870 修改住院记录名称及跳转
            $state.go("inpatient_paid_record");//KYEEAPPC-3870
        };
        //跳转住院检验检查单页面
        $scope.inpaitentReport = function () {
            // KYEEAPPC-4047  2.1.0报告单跨院修改 张明  2015.11.25
            $state.go('report_multiple');
        };
        //跳转住院满意度界面
        $scope.inpaitentSatisfication = function () {
            $state.go("satisfaction_hospital_list");
        };
        $scope.doRefresh = function () {
            $scope.refresh(false);
        }
    })
    .build();