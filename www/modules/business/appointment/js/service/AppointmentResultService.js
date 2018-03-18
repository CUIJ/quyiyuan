
/**
 * 产品名称：quyiyuan.
 * 创建用户：高玉楼
 * 日期：2015年8月31日14:45:02
 * 创建原因：预约挂号确认注册服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.result.service")
    .type("service")
    .name("AppointmentResultService")
    .params(["HttpServiceBus", "KyeeMessageService", "AppointmentDoctorDetailService"])
    .action(function (HttpServiceBus, KyeeMessageService, AppointmentDoctorDetailService) {
        var def = {
            queryAppointmentResult :function(param,onSuccess){
                HttpServiceBus.connect({
                    url : '/appoint/action/AppointActionC.jspx',
                    params : {
                        op: 'appointRegistResultActionC',
                        HOSPITAL_ID: param.hospitalId,
                        REG_ID: param.regId,
                        //gch新增参数标识是否需要判断0元支付
                        HANDLE_NO_PAY_FLAG:param.handleNoPayFlag,
                        ICOM_FROM:param.whereIComeFrom,
                        HOSPITAL_AREA:param.HOSPITAL_AREA,
                        // 高萌  2016年9月9日17:01:51  任务号 KYEEAPPC-7803
                        "RUSH_ID":param.RUSH_ID//有号提醒记录对应的ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    },
                    onError : function(retVal){
                    }
                });
            }
        };
        return def;
    })
    .build();
