
new KyeeModule()
    .group("kyee.quyiyuan.card_refund.controller")
    .require(["kyee.quyiyuan.patient_card_recharge.controller"])
    .type("controller")
    .name("CardRefundController")
    .params(["$scope", "$rootScope", "$state", "$ionicHistory", "KyeeI18nService", "KyeeUtilsService", "KyeeMessageService","KyeeListenerRegister","PatientCardRefundService","MyRefundDetailService"])
    .action(function ($scope, $rootScope, $state, $ionicHistory, KyeeI18nService, KyeeUtilsService, KyeeMessageService,KyeeListenerRegister,PatientCardRefundService,MyRefundDetailService){
        PatientCardRefundService.getRefund(function(data){
            $scope.refundRecord =data.data;
        });
        $scope.goBack =  function(){
            $ionicHistory.goBack(-2);
        };
        //退费详情
        $scope.showDetail = function(index,detail,refundSerialNo,refundApplyStatus){
            var outTradeNo = detail[index].OUT_TRADE_NO;
            MyRefundDetailService.fromView = 'patient_card_hositry';
            MyRefundDetailService.params = {
                OUT_TRADE_NO:outTradeNo,
                REFUND_SERIAL_NO:refundSerialNo
            };
            if(refundApplyStatus==1) {
                $state.go('refund_detail');
            }
        };
        //弹出失败信息
        $scope.alertFailue =function(item){
            if(item!=undefined){
                KyeeMessageService.message({
                    title : KyeeI18nService.get("patient_card_records.noticeMessage","失败原因"),
                    content : KyeeI18nService.get("patient_card_records.message",item),
                    okText: KyeeI18nService.get("commonText.iknowMsg","我知道了")
                });
            }
        };
        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

    })
    .build();