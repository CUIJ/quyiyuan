/**
 * Created by Administrator on 2017/5/15 0015.
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctor.patient.relation.service")
    .type("service")
    .name("DoctorPatientRelationService")
    .params(["HttpServiceBus", "KyeeMessageService","RsaUtilService"])
    .action(function (HttpServiceBus, KyeeMessageService,RsaUtilService) {
        var def = {
            DOCTOR_UUID:undefined,
            paymentAdditionalCard:false,    //是否显示就诊卡
            doctorName:undefined,
            deptName:undefined,
            hosName:undefined,
            doctorInfo:undefined,
            patientPhoneNum:undefined,
            MsgCode:undefined,
            idCard:undefined,
            patientName:undefined,
            //根据用户信息和医生二维码UUID获取医患关系
            getDoctorPatientInfo: function (param,dataBack) {
                HttpServiceBus.connect({
                    url: "appoint/action/DoctorPatientRelationActionC.jspx",
                    params: {
                        op: "getDoctorPatientInfoActionC",
                        DOCTOR_QR_CODE:param.DOCTOR_QR_CODE,
                        PATIENT_NAME:param.PATIENT_NAME,
                        PHONE_NUMBER:param.PHONE_NUMBER,
                        ID_NO:param.ID_NO
                    },
                    onSuccess: function (data) {
                        dataBack(data);
                    }
                });
            },
            //短信验证
            sendCheckCode: function (PHONE_NUMBER,onSuccess) {
                HttpServiceBus.connect({
                    url: "/user/action/DataValidationActionC.jspx",
                    params: {
                        messageType: 2,//医院ID
                        PHONE_NUMBER: RsaUtilService.getRsaResult(PHONE_NUMBER),
                        modId: 10001,
                        businessType:'1',//
                        op: "sendRegCheckCodeActionC"
                    },
                    // 将短信验证码倒计时改为ionic自带的定时器   By  张家豪  KYEEAPPTEST-2890
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();