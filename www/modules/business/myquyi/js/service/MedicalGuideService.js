/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：我的趣医门诊业务服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.medical_guide.service")
    .require([
        "kyee.quyiyuan.service_bus.http",
        "kyee.quyiyuan.service_bus.cache",
        "kyee.framework.service.message",
        "kyee.quyiyuan.report_multiple.service",
        "kyee.quyiyuan.satisfaction.satisfactionHospital.service",
        "kyee.quyiyuan.satisfaction.satisfactionDoctor.service",
        "kyee.quyiyuan.satisfaction.satisfactionMenu.service",
        "kyee.quyiyuan.appointment.doctor_detail.service"
    ])
    .type("service")
    .name("MedicalGuideService")
    .params([
        "$state","HttpServiceBus","CacheServiceBus","KyeeMessageService",
        "ReportMultipleService","SatisfactionDoctorService","SatisfactionMenuService",
        "SatisfactionHospitalService","AppointmentRegistDetilService","ClinicPaymentService","KyeeI18nService",
        "ClinicPaymentReviseService"
    ])
    .action(function(
        $state,HttpServiceBus,CacheServiceBus,KyeeMessageService,
        ReportMultipleService,SatisfactionDoctorService,SatisfactionMenuService,
        SatisfactionHospitalService, AppointmentRegistDetilService,ClinicPaymentService,KyeeI18nService,
        ClinicPaymentReviseService){
        var def = {
            scope:undefined,
            //请求数据全局变量
            medicalGuideRecord:undefined,
            resultData:undefined,

            loadStore:function(loadStoreCallbackFunc,isShowLoading){
                var me = this;
                HttpServiceBus.connect({
                    url: 'multibusiness/action/VisitTreeAcionC.jspx',
                    showLoading:isShowLoading,
                    params: {
                        op: 'getVisitTreeActionC',
                        queryMethod:'visitTree',
                        USER_VS_ID:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                        USER_ID:CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        HOSPITAL_ID:CacheServiceBus.getStorageCache().get("hospitalInfo").id,
                        //  PATIENT_ID:patientId,
                        LIMIT:3,
                        //  QUEUE_TYPE:0,//排队模式
                        LIMIT_AR:10//默认取端上的预约挂号条数
                    },
                    onSuccess: function (records) {
                        if(records.success){
                            me.medicalGuideRecord=records.data;
                            //就医记录医院分组数据,key值医院ID，value值医院ID对应的就医记录
                            var hospitalData={};
                            me.doSetAppointData(hospitalData);
                            me.doSetRegistData(hospitalData);
                            me.doSetFeeResultData(hospitalData);
                            me.doSetReportResultData(hospitalData);
                            var resultData = me.getHospitalGroupData(hospitalData);
                            //begin by gyl 把查询到的门诊业务存放在缓存中 KYEEAPPC-3962
                            def.resultData = resultData;
                            //end by gyl KYEEAPPC-3962
                            loadStoreCallbackFunc(resultData);
                        }else{
                            var errorMsg = records.message;
                            if(errorMsg!=null&&errorMsg!=undefined&&errorMsg!=''){
                                KyeeMessageService.message({
                                    title:KyeeI18nService.get('commonText.tipMsg','提示'),
                                    content:errorMsg
                                });
                            }else{
                                KyeeMessageService.message({
                                    title:KyeeI18nService.get('commonText.tipMsg','提示'),
                                    content: KyeeI18nService.get('myquyi->MAIN_TAB.medicalGuide.queryFail','查询失败')
                                });
                            }
                        }
                    }
                })
            },
            getHospitalGroupData : function(hospitalDatas){
                var hospitalGroupDatas=[];
                for(var hospitalId in hospitalDatas)
                {
                    var hospitalName = '';
                    var hospitalData = hospitalDatas[hospitalId];
                    if(hospitalData.appointList.length>0)
                    {
                        hospitalName = hospitalData.appointList[0].hospitalName;
                    }
                    else if(hospitalData.registList.length>0)
                    {
                        hospitalName = hospitalData.registList[0].hospitalName;
                    }
                    else if(hospitalData.feeList.length>0)
                    {
                        hospitalName = hospitalData.feeList[0].hospitalName;
                    }
                    else if(hospitalData.reportList.length>0)
                    {
                        hospitalName = hospitalData.reportList[0].hospitalName;
                    }
                    var hospitalGroupData=angular.copy(hospitalData);
                    hospitalGroupData.hospitalName = hospitalName;
                    hospitalGroupData.hospitalId =hospitalId;
                    hospitalGroupDatas.push(hospitalGroupData);
                }
                return hospitalGroupDatas;
            },
            //初始化预约数据
            doSetAppointData: function (hospitalData) {
                var appointList = [];
                var appointResult=this.medicalGuideRecord.appointNodeInfo;//预约信息
                if(appointResult !=null && appointResult !=undefined && appointResult.length>0){
                    var yyDetailStr='';
                    var length=appointResult.length<4 ? appointResult.length:3;//取三条
                    for(var i=0;i<length;i++){
                        //时间格式化
                        var reg_date=appointResult[i].REG_DATE;
                        if(reg_date!=null&&reg_date!=''&&reg_date!=undefined){
                            reg_date=appointResult[i].REG_DATE.toString().substr(5,5);
                        }else{
                            reg_date='';
                        }
                        //上午、下午
                        var clinic_duration=appointResult[i].CLINIC_DURATION;
                        if(clinic_duration!=null&&clinic_duration!=''&& clinic_duration!=undefined){
                            if(clinic_duration.indexOf(' ')>-1){
                                clinic_duration=clinic_duration.substring(clinic_duration.lastIndexOf('/')+1).split(' ')[0];
                            }else{
                                clinic_duration=clinic_duration.substring(clinic_duration.lastIndexOf('/')+1);
                            }
                        }else{
                            clinic_duration='';
                        }
                        // begin by 高玉楼 APPCOMMERCIALBUG-1593 日期和号源时间段显示用空格分割
                        var time=reg_date+' '+clinic_duration;
                        //end by 高玉楼 APPCOMMERCIALBUG-1593

                        var deptName=appointResult[i].DEPT_NAME;//预约科室

                        var type=parseInt(appointResult[i].TYPE);//类型：预约、挂号等

                        var statusType=parseInt(appointResult[i].APPOINT_TYPE);//状态类型：处理中等
                        //begin 预约挂号记录页面中，如果预约成功，且有签到状态优先显示签到状态 By 高玉楼 KYEEAPPC-2693
                        var signType = undefined;
                        if(type==0){
                            statusType=parseInt(appointResult[i].APPOINT_TYPE);
                            if(appointResult[i].SIGN_TYPE)
                            {
                                signType =  parseInt(appointResult[i].SIGN_TYPE);
                            }
                        }else if(type==1){
                            statusType=parseInt(appointResult[i].REGIST_TYPE);
                        }else if(type==2){
                            statusType=parseInt(appointResult[i].APPOINT_TYPE);
                        }
                        //begin (APK)将APK显示的预约挂号状态文字改为由云传给APK显示   By  张家豪 KYEEAPPC-2956
                        if(appointResult[i].STATUS_DESC && appointResult[i].STATUS_DESC_STYLE){
                            var status = appointResult[i].STATUS_DESC;//状态文字值
                            var statusColor = appointResult[i].STATUS_DESC_STYLE;
                        }
                        //end (APK)将APK显示的预约挂号状态文字改为由云传给APK显示  By  张家豪  KYEEAPPC-2956
                        var fontColor='#666';
                        if('#999999'==statusColor){
                            statusColor = '#666'
                        }
                        yyDetailStr={
                            'hospitalName':appointResult[i].HOSPITAL_NAME,
                            'time':time,
                            'deptName':deptName,
                            'status':status,
                            'statusColor':statusColor,
                            'fontColor':fontColor,
                            'appointNodeInfo':appointResult[i]
                        };
                        //如果预约记录对应的医院数据不存在，则创建医院的空的就医记录
                        if(hospitalData[appointResult[i].HOSPITAL_ID]==undefined)
                        {
                            hospitalData[appointResult[i].HOSPITAL_ID]={
                                appointList:[],
                                registList:[],
                                feeList:[],
                                reportList:[],
                                satisfactionList:[]
                            };
                        }
                        hospitalData[appointResult[i].HOSPITAL_ID].appointList.push(yyDetailStr);
                        appointList.push(yyDetailStr);
                    }
                }
                return appointList;
            },
            //初始化挂号数据
            doSetRegistData:function(hospitalData){
                var registList = [];
                var registResult=this.medicalGuideRecord.registNodeInfo;//挂号信息
                if(registResult!=undefined&&registResult!=null&&registResult.length>0){
                    var ghDetailStr='';
                    var length=registResult.length<4 ? registResult.length:3;
                    for(var i=0;i<length;i++){
                        var reg_date=registResult[i].REG_DATE;
                        if(reg_date!=null&&reg_date!=''&&reg_date!=undefined){
                            reg_date=registResult[i].REG_DATE.toString().substr(5,5);
                        }else{
                            reg_date='';
                        }
                        var clinic_duration=registResult[i].CLINIC_DURATION;
                        if(clinic_duration!=null&&clinic_duration!=''&& clinic_duration!=undefined){
                            if(clinic_duration.indexOf(' ')>-1){
                                clinic_duration=clinic_duration.split('/')[1].split(' ')[0];
                            }else{
                                clinic_duration=clinic_duration.split('/')[1];
                            }
                        }else{
                            clinic_duration='';
                        }
                        // begin by 高玉楼 APPCOMMERCIALBUG-1593 日期和号源时间段显示用空格分割
                        var time=reg_date+' '+clinic_duration;
                        // begin by 高玉楼 APPCOMMERCIALBUG-1593
                        var deptName=registResult[i].DEPT_NAME;
                        var type=parseInt(registResult[i].TYPE);
                        var statusType=parseInt(registResult[i].REGIST_TYPE);
                        if(type==0){
                            statusType=parseInt(registResult[i].APPOINT_TYPE);
                        }else if(type==1){
                            statusType=parseInt(registResult[i].REGIST_TYPE);
                        }else if(type==2){
                            statusType=parseInt(registResult[i].APPOINT_TYPE);
                        }
                        //begin (APK)将APK显示的预约挂号状态文字改为由云传给APK显示   By  张家豪 KYEEAPPC-2956
                        if(registResult[i].STATUS_DESC && registResult[i].STATUS_DESC_STYLE){
                            var status=registResult[i].STATUS_DESC;//状态文字值
                            var statusColor = registResult[i].STATUS_DESC_STYLE;
                        }
                        //end (APK)将APK显示的预约挂号状态文字改为由云传给APK显示  By  张家豪  KYEEAPPC-2956
                        var fontColor='#666';
                        if('#999999'==statusColor){
                            statusColor='#666';
                        }
                        ghDetailStr={
                            'hospitalName':registResult[i].HOSPITAL_NAME,
                            'time':time,
                            'deptName':deptName,
                            'status':status,
                            'statusColor':statusColor,
                            'fontColor':fontColor,
                            'registNodeInfo':registResult[i]
                        };

                        //如果挂号记录对应的医院数据不存在，则创建医院的空的就医记录
                        if(hospitalData[registResult[i].HOSPITAL_ID]==undefined)
                        {
                            hospitalData[registResult[i].HOSPITAL_ID]={
                                appointList:[],
                                registList:[],
                                feeList:[],
                                reportList:[],
                                satisfactionList:[]
                            };
                        }
                        hospitalData[registResult[i].HOSPITAL_ID].registList.push(ghDetailStr);

                        registList.push(ghDetailStr);

                    }
                }
                return registList;
            },
            //初始化缴费数据
            doSetFeeResultData:function(hospitalData){
                var feeList = [];
                var feeResult=this.medicalGuideRecord.treatmentCostsInfo;//缴费信息
                var sortFeeResult='';
                if(feeResult!=undefined&&feeResult!=null&&feeResult!=''){
                    sortFeeResult=feeResult.sort(function(a,b){return new Date(b.VISIT_DATE)- new Date(a.VISIT_DATE)});
                }
                if(sortFeeResult!=undefined&&sortFeeResult!=null&&sortFeeResult.length>0){
                    var feeDetailStr='';
                    var length=sortFeeResult.length<4 ? sortFeeResult.length:3;
                    for(var i=0;i<length;i++){
                        var visit_date=sortFeeResult[i].VISIT_DATE;
                        if(visit_date!=null&&visit_date!=''&&visit_date!=undefined){
                            visit_date=sortFeeResult[i].VISIT_DATE.toString().substr(5,5);
                        }else{
                            visit_date='';
                        }
                        var account_sum=sortFeeResult[i].ACCOUNT_SUM;
                        if(account_sum!=null&&account_sum!=''&&account_sum!=undefined){
                            account_sum=Number(sortFeeResult[i].ACCOUNT_SUM).toFixed(2);
                        }else{
                            account_sum='';
                        }
                        var showText='¥'+account_sum;
                        var countNum=sortFeeResult[i].TOTAL+KyeeI18nService.get('myquyi->MAIN_TAB.medicalGuide.size','笔');
                        //兼容老版本报告单不跨院，后台返回的医院ID和医院名称为空，则获取默认医院Id和医院名称
                        var  hospitalId = sortFeeResult[i].HOSPITAL_ID?sortFeeResult[i].HOSPITAL_ID:CacheServiceBus.getStorageCache().get("hospitalInfo").id,
                            hospitalName = sortFeeResult[i].HOSPITAL_ID?sortFeeResult[i].HOSPITAL_NAME:CacheServiceBus.getStorageCache().get("hospitalInfo").name;
                        feeDetailStr={
                            'hospitalName':hospitalName,
                            'visitDate':visit_date,
                            'showText':showText,
                            'countNum':countNum,
                            'status': KyeeI18nService.get('unPay','待缴费'),
                            'statusColor':'#EC2B10',
                            'fontColor':'#666',
                            'sortFeeResult':sortFeeResult[i]
                        };
                        //如果缴费记录对应的医院数据不存在，则创建医院的空的就医记录
                        if(hospitalData[hospitalId]==undefined)
                        {
                            hospitalData[hospitalId]={
                                appointList:[],
                                registList:[],
                                feeList:[],
                                reportList:[],
                                satisfactionList:[]
                            };
                        }
                        hospitalData[hospitalId].feeList.push(feeDetailStr);
                        feeList.push(feeDetailStr);
                    }
                }
                return feeList;
            },
            //初始化报告单数据
            doSetReportResultData:function(hospitalData){
                var reportList = [];
                var reportResult=this.medicalGuideRecord.doctorReportInfo;//报告单信息
                if(reportResult!=undefined&&reportResult!=null&&reportResult.length>0){
                    var reportDetailStr='';
                    var length=reportResult.length<4 ? reportResult.length:3;
                    for(var i=0;i<length;i++){
                        var ITEM_NAME=reportResult[i].ITEM_NAME;
                        if(ITEM_NAME!=null&&ITEM_NAME!=''&&ITEM_NAME!=undefined){
                            ITEM_NAME=reportResult[i].ITEM_NAME.substr(0,15);
                        }else{
                            ITEM_NAME='';
                        }
                        var REPORT_DATE=reportResult[i].REPORT_DATE;
                        if(REPORT_DATE!=null&&REPORT_DATE!=''&&REPORT_DATE!=undefined){
                            REPORT_DATE=reportResult[i].REPORT_DATE.toString().substr(5,5);
                        }else{
                            REPORT_DATE='';
                        }
                        var report_type= reportResult[i].REPORT_TYPE;
                        //兼容老版本报告单不跨院，后台返回的医院ID和医院名称为空，则获取默认医院Id和医院名称
                        var  hospitalId = reportResult[i].HOSPITAL_ID?reportResult[i].HOSPITAL_ID:CacheServiceBus.getStorageCache().get("hospitalInfo").id,
                            hospitalName = reportResult[i].HOSPITAL_ID?reportResult[i].HOSPITAL_NAME:CacheServiceBus.getStorageCache().get("hospitalInfo").name;
                        reportDetailStr={
                            'hospitalName':hospitalName,
                            'REPORT_DATE':REPORT_DATE,
                            'ITEM_NAME':ITEM_NAME,
                            'REPORT_TYPE':report_type
                        };
                        //如果报告单对应的医院数据不存在，则创建医院的空的就医记录
                        if(hospitalData[hospitalId]==undefined)
                        {
                            hospitalData[hospitalId]={
                                appointList:[],
                                registList:[],
                                feeList:[],
                                reportList:[],
                                satisfactionList:[]
                            };
                        }
                        hospitalData[hospitalId].reportList.push(reportDetailStr);
                        reportList.push(reportDetailStr);
                    }
                }
                return reportList;
            },
            //预约、挂号list点击
            onAppointListTap:function(record){
                AppointmentRegistDetilService.RECORD = {
                    HOSPITAL_ID: record.HOSPITAL_ID,
                    REG_ID: record.REG_ID
                };
                AppointmentRegistDetilService.ROUTE_STATE = "myquyi->MAIN_TAB.medicalGuide";
                $state.go("appointment_regist_detil");
                //AppointRegistDetailService.doSetAppointDetailParams(record);
                //$state.go("appoint_regist_detail");
            },
            //报告单list点击
            onReportListTap:function(record){
                //KYEEAPPC-4047  2.1.0报告单跨院修改 张明  2015.11.25
                ReportMultipleService.goToReport();//检查检验单
            },
            //缴费list点击
            onPaymentListTap:function(hospitalId) {
                //程铄闵 KYEEAPPC-6170 门诊缴费记录(2.2.20)
                ClinicPaymentReviseService.isMedicalInsurance(2,function (route) {
                    if(route == 'clinicPayment'){
                        ClinicPaymentService.HOSPITALID_TREE = params.HOSPITAL_ID;
                    }
                    else{
                        ClinicPaymentReviseService.HOSPITALID_TREE = params.HOSPITAL_ID;
                    }
                    $state.go(route);
                });
            },
            refresh:function(){
                def.scope.doMedicalGuideRefresh();
            }
        };
        return def;
    })
    .build();
