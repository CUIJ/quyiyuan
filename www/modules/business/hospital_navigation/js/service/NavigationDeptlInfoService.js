/**
 * 产品名称：quyiyuan
 * 创建者：杜巍巍
 * 任务号：KYEEAPPC-3461
 * 创建时间： 2015年9月1日10:41:05
 * 创建原因：医院搜索科室信息服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationDeptInfo.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("NavigationDeptInfoService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){
        var def = {
            hospitalId:undefined,  //医院ID
            navigationID:undefined,
            allNavigationInfro:undefined,
            floorDeptInfo:[],
            searchDeptInfo:[],
            nowCooUni:undefined,
            //搜索科室信息
            querySearchDept:function(Callback,hospitalId,keywords){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "getHospitalSerchResult",
                        hospitalId:hospitalId,
                        KEY_WORDS:keywords
                    },
                    onSuccess : function (data) {
                        if (data.success) {
                             searchDeptInfo = data.data.rows;
                            Callback(searchDeptInfo);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            queryFloorInfo:function(Callback,navigationID){
                HttpServiceBus.connect({
                    url : "health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "queryBuildFloorInfo",
                        navigationId:navigationID,
                        hospitalID:this.hospitalId
                    },
                    onSuccess : function (data) {
                        if (data.success) {
                            var splitDate = undefined;
                            var floorDeptInfo = data.data.rows;
                            for(var i=0;i<floorDeptInfo.length;i++){
                                splitDate = floorDeptInfo[i].HOSPITAL_FLOOR_DEPT.split('、');
                                floorDeptInfo[i].HOSPITAL_FLOOR_DEPT = [];
                                for(var m=0;m<splitDate.length;m++){
                                    floorDeptInfo[i].HOSPITAL_FLOOR_DEPT.push(splitDate[m]);
                                }
                            }
                            Callback(floorDeptInfo);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            }

        };
        return def;
    })
    .build();
