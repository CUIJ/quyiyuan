/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年5月22日16:40:36
 * 创建原因：C端医生评价页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.doctorSuggest.service")
    .type("service")
    .name("AppointmentDoctorSuggestService")
    .params(["HttpServiceBus","KyeeMessageService","KyeeUtilsService"])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeUtilsService){
        var def = {
            loadData: function (hospitalId, doctorCode, page, pageSize,  onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/DoctorSurveyActionC.jspx",
                    params: {
                        op: "queryDoctorSatisfactionRecord",
                        hospitalId : hospitalId,
                        doctorCode : doctorCode,
                        page: page,
                        limit: pageSize
                    },
                    cache : {
                        by : "TIME",
                        value : 10 * 60
                    },
                    showLoading:false,
                    onSuccess: function (resp) {
                        if(resp.success){
                            var data = resp.data.rows;
                            //begin 医生详情页面整改 BY 高玉楼 KYEEAPPC-3008
                            for(var i=0;i<data.length;i++)
                            {
                                data[i].SUGGEST_DATE = KyeeUtilsService.DateUtils.formatFromDate(data[i].SUGGEST_DATE, 'YYYY/MM/DD');
                            }
                            //begin 医生详情页面整改 BY 高玉楼
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
