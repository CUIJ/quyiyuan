/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：我的关注页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.my_care_doctors.service")
    .require([])
    .type("service")
    .name("MyCareDoctorsService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService"])
    .action(function(HttpServiceBus, CacheServiceBus, KyeeMessageService){

        var def = {
            lastSelectPage:1,
            /**
             * 查询所有关注的医生
             */
            queryMyCareList : function(onSuccess){
                var me = this;
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "queryMyCareList",
                        userId: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        userVsId: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            var data = me.makePicPath(resp.data.rows);
                            onSuccess(data);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },
            /**
             * 查询切换医院所需要用的医院信息
             */
            queryHospitalInfo : function(hospitalId, onSuccess){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "queryRegistJumpInfo",
                        DOCTOR_HOSPITALID: hospitalId
                    },
                    onSuccess : function (resp) {
                        if(!resp.data){
                            return;
                        }
                        onSuccess(resp.data);
                    }
                });
            },
            /**
             * 查询医患互动跳转参数
             */
            queryInteractionInfo : function(hospitalId, doctorCode, onSuccess){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params : {
                        op: "queryRegistJumpInfo",
                        DOCTOR_HOSPITALID: hospitalId,
                        DOCTOR_CODE:doctorCode
                    },
                    onSuccess : function (resp) {
                        if(!resp.data){
                            return;
                        }
                        onSuccess(resp.data);
                    }
                });
            },
            /**
             * 重新转换图片路径
             * @param data
             * @returns {*}
             * 修改：图片已经全部转移至OSS服务器，用https协议。by wenpengkun KYEEAPPTEST-3918
             */
            makePicPath: function (data) {
                for(var index = 0; index < data.length; index++){
                    if(data[index].DOCTOR_PIC_PATH){
                        if( data[index].DOCTOR_PIC_PATH.substring(0,7) != 'http://' && data[index].DOCTOR_PIC_PATH.substring(0,8) != 'https://'){
                            data[index].DOCTOR_PIC_PATH = AppConfig.SERVER_URL + data[index].DOCTOR_PIC_PATH;
                        }
                    } else {
                        data[index].DOCTOR_PIC_PATH = "/resource/images/base/doc_head_default_m.png";
                    }
                }
                return data;
            },

            /**
             * 保存关注信息
             */
            careDoctor: function (hospitalId, doctorCode, careStatus) {
                var userVsId = "";
                var patientId = "";
                var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                var currentCardInfo = CacheServiceBus.getMemoryCache().get('currentCardInfo');
                if (currentCustomPatient != undefined && currentCustomPatient.USER_VS_ID != undefined){
                    userVsId = currentCustomPatient.USER_VS_ID;
                }
                if ( currentCardInfo != undefined){
                    patientId = currentCardInfo.PATIENT_ID;
                }
                HttpServiceBus.connect({
                    url: "patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params: {
                        op: 'saveCareDoctor',
                        hospitalId: hospitalId,
                        doctorCode: doctorCode,
                        careFlag: careStatus,
                        patientId: patientId,
                        userVsId: userVsId
                    }
                });
            },
            queryFamilyDoctor : function(onSuccessCallBack){
                HttpServiceBus.connect({
                    url: "third:familyDoctorInfo/queryFamilyDoctor",
                    onSuccess : function (resp) {
                        if(resp.success){
                            if(!resp.data){
                                return;
                            }
                            onSuccessCallBack(resp.data);
                        } else{
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }


                    }
                });
            }
        };

        return def;
    })
    .build();