/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医患互动咨询留言页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.doctorMessageBoard.service")
    .type("service")
    .name("DoctorMessageBoardService")
    .params(["HttpServiceBus", "CacheServiceBus", "KyeeMessageService"])
    .action(function(HttpServiceBus, CacheServiceBus, KyeeMessageService){

        var def = {
            /**
             * 查询聊天记录
             */
            queryChatWords : function(showLoading, readFlag, hospitalId, doctorCode,
                                      page, limit, onSuccess){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    showLoading: showLoading,
                    params : {
                        op: "queryPatientWordsInit",
                        hospitalId: hospitalId,
                        doctorCode: doctorCode,
                        readFlag: readFlag,
                        page: page,
                        limit: limit
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            onSuccess(resp.data.rows);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },
            /**
             * 删除根留言
             */
            deleteRootWord : function(WORDS_ID){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params : {
                        op: "deleteRootMessage",
                        WORDS_ID: WORDS_ID
                    }
                });
            },
            /**
             * 发表根留言
             */
            postRootWord : function(postdata, WORDS_FLAG){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "savePatientWords",
                        postdata: postdata,
                        WORDS_FLAG: WORDS_FLAG
                    }
                });
            },
            /**
             * 删除子留言
             */
            deleteResetWord : function(RESET_ID){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params : {
                        op: "deletePatientReset",
                        RESET_ID: RESET_ID
                    }
                });
            },
            /**
             * 发表子留言
             */
            postResetWord : function(hospitalId, doctorCode, wordsId, postdata, onSuccess){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "savePatientReset",
                        postdata: postdata,
                        hospitalId: hospitalId,
                        doctorCode: doctorCode,
                        wordsId: wordsId
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            onSuccess(resp.data.rows);
                        } else if(resp.alertType == 'ALERT'){
                            KyeeMessageService.broadcast({
                                content: resp.message
                            });
                        }
                    }
                });
            },
            /**
             * 查询该医生是否绑定
             */
            queryDoctorBindingFlag : function(hospitalId, doctorCode, onSuccess){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "queryDoctorFlag",
                        hospitalId: hospitalId,
                        doctorCode: doctorCode
                    },
                    onSuccess : function (resp) {
                        if(resp.success){
                            onSuccess(resp.data);
                        }
                    }
                });
            },
            /**
             * 查询医生的详细信息
             */
            queryDoctorCareInfo : function(hospitalId, deptCode, doctorCode, onSuccess){
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params : {
                        op: "queryDoctorInfo",
                        HOSPITAL_ID: hospitalId,
                        DOCTOR_CODE: doctorCode,
                        DEPT_CODE: deptCode
                    },
                    onSuccess : function (resp) {
                        if(!resp || !resp.data){
                            return;
                        }
                        onSuccess(resp.data);
                    }
                });
            }
        };
        return def;
    })
    .build();
