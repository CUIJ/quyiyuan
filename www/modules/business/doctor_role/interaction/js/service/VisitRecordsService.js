/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年7月2日10:06:34
 * 创建原因：就诊记录
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.visitRecords.service")
    .type("service")
    .name("visitRecordsService")
    .params(["HttpServiceBus", "CacheServiceBus", "MessageBoardService",
        "KyeeMessageService"])
    .action(function (HttpServiceBus, CacheServiceBus, MessageBoardService,
                      KyeeMessageService) {

        var def = {
            storageCache: CacheServiceBus.getStorageCache(),
            //初始化查询数据
            loadData: function (onSuccess,showLoading,page) {
                HttpServiceBus.connect({
                    url: "/patientwords/action/PatientWordsActionC.jspx",
                    showLoading:showLoading,
                    params: {
                        op: "queryTreatmentRecords",
                        hospitalId: this.storageCache.get('hospitalInfo').id,
                        patientId: MessageBoardService.paramData.PATIENT_ID,
                        userVsId: MessageBoardService.paramData.USER_VS_ID,
                        start: 0,
                        page: 1,
                        limit: 10 * page
                    },
                    onSuccess: function (resp) {
                        if(resp.success){
                            onSuccess(resp.data);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                })
            }
        };
        return def;
    })
    .build();
