/**
 * Created by lizhihu on 2017/7/18.
 */

new KyeeModule()
    .group("kyee.quyiyuan.my.convenience.networkclinicDL.service")
    .type("service")
    .name("NetWorkClinicService")
    .params(["KyeeMessagerService", "HttpServiceBus", "KyeeMessageService"])
    .action(function (KyeeMessagerService, HttpServiceBus, KyeeMessageService) {
        return {
            hospitalId: null,
            
            /**
             * [getDoctorListByClinic 获取网络门诊医生列表]
             * @param  {[object]} param   []
             *      hospitalId(非必传, 若不传，则查询除体验医院之外的所有医院的网络门诊医生)
             * @param  {[type]} success [description]
             * @param  {[type]} fail    [description]
             * @return {[type]}         [description]
             */
            getDoctorListByClinic: function(param,success,fail){
                HttpServiceBus.connect({
                    url: "third:pay_consult/doctor/online/query",
                    params: param || {},
                    onSuccess: function(response){
                        typeof success === 'function' && success(response);
                    },
                    onError: function(error){
                        typeof fail === 'function' && fail(error);
                    }
                });
            },
        };
    })
    .build();