
/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.my.personal.information.service")
    .require([])
    .type("service")
    .name("MyPersonalInformationService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){

        var def = {
            BACK_ID:null,
            getPersonalInfo: function (param, onSuccess) {
                HttpServiceBus.connect({
                    url: "/healthAR/action/HealthARAction.jspx",
                    params: {
                        op: "getPersonalInfoActionC",
                        idCardNo: param.idCardNo,
                        name: param.name,
                        phoneNumber: param.phoneNumber
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(def.dealWithImage(data.data));
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            dealWithImage: function (data) {
                if (!data.IMAGE_PATH) {
                    if (data && data.PATIENT_SEX && data.PATIENT_SEX == 2) {
                        data.IMAGE_PATH = 'resource/images/healthArchive/lady.png';//'resource/images/center/headF.png';//将头像字段与缓存中作区分
                    } else {
                        data.IMAGE_PATH = 'resource/images/healthArchive/mr.png';//'resource/images/center/headM.png';//将头像字段与缓存中作区分
                    }
                }
                return data;
            }
        };

        return def;
    })
    .build();


