/**
 * 产品名称：quyiyuan
 * 创建者：liujian
 * 创建时间：2015年11月25日09:48:32
 * 创建原因：排班模块--按医生查看医生排班服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.scheduleByDoctor.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("ScheduleByDoctorService")
    .params(["HttpServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,KyeeMessageService){
        var doctorScheduleData =
        {
            //医生简介
            DOCTOR_DESC: {},
            //查询医生排班数据
            querySchedule : function(params, onSuccess){
                HttpServiceBus.connect({
                    url : "/register/action/DoctorScheduleAcionC.jspx",
                    params : {
                        op : "getScheduleLabelDictActionC",
                        DEPT_CODE:params.deptCode
                    },
                    onSuccess : function(data){
                        if(data.success){
                            var doctorScheduleTable=data.data.data.rows;
                            var result=doctorScheduleData.dealScheduleData(doctorScheduleTable);
                            onSuccess(result);
                        }else{
                            KyeeMessageService.broadcast({
                                content:data.data.message,
                                duration:3000
                            });
                        }
                    }
                });
            },
            //处理后台返回的数据
            dealScheduleData:function(doctorScheduleTable){
                var newScheduleList=[];
                for(var i=0;i<Math.ceil(doctorScheduleTable.length/8);){
                    var page=[];
                    var SchedulePage=[];
                        var s=8;
                        if((i==Math.ceil(doctorScheduleTable.length/8)-1) && doctorScheduleTable.length%8!=0){
                            var s=doctorScheduleTable.length%8;
                        }
                        for (var j = 0; j <s;) {
                            SchedulePage.push(doctorScheduleTable[j+i*8]);
                            j++;
                        }
                    for (var j = 0; j < SchedulePage.length;) {
                        var col = [];
                        //一行四列
                        if (j < SchedulePage.length) {
                            col.push(SchedulePage[j]);
                            j++;
                        }
                        if (j < SchedulePage.length) {
                            col.push(SchedulePage[j]);
                            j++;
                        }
                        if(j<SchedulePage.length){
                            col.push(SchedulePage[j]);
                            j++;
                        }
                        if(j<SchedulePage.length){
                            col.push(SchedulePage[j]);
                            j++;
                        }
                        page.push(col);
                    }
                    newScheduleList.push(page);
                    i++;
              }
                return newScheduleList;
            }
            };
        return doctorScheduleData;
    })
    .build();

