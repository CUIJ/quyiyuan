new KyeeModule()
    .group("kyee.quyiyuan.healthCard.service")
    .require([])
    .type("service")
    .name("HealthCardService")
    .params(["HttpServiceBus","KyeeMessageService","CacheServiceBus","KyeeI18nService"])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeI18nService){
        var def = {
            payTypes:[],
            //获得地区数据
            queryHealthCardAreaInfo:function(getData){
                var param = {
                    op : "queryHealthCardAreaInfo",
                };
                HttpServiceBus.connect({
                    url : "healthCard/action/HealthCardActionC.jspx",
                    params : param,
                    onSuccess : function(data){
                        if(data){
                            //数据获取成功
                            if(data.success){
                                getData(data,true);
                            }
                            //数据获取失败
                            else{
                                getData(data,false);
                            }
                        }
                    },
                    onError　: function(){
                        KyeeMessageService.broadcast({
                            content: "网络异常，请稍后重试"
                        });
                    }
                })
            },
            //查询健康卡
            queryHealthCardInfo:function(AREA_CODE,PATIENT_NAME,PHONE_NUMBER,ID_NO,getData){
                var param = {
                    op : "queryHealthCardInfo",
                    AREA_CODE:AREA_CODE,
                    PATIENT_NAME:PATIENT_NAME,
                    PHONE_NUMBER:PHONE_NUMBER,
                    ID_NO:ID_NO
                };
                HttpServiceBus.connect({
                    url : "healthCard/action/HealthCardActionC.jspx",
                    params : param,
                    onSuccess : function(data){
                        if(data){
                            //数据获取成功
                            if(data.success){
                                getData(data,true);
                            }
                            //数据获取失败
                            else{
                                getData(data,false);
                            }
                        }
                    },
                    onError　: function(){
                        KyeeMessageService.broadcast({
                            content: "网络异常，请稍后重试"
                        });
                    }
                })
            },

            //获取充值订单号和权限
            healthCardPatientRecharge:function(AREA_CODE,PATIENT_NAME,PHONE_NUMBER,ID_NO,AMOUNT,CARD_NO,CARD_TYPE,getData){
                var param = {
                    op : "healthCardPatientRecharge",
                    AREA_CODE : AREA_CODE,
                    PATIENT_NAME : PATIENT_NAME,
                    PHONE_NUMBER : PHONE_NUMBER,
                    ID_NO : ID_NO,
                    AMOUNT : AMOUNT,
                    CARD_NO : CARD_NO,
                    CARD_TYPE : CARD_TYPE
                };
                HttpServiceBus.connect({
                    url : "healthCard/action/HealthCardActionC.jspx",
                    params : param,
                    onSuccess : function(data){
                        if(data){
                            //数据获取成功
                            if(data.success){
                                getData(data,true);
                            }
                            //数据获取失败
                            else{
                                getData(data,false);
                            }
                        }
                    },
                    onError　: function(){
                        KyeeMessageService.broadcast({
                            content: "网络异常，请稍后重试"
                        });
                    }
                })
            }
        };
        return def;
    })
    .build();