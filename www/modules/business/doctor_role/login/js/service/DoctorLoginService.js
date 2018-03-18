/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:26:48
 * 创建原因：医生登录页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.login.service")
    .require([])
    .type("service")
    .name("DoctorLoginService")
    .params(["HttpServiceBus", "CacheServiceBus", "HospitalService", "RsaUtilService"])
    .action(function(HttpServiceBus, CacheServiceBus, HospitalService, RsaUtilService){

        var def = {

            /**
             * 获取当前医院的虚拟医生的医生编码
             */
            getVirtualDoctorCode: function (onSuccess) {
                var currentHospitalId = CacheServiceBus.getStorageCache().
                    get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

                if(currentHospitalId != '1001'){
                    onSuccess('QY01');
                } else {
                    HospitalService.getParamValueByName(currentHospitalId, "VIRTUAL_DOCTOR", function (result) {
                        if(result.data.VIRTUAL_DOCTOR){
                            onSuccess(result.data.VIRTUAL_DOCTOR);
                        }
                    });
                }
            },

            /**
             * 医生登陆校验
             */
            validateDoctorUser : function(doctorUser, passWord, onSuccess){

                var currentHospitalId = CacheServiceBus.getStorageCache().
                    get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

                passWord = RsaUtilService.getRsaResult(passWord);

                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "validateDoctorUserNew",
                        DOCTOR_USER: doctorUser,
                        HOSPITAL_ID: currentHospitalId,
                        DOCTOR_PASSWORD: passWord,
                        DOCTOR_SOURCE: "1"
                    },
                    onSuccess : function (resp) {
                        onSuccess(resp);
                    }
                });
            },

            /**
             * 检查该用户是否绑定过医生账号，以及绑定的是否是当前医院
             */
            checkIsBindingDoctor: function () {

                var currentUserRecord = CacheServiceBus.getMemoryCache().
                    get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var currentHospitalId = CacheServiceBus.getStorageCache().
                    get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

                var doctorCode = currentUserRecord.DOCTOR_CODE;
                var doctorHospitalId = currentUserRecord.DOCTOR_HOSPITAL_ID;
                if(doctorCode){
                    if(doctorHospitalId == currentHospitalId){
                        return 0;//可以切换
                    } else {
                        return 1;//绑定的不是当前医院
                    }
                } else {
                    return 2;//没有绑定过
                }
            }
        };

        return def;
    })
    .build();
