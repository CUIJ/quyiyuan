/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/5
 * 创建原因：确认预约服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appoint.appoint_appointConfirm.service")
    .require(["kyee.framework.service.message", "kyee.quyiyuan.appointment.service"])
    .type("service")
    .name("AppointConfirmService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus", "AppointmentDeptGroupService", "AppointmentCreateCardService"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus, AppointmentDeptGroupService, AppointmentCreateCardService) {
        var confirmData = {
            //用户选择的号源
            CLINIC_SOURCE: {},
            //用户选择的单个医生信息（包含医生的排班）
            DOCTOR: {},
            //用户选择的医生的排班数据
            SCHEDULE_LISTDATA: {},
            //预约号源数据
            CLINIC_DETAIL: {},
            //全局参数
            memoryCache: CacheServiceBus.getMemoryCache(),
            //缓存数据
            storageCache: CacheServiceBus.getStorageCache(),
            //查询就诊卡
            Clientinfo: null,

            consulationData: {},  //会诊页面传递的数据
            //回调函数
            setClientinfo: function (fn) {
                confirmData.Clientinfo = fn;
            },
            //获取就诊卡信息
            //begin 网络科室获取从科室中获取 By 高玉楼 KYEEAPPTEST-2805
            queryClientinfo: function (params) {
                var me = this;
                //获取医院信息
                var hospitalinfo = confirmData.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                //获取缓存中当前就诊者信息
                var currentPatient = confirmData.memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        op: "queryCardInAppoint",
                        hospitalID: hospitalinfo.id,
                        USER_VS_ID: currentPatient.USER_VS_ID,
                        DEPT_CODE:AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.DEPT_CODE,
                        IS_ONLINE:params.IS_ONLINE,
                        USER_ID:currentPatient.USER_ID,
                        //0 ：标识为预约    1：标识为挂号
                        isAppoint:0       // (APK)查卡接口根据不同业务类型返回虚拟卡  By  张家豪  KYEEAPPC-2948
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var ClienData = data.data;
                            //回调
                            confirmData.Clientinfo(ClienData);
                        } else {
                            confirmData.Clientinfo([]);
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //确认预约不缴费
            confirmAppointNopay: function (params, onSuccess) {
                //createCard 0表示不建卡，1表示新建卡
                var createCard = 0;
                //选择申请新卡时，patientId为-1
                if (params.postdata.CARD_NO == '') {
                    createCard = 1;
                }
                var paramsObj = {
                    op: "sendAppointInfoActionC",
                    hospitalID: params.hospitalId,
                    HID: params.HID,
                    USER_VS_ID: params.USER_VS_ID,
                    postdata: params.postdata,
                    USER_ID: params.USER_ID,
                    PHONE: params.PHONE,
                    PSWD: params.PSWD,
                    PATIENT_ID: params.PATIENT_ID,
                    APPOINT_SOURCE: params.APPOINT_SOURCE,
                    MEDICAL_CARD_ID: params.MEDICAL_CARD_ID,
                    MARK_DESC: params.MARK_DESC,
                    MEDICAL_CARD_PWD: params.MEDICAL_CARD_PWD,
                    ADDRESS_ID: params.ADDRESS_ID,
                    DEPT_CODE: params.DEPT_CODE,
                    IS_ONLINE: params.IS_ONLINE,
                    IS_CREATE_CARD: createCard,
                    isReferral: params.IS_REFERRAL,
                    REFERRAL_REG_ID: params.REFERRAL_REG_ID,
                    REFERRAL_DIRECTION:params.REFERRAL_DIRECTION,
                    //修改人：任妞     修改时间：2016年8月18日   下午5：46：38   任务号：KYEEAPPC-7336
                    HOSPITAL_AREA:params.HOSPITAL_AREA,
                    AMOUNT: params.AMOUNT,//预约费用
                    AMOUNT_TYPE:params.AMOUNT_TYPE,//挂号费别：0:普通；1:特殊人群优惠
                    ONLINE_BUSINESS_TYPE:params.ONLINE_BUSINESS_TYPE,
                    IS_MEDICAL_TYPE:params.IS_MEDICAL_TYPE,//用户选择虚拟卡预约用户类型，0自费类型；1医保类型  KYEEAPPC-11869
                    //会诊会用到--start
                    OLD_REG_ID: params.REG_ID,
                    consultationFlag: params.consultationFlag,
                    consultPatientKeyId: params.consultPatientKeyId ? params.consultPatientKeyId + '' : '',
                    reservationId: params.reservationId ? params.reservationId + '' : ''
                    //会诊会用到--end
                };
                if (params.EXPENSE_DETAIL) {
                    paramsObj['EXPENSE_DETAIL'] = params.EXPENSE_DETAIL;
                }
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    type:"POST",
                    params: paramsObj,
                    onSuccess: function (data) {
                        if(data.success){
                            AppointmentCreateCardService.password = '';
                        }
                        onSuccess(data);
                    }
                });
            },
            //end 网络科室获取从科室中获取 By 高玉楼 KYEEAPPTEST-2805
            //确认预约缴费
            confirmAppointPay: function (params, onSuccess) {
                //createCard 0表示不建卡，1表示新建卡
                var createCard = 0;
                //选择申请新卡时
                if (params.postdata.CARD_NO == '') {
                    createCard = 1;
                }
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    type : "POST",
                    params: {
                        op: "getAppointPayOrderNo",
                        hospitalID: params.hospitalId,
                        HID: params.HID,
                        USER_VS_ID: params.USER_VS_ID,
                        postdata: params.postdata,
                        USER_ID: params.USER_ID,
                        PHONE: params.PHONE,
                        PSWD: params.PSWD,
                        AMOUNT: params.AMOUNT,
                        PATIENT_ID: params.PATIENT_ID,
                        APPOINT_SOURCE: params.APPOINT_SOURCE,
                        MARK_DESC: params.MARK_DESC,
                        MEDICAL_CARD_ID: params.MEDICAL_CARD_ID,
                        MEDICAL_CARD_PWD: params.MEDICAL_CARD_PWD,
                        ADDRESS_ID: params.ADDRESS_ID,
                        DEPT_CODE: params.DEPT_CODE,
                        IS_ONLINE: params.IS_ONLINE,
                        IS_CREATE_CARD: createCard,
                        EXPENSE_DETAIL: params.EXPENSE_DETAIL,
                        isReferral: params.IS_REFERRAL,
                        REFERRAL_REG_ID: params.REFERRAL_REG_ID,
                        REFERRAL_DIRECTION:params.REFERRAL_DIRECTION,
                        //修改人：任妞     修改时间：2016年8月18日   下午5：46：38   任务号：KYEEAPPC-7336
                        HOSPITAL_AREA:params.HOSPITAL_AREA,
                        AMOUNT: params.AMOUNT,//预约费用
                        AMOUNT_TYPE:params.AMOUNT_TYPE,//挂号费别：0:普通；1:特殊人群优惠
                        IS_MEDICAL_TYPE:params.IS_MEDICAL_TYPE//用户选择虚拟卡预约用户类型，0自费类型；1医保类型 KYEEAPPC-11869
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            AppointmentCreateCardService.password = '';
                        }
                        onSuccess(data);
                    }
                });
            },
            //获取优惠方式
            getPreferentialType:function(params,PreferentialTypeData){
                //获取缓存中医院信息
                var hospitalinfo = confirmData.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var id=hospitalinfo.id;
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "confirmAppointRegistPageActionC",
                        HOSPITAL_ID: hospitalinfo.id,
                        IS_ONLINE:params.IS_ONLINE,
                        USER_ID:params.USER_ID,
                        USER_VS_ID:params.USER_VS_ID,
                        TYPE:params.TYPE,
                        AMOUNT:params.AMOUNT,
                        DOCTOR_CLINIC_TYPE: params.DOCTOR_CLINIC_TYPE,
                        CLINIC_TYPE: params.CLINIC_TYPE
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var resultData = data.data;
                            PreferentialTypeData(resultData);
                        }
                        else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 5000
                            });
                        }
                    }
                });
            },
            //begin 前端校验阻塞后发送 By 高玉楼 KYEEAPPC-2896
            //当提示您还没有选择就诊卡时发送的请求
            choosePatientIdCardCheck: function () {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "recordAppointChoosePatientIdCard"
                    },
                    showLoading:false,//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    onSuccess: function (data) {
                    }
                });
            },
            //当提示请输入或选择就诊卡号再进行挂号时发送的请求
            inputOrChoosePatientIdCardCheck: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "recordAppointInputOrChoosePatientIdCard"
                    },
                    showLoading:false,//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    onSuccess: function (data) {
                    }
                });
            },
            //视频插件初始化失败时发送请求
            appointVideoInitFialuer: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "recordAppointVideoInitFail"
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            //网络科室暂不支持IOS系统时发送请求
            appointNontSupportIOS: function (onSuccess) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "recordAppointNonsupportIOS"
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            //网络科室暂不支持网页版时发送的请求
            appointNetDeptSupportWeb: function () {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "recordAppointNetDeptSupportWeb"
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            //网络科室挂号失败时发送的请求
            appointNetDeptAppointFailuer: function () {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "recordAppointNetDeptAppointFail"
                    },
                    onSuccess: function (data) {
                    }
                });
            }
            //end 前端校验阻塞后发送请求 By 高玉楼

        };

        return confirmData;
    })
    .build();

