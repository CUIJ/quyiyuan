/*
 * 产品名称：quyiyuan
 * 创建人: maoruikang
 * 创建日期:2017年9月4日09:10:03
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.weightManage.service")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("WeightManageService")
    .params(["$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "KyeeI18nService"])
    .action(function($state, KyeeMessageService, KyeeViewService,HttpServiceBus,KyeeI18nService){

        var def = {
            queryWeight : function(USER_ID,CURRENT_PAGE,PAGE_SIZE,SUGAR_DAYS,IS_CONTINUE,op,onSuccess){
                HttpServiceBus.connect({
                    url : "/healthManagement/action/HealthManagementActionC.jspx",
                    params : {
                        USER_ID : USER_ID,
                        CURRENT_PAGE:CURRENT_PAGE,
                        PAGE_SIZE:PAGE_SIZE,
                        SUGAR_DAYS:SUGAR_DAYS,
                        IS_CONTINUE:IS_CONTINUE,
                        op : op
                    },
                    onSuccess : function(data){
                        if(data.success){
                            onSuccess(data.data);
                        }
                    }
                });
            }
           
        };

        return def;
    })
    .build();

