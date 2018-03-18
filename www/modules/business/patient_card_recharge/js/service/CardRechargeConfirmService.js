/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016/2/3
 * 创建原因：就诊卡充值确认信息(2.1.60版后)服务层
 * 任务号：KYEEAPPC-5217
 * 修改者：程铄闵
 * 修改时间：2016年9月27日15:10:43
 * 修改原因：2.3.10版修改增加退费记录
 * 任务号：KYEEAPPC-8088
 */
new KyeeModule()
    .group("kyee.quyiyuan.card_recharge_confirm.service")
    .require([])
    .type("service")
    .name("CardRechargeConfirmService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus", "KyeeI18nService"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus, KyeeI18nService) {
        var def = {

            lastCardParams:{},//最近一次选择的卡信息
            rechargeToOrder:false,//从就诊卡充值（我的）进入订单页

            //获取状态信息
            loadConfirmInfo: function (getData) {
                var params = def.lastCardParams;
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        CARD_NO: params.CARD_SHOW,
                        CARD_TYPE: params.CARD_TYPE,
                        PATIENT_ID: params.PATIENT_ID,
                        QUERY_TYPE:'1',
                        op: "queryPatientRechargeMasterActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            if(!data.data.IS_OPEN_RHCMS==1){
                                def.rechargeInfo = data.data;
                            }
                            getData('success');
                        }
                        else {
                            getData('fail');
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },

            //确认充值 //KYEEAPPC-7818 程铄闵 增加cardType
            rechargeSubmit: function(getData,cardNo,cardType,patientId,amount){
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        op: "patientRecharge",
                        PATIENT_ID: patientId,
                        CARD_NO: cardNo,
                        CARD_TYPE:cardType,
                        AMOUNT: amount
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var storageCache = CacheServiceBus.getStorageCache();
                            var hospitalInfo = storageCache.get('hospitalInfo');
                            var mark =KyeeI18nService.get("card_recharge_confirm.msgTitle","就诊卡充值");
                            var payData = {
                                'hospitalID':hospitalInfo.id,
                                'MARK_DESC': mark,
                                'MARK_DETAIL': mark,
                                'AMOUNT': parseFloat(amount).toFixed(2),
                                'TRADE_NO': data.data,
                                'CARD_NO':cardNo,
                                'CARD_TYPE':cardType,
                                'PATIENT_RECHARGE': true
                            };//KYEEAPPC-7818 程铄闵 增加cardType
                            getData(payData);
                        } else {
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