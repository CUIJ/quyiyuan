/**
* Created by lizhihu on 2017/7/6.
*/
new KyeeModule()
    .group("kyee.quyiyuan.consulation.note.detail.service")
    .require([
        "kyee.quyiyuan.service_bus.cache",
        "kyee.framework.service.message",
        "kyee.framework.service.utils"
    ])
    .type("service")
    .name("ConsulationNoteDetailService")
    .params(["HttpServiceBus",
        "KyeeMessageService",
        "$state", "CacheServiceBus",
        "KyeeI18nService",
        "KyeeUtilsService"

    ])
    .action(function (HttpServiceBus, KyeeMessageService, $state, CacheServiceBus, KyeeI18nService, KyeeUtilsService) {

        var def = {
            consType:'MDT',
            consultPatientUUId: '', //会诊记录标识

            /**
             * 请求MDT会诊详情
             * @author lizhihu
             * @param id
             * @param onSuccess
             */
            getMDTDetailList: function(id, onSuccess){
                HttpServiceBus.connect({
                    url: 'consultation/action/ConsultationRecordActionC.jspx',
                    params: {
                        op: "getConsultationRecordDetailActionC",
                        reservationId: id
                    },
                    onSuccess: function (data) {
                        //console.log(data)
                        if (!data.success) {
                            //显示无数据提示
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                        onSuccess(data.data);
                    }
                });
            },
            /**
             * 请求RPP会诊详情
             * @author hourui
             * @param consultPatientKeyId
             * @param onSuccess
             */
            getRPPDetailList: function(consultPatientKeyId, onSuccess){
                HttpServiceBus.connect({
                    url: 'consultation/action/ConsultationRecordActionC.jspx',
                    params: {
                        op: "getPathologyConsultationRecordDetailActionC",
                        consultPatientKeyId: consultPatientKeyId
                    },
                    onSuccess: function (data){
                        if (!data.success) {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                        onSuccess(data.data);
                    }
                });
            }
        };
        return def;
    })
    .build();
