/**
 * 产品名称：quyiyuan
 * 创建者：张明
 * 创建时间：2015年9月9日11:21:20
 * 创建原因：特色科室服务交互层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group('kyee.quyiyuan.appointment.features_dept.service')
    .type('service')
    .require([])
    .name('FeaturesDeptService')
    .params(["$state",
              "KyeeMessageService",
              "KyeeViewService",
              "HttpServiceBus"])
    .action(function($state,KyeeMessageService,KyeeViewService,HttpServiceBus){
        var def={
            //查取某医院下的特色科室信息
            queryAllFeaturesDeptData:function(hospitalId,onSuccess){
                HttpServiceBus.connect({
                   url:'/appoint/action/AppointActionC.jspx',
                    params:{
                        hospitalID:hospitalId,
                        op: "getFeaturesDeptActionC"
                    },
                    cache : {
                        by : "TIME",
                        value : 3 * 60
                    },
                    onSuccess:function(data){
                         if(data!=null && data!=undefined){
                             onSuccess(data);
                         }
                    },
                    onError:function(){

                    }
                });
            }

        }
        return def;
    })
    .build();