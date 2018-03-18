/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/7/26
 * 创建原因：举报界面开发 KYEESUPPORT-54
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.patients_report.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("PatientsReportService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService"])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeUtilsService){
        var def = {
            reportParams: {
                reportedUserId: "",//被举报人ID
                formGroupId: ""//举报来源群组ID
            },

            /**
             * 提交举报内容,待联调
             */
            submitReportInfo: function(reportContent,callBack){
                HttpServiceBus.connect({
                    url: "third:groupmanage/report",
                    params: {
                        reportedUserId: def.reportParams.reportedUserId,
                        reportType: "",
                        groupId: def.reportParams.formGroupId,
                        reportContent: JSON.stringify(reportContent)
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            callBack();
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
    })
    .build();