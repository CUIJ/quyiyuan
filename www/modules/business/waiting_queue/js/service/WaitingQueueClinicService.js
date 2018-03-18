/**
 * Created by 刘健 on 2016/4/21.
 */
new KyeeModule()
    .group("kyee.quyiyuan.waitingqueue.clinic.service")
    .require([

    ])
    .type("service")
    .name("WaitingQueueClinicService")
    .params(["HttpServiceBus","KyeeMessageService","CacheServiceBus","KyeeUtilsService"])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeUtilsService){
        var clinicQueue = {

            //获取我的排队数据
            getQueueClinicData:function(onSuccess){
                //全局参数
                var memoryCache = CacheServiceBus.getMemoryCache();
                //缓存数据
                var storageCache = CacheServiceBus.getStorageCache();
                var patientId = "";
                var cardInfo = memoryCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
                if(cardInfo){
                    patientId = cardInfo.PATIENT_ID;
                }
                else{
                    patientId = "";
                }
                HttpServiceBus.connect(
                    {
                        url : "/sortquery/action/QueuingActionC.jspx",
                        params : {
                            op:"getQueuingOfUserActionC",
                            loc:"c",
                            hospitalID:storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                            PATIENT_ID:patientId
                        },
                        onSuccess:function(data){//回调函数
                            var isSuccess = data.success;
                            if(isSuccess){
                                var resultData="";
                                /*if(data.data){
                                    resultData= clinicQueue.dealhistryQeue(data.data);
                                }*/
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
            },
            //处理历史叫号数据时间
            dealhistryQeue:function(data){
                for(var i=0;i<data.length;i++){
                    if(data[i].REMAINING_NUMBER==undefined || data[i].REMAINING_NUMBER=="" ||data[i].REMAINING_NUMBER==null){
                        data[i].REMAINING_NUMBER="- -";
                    }
                   if(data[i].REMAINING_NUMBER<0){
                       data[i].REMAINING_NUMBER=0;
                   }
                    for(var j=0;j<data[i].T_QUEUE_CALLED_NUMBER_LIST.length;j++){
                        var calledTime=new Date(data[i].T_QUEUE_CALLED_NUMBER_LIST[j].CALLED_TIME);
                        data[i].T_QUEUE_CALLED_NUMBER_LIST[j].CALLED_TIME_SHOW=KyeeUtilsService.DateUtils.formatFromDate(calledTime, 'HH点mm分');
                    }
                }
                return data;
            }

        };
        return clinicQueue;
    })
    .build();
