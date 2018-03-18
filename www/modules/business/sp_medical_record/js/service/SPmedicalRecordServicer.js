/*
* 产品名称 quyiyuan.
* 创建用户: yangmingsi
* 日期: 2017年2月21日09:40:54
* 任务号：KYEEAPPC-10018
*/
new KyeeModule()
    .group("kyee.quyiyuan.center.medicalRecord.service")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("MedicalRecordService")
    .params(["$state",
        "KyeeMessageService",
        "KyeeViewService",
        "HttpServiceBus",
        "KyeeI18nService",
        "$ionicHistory",
        "CenterUtilService",
        "CacheServiceBus"])
    .action(function ($state, KyeeMessageService, KyeeViewService, HttpServiceBus,KyeeI18nService,$ionicHistory,CenterUtilService,CacheServiceBus) {

        var def = {
            satInfo:{},
            isQuickEvaluate:false,//快捷评价标识
            loadData: function (name,idNo,phoneNumer,startTime,endTime,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        patientName: name,
                        idNo:idNo,
                        phoneNumber:phoneNumer,
                        startTime:startTime,
                        endTime:endTime,
                        isQueryExtendInfo:"1",
                        FLAG: "cloud",
                        op: "queryMedicalRecord"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },

          /*  loadClinicHosRecord: function (hospitalId,serialNo,inHospitalFlag, onSuccess) {*/

            //快速评价短信验证码校验
            quickSugCodeAuth: function (phoneNumber,checkCode,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        phoneNumber:phoneNumber,
                        checkCode :checkCode ,
                        FLAG: "cloud",
                        op: "quickSugCodeAuth"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },
            // 就医记录短信快捷评价查询就医记录
            quickSugSearchRecord: function (messageId,phoneNumber,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        messageId: messageId,
                        phoneNumber:phoneNumber,
                        FLAG: "cloud",
                        op: "quickSugSearchRecord"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },

            loadClinicHosRecord: function (hospitalId,serialNo,inHospitalFlag, onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        hospitalId: hospitalId,
                        serialNo:serialNo,
                        type:inHospitalFlag,
                        FLAG: "cloud",
                        op: "quickSugSearchRecordDetail"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },
            /*查询评价记录 recordId，sourceFlag**/
            querySuggest: function (recordId,sourceFlag,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        recordId: recordId,
                        /*sourceFlag: "1",*/
                        FLAG: "cloud",
                        op: "quickSugGetMedicalRecordSuggest"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },
            /**快速评价查询医生所有评价**/
            queryAllSuggest: function (hospitalId,deptCode,doctorCode,gradeCode,currentPage,rows,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        hospitalId: hospitalId,
                        deptCode:deptCode,
                        doctorCode:doctorCode,
                        gradeCode:gradeCode,
                        page:currentPage,
                        rows:rows,
                        FLAG: "cloud",
                        op: "quickSugGetAllMedicalRecordSuggest"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },
            /**
             * 保存医生评价数据
             */

            saveSuggestData : function(postdata, onSuccess){
                postdata.op = "quickSugSaveMedicalRecordSuggest";
                HttpServiceBus.connect({
                    type: "POST",
                    url : "/satisfaction/action/BZSatisfactionActionC.jspx",
                    params : postdata,
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
           /*计算医生平均分*/
            queryDoctorAvgScore: function(hospitalId,deptCode,doctorCode,gradeCode,sourceFlag,onSuccess){
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        hospitalId: hospitalId,
                        deptCode:deptCode,
                        doctorCode:doctorCode,
                        gradeCode:gradeCode,
                      /*  sourceFlag:"1",*/
                        FLAG: "cloud",
                        op: "quickSugGetDoctorAvgScoreRecord"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },
        /**
         * 修改患者信息
         */
        addOrEditExtendPatientInfo : function(TREATMENT_CARD_NO,PHONE_NUMBER, onSuccess){
            HttpServiceBus.connect({
                type: "POST",
                url : "/satisfaction/action/BZSatisfactionActionC.jspx",
                showLoading: true,
                params: {
                    TREATMENT_CARD_NO: TREATMENT_CARD_NO,
                    PHONE_NUMBER:PHONE_NUMBER,
                    FLAG: "cloud",
                    op: "addOrEditExtendPatientInfo"
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
            queryDisSatReasonList: function (scoreValue,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        scoreValue: scoreValue,
                        FLAG: "cloud",
                        op: "getWebDisSatReasons"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },

            loadSatHosList: function (number,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        number: number,
                        FLAG: "cloud",
                        op: "getSatHosRankInfo"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            },

            loadSatDocList: function (number,onSuccess) {
                HttpServiceBus.connect({
                    url: "/satisfaction/action/BZSatisfactionActionC.jspx",
                    showLoading: true,
                    params: {
                        number: number,
                        FLAG: "cloud",
                        op: "getSatDocRankInfo"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();

