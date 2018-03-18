/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/20
 * 创建原因：c端预约挂号详情服务层
 * 修改者：
 * 修改原因：
 *
 */
/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/18
 * 创建原因：预约挂号医生页面服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.appointment_regist_detil.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("AppointmentRegistDetilService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService","$state","CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService,$state,CacheServiceBus) {

        var AppointDetilData = {
            //一条记录
            RECORD: {},
            //
            ROUTE_STATE: "",
            //查询就诊卡
            Clientinfo: null,
            //判断是否为会诊详情
            isConsulotion:false,
            //获取预约挂号详情 
            queryAppointRegistParaDetil: function (params, onSuccess, onError) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getAppointRegistDetailParaActionC", //getAppointRegistDetailActionC
                        HOSPITAL_ID: params.hospitalId,
                        REG_ID: params.regId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            typeof onSuccess === 'function' && onSuccess(data.data, data.resultCode);
                        } else if(data.resultCode === "0020406"){
                            typeof onSuccess === 'function' && onSuccess(data.data, data.resultCode);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    },
                    onError: function (response) {
                        typeof onError === 'function' && onError(response);
                    }
                });
            },
            //详情页删除
            deleteList: function (regId,userVsId,Callback) {
                HttpServiceBus.connect({
                    url: "multibusiness/action/VisitTreeAcionC.jspx",
                    params: {
                        REG_ID:regId,
                        USER_VS_ID: userVsId,
                        op: "deleteAppintRegistRecordActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            // def.dealCloudData(data);
                            Callback(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            //预约签到
            sign: function (params, callback) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "appointSignActionC",
                        HOSPITAL_ID: params.hospitalId,
                        REG_ID: params.regId,
                        REG_DATE:params.regDate
                    },
                    onSuccess: function (data) {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 5000
                            });
                        callback(data);
                    }
                });
            },
            //取消预约挂号订单前的校验接口
            riskAppointCancel: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "regCancelVerifyActionC",
                        hospitalID: params.hospitalId,
                        REG_ID: params.regId
                    },
                    onSuccess: function (data) {
                       if (data.success) {
                            onSuccess(data);
                        }else {
                           if(data.message!=null || data.message!="" || data.message!=undefined){
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                           }
                        }
                    }
                });
            },
            //取消预约
            appointCancel: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "abandonAppointActionC",
                        hospitalID: params.hospitalId,
                        REG_ID: params.regId,
                        C_REG_ID: params.cRegId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                            onSuccess();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //取消预约需要延迟一定时间  高萌 2017年2月4日15:04:36  KYEEAPPC-9804
            appointCancelDelay: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "abandonAppointDelayActionC",
                        hospitalID: params.hospitalId,
                        REG_ID: params.regId,
                        C_REG_ID: params.cRegId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //取消挂号
            registCancel: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/register/action/RegisterActionC.jspx",
                    params: {
                        op: "abandonRegisterActionC",
                        hospitalID: params.hospitalId,
                        C_REG_ID: params.cRegId,
                        USER_ID: params.userId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //预约转挂号-取消（取消挂号）
            appointToregistCancel: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "abandonAppoint2RegistActionC",
                        HOSPITAL_ID: params.hospitalId,
                        REG_ID: params.regId
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //预约转挂号
            appointToregist: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "changeAppoint2RegesiterActionC",
                        hospitalID: params.hospitalId,
                        REG_ID: params.regId,
                        USER_ID: params.userId,
                        C_REG_ID: params.cRegId,
                        MARK_DESC: params.markDesc,
                        AMOUNT: params.Amount,
                      //  postdata:params.postData,
                        CARD_PWD:params.CARD_PWD
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //预约后支付（继续支付）
            goToPay: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "afterAppoint2FeeActionC",
                        hospitalID: params.hospitalId,
                        PATIENT_ID: params.patientId,
                        USER_ID: params.userId,
                        C_REG_ID: params.cRegId,
                        MARK_DESC: params.markDesc,
                        AMOUNT: params.Amount,
                     //   postdata: params.postData
                        CARD_NO: params.CARD_NO,
                        CARD_PWD: params.CARD_PWD,
                        IS_CREATE_CARD:params.IS_CREATE_CARD
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //先挂号后交费支付
            //begin 先挂号后交费 By 高玉楼 KYEEAPPC-2677
            goToPayRegist: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/register/action/RegisterActionC.jspx",
                    params: {
                        op: "afterRegist2FeeActionC",
                        HOSPITAL_ID: params.HOSPITAL_ID,
                        C_REG_ID: params.C_REG_ID,
                        PATIENT_ID:params.PATIENT_ID,
                        CARD_NO: params.CARD_NO,//
                        CARD_PWD: params.CARD_PWD,
                        IS_CREATE_CARD:params.IS_CREATE_CARD
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //end 先挂号后交费 By 高玉楼
            /**
             * 取消订单（预约后支付）
             * KYEEAPPC-3002
             * @param onSuccess
             */
            cancelAppointOrder: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "cancelAfterAppointPayActionC",
                        HOSPITAL_ID: params.HOSPITAL_ID,
                        REG_CREATE_TIME: params.REG_CREATE_TIME,
                        REG_ID: params.REG_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                            onSuccess();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },

            // 线下取消 edit by caochen 任务号：KYEEAPPC-4364
            offlineCancel: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "offlineCancelActionC",
                        HOSPITAL_ID: params.hospitalId,
                        REG_ID: params.regId,
                        CANCEL_ACTION:params.cancelAction
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },

            //end 先挂号后交费 By 程效亮
            /**
             *
             * 取消订单（挂号后支付）
             * KYEEAPPC-11027
             * @param onSuccess
             */
            cancelRegisterOrder: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "cancelRegisterLockActionC",
                        HOSPITAL_ID: params.HOSPITAL_ID,
                        REG_CREATE_TIME: params.REG_CREATE_TIME,
                        REG_ID: params.REG_ID
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                            onSuccess();
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            // 重发短信 edit by gaomeng  任务号：KYEEAPPC-6789
            reSendMsg: function (messageParams, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "reSendMsgActionC",
                        HOSPITAL_ID: messageParams.hospitalId,
                        REG_ID: messageParams.regId
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                    }
                });
            },
            //回调函数
            setClientinfo: function (fn) {
                AppointDetilData.Clientinfo = fn;
            },
            //begin  网络医院标示从科室中获取 By 高玉楼 KYEEAPPTEST-2805
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
                        isAppoint: 0     // (APK)查卡接口根据不同业务类型返回虚拟卡  By  张家豪  KYEEAPPC-2948
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var ClienData = data.data;
                            AppointDetilData.Clientinfo(ClienData);
                        } else {
                            AppointDetilData.Clientinfo([]);
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 5000
                            });
                        }
                    }
                });
            }
        };
        return AppointDetilData;
    })
    .build();

