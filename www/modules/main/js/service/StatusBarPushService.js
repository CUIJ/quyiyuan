/**
 * 产品名称：quyiyuan.
 * 创建用户：licong
 * 日期：2017/2/14
 * 描述：外部推送通知栏点击事件处理
 */

new KyeeModule()
    .group("kyee.quyiyuan.status_bar_push.service")
    .require([
        "kyee.quyiyuan.patients_group.message.service",
        "kyee.quyiyuan.patients_group.reminder.service",
        "kyee.quyiyuan.myWallet.inpatientPayment.service",
        "kyee.quyiyuan.patients_group.report_reminder.controller",
        "kyee.quyiyuan.patients_group.medical_record_reminder.controller",
        "kyee.quyiyuan.patients_group.medical_orders_reminder.controller",
        "kyee.quyiyuan.myWallet.myquyiInpatientPayment.controller",
        "kyee.quyiyuan.patients_group.medication_push.controller",
        "kyee.quyiyuan.patients_group.medication_push.service",
        "kyee.quyiyuan.patients_group.treatment_plan.controller",
        "kyee.quyiyuan.patients_group.treatment_plan.service",
        "kyee.quyiyuan.patients_group.unified_push.controller",
        "kyee.quyiyuan.patients_group.unified_push.service",
        "kyee.quyiyuan.login.service"

    ])
    .type("service")
    .name("StatusBarPushService")
    .params(["$state","MessageService", "MedicationPushService","AppointmentRegistDetilService", "PaidRecordService", "CloundHisMessageService","AppointmentDoctorDetailService","LoginService",
            "AddClinicManagementService","AppointmentDeptGroupService","HospitalSelectorService","CacheServiceBus","InpatientPaymentService","PatientCardRechargeService","PerpaidRecordService","ReminderService"
            ,"TreatmentPlanService","UnifiedPushService"])
    .action(function($state,MessageService,MedicationPushService, AppointmentRegistDetilService, PaidRecordService, CloundHisMessageService,AppointmentDoctorDetailService,LoginService,
                     AddClinicManagementService,AppointmentDeptGroupService,HospitalSelectorService,CacheServiceBus,InpatientPaymentService,PatientCardRechargeService,PerpaidRecordService,ReminderService,TreatmentPlanService,UnifiedPushService){

        var def = {
            webJump:undefined,
            /**
             * 通知栏点击事件处理
             * @param params: {
             *  router: 页面路由,
             *  data: 业务参数
             * }
             * */
            clickStatusBarMessage: function(params){

                if(params){
                    //病友圈
                    if(params.router == "message->MAIN_TAB"){
                        def.webJump = true;
                        $state.go(params.router,{}, { reload: true });
                        MessageService.menuTabFlag=0;
                    }

                    /* 业务参数处理
                     //跳转预约挂号详情界面
                     if(params.router == "appointment_regist_detil"){
                     AppointmentRegistDetilService.RECORD = params.data;
                     $state.go(params.router);
                     }
                     //缴费成功消息
                     else if(params.router == "paid_record"){
                     ClinicPaidMessageService.getPaidList(params.data);
                     }
                     // 预缴金不足
                     else if(params.router == "clound_his_message"){
                     CloundHisMessageService.MESSAGE = params.data;
                     $state.go(params.router);
                     }*/


                    //缴费成功消息跳转
                    else if(params.router == "paid_record" || params.router == "clinic_paid_message"){
                        PaidRecordService.webJump = true;
                        PaidRecordService.params = params;
                    }

                    //住院预交消息跳转
                    else if(params.router == "perpaid_record"){
                        PerpaidRecordService.webJump = true;
                    }

                    //就诊卡充值的页面跳转
                    else if(params.router == "patient_card_recharge"){
                        PatientCardRechargeService.webJump = true;
                    }

                    /*//病友圈每日清单跳转
                    else if(params.router == "myquyi_inpatient_payment"){
                        InpatientPaymentService.messageCenterParams = params;
                    }*/

                    //跳转预约挂号详情界面
                    else if(params.router == "appointment_regist_detil"){
                        def.webJump = true;
                        var data = params.param.replace(/'/g,"\"");
                        var param = JSON.parse(data);
                        AppointmentRegistDetilService.RECORD = param;
                    }
                    //有号提醒跳转到医生主页
                    else if(params.router == "doctor_info"){
                        def.webJump = true;
                        var data = params.param.replace(/'/g,"\"");
                        var param = JSON.parse(data);
                        AppointmentDoctorDetailService.doctorInfo  = param;
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE = param.IS_ONLINE ;
                        var currentHospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                        if(param.HOSPITAL_ID!=currentHospitalInfo.id){
                            HospitalSelectorService.selectHospitalById(param.HOSPITAL_ID,function(){
                                $state.go(params.router,{},{ reload: true });
                                return;
                            });
                            return;
                        }

                    }
                    //抢号失败和过期跳转到抢号详情页
                    else if(params.router == "rush_clinic_detail"){
                        def.webJump = true;
                        var data = params.param.replace(/'/g,"\"");
                        var param = JSON.parse(data);
                        AddClinicManagementService.DOCTOR_INFO  = param;
                    }
                    //放号提醒跳转到医生列表页
                    else if(params.router == "appointment_doctor"){
                        def.webJump = true;
                        var data = params.param.replace(/'/g,"\"");
                        var param = JSON.parse(data);
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = param;
                        var currentHospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                        if(param.HOSPITAL_ID!=currentHospitalInfo.id){
                            HospitalSelectorService.selectHospitalById(param.HOSPITAL_ID,function(){
                                $state.go(params.router,{},{ reload: true });
                                return;
                            });
                            return;
                        }

                        //用药提醒跳转至用药提醒详情页面 add by dangliming 2017/02/27
                    } else if(params.router == "medication_push"){
                        var jsonPram=JSON.parse(params.param);
                        var messageId=jsonPram.messageId;//edit by wangsannv
                        MedicationPushService.messageId=messageId;
                        MedicationPushService.isFromOuterPush = true;
                        //MedicationPushService.medicationData = params.param;  //edit by wangsnnv

                    } else if(params.router == "treatment_plan_push"){
                        def.webJump = true;
                        var jsonPram=JSON.parse(params.param);
                        var messageId=jsonPram.messageId;
                        TreatmentPlanService.messageId=messageId;
                        TreatmentPlanService.isFromBar = true;
                    }
					 else if(params.router =="report_multiple"){
                        def.webJump = true;
                        LoginService.autoLoad();
                    }
                    //病例提醒跳转到病例提醒详情页面

                    else if(params.URL == "case"){
                        def.webJump = true;
                        ReminderService.medicalRecordData=params;
                        $state.go("medical_record_reminder",{},{ reload: true });
                        return;
                    }
                    //医嘱提醒跳转到医嘱提醒详情页面
                    else if(params.URL ==  "doctor"){
                        def.webJump = true;
                        ReminderService.doctorOrdersData=params;
                        $state.go("medical_orders_reminder",{},{ reload: true });
                        return;
                    }
                    //检验检查单提醒跳转到检验检查单详情页面
                    else if(params.URL ==  "report"){
                        def.webJump = true;
                        ReminderService.reportData=params;
                        $state.go("report_reminder",{},{ reload: true });
                        return;
                    }
                    //推送
                    else if(params.router ==  "unified_push"){
                        var jsonPram=JSON.parse(params.param);
                        var messageId=jsonPram.messageId;
                        UnifiedPushService.messageId=messageId;
                        UnifiedPushService.isFromOuterPush = true;
                    }
                    //每日清单提醒跳转到每日清单详情页面
                    else if(params.router ==  "myquyi_inpatient_payment"){
                        InpatientPaymentService.isOutPush=true;
                        InpatientPaymentService.inPatientData=params;
                        $state.go("myquyi_inpatient_payment",{},{ reload: true });
                        return;
                    }else if(params.router =="clinic_payment_revise"){
                        def.webJump = true;
                    }
                    //就诊卡充值的页面跳转9月19调整
                    else if(params.router == "patient_card_records"){
                        def.webJump = true;
                    }
                    $state.go(params.router,{},{ reload: true });
                }
            }
        };

        return def;
    })
    .build();