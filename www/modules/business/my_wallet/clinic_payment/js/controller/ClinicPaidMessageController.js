/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年8月26日14:39:30
 * 创建原因：门诊已缴费消息多笔列表
 * 任务号：KYEEAPPC-7609
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaidMessage.controller")
    .require(["kyee.quyiyuan.myWallet.clinicPaidMessage.service"])
    .type("controller")
    .name("ClinicPaidMessageController")
    .params(["$scope", "$rootScope", "$state", "$ionicHistory", "ClinicPaidService", "KyeeListenerRegister",
        "AppointmentRegistDetilService", "KyeeMessageService","$ionicScrollDelegate","KyeeI18nService",
        "HospitalSelectorService","$compile","CacheServiceBus","$timeout","AuthenticationService",
        "KyeeViewService","ClinicPaymentService","$ionicListDelegate","CommPatientDetailService","KyeeUtilsService",
        "ClinicPaymentReviseService","PatientCardService","PaidRecordService"])
    .action(function ($scope, $rootScope, $state, $ionicHistory, ClinicPaidService, KyeeListenerRegister,
                      AppointmentRegistDetilService, KyeeMessageService,$ionicScrollDelegate,KyeeI18nService,
                      HospitalSelectorService,$compile,CacheServiceBus,$timeout,AuthenticationService,
                      KyeeViewService,ClinicPaymentService,$ionicListDelegate,CommPatientDetailService,KyeeUtilsService,
                      ClinicPaymentReviseService,PatientCardService,PaidRecordService) {

        $scope.isEmpty = true;
        $scope.emptyText = undefined;
        $scope.payChannel0 = KyeeI18nService.get("clinicPaid.payChannel0","APP支付");
        $scope.payChannel1 = KyeeI18nService.get("clinicPaid.payChannel1","非APP支付");
        //外部通知跳转进来，显示返回键
        if(PaidRecordService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        //处理成功数据
        var init = function(){
            if(PaidRecordService.webJump){

                //web推送页面跳转
                PaidRecordService.loadPaidRecord(PaidRecordService.params,function(success,data){
                    var paidData = PaidRecordService.paidList;
                    if(paidData && paidData.success){
                        $scope.isEmpty = false;
                        $scope.paidData = paidData.rows;
                        $scope.headDate = paidData.rows[0].VISIT_DATE;
                    }
                    else{
                        $scope.isEmpty = true;
                        $scope.emptyText = PaidRecordService.errorMsg;
                    }
                });
            }
            var paidData = PaidRecordService.paidList;
            if(paidData && paidData.success){
                $scope.isEmpty = false;
                $scope.paidData = paidData.rows;
                $scope.headDate = paidData.rows[0].VISIT_DATE;
            }
            else{
                $scope.isEmpty = true;
                $scope.emptyText = PaidRecordService.errorMsg;
            }
        };

        init();

        //判断本月
        $scope.isCurrentMonth = function(date){
            var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM');
            var dateNew = KyeeUtilsService.DateUtils.formatFromDate(date,'YYYY/MM');
            return cur==dateNew;
        };

        //跳转到详情页
        $scope.showRecord = function (paidInfo) {
            ClinicPaidService.fromClinicPaid = true;//从已缴费记录中跳到详情标记
            //详情增加多笔记录 程铄闵 KYEEAPPC-7609
            var params = {
                PLACE:'0',
                REC_MASTER_ID:paidInfo.REC_MASTER_ID,
                EXTRA_KEY:paidInfo.EXTRA_KEY
            };
            PaidRecordService.params = params;
            $state.go('paid_record');
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "clinic_paid_message",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                    $scope.goBack();

            }
        });
        //返回
        $scope.goBack = function () {
            if(PaidRecordService.webJump){
                //外部通知跳转进来,返回到首页
                PaidRecordService.webJump = undefined;
                $state.go('home->MAIN_TAB');
            }else{
                $ionicHistory.goBack();
            }
        };

    })
    .build();