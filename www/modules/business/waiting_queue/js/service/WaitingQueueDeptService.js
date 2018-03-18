/**
 * Created by 刘健 on 2016/4/21.
 */
new KyeeModule()
    .group("kyee.quyiyuan.waitingqueue.dept.service")
    .require([
    ])
    .type("service")
    .name("WaitingQueueDeptService")
    .params(["HttpServiceBus","KyeeMessageService","CacheServiceBus"])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus){
        var deptQueue = {
            //医生含排版数据
            QUEUE_DEPT: {},
            //获取科室排队数据
            getDeptInfoData:function(onSuccess){
                HttpServiceBus.connect(
                    {
                        url : "/sortquery/action/QueuingActionC.jspx",
                        params : {
                            op:"getQueuingDeptActionC",
                            loc:"c",
                            hospitalID:CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id
                        },
                        onSuccess:function(data){//回调函数
                            var isSuccess = data.success;
                            var queueClinicData=null;
                            var queueUnclinicData=null;
                            if(isSuccess){
                                deptQueue.QUEUE_DEPT=data.data;
                                onSuccess(data.data);
                            }else{
                                var errorMsg = data.message;
                                KyeeMessageService.broadcast({
                                    content : errorMsg
                                });
                            }
                        }
                    }
                );
            }

        };
        return deptQueue;
    })
    .build();
