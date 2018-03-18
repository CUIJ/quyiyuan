/**
 * Created by liwenjuan on 2016/11/28.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor.select_hospital_list.service")
    .require([])
    .type("service")
    .name("SelectHospitalListService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "CacheServiceBus",
        "KyeeI18nService"
    ])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus,KyeeI18nService){
        var def = {
            storageCache: CacheServiceBus.getStorageCache(), //storage缓存对象
            memoryCache: CacheServiceBus.getMemoryCache(), //memory缓存对象
            /**
             * 获取医院列表
             * addBy liwenjuan 2016/11/28
             * @param callback
             */
            requestHospital: function(provinceCode,cityCode,callback){
                HttpServiceBus.connect({
                    url: "third:hospitalController/getHospitalList",
                    params: {
                        provinceCode: provinceCode,
                        cityCode: cityCode
                    },
                    onSuccess: function(result){
                        if(result.success){
                            callback && callback(result.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: result.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();