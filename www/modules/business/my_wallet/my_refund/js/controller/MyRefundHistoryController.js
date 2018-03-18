/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2015年10月21日15:21:36
 * 创建原因：退费历史记录控制器
 * 任务号：KYEEAPPC-3596
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefundHistory.controller")
    .require(["kyee.quyiyuan.myRefund.service"])
    .type("controller")
    .name("MyRefundHistoryController")
    .params(["$scope", "$state","MyRefundService","MyRefundDetailService","AppointmentRegistDetilService","MyRefundDetailNewService","ClinicPaidService"])
    .action(function ($scope, $state,MyRefundService,MyRefundDetailService,AppointmentRegistDetilService,MyRefundDetailNewService,ClinicPaidService) {

        //初始化无数据标记
        $scope.isEmpty = true;
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
        //初始化医院
        var hospitalId = undefined;

        //获取医院  update 程铄闵 KYEEAPPC-3738
        if(MyRefundService.messageHospital){
            hospitalId = MyRefundService.messageHospital;
            MyRefundService.messageHospital = undefined;
        }

        //获取已退费的信息
        MyRefundService.getMyRefundInfo('1',function (success,message,data) {
            if(success){
                var info = data.INFO;
                if(info){
                    if(info.length>0){
                        $scope.isEmpty = false;
                        $scope.refundHistory = info;
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
        },hospitalId);

        //跳转退费历史详情--已废弃
        $scope.goDetail= function(refundDetail){
            refundDetail.isHistory=true;//从历史页面跳转详情
            refundDetail.QUERY_TYPE = '1';//0-待处理；1-已处理
            MyRefundDetailService.detailData = refundDetail;
            $state.go('refund_detail');
        };
        //跳转退费详情
        $scope.goRefundDetail = function(item){
            //门诊退费  KYEEAPPC-7114 程铄闵
            if(item.MODEL_CODE == '02'){
                MyRefundDetailService.params = {
                    flag:'myRefund',
                    RETURN_ID: item.RETURN_ID,
                    REFUND_TRADE_NO: item.REFUND_TRADE_NO,
                    OUT_TRADE_NO:item.OUT_TRADE_NO,
                    refundSum:item.RETURN_BALANCE
                };
                $state.go('refund_detail');
            }
            else{
                MyRefundDetailNewService.REFUND_TRADE_NO = item.REFUND_TRADE_NO;
                MyRefundDetailNewService.OUT_TRADE_NO=item.OUT_TRADE_NO;
                $state.go('refund_detail_new');
            }
        };

        $scope.goForDetail = function (modelCode,paymentType,neededPara,para){
            if(paymentType==10){
                return;
            }
            switch(modelCode){
                case "01":
                case "03":
                case "05":
                    AppointmentRegistDetilService.ROUTE_STATE="refund_history";
                    AppointmentRegistDetilService.RECORD.REG_ID = neededPara;
                    AppointmentRegistDetilService.RECORD.HOSPITAL_ID=para;
                    $state.go('appointment_regist_detil');
                    break;
                case "02":
                    ClinicPaidService.PARA=para;
                    ClinicPaidService.OUT_TRADE_NO=neededPara;
                    $state.go('paid_record');
                    break;
                case "04":
                case "06":
                    MyRefundDetailNewService.OUT_TRADE_NO=neededPara;
                    $state.go('refund_detail_new');
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