/*
 * 产品名称：quyiyuan
 * 创建人: maoruikang
 * 创建日期:2017年9月4日09:10:03
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.healthManage.service")
    .require([])
    .type("service")
    .name("HealthManageService")
    .params(["$state","HttpServiceBus","KyeeMessageService"])
    .action(function($state,HttpServiceBus,KyeeMessageService){

        var def = {
            //获取身体数据
            getAll : function(USER_ID,onSuccess){
                HttpServiceBus.connect({
                    url : "/healthManagement/action/HealthManagementActionC.jspx",
                    params : {
                        USER_ID : USER_ID,
                        op : "getAllFirstActionC"
                    },
                    onSuccess : function(data){
                        if(data.success){
                            onSuccess(data.data);
                        }
                    }
                });
            },
            record : function (USER_ID,MEASURE_TIME,BLOOD_SUGAR,BLOOD_SUGAR_DATE) {
                HttpServiceBus.connect({
                    url : "/healthManagement/action/HealthManagementActionC.jspx",
                    params : {
                        USER_ID : USER_ID,
                        MEASURE_TIME:MEASURE_TIME,
                        BLOOD_SUGAR:BLOOD_SUGAR,
                        BLOOD_SUGAR_DATE:BLOOD_SUGAR_DATE,
                        op : "recordBloodSugarActionC"
                    }
                });
            }
        };

        return def;
    })
    .build();

