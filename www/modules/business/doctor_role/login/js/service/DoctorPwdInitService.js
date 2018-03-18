/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:26:48
 * 创建原因：医生密码初始化页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.pwdInit.service")
    .require([])
    .type("service")
    .name("DoctorPwdInitService")
    .params(["HttpServiceBus", "RsaUtilService", "CacheServiceBus"])
    .action(function (HttpServiceBus, RsaUtilService, CacheServiceBus) {

        var def = {
            /**
             * 更新用户密码
             */
            updateDoctorPwd: function (currentUser, currentHospitalID, pwdNew, msgCode, onSuccess) {

                pwdNew = RsaUtilService.getRsaResult(pwdNew);

                if(!msgCode){
                    var phoneNum = '';
                } else {
                    var phoneNum = this.phoneNum
                }

                HttpServiceBus.connect({
                    url: "/patientwords/action/PatientWordsActionC.jspx",
                    params: {
                        op: "updateDoctorPwd",
                        USER_CODE: currentUser,
                        DOCTOR_CODE: this.doctorUser,
                        HOSPITAL_ID: currentHospitalID,
                        DOCTOR_PASSWORDNEW: pwdNew,
                        DOCTOR_PASSWORDOLD: RsaUtilService.getRsaResult(this.doctorPwdOld),
                        PHONE_NUMBER: phoneNum,
                        SECURITY_CODE: msgCode

                    },
                    onSuccess: function (resp) {
                        onSuccess(resp);
                    }
                });
            },
            /**
             * 获取验证码
             */
            getValiteCode: function (onSuccess) {

                var currentHospitalId = CacheServiceBus.getStorageCache().
                    get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

                HttpServiceBus.connect({
                    url: "/patientwords/action/PatientWordsActionC.jspx",
                    params: {
                        op: "sendRegCheckCode",
                        HOSPITAL_ID: currentHospitalId,
                        PHONE_NUMBER: RsaUtilService.getRsaResult(this.phoneNum),
                        modId: '10001',
                        messageType: '3'
                    },
                    onSuccess: function (resp) {
                        onSuccess(resp);
                    }
                });
            }
        };

        return def;
    })
    .build();
