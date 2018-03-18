/**
 * 产品名称：quyiyuan
 * 创建者：董茁
 * 创建时间：2016年10月08日10:18:39
 * 创建原因：一键理赔首页service
 * 任务号：KYEEAPPC-8135
 */
new KyeeModule()
    .group("kyee.quyiyuan.one_quick_claim.service")
    .require([])
    .type("service")
    .name("OneQuickClaimService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "KyeeI18nService"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, KyeeI18nService) {
        var def = {
            isFrom:true,
           //获取保险公司名称
            getComPany: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "onlineClaims/action/OnLineClaimsActionC.jspx",
                    params: {
                        op: "getCompanyName"
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            onSuccess(data.data);
                        }
                        else{
                            data.emptyText = "请选择要投保的公司";
                            onSuccess(data.data);
                        }
                    }
                })
            }
        };
        return def;
    })
    .build();