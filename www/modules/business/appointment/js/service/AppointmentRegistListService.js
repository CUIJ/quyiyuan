/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/5/9.
 * 创建原因：预约挂号记录服务层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.regist.List.service")
    .require(["kyee.framework.service.message",
        "kyee.quyiyuan.service_bus.cache",
        "kyee.quyiyuan.interaction.doctorMessageBoard.service",
        "kyee.quyiyuan.payOrder.service",
        "kyee.framework.service.utils"
    ])
    .type("service")
    .name("AppointmentRegistListService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "$state","CacheServiceBus",
        "DoctorMessageBoardService",
        "PayOrderService",
        "KyeeUtilsService",
        "AppointmentDoctorDetailService",
        "SatisfactionMenuService",
        "SatisfactionDoctorService","KyeeI18nService","SatisfactionHospitalService"])
    .action(function(HttpServiceBus,KyeeMessageService,$state,CacheServiceBus,DoctorMessageBoardService,
                     PayOrderService,KyeeUtilsService,AppointmentDoctorDetailService,SatisfactionMenuService,
                     SatisfactionDoctorService,KyeeI18nService,SatisfactionHospitalService){
        var def ={
            resultTimer:undefined,
            //获取传递来的参数
            doSetAppointListParams:function(pagedata){
                this.pagedata = pagedata;
            },
           /*点击预约挂号记录事件*/
            onAppointRecordListTap:function (record){
                var rec  = record;
                AppointRegistDetailService.doSetAppointDetailParams(rec);
                $state.go('appoint_regist_detail');
            },
            //继续支付
            onGoToPay:function(formdata,onSuccess){
                this.clearUserAmount();//add 清缓存
                var me=this;
                var userId=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                var patientId=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO).PATIENT_ID;
                HttpServiceBus.connect({
                    url:"appoint/action/AppointActionC.jspx",
                    params: {
                        op:'afterAppoint2FeeActionC',
                        HID:formdata.HID,
                        hospitalID:formdata.HOSPITAL_ID,
                        MARK_DESC:formdata.MARK_DESC,
                        AMOUNT:formdata.AMOUNT,
                        postdata: JSON.stringify(formdata),
                        USER_ID:userId,
                        PATIENT_ID:patientId,
                        C_REG_ID:formdata.REG_ID
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
            //取消订单
            onCancelPay:function(formdata,onSuccess){
                var me=this;
                KyeeMessageService.confirm({
                    title:"取消提示",
                    content:"是否取消该订单？",
                    onSelect:function (buttonTap) {
                        if (buttonTap === true) {
                            HttpServiceBus.connect({
                                url : "/appoint/action/AppointActionC.jspx",
                                params: {
                                    op:"cancelAfterAppointPayC",
                                    HOSPITAL_ID: formdata.HOSPITAL_ID,
                                    C_REG_ID: formdata.REG_ID,
                                    REG_CREATE_TIME:formdata.REG_CREATE_TIME ,
                                    APPOINT_PAY_TIMER: formdata.AppointPaytimer,
                                    REG_ID: formdata.REG_ID
                                },
                                onSuccess: function (data) {
                                    if (data.success) {
                                        KyeeMessageService.message({
                                            title:"系统提示",
                                            content:data.message});
                                        me.getAppointList(true, function (resultData) {});
                                    } else {
                                            KyeeMessageService.broadcast({
                                                content:data.message,
                                                duration:3000
                                            });
                                        me.getAppointList(true, function (resultData) {});
                                    }
                                }
                            });

                        }
                    }
                });
            },
            //再次预约  By  张家豪  KYEEAPPC-3292
            reappoint:function(params,hospitalId,onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDeptDetailActionC",
                        HOSPITAL_ID: hospitalId,
                        DEPT_CODE: params.DEPT_CODE,
                        IS_ONLINE:params.IS_ONLINE
                    },
                    onSuccess: function (reappointData) {
                        if (reappointData.success) {
                            onSuccess(reappointData.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: reappointData.message,
                                duration: 3000
                            });
                        }
                    }
                });

            },
            //再次预约  By  张家豪  KYEEAPPC-3292
            againAppoint:function(params,hospitalId,doctorCode,onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDeptDetailActionC",
                        HOSPITAL_ID: hospitalId,
                        DEPT_CODE: params.DEPT_CODE,
                        IS_ONLINE:params.IS_ONLINE,
                        DOCTOR_CODE:doctorCode
                    },
                    onSuccess: function (againAppointData) {
                        if (againAppointData.success) {
                            onSuccess(againAppointData.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: againAppointData.message,
                                duration: 3000
                            });
                        }
                    }
                });

            },
            //去点评  By  张家豪  KYEEAPPC-3292
            goToComment:function(data){
                if (data.VISIT_STATUS && data.IS_NEED_VISIT == 0 && data.VISIT_STATUS != '2') {//吴伟刚 APPCOMMERCIALBUG-1799 门诊满意度就诊之后才能评价的参数控制
                    KyeeMessageService.message({
                        title:KyeeI18nService.get('commonText.msgTitle', '消息', null),
                        content:  KyeeI18nService.get('satisfaction_clinic.jiuZhenHouContent', '您就诊之后才可以评价该医生！', null)
                    });
                    return;
                }
//                SatisfactionDoctorService.data.IS_SCORE= "0"     //医院评价参数控制
//                SatisfactionDoctorService.data.IS_SUGGEST= "0"   //医生评价参数控制
//                SatisfactionDoctorService.data.LOC_INFO= "0"
                //如果评价了医生，没有评价医院，跳到评价医院
                if(data.IS_SUGGEST== '2'&&data.IS_SCORE=='0'){
                    SatisfactionHospitalService.data = data;
                    SatisfactionHospitalService.data.REG_ID = data.REG_ID;
                    SatisfactionMenuService.isTabActive = 2;//评价医院
                    $state.go("satisfaction_menu.satisfaction_hospital");
                }else{
                    SatisfactionDoctorService.data = data;
                    SatisfactionDoctorService.data.TRADE_ORDER_NO = SatisfactionDoctorService.data.REG_ID;
                    SatisfactionMenuService.isTabActive = 1;//评价医生
                    $state.go("satisfaction_menu.satisfaction_doctor");
                }
            },
            //查看评价分数
            goToSeeComment:function(data){
                    SatisfactionDoctorService.data = data;
                    SatisfactionDoctorService.data.TRADE_ORDER_NO =  SatisfactionDoctorService.data.REG_ID;
                    SatisfactionMenuService.isTabActive = 1;//评价医生
                    $state.go("satisfaction_menu.satisfaction_doctor");
            },
            //咨询医生  By  张家豪  KYEEAPPC-3292
            consultDoctor:function(data){
                var StorageCache = CacheServiceBus.getStorageCache();
                var MemoryCache = CacheServiceBus.getMemoryCache();
                data.HOSPITAL_NAME = StorageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).name;
                data.HOSPITAL_ID = StorageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                data.USER_VS_ID = MemoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                data.OFTEN_NAME = MemoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).OFTEN_NAME;
                DoctorMessageBoardService.paramData = data;
                $state.go("doctorMessageBoard");
            },
            clearUserAmount:function(){
                CacheServiceBus.getStorageCache().set("IS_OPEN_BALANCE",undefined);
                CacheServiceBus.getStorageCache().set("USER_PAY_AMOUNT",undefined);
            },
            //请求预约挂号记录数据
            getAppointList:function(showLoading,curPage, onSuccess){
                if(showLoading=='1'){
                   var showLoad = false;
                }else{
                    var showLoad = true;
                }
                var appointListData=[];
                var me=this;
                if ( CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT)== undefined) {
                    return;
                }
                var hospitalId="";
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo){
                    hospitalId = hospitalInfo.id;
                }
                if(appointListData.length===0){
                    HttpServiceBus.connect(
                        {
                            url : "/multibusiness/action/VisitTreeAcionC.jspx",
                            params : {
                                op:"getVisitTreeAppointMoreRecsActionC",
                                loc:"c",
                                USER_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                                USER_VS_ID:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                                HOSPITAL_ID:hospitalId,
                                CURRENT_PAGE:curPage
                            },
                            showLoading: showLoad,
                            onSuccess:function(data){
                                var app7index=[];
                                if(data.success){
                                    if(data.data!=null&&data.data!=""&&data.data!=undefined){
                                        var appointListNotHidden=true;
                                        var resultData = data.data.moreAppointRegs;
                                        var resultTimer = data.data.curHosTimerAppoint;
                                        for(var i=0;i<resultData.length;i++){
                                            if(resultTimer){
                                                resultData[i].AppointPaytimer=resultTimer.AppointPaytimer;
                                            }
                                            var type=parseInt(resultData[i].TYPE);
                                            var appointType=parseInt(resultData[i].APPOINT_TYPE);
                                            var registType=parseInt(resultData[i].REGIST_TYPE);
                                            //begin 如果预约成功，且有签到状态优先显示签到状态 By 高玉楼 KYEEAPPC-2693
                                            var statusType='',signType=resultData[i].SIGN_TYPE,statusResult=undefined;
                                            if(type==0){
                                                statusType=appointType;
                                            }else if(type==1){
                                                statusType=registType;
                                            }else if(type==2){
                                                statusType=appointType;
                                            }
                                            //end 如果预约成功，且有签到状态优先显示签到状态
                                            //begin (APK)将APK显示的预约挂号状态文字改为由云传给APK显示   By  张家豪 KYEEAPPC-2956
                                            if(resultData[i].STATUS_DESC_STYLE && resultData[i].STATUS_DESC){
                                                resultData[i].APPOINT_STATUS_DESC = resultData[i].STATUS_DESC;
                                                resultData[i].APPOINTSTATUS = resultData[i].STATUS_DESC_STYLE;
                                            }
                                            //end (APK)将APK显示的预约挂号状态文字改为由云传给APK显示  By  张家豪  KYEEAPPC-2956
                                            //支付状态判断
                                            if((type==0&&appointType==7)||(type==1&&registType==8)){
                                                resultData[i].payNotHiddden=true;
                                            }else{
                                                resultData[i].payNotHiddden=false;
                                            }
                                            //取消挂号
                                            if(type==1&&registType==1){
                                                resultData[i].RegistNotHiddden=true;
                                            }else{
                                                resultData[i].RegistNotHiddden=false;
                                            }

                                        }
                                        //时间格式化
                                        for(var i=0;i<resultData.length;i++){
                                            var regTime= KyeeUtilsService.DateUtils.formatFromString(resultData[i].REG_DATE,"YYYY-MM-DD HH:mm:ss", "YYYY/MM/DD");
                                            resultData[i].REG_DATE_RESULT=regTime;
                                        };
                                    }
                                }else{
                                    //显示无数据提示
                                    appointListNotHidden=false;
                                    KyeeMessageService.broadcast({
                                        content: data.message,
                                        duration: 3000
                                    });
                                }
                                var appointListData={
                                    "resultData":resultData,
                                    "appointListNotHidden":appointListNotHidden
                                };
                                onSuccess(appointListData);
                            }
                        }
                    );
                }
            },
            //请求抢号和有号记录数据
            getRushClinicList:function(showLoading,curPage, onSuccess){
                if(showLoading=='1'){
                    showLoad = false;
                }else{
                    showLoad = true;
                }
                var appointListData=[];
                var me=this;
                if ( CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT)== undefined) {
                    return;
                }
                if(appointListData.length===0){
                    HttpServiceBus.connect(
                        {
                            url : "/appoint/action/AppointActionC.jspx",
                            params : {
                                op:"getRushClinicAppointMoreRecsActionC",
                                loc:"c",
                                USER_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                                USER_VS_ID:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                                HOSPITAL_ID:CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                                CURRENT_PAGE:curPage
                            },
                            showLoading: showLoad,
                            onSuccess:function(data){
                                var app7index=[];
                                if(data.success){
                                    if(data.data!=null&&data.data!=""&&data.data!=undefined){
                                        var appointListNotHidden=true;
                                        var resultData = data.data.morerRushClinicRecords;
                                        //时间格式化
                                        for(var i=0;i<resultData.length;i++){
                                            var regTime= KyeeUtilsService.DateUtils.formatFromString(resultData[i].REG_DATE,"YYYY-MM-DD HH:mm:ss", "YYYY/MM/DD");
                                            resultData[i].REG_DATE_RESULT=regTime;
                                        };
                                    }
                                }else{
                                    //显示无数据提示
                                    appointListNotHidden=false;
                                    KyeeMessageService.broadcast({
                                        content: data.message,
                                        duration: 3000
                                    });
                                }
                                var appointListData={
                                    "resultData":resultData,
                                    "appointListNotHidden":appointListNotHidden
                                };
                                onSuccess(appointListData);
                            }
                        }
                    );
                }
            },
            //删除预约挂号记录
            allCloudData: [],
            isSelectPatient: undefined,
            isShowTipType: undefined,
            isFromChangeSetting: undefined,
            deleteList: function (Callback,regId,userVsId) {
                HttpServiceBus.connect({
                    url: "multibusiness/action/VisitTreeAcionC.jspx",
                    showLoading: true,
                    params: {
                        REG_ID:regId,
                        USER_VS_ID:userVsId,
                        op: "deleteAppintRegistRecordActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //def.dealCloudData(data);
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },

            addParameter:function(onSuccess){
                HttpServiceBus.connect(
                    {
                        url : "/patientwords/action/PatientWordsActionC.jspx",
                        showLoading:false,
                        params : {
                            loc:"c",
                            op:"queryParameter",
                            hospitalID:CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id
                        },
                        onSuccess:function(data){
                            if(data.success){
                                if(data.data == '1'){
                                        var  DoctorPatientNotHidden=true;
                                }
                                else{
                                     DoctorPatientNotHidden=true;
                                    return;
                                }
                                var DoctorPatientData={
                                    'DoctorPatientNotHidden':DoctorPatientNotHidden,
                                    'DoctorPatientData':data
                                };
                                onSuccess(DoctorPatientData);
                            }
                        }
                    }
                );
            },
            //点击医患互动按钮
            onDoctorPatientTap:function(record){
;
                var rec = record;
                var patientCard = CacheServiceBus.getMemoryCache().get("currentCardInfo");
                //该就诊者没有卡，进入查取就诊卡界面了
                //if(patientCard == undefined)
                if(false){
                    KyeeMessageService.confirm({
                        title: "消息",
                        content: "您还没有选择就诊卡，是否选择？",
                        onSelect: function (buttonTap) {
                            if (buttonTap === true) {
                                //跳查取就诊卡
                                //this.createViewToViewportConfig('KYMH.view.center.QueryHisCardView', global.currentCustomPatient);
                            }
                        }
                    });
                    return;
                }
                else{
                    var arc=new Array();
                    arc[0]={
                        HOSPITAL_ID:rec.HOSPITAL_ID,
                        HOSPITAL_NAME:rec.HOSPITAL_NAME,
                        DOCTOR_CODE:rec.DOCTOR_CODE,
                        DOCTOR_NAME:rec.DOCTOR_NAME,
                        PATIENT_ID:rec.PATIENT_ID,
                        PATIENT_NAME:rec.PATIENT_NAME,
                        DEPT_NAME:rec.DEPT_NAME,
                        DEPT_CODE:rec.DEPT_CODE
                   };
                    DoctorMessageBoardService.paramData = arc[0];
                    $state.go("doctorMessageBoard");
                }
            },
            //高萌 2016年9月9日01:16:52 删除抢号管理记录
            deleteRushRecord: function (Callback,rushId,userId) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: true,
                    params: {
                        RUSH_ID:rushId,
                        USE_ID:userId,
                        op: "deleteRushClinicRecordActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //def.dealCloudData(data);
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            // 高萌 2016年9月9日01:16:24 更新抢号管理记录状态
            updateRushRecord: function (Callback,rushId,userId,status) {
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: true,
                    params: {
                        RUSH_ID:rushId,
                        USE_ID:userId,
                        STATUS:status,
                        op: "updateRushRecordStatusActionC"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //def.dealCloudData(data);
                            Callback(data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            /**
             * 若用户长时间停留在抢号管理页面并未进行预约挂号，则需要反查该记录状态是否已过期
             * @param appointListData
             */
            getRushRecordStatus:function(rushId, userId, onSuccess){
                HttpServiceBus.connect(
                    {
                        url : "appoint/action/AppointActionC.jspx",
                        params : {
                            op:"getRushStatusByRushIdActionC",
                            loc:"c",
                            RUSH_ID:rushId,
                            USER_ID: userId
                        },
                        onSuccess: function (data) {
                            if (data.success) {
                                onSuccess(data.data);
                            } else {
                                KyeeMessageService.broadcast({
                                    content: data.message
                                });
                            }
                        }
                    }
                );
            }
        };
        return def;
    })
    .build();
