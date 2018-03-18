/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/11/25
 * 创建原因：病友圈我的医生服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.dept_doctor_list.service")
    .require([

    ])
    .type("service")
    .name("DeptDoctorListService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeI18nService"
    ])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeI18nService){
        var def = {
            deptInfo: "", // add by wyn 20161130 科室信息，从appointment传入

            /**
             * 获取医生列表信息,包含向医生报到时医生未接受，等待验证的医生信息
             * add by wyn 20161125
             */
            getDeptDoctorList: function(callBack){
                HttpServiceBus.connect({
                    "url": "third:patientDoctor/doctor/list",
                    "params": {
                        hospitalId: def.deptInfo.hospitalId,
                        deptCode: def.deptInfo.deptCode
                    },
                    onSuccess: function(data){
                        if (data.success) {
                            data.deptName = def.deptInfo.deptName;
                            callBack(data);
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