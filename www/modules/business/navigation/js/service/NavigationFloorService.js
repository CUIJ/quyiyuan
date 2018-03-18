/**
 * 产品名称：quyiyuan
 * 创建者：赵婷
 * 创建时间： 2015年5月12日10:41:05
 * 创建原因：医院导航服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigation.service.NavigationFloor")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("NavigationFloorService")
    .params(["KyeeMessagerService","HttpServiceBus"])
    .action(function(KyeeMessagerService,HttpServiceBus){
        var def = {
            allHospitalInfro:[],  //获取医院各个楼宇分布的总数据
            fixedPositionInfro:[],  //获取从预约详情跳转定位
            lastClassName:undefined,  //获取上一个跳转页面的路由

            scope:undefined,

            //查询图片
            queryHospitalParam:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "hospitalInform/action/HospitalinforActionC.jspx",
                    params : {
                        loc : "c",
                        op : "queryHospitalParam",
                        hospitalId:hospitalId,
                        paramName:'NAVIGTO'
                    },
                    //cache : {
                    //    by : "TIME",
                    //    value : 60*10
                    //},
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            },
            //查询楼层
            queryfloor:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "queryfloor",
                        hospitalID:hospitalId
                    },
                    //cache : {
                    //    by : "TIME",
                    //    value : 60*10
                    //},
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            },
            //查询图片下方医院提示
            queryallintro:function(Callback,hospitalId){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "queryallintro",
                        hospitalID:hospitalId
                    },
                    //cache : {
                    //    by : "TIME",
                    //    value : 60*10
                    //},
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            },
            //查询预约科室定位
            queryDepartFloor:function(Callback,param){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "queryDepartFloor",
                        hospitalId:param.HOSPITAL_ID,//'1501' 预约医院
                        DEPART:param.DEPT_NAME//'急诊科'  预约科室
                    },
                    //cache : {
                    //    by : "TIME",
                    //    value : 60*10
                    //},
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            }
        };
        return def;
    })
    .build();
