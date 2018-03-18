/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医生评价页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.satisfaction.satisfactionDoctor.service")
    .require([])
    .type("service")
    .name("SatisfactionDoctorService")
    .params(["HttpServiceBus","CacheServiceBus","KyeeMessageService","KyeeI18nService"])
    .action(function(HttpServiceBus,CacheServiceBus,KyeeMessageService,KyeeI18nService){

        var def = {
            hospitalInfo:'',
            //全局参数
            memoryCache: CacheServiceBus.getMemoryCache(),
            /**
             * 查询医生评分项目数据
             */
            querySurveyData : function(itemHospitalId, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/HospitalSurveyActionC.jspx",
                    params : {
                        op: "getSurveyItem",
                        itemHospitalId: itemHospitalId,
                        itemType: 2
                    },
                    onSuccess : function (resp) {
                        if(!resp.rows){
                            return;
                        }
                        onSuccess(resp);
                    }
                });
            },
            /**
             * 查询医生已评价数据
             */
            querySatisfactionData : function(itemHospitalId, regId, onSuccess){
                HttpServiceBus.connect({
                    url : "/satisfaction/action/DoctorSurveyActionC.jspx",
                    params : {
                        op: "getDoctorSuggestedData",
                        HOSPITAL_ID: itemHospitalId,
                        TRADE_ORDER_NO: regId,
                        forceSatification: "YES"
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
             * 预判医生分数
             */
            calculateDataScore:function(postdata, hospitalId,onSuccess){
                HttpServiceBus.connect({
                    type: "POST",
                    url : "/satisfaction/action/DoctorSurveyActionC.jspx",
                    params : {
                        op: "calculateDataScore",
                        forceSatification: "YES",
                        postdata: postdata,
                        hospitalId:hospitalId
                    },
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }
                        onSuccess(resp);
                    }
                });
            },

            /**
             * 保存医生评价数据
             */
            saveSatisfactionData : function(postdata, onSuccess){

                HttpServiceBus.connect({
                    type: "POST",
                    url : "/satisfaction/action/DoctorSurveyActionC.jspx",
                    params : {
                        op: "saveDoctorSatisfiedData",
                        forceSatification: "YES",
                        postdata: postdata
                    },
                    onSuccess : function (resp) {
                        if(!resp){
                            return;
                        }
                        if(resp.success){
                            onSuccess(resp);
                        }else{
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                            return;
                        }
                    }
                });
            },
            //保存关注信息
            careDoctor: function (careStatus,doctorInfo,hospitalInfo) {
                var hospitalId = hospitalInfo.HOSPITAL_ID;
                var doctorCode = doctorInfo.DOCTOR_CODE;
                var deptCode = doctorInfo.DEPT_CODE;
                var userVsId = "";
                var patientId = "";
                var currentCustomPatient = this.memoryCache.get('currentCustomPatient');
                var currentCardInfo = this.memoryCache.get('currentCardInfo');
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
                        userVsId: userVsId,
                        DEPT_CODE:deptCode,
                        forceSatification: "YES"
                    },
                    onSuccess: function (data) {
                        if (!data.success) {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },

            //加载关注信息
            queryDoctorCareInfo: function(doctorInfo,hospitalInfo,handle){
                var me = this;
                var hospitalId =hospitalInfo.HOSPITAL_ID;
                var memoryCache = CacheServiceBus.getMemoryCache();
                var userVsId = undefined;
                if(memoryCache.get('currentCustomPatient') != undefined){
                    userVsId = memoryCache.get('currentCustomPatient').USER_VS_ID;
                }
                HttpServiceBus.connect({
                    url: "patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params: {
                        op: "queryDoctorCareInfo",
                        hospitalId:hospitalId,
                        doctorCode:doctorInfo.DOCTOR_CODE,
                        userVsId: userVsId,
                        DEPT_CODE:doctorInfo.DEPT_CODE,
                        forceSatification: "YES"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //getData(data.data);
                            handle(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();
