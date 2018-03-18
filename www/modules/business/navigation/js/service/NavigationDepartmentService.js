/**
 *产品名称：quyiyuan
 *创建者：赵婷
 *创建时间：2015/6/25
 *创建原因：平面导航根据科室定位（选择科室）服务
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigation.service.navigationDepartment")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("NavigationDepartmentService")
    .params(["KyeeMessagerService","HttpServiceBus"])
    .action(function(KyeeMessagerService,HttpServiceBus){
        var def = {
            hospitalId:undefined,  //医院ID
            checkDeptName:undefined, //从预约详情传递的科室名称
            queryDepatmentInfro:function(hospitalId,Callback){
                HttpServiceBus.connect({
                    url : "/health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "getDepartInfoList",
                        hospitalId:hospitalId
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
