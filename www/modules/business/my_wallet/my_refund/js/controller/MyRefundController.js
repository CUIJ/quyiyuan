/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年8月20日
 * 创建原因：我的退款页面控制器
 * 修改者：程铄闵
 * 修改时间：2015年10月17日13:24:46
 * 修改原因：2.0.80版本需求修改
 * 任务号：KYEEAPPC-3596
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefund.controller")
    .require([
        "kyee.quyiyuan.myRefund.service",
        "kyee.quyiyuan.myRefundApply.controller",
        "kyee.quyiyuan.myRefundDetail.controller",
        "kyee.quyiyuan.myRefundHistory.controller",
        "kyee.quyiyuan.myRefundDetailNew.controller",
        "kyee.quyiyuan.myClinicRefundApply.controller"
    ])
    .type("controller")
    .name("MyRefundController")
    .params(["$scope", "$state", "KyeeListenerRegister", "MyRefundService", "MyRefundApplyService",
         "MyRefundDetailService", "CacheServiceBus", "HomeService", "KyeeMessageService","KyeeI18nService","MyRefundDetailNewService","AppointmentRegistDetilService","ClinicPaidService"])
    .action(function ($scope, $state, KyeeListenerRegister, MyRefundService, MyRefundApplyService,
                       MyRefundDetailService, CacheServiceBus, HomeService, KyeeMessageService,KyeeI18nService,MyRefundDetailNewService,AppointmentRegistDetilService,ClinicPaidService) {
        //初始化无数据标记
        $scope.isEmpty = true;
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵

        //跳转至详情页
        $scope.goRefundDetail = function(item){
            //门诊退费  KYEEAPPC-7114 程铄闵
            if(item.MODEL_CODE == '02'){
                MyRefundDetailService.params = {
                    flag:'myRefund',
                    RETURN_ID: item.RETURN_ID,
                    REFUND_TRADE_NO: item.REFUND_TRADE_NO,
                    refundSum:item.RETURN_BALANCE,
                    OUT_TRADE_NO:item.OUT_TRADE_NO
                };
                $state.go('refund_detail');
            }
            else{

                MyRefundDetailNewService.REFUND_TRADE_NO = item.REFUND_TRADE_NO;
                MyRefundDetailNewService.OUT_TRADE_NO=item.OUT_TRADE_NO;
                $state.go('refund_detail_new');
            }
        };

        //点击退款按钮，数据传到我的退费页面
        $scope.goApplyRefund = function (item) {
            //数据传到下一页
                MyRefundApplyService.applyInfo=item;
                $state.go('refund_apply');
        };

        //刷新
        $scope.doRefresh = function(){
            //获取退费的信息
            MyRefundService.getMyRefundInfo('0',function (success,message,data) {
                if(success){
                    var info = data.INFO;
                    if(info){
                        if(info.length>0){
                            $scope.isEmpty = false;
                            $scope.refundInfo = data;
                        }
                        else{
                            $scope.isEmpty = true;
                            $scope.emptyText = message;
                        }
                    }
                }
                else{
                    $scope.isEmpty = true;
                    $scope.emptyText = message;
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.doRefresh();

        //跳转至明细--未使用
        $scope.goForDetail = function (modelCode,paymentType,neededPara,para){
            if(paymentType==10){
                return;
            }
            switch(modelCode){
                case "01":
                case "03":
                case "05":
                    AppointmentRegistDetilService.ROUTE_STATE="my_refund";
                    AppointmentRegistDetilService.RECORD.REG_ID = neededPara;
                    AppointmentRegistDetilService.RECORD.HOSPITAL_ID=para;
                    $state.go('appointment_regist_detil');
                    break;
                case "02":
                    ClinicPaidService.PARA=para;//跳转门诊账单详情标示
                    ClinicPaidService.OUT_TRADE_NO=neededPara;
                    $state.go('paid_record');
                    break;
                case "04":

                case "06":
                    MyRefundDetailNewService.OUT_TRADE_NO=neededPara;
                    $state.go('refund_detail_new');
            }
        };
        //跳转明细详情页--已废弃
        $scope.goDetail = function (refundDetail) {
            refundDetail.isHistory = false;//从非历史页面跳转详情
            refundDetail.QUERY_TYPE = '1';//0-待处理；1-已处理
            MyRefundDetailService.PAYMENT_TYPE = refundDetail.PAYMENT_TYPE;//支付方式
            MyRefundDetailService.detailData = refundDetail;
            $state.go('refund_detail');
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