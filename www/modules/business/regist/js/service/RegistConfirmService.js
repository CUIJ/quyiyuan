/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/4
 * 创建原因：确认挂号服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.regist.regist_registConfirm.service")
    .require(["kyee.framework.service.message", "kyee.quyiyuan.appointment.service", "kyee.quyiyuan.appointment.create_card.controller","kyee.quyiyuan.appointment.doctor_detail.service"])
    .type("service")
    .name("RegistConfirmService")
    .params(["HttpServiceBus", "KyeeMessageService", "CacheServiceBus", "AppointmentDeptGroupService", "AppointmentCreateCardService","AppointmentDoctorDetailService"])
    .action(function (HttpServiceBus, KyeeMessageService, CacheServiceBus, AppointmentDeptGroupService, AppointmentCreateCardService,AppointmentDoctorDetailService) {
        var clinicData = {
            //路由
            ROOTER:null,
            //用户选择的号源
            CLINIC_SOURCE: {},  // (APK)需要在挂号时号源显示具体时间(时间点或者时间段)  By  张家豪  KYEEAPPC-3017
            //用户选择的单个医生信息（包含医生的排班）
            DOCTOR: {},
            //用户选择的医生的排班数据
            SCHEDULE_LISTDATA: {},
            //全局参数
            memoryCache: CacheServiceBus.getMemoryCache(),
            //缓存数据
            storageCache: CacheServiceBus.getStorageCache(),
            //查询就诊卡
            Clientinfo: null,
            //回调函数
            setClientinfo: function (fn) {
                clinicData.Clientinfo = fn;
            },
            //获取就诊卡信息
            //begin  网络医院标示从科室中获取 By 高玉楼 KYEEAPPTEST-2805
            queryClientinfo: function (params, onSuccess) {
                //获取缓存中医院信息
                var hospitalinfo = clinicData.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
              //获取缓存中当前就诊者信息
                var currentPatient = clinicData.memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    params: {
                        op: "queryCardInAppoint",
                        hospitalID: hospitalinfo.id,
                        USER_VS_ID: currentPatient.USER_VS_ID,
                        IS_ONLINE: params.IS_ONLINE,
                        USER_ID: currentPatient.USER_ID,
                        //0 ：标识为预约    1：标识为挂号
                        isAppoint: 1     // (APK)查卡接口根据不同业务类型返回虚拟卡  By  张家豪  KYEEAPPC-2948
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var ClienData = data.data;
                            clinicData.Clientinfo(ClienData);
                        } else {
                            clinicData.Clientinfo([]);
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 5000
                            });
                        }
                    }
                });
            },
            //end 网络医院标示从科室中获取 By 高玉楼
            //获取号源数据
            queryClinicData: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/register/action/RegisterActionC.jspx",
                    params: {
                        op: "getRegClinicDetailActionC",
                        hospitalID: params.hospitalID,
                        CLINIC_DATE: params.clinicDate,
                        HB_TIME: params.hbTime,
                        DEPT_CODE: params.deptCode,
                        DOCTOR_CODE: params.doctorCode,
                        IS_ONLINE:params.IS_ONLINE,
                        // PATIENT_ID: params.patientId
                        HIS_SCHEDULE_ID : params.hisScheduleId,
                        IS_REFERRAL:params.IS_REFERRAL
                    },
                    onSuccess: function (data) {
                        onSuccess(data);
                        //KYEEAPPC-6612 获取号源为空，则将排班ISTIME置为0
                        /*if (data.success) {
                            var clinicData = data.data;
                            onSuccess(clinicData);
                        }
                        else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 5000
                            });
                        }*/
                    }
                });
            },
            //确认挂号
            confirmRegist: function (params, onSuccess) {
                //createCard 0表示不建卡，1表示新建卡
                var createCard = 0;
                //选择申请新卡时，patientId为-1
                if (params.postdata.CARD_NO == '') {
                    createCard = 1;
                }
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    type:"POST",
                    params: {
                        op: "getRegistPayOrderNo",
                        hospitalID: params.hospitalID,
                        HID: params.HID,
                        postdata: params.postdata,
                        MARK_DESC: params.MARK_DESC,
                        AMOUNT: params.AMOUNT,
                        USER_ID: params.USER_ID,
                        PATIENT_ID: params.PATIENT_ID,
                        USER_VS_ID: params.USER_VS_ID,
                        ADDRESS_ID: params.ADDRESS_ID,
                        DEPT_CODE: params.DEPT_CODE,
                        IS_ONLINE: params.IS_ONLINE,
                        IS_CREATE_CARD: createCard,
                        EXPENSE_DETAIL: params.EXPENSE_DETAIL,
                        isReferral:params.IS_REFERRAL,
                        REFERRAL_REG_ID:params.REFERRAL_REG_ID,
                        REFERRAL_DIRECTION:params.REFERRAL_DIRECTION,
                        //修改人：任妞     修改时间：2016年8月18日   下午5：46：38   任务号：KYEEAPPC-7336
                        HOSPITAL_AREA:params.HOSPITAL_AREA,
                        AMOUNT_TYPE:params.AMOUNT_TYPE,//挂号费别：0:普通；1:特殊人群优惠
                        ONLINE_BUSINESS_TYPE:params.ONLINE_BUSINESS_TYPE //网络门诊：0：视频问诊；1：购药开单
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
                var hospitalinfo = clinicData.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
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
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: "recordRegisterChoosePatientIdCard"
                    },
                    showLoading:false,//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    onSuccess: function (data) {
                    }
                });
            },
            //当提示请输入或选择就诊卡号再进行挂号是发送的请求
            inputOrChoosePatientIdCardCheck: function () {
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: "recordRegisterInputOrChoosePatientIdCard"
                    },
                    showLoading:false,//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    onSuccess: function (data) {
                    }
                });
            },
            //视频插件初始化失败时发送请求
            registeVideoInitFailure: function () {
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: "recordRegisterVideoInitFail"
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            //网络科室暂不支持IOS系统 时发送请求
            registeNonsupportIOS: function () {
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: "recordRegisterNonsupportIOS"
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            //网络科室暂不支持网页版时发送请求
            registerNetDeptSupportWeb: function () {
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: "recordRegisterNetDeptSupportWeb"
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            //网络科室挂号失败时发送请求
            registerNetDeptAppointFailure: function () {
                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: "recordRegisterNetDeptAppointFail"
                    },
                    onSuccess: function (data) {
                    }
                });
            },
            registerGetHisFailure: function () {

                HttpServiceBus.connect({
                    url: "register/action/RegisterActionC.jspx",
                    params: {
                        op: "recordRegisterGetHisFail"
                    },
                    onSuccess: function (data) {
                    }
                });
            }
            //end 前端校验阻塞后发送请求 By 高玉楼

        };
        return clinicData;
    })
    .build();

