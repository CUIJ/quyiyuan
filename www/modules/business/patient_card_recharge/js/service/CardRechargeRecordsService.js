/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年2月22日15:09:26
 * 创建原因：就诊卡充值记录(2.1.60版后)服务层
 * 任务号：KYEEAPPC-5217
 */
new KyeeModule()
    .group("kyee.quyiyuan.card_recharge_records.service")
    .require([])
    .type("service")
    .name("CardRechargeRecordsService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "KyeeI18nService","CardRechargeConfirmService"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, KyeeI18nService,CardRechargeConfirmService) {
        var def = {

            isNextStep:false,//充值记录继续支付标记
            //查询记录
            queryChargeRecord: function (showLoading,currentPage,rows,onSuccess) {
                HttpServiceBus.connect({
                    url: 'patientRecharge/action/PatientRechargeActionC.jspx',
                    showLoading: showLoading,
                    params: {
                        op: 'queryPatientRechargeRecord',
                        PAGE:currentPage,
                        ROWS:rows
                    },
                    onSuccess: function (records) {
                        var tip = records.message;//底部黑框提示
                        var emptyText = KyeeI18nService.get("card_recharge_record.emptyText","暂无充值记录，请下拉刷新");//背景空提示
                        if (records.success) {
                            //充值记录
                            var chargeRecords = records.data.rows;
                            var total = records.data.total;
                            //判断是否有记录
                            if(total > 0){
                                emptyText = undefined;
                            }
                            for (var i = 0; i < chargeRecords.length; i++) {
                                if(chargeRecords[i].ERROR_MSG){
                                    var errorMsgStr = chargeRecords[i].ERROR_MSG.split('|');
                                    chargeRecords[i].RECORD_STATUS = errorMsgStr[1];
                                    chargeRecords[i].RECORD_COLOR = errorMsgStr[0];
                                    var time = chargeRecords[i].PAY_TIME;
                                    if(time){
                                        chargeRecords[i].PAY_TIME = KyeeUtilsService.DateUtils.formatFromDate(time,'YYYY/MM/DD');
                                        chargeRecords[i].PAY_TIME_DETAIL=KyeeUtilsService.DateUtils.formatFromDate(time,'HH:mm:ss');
                                    }
                                }
                                if(chargeRecords[i].STATUS){
                                    var errorMsgStr = chargeRecords[i].STATUS.split('|');
                                    chargeRecords[i].QUERY_STATUS = errorMsgStr[1];
                                    chargeRecords[i].QUERY_COLOR = errorMsgStr[0];
                                    var time = chargeRecords[i].CREATE_TIME;
                                    if(time) {
                                        chargeRecords[i].CREATE_TIME = KyeeUtilsService.DateUtils.formatFromDate(time, 'YYYY/MM/DD');
                                    }
                                }
                            }
                            onSuccess(records,tip,emptyText);
                        }
                        else {
                            //当前非第一页时不显示空提示
                            if(currentPage > 1){
                                emptyText = undefined;
                                tip = KyeeI18nService.get("card_recharge_record.tip","已成功为您加载就诊卡充值记录，如果未获得最新状态请下拉刷新");
                            }
                            else{
                                tip = undefined;
                            }
                            onSuccess(undefined,tip,emptyText);
                            KyeeMessageService.broadcast({
                                content: records.message
                            });
                        }
                    }
                });
            },
            //继续支付按钮事件  //KYEEAPPC-7818 程铄闵 增加cardType
            rechargeContinue :function(cardNo,cardType,patientId,getData){
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        CARD_NO:cardNo,
                        CARD_TYPE: cardType,
                        PATIENT_ID: patientId,
                        op: "queryPatientRechargeMasterActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //有卡数据--跳转确认页面
                            if(data.data && data.data.total>0){
                                CardRechargeConfirmService.rechargeInfo = data.data;
                                getData('card_recharge_confirm');
                            }
                            //无卡数据--弹框提示
                            else{
                                KyeeMessageService.broadcast({
                                    content: data.data.ERROR_MSG,
                                    duration: 3000
                                });
                                getData('card_recharge_records');
                            }
                        }
                        else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //就诊卡充值记录滑动删除 by 杜巍巍
            delCardRechargeRecords: function (getData,PATD_ID) {
                HttpServiceBus.connect({
                    url: "patientRecharge/action/PatientRechargeActionC.jspx",
                    params: {
                        UNION_ID:PATD_ID,
                        op: "hiddenPatientRechargeByPrimaryKey"
                    },
                    onSuccess: function (data) {
                        getData(data);
                    }
                })
            }
        };
        return def;
    })
    .build();