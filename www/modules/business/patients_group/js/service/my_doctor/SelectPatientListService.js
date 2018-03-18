new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor.select_patient_list.service")
    .require(["kyee.quyiyuan.center.custom_patient.service"])
    .type("service")
    .name("SelectPatientListService")
    .params([
        "$state",
        "HttpServiceBus",
        "KyeeMessageService",
        "CacheServiceBus",
        "KyeeI18nService"
    ])
    .action(function($state,HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeI18nService,
                     CustomPatientService){
        var def = {
            //查询切换就诊者请求
            queryCustomPatient: function (USER_ID, onSuccess) {
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    showLoading: true,
                    params: {
                        USER_ID: USER_ID,
                        FLAG: "cloud",
                        op: "queryCustomPatient"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },
            //切换就诊者请求
            updateSelectFlag: function (item, hospitalId, onSuccess) {
                var userType = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_TYPE;
                var userId = item.USER_ID;
                var userVsId = item.USER_VS_ID;
                if(hospitalId == 1001){
                    //PATIENT_TYPE 0：体验就诊者  1：普通就诊者 KYEEAPPC-4627
                    if(item.PATIENT_TYPE == 1){
                        KyeeMessageService.message({
                            title : KyeeI18nService.get("update_user.sms","消息"),
                            content :KyeeI18nService.get("comm_patient_detail.testTip","您当前在趣医体验医院，只能使用体验就诊者体验，其他就诊者无法在体验医院进行相关业务操作!" ),
                            okText : KyeeI18nService.get("custom_patient.iRealKnow","我知道了！"),
                            onOk: function () {
                                def.goOut();
                            }
                        });
                    }
                }else{
                    HttpServiceBus.connect({
                        url: "/center/action/CustomPatientAction.jspx",
                        params: {
                            userId: userId,
                            userVsId: userVsId,
                            op: "updateSelectFlag",
                            USER_TYPE:userType
                        },
                        onSuccess: function (data) {
                            onSuccess(data);
                        }
                    });
                }
            }
        };
        return def;
    })
    .build();