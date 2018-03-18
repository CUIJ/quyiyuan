new KyeeModule()
    .group("kyee.quyiyuan.patient_card_refund.service")
    .require([])
    .type("service")
    .name("PatientCardRefundService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus","KyeeUtilsService"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus,KyeeUtilsService) {
        var def = {
            //参数集合
            rechargeInfo:undefined,
            //退费标识
            fromApplyRefund:false,
            //拉取要退费的数据
            getCardChargeRefund:function(onSuccess,name,card_no){
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "getPatientCardRefundableInfoActionC",
                        INPUT_NAME:name,
                        CARD_NO:card_no
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var data = data.data;
                            onSuccess(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //获取退费记录
            getRefund:function(onSuccess){
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "queryPatientCardRefundRecordActionC"
                    },
                    onSuccess: function (data) {
                        for (var i = 0; i < data.data.rows.length; i++) {
                            data.data.rows[i].CREATE_TIME = KyeeUtilsService.DateUtils.formatFromDate(data.data.rows[i].CREATE_TIME, 'YYYY/MM/DD');
                            if(data.data.rows[i].DISPLAY_COLOUR=='RED'){
                                data.data.rows[i].DISPLAY_COLOUR='#ff777a';
                            }
                            if(data.data.rows[i].DISPLAY_COLOUR=='GREEN'){
                                data.data.rows[i].DISPLAY_COLOUR='#5baa8a';
                            }
                            if(data.data.rows[i].DISPLAY_COLOUR=='BLACK'){
                                data.data.rows[i].DISPLAY_COLOUR='';
                            }
                            for(var j= 0; j <data.data.rows[i].refundDetailJSONArray.length;j++ ){
                               if(data.data.rows[i].refundDetailJSONArray[j].DETAIL_DISPLAY_COLOUR=='RED'){
                                   data.data.rows[i].refundDetailJSONArray[j].DETAIL_DISPLAY_COLOUR='#ff777a';
                               }
                                if(data.data.rows[i].refundDetailJSONArray[j].DETAIL_DISPLAY_COLOUR=='GREEN'){
                                    data.data.rows[i].refundDetailJSONArray[j].DETAIL_DISPLAY_COLOUR='#5baa8a';
                                }
                                if(data.data.rows[i].refundDetailJSONArray[j].DETAIL_DISPLAY_COLOUR=='BLACK'){
                                    data.data.rows[i].refundDetailJSONArray[j].DETAIL_DISPLAY_COLOUR='';
                                }
                            }
                        }
                        onSuccess(data);
                    }
                });
            },
            //申请退费
            applyPatientCardRefund:function(onSuccess,params){
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "applyPatientCardRefundActionC",
                        INPUT_NAME:params.PATIENT_NAME,
                        CARD_NO:params.CARD_NO,
                        REFUND_SERIAL_NO:params.REFUND_SERIAL_NO
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var data = data;
                            onSuccess(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();