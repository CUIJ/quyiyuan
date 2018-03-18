/**
 * 产品名称：quyiyuan
 * 创建者：赵婷
 * 创建时间： 2015年5月12日10:41:05
 * 创建原因：医院介绍服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigation.service.NavigationMain")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("NavigationMainService")
    .params(["KyeeMessagerService","HttpServiceBus"])
    .action(function(KyeeMessagerService,HttpServiceBus){
        var def = {
            queryallintro:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "queryallintro",
                        hospitalID:hospitalId
                    },
                    cache : {
                        by : "TIME",
                        value : 60*10
                    },
                    onSuccess : function (resp) {
                        Callback(resp);
                    }

                });
            }
        };
        return def;
    })
    .build();