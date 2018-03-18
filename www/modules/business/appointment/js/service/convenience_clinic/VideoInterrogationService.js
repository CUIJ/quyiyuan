/**
 * 描述： 视频问诊服务器
 * 作者:  wangsannv
 * 时间:  2017年3月31日11:32:27
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.video_interrogation.service")
    .require([])
    .type("service")
    .name("VideoInterrogationService")
    .params(["HttpServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,KyeeMessageService){
        var  videoGationData={
            clinicDue:1,  //默认为初始阶段    1  2  3
            Clientinfo:undefined,
            ClinicSource:undefined,  //医生的号源信息
            isFromDoctorInf:true, //是否通过医生详情页面进入的
            clinicDetail:undefined,//医生的号源信息
            netWorkShedule:undefined,//医生的排版信息
            //回调函数
            setClientinfo: function (fn) {
                videoGationData.Clientinfo = fn;
            },
            //网络医院标示从科室中获取
            queryClientinfo: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        op: "queryCardInAppoint",
                        hospitalID: params.HOSPITAL_ID,
                        USER_VS_ID: params.USER_VS_ID,
                        IS_ONLINE: params.IS_ONLINE,
                        USER_ID: params.USER_ID,
                        //0 ：标识为预约    1：标识为挂号
                        isAppoint: 0     // (APK)查卡接口根据不同业务类型返回虚拟卡
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var ClienData = data.data;
                            videoGationData.Clientinfo(ClienData);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //是否配送范围之内
            isInDistributionRange: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/NetworkHospitalActionC.jspx",
                        params: {
                        op: "isInDistributionRangeActionC",
                        hospitalID: params.HOSPITAL_ID,
                        ADDRESS_ID: params.ADDRESS_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var isRange = true;
                            onSuccess(isRange);
                        } else {
                            var isRange = false;
                            onSuccess(isRange);
                        }
                    }
                });
            },
            //获取收获地址
            queryAddressinfo: function (params,callBack) {
                HttpServiceBus.connect({
                    url: "/center/action/userReceiveAddressActionC.jspx",
                    params: {
                        op: "queryCardInAppoint",
                        hospitalID: params.HOSPITAL_ID,
                        USER_VS_ID: params.USER_VS_ID,
                        IS_ONLINE: params.IS_ONLINE,
                        USER_ID: params.USER_ID,
                        //0 ：标识为预约    1：标识为挂号
                        isAppoint: 0     // (APK)查卡接口根据不同业务类型返回虚拟卡
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            callBack(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //获取号源
            queryClinicData: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/register/action/RegisterActionC.jspx",
                    params: {
                        op: "getRegClinicDetailActionC",
                        hospitalID: params.hospitalID,        //医院id
                        CLINIC_DATE: params.clinicDate,       //就诊日期
                        HB_TIME: params.hbTime,                 //号源时间点
                        DEPT_CODE: params.deptCode,            //就诊科室
                        DOCTOR_CODE: params.doctorCode,       //医生code
                        IS_ONLINE:params.IS_ONLINE,            //是否上线 1
                        HIS_SCHEDULE_ID : params.hisScheduleId,  //
                        IS_REFERRAL:params.IS_REFERRAL         //
                    },
                    onSuccess: function (data) {
                        onSuccess(data)
                    }
                });
            },

            //获取单个医生的网络排班
            queryDoctorData: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/NetworkHospitalActionC.jspx",
                    params: {
                        op: "getOnlineDoctorsByDeptIdActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        BUSSINESS_TYPE:params.businessType,
                        DOCTOR_CODE: params.DOCTOR_CODE,
                        USER_VS_ID:params.USER_VS_ID,
                        IS_ONLINE:params.IS_ONLINE
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var doctorList = data.data;
                           var resultData = videoGationData.dealDoctorData(doctorList);
                            onSuccess(resultData);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //获取问诊详情
            queryAppointDetail: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/OnlinePrescriptionActionC.jspx",
                    params: {
                        op: "getOnlineRecordDetailActionC",
                        HOSPITAL_ID: params.HOSPITAL_ID,
                        REG_ID: params.REG_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data,data.resultCode);
                        }
                        else if(data.resultCode=="0020406"){
                            onSuccess(data.data,data.resultCode);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content: data.
                                    message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
             dealDoctorData: function (doctorList) {
                 var resultData = {};//返回医生数据,含问诊中diagnosisRunningLst，已约满diagnosisEnoughLst，停诊diagnosisStopLst三个状态
                 //resultData["runningDoctorList"] = doctorList.diagnosisRunningLst;
                 //resultData["enoughtDoctorList"] = doctorList.diagnosisEnoughLst;
                 //resultData["stopDoctorList"] = doctorList.diagnosisStopLst;
                 resultData["diagnosisList"] = {};
                 //视频问诊
                 if(doctorList.diagnosisRunningLst != undefined&&doctorList.diagnosisRunningLst.length>0){   //视频问诊问诊中
                     resultData["diagnosisList"] = doctorList.diagnosisRunningLst;
                 }
                 if(doctorList.diagnosisEnoughLst != undefined&&doctorList.diagnosisEnoughLst.length>0){   //视频问诊已约满
                     resultData["diagnosisList"] = doctorList.diagnosisEnoughLst;
                 }
                 if(doctorList.diagnosisStopLst != undefined&&doctorList.diagnosisStopLst.length>0){   //视频问诊停诊
                     resultData["diagnosisList"] =doctorList.diagnosisStopLst;
                 }
                 //购药
                 resultData["prescriptionList"] = {};
                 if(doctorList.prescriptionRunningLst != undefined&&doctorList.prescriptionRunningLst.length>0){   //购药诊中
                     resultData["prescriptionList"] = doctorList.prescriptionRunningLst;
                 }
                 if(doctorList.prescriptionEnoughLst != undefined&&doctorList.prescriptionEnoughLst.length>0){   //购药已约满
                     resultData["prescriptionList"] =doctorList.prescriptionEnoughLst;
                 }
                 if(doctorList.prescriptionStopLst != undefined&&doctorList.prescriptionStopLst.length>0){   //购药停诊
                     resultData["prescriptionList"] = doctorList.prescriptionStopLst;
                 }
                 //videoGationData.netWorkShedule=resultData;
                 return resultData;
             }
        };
        return videoGationData;
    })
    .build();