/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:26:48
 * 创建原因：医生个人中心服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.center.service")
    .type("service")
    .name("DoctorCenterService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeEnv",
        "KyeeMessageService"])
    .action(function(HttpServiceBus, CacheServiceBus, KyeeEnv,
                     KyeeMessageService){

        var def = {

            /**
             * 解除医生绑定
             */
            unDoctorBinding: function (onSuccess) {

                var currentUserRecord = CacheServiceBus.getMemoryCache().
                    get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);

                if(currentUserRecord.VIRTUAL_DOCTOR_FLAG){
                    //虚拟医生解除绑定直接清空前台缓存
                    def.clearDoctorCacheInfo();
                    var data = {};
                    data.FLAG = 1;
                    onSuccess(data);
                } else {
                    //真实医生解除绑定
                    HttpServiceBus.connect({
                        url: "/patientwords/action/PatientWordsActionC.jspx",
                        params: {
                            op: "updateStatus",
                            HOSPITAL_ID: currentUserRecord.DOCTOR_HOSPITAL_ID,
                            DOCTOR_CODE: currentUserRecord.DOCTOR_CODE,
                            USER_ID: currentUserRecord.USER_ID
                        },
                        onSuccess: function (resp) {
                            if (resp.success) {
                                def.clearDoctorCacheInfo();
                                onSuccess(resp.data);
                            } if(resp.alertType == 'ALERT'){
                                KyeeMessageService.broadcast({
                                    content: resp.message
                                });
                            }
                        }
                    });
                }
            },

            /**
             * 清空医生的缓存信息
             */
            clearDoctorCacheInfo: function () {

                // 获取全局变量
                var cur_patient = CacheServiceBus.getMemoryCache().
                    get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                cur_patient.ROLE_CODE = 4;
                CacheServiceBus.getMemoryCache().
                    set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, cur_patient);

                //更新缓存信息
                var currentUserRecord = CacheServiceBus.getMemoryCache().
                    get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);

                currentUserRecord.DOCTOR_CODE = "";
                currentUserRecord.DOCTOR_HOSPITAL_ID = "";
                currentUserRecord.ROLE_CODE = 4;

                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD,
                    currentUserRecord);

                //更新全局视图角色code
                KyeeEnv.ROOT_SCOPE.ROLE_CODE = 4;
            }
        }

        return def;
    })
    .build();
