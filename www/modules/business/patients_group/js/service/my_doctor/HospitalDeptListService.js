/**
 * 产品名称：趣医院
 * 创建者：张毅
 * 创建时间： 2016/12/11
 * 创建原因：病友圈医院科室列表service
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.hospital_dept_list.service")
    .require([])
    .type("service")
    .name("HospitalDeptListService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeI18nService){
        var def = {

            hospitalInfo:{},

            /**
             *根据医院ID获取齐分级科室列表
             * add by 张毅 at 20161211
             */
            queryDeptInfo: function (onSuccessCallBack) {
                HttpServiceBus.connect({
                    url: "third:deptController/getDeptInfo",
                    params: {
                        hospitalId: def.hospitalInfo.hospitalId
                    },
                    cache : {
                        by : "TIME",
                        value : 5 * 60
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccessCallBack && onSuccessCallBack(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            }
        };
        return def;
    }).build();