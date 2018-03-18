/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2015年10月21日15:21:36
 * 创建原因：退费明细服务
 * 任务号：KYEEAPPC-3596
 * 修改者：程铄闵
 * 修改时间：2016年7月20日21:03:58
 * 修改原因：增加门诊多笔退费
 * 任务号：KYEEAPPC-7114
 */
new KyeeModule()
    .group("kyee.quyiyuan.myRefundDetail.service")
    .type("service")
    .name("MyRefundDetailService")
    .params(["HttpServiceBus"])
    .action(function (HttpServiceBus) {
        var def = {
            params:{},//不同入口的传入参数
            param:{},
            fromView:undefined,//入口模块
            fromRefund:true,//就诊卡退费跳到退费详情的标识
            loadData : function(getData) {
                var httpParams = {};
                var url;
                var returnId;
                var refundTradeNo;
                var outTradeNo;
                var recMasterId;
                var extraKey;
                var params = def.params;
                var param = def.param;
                var payTypeFlag;
                var readFlagId;
                var refundSerialNo;
                //从就诊卡卡退费记录跳转
                if(def.fromView == 'patient_card_refund'){
                    refundSerialNo = param.REFUND_SERIAL_NO;
                    outTradeNo = param.OUT_TRADE_NO;
                    httpParams = {
                        OUT_TRADE_NO:outTradeNo,
                        REFUND_SERIAL_NO:refundSerialNo,
                        op: "queryPatientCardRefundDetailActionC"
                    };
                    url = "patientRecharge/action/PatientRechargeActionC.jspx";
                }
                //从退费历史进去
                else if(def.fromView=='patient_card_hositry' ){
                    refundSerialNo = params.REFUND_SERIAL_NO;
                    outTradeNo = params.OUT_TRADE_NO;
                    httpParams = {
                        OUT_TRADE_NO:outTradeNo,
                        REFUND_SERIAL_NO:refundSerialNo,
                        op: "queryPatientCardRefundDetailActionC"
                    };
                    url = "patientRecharge/action/PatientRechargeActionC.jspx";
                }
                //
                else{
                    //门诊缴费详情
                    if(params && params.flag){
                        var flag = params.flag;//入口业务标记
                        //我的退费入口
                        if(flag == 'myRefund'){
                            returnId = params.RETURN_ID;
                            refundTradeNo = params.REFUND_TRADE_NO;
                            outTradeNo = params.OUT_TRADE_NO;
                        }
                        //门诊缴费详情
                        else if(flag == 'clinicPaid'){
                            recMasterId = params.REC_MASTER_ID;
                            outTradeNo = params.OUT_TRADE_NO;
                            extraKey = params.EXTRA_KEY;
                            payTypeFlag = params.PAYTYPE_FLAG;
                            readFlagId = params.READ_FLAG_ID;
                        }
                        //门诊退费详情 程铄闵 KYEEAPPC-7610
                        else if(flag == 'clinicRefund'){
                            recMasterId = params.REC_MASTER_ID;
                            outTradeNo = params.OUT_TRADE_NO;
                            payTypeFlag = params.PAYTYPE_FLAG;
                        }
                    }
                    httpParams = {
                        op: "getRefundDetail",
                        RETURN_ID:returnId,
                        REFUND_TRADE_NO:refundTradeNo,
                        OUT_TRADE_NO:outTradeNo,
                        REC_MASTER_ID:recMasterId,
                        EXTRA_KEY:extraKey,
                        PAYTYPE_FLAG:payTypeFlag,
                        READ_FLAG_ID:readFlagId,
                        REFUND_SERIAL_NO:refundSerialNo
                    };
                    url = "/payment/action/ReturnActionC.jspx";
                }
                def.fromView = undefined;
                HttpServiceBus.connect({
                    url: url,
                    params: httpParams,
                    onSuccess: function (data) {
                        if(data.success){
                            var rec = data.data;
                            if(rec && rec.total>=1){
                                var rows = rec.rows;
                                for(var i=0;i<rows.length;i++){
                                    if(rows[i].RETURN_DETAIL){
                                        rows[i].RETURN_DETAIL = JSON.parse(rows[i].RETURN_DETAIL);
                                    }
                                }
                                getData(true,data.data);
                            }
                            else{
                                getData(false,data.message);
                            }
                        }
                        else{
                            getData(false,data.message);
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();