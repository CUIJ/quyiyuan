/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2016年1月6日16:02:13
 * 创建原因：就诊卡充值记录服务层
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.recharge_records.service")
    .require([])
    .type("service")
    .name("RechargeRecordsService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus", "KyeeI18nService"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus, KyeeI18nService) {
        var def = {

            CARD_NO: '',
            PATIENT_ID: '',
            //查询记录
            queryChargeRecord: function (onSuccess, flag) {
                var me = this;
                if(!flag){
                    flag = false;
                }
                HttpServiceBus.connect({
                    url: 'patientRecharge/action/PatientRechargeActionC.jspx',
                    showLoading: flag,
                    params: {
                        op: 'queryPatientRechargeRecord',
                        opVersion:'2.1.50',//KYEEAPPC-5217 程铄闵
                        PATIENT_ID: me.PATIENT_ID,
                        CARD_NO: me.CARD_NO
                    },
                    onSuccess: function (records) {
                        if (records.success) {
                            //充值记录
                            var chargeRecords = records.data.rows;
                            for (var i = 0; i < chargeRecords.length; i++) {
                                var errorMsgStr = chargeRecords[i].ERROR_MSG.split('|');
                                chargeRecords[i].STATUS = errorMsgStr[1];
                                chargeRecords[i].COLOR = errorMsgStr[0];
                                chargeRecords[i].CREATE_TIME = chargeRecords[i].CREATE_TIME.substr(0, 10)
                            }
                            onSuccess(chargeRecords, records.message);
                        }
                        else {
                            KyeeMessageService.broadcast({
                                content: records.message
                            });
                        }
                    }
                });
            }

        };
        return def;
    })
    .build();

