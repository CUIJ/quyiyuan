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
    .group("kyee.quyiyuan.appointment.add.clinic.management.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("AddClinicManagementService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "AppointmentDeptGroupService"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, AppointmentDeptGroupService) {
        //获取预约科室
        var doctorData = {

            HOSPITAL_INFO:undefined,//跳转到抢号添加页面，则需要传递医院信息
            DOCTOR_INFO:undefined,//跳转到抢号添加页面，则需要传递医生信息
            ROUTER:null,
            rush_type:undefined,//跳转到抢号管理页，传递自动抢号/有号提醒标识

            //
            queryCanRushScheduleList: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getCanRushScheduleActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        BUSSINESS_TYPE:params.bussinessType,
                        DOCTOR_CODE: params.DOCTOR_CODE,
                        USER_VS_ID:params.USER_VS_ID,
                        TYPE:params.ADD_CLINIC_TYPE
                      //  TYPE:DOCTOR_INFO.ADD_CLINIC_TYPE
                        //IS_ONLINE:params.IS_ONLINE//KYEEAPPC-3907 查询医生列表增加IS_ONLINE字段
                        //IS_REFERRAL:params.IS_REFERRAL
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //   var doctorList = doctorData.dealdoctorListArr(data.data.rows);
                            var doctorList=data.data.rows;
                            var doctorListNew = [];
                            //var clinicDateWeek = "";
                            var scheduleDateType = "";
                            var scheduleDateColourOfType = "";
                            ////获取當前年月日
                            //$scope.datet = new Date();
                            //$scope.dated = KyeeUtilsService.DateUtils.formatFromDate( $scope.datet, 'YYYY/MM/DD');
                            for (var i = 0; i < doctorList.length; i++) {
                                var doctor =doctorList[i];
                                doctor.CLINIC_IS_TAKEN = false;
                                //var clinicDate = new Date(doctorList[i].CLINIC_DATE);          //当前日期
                                //clinicDateWeek = clinicDate.getDay();
                                //doctor.CLINIC_DATE_WEEK = clinicDateWeek;//当前周的第几
                                if(doctorList[i].DOCTOR_SCHEDULE_LIST.length == 0){
                                    scheduleDateType = "无排班";
                                    doctor.SCHEDULE_TEXT = "";
                                    doctor.SCHEDULE_COLOUR = "qy-grey7";
                                    doctor.SCHEDULE_TYPE = "0";//0:无排班  1:有号   2：可抢号  3：待放号
                                }else{
                                    if(doctorList[i].RUSH_SCHEDULE_FLAG == 1){
                                        //预估的排班
                                        //scheduleDateType = "待放号";
                                        //scheduleDateColourOfType = 2;//蓝色
                                        doctor.SCHEDULE_TEXT = "待放号";
                                        doctor.SCHEDULE_COLOUR =  "blueOptional";//蓝色
                                        doctor.SCHEDULE_TYPE = "3";//0:无排班  1:有号   2：可抢号  3：待放号
                                    }else{
                                        //真实的排班
                                        if(doctorData.checkClinicAble(doctorList[i])){
                                            //doctor.SCHEDULE_TEXT =  "有号";
                                            doctor.SCHEDULE_TEXT =  "";
                                            doctor.SCHEDULE_COLOUR = "qy-grey7";
                                            doctor.SCHEDULE_TYPE = "1";//0:无排班  1:有号   2：可抢号  3：待放号
                                        }else{
                                            //scheduleDateType = "可抢号";
                                            //scheduleDateColourOfType = 1;//橙色
                                            doctor.SCHEDULE_TEXT = "可抢号";
                                            doctor.SCHEDULE_COLOUR = "orangeOptional";//橙色
                                            doctor.SCHEDULE_TYPE = "2";//0:无排班  1:有号   2：可抢号  3：待放号
                                        }
                                    }
                                }
                                doctorListNew.push(doctor);
                            }
                            //var resultData = doctorData.dealDoctorData(doctorList,params.ADD_CLINIC_TYPE);
                            ////专家职称过滤
                            //resultData["FILTER_CONDITIONS"]=data.data.FILTER_CONDITIONS;
                            ////是否展示专家过滤条件
                            //resultData["IS_SHOW_FILTER_CONDITIONS"]=data.data.IS_SHOW_FILTER_CONDITIONS;
                            onSuccess(data.data, doctorListNew);

                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            queryDoctorScheduleFee: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDoctorScheduleFeeActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        BUSSINESS_TYPE:params.bussinessType,
                        DOCTOR_CODE: params.DOCTOR_CODE,
                        USER_VS_ID:params.USER_VS_ID,
                        TYPE:params.ADD_CLINIC_TYPE
                        //IS_ONLINE:params.IS_ONLINE//KYEEAPPC-3907 查询医生列表增加IS_ONLINE字段
                        //IS_REFERRAL:params.IS_REFERRAL
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
            checkClinicAble:function(scheduleTypeList){
               var isClinicAble = "";
               for(var t =0;t<scheduleTypeList.DOCTOR_SCHEDULE_LIST.length;t++){
                if(scheduleTypeList.DOCTOR_SCHEDULE_LIST[t].ISTIME == 1){
                    isClinicAble = true;
                    break;
                }else{
                    isClinicAble = false;
                }
               }
               return isClinicAble;
            },
            //获取科室医生列表,获取预约挂号医生排班
            queryDoctorList: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDoctorListActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        BUSSINESS_TYPE:params.bussinessType,
                        DOCTOR_CODE: params.DOCTOR_CODE,
                        USER_VS_ID:params.USER_VS_ID
                        //IS_ONLINE:params.IS_ONLINE//KYEEAPPC-3907 查询医生列表增加IS_ONLINE字段
                        //IS_REFERRAL:params.IS_REFERRAL
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //   var doctorList = doctorData.dealdoctorListArr(data.data.rows);
                            var doctorList=data.data.rows;
                            var resultData = doctorData.dealDoctorData(doctorList,params.ADD_CLINIC_TYPE);
                            //专家职称过滤
                            resultData["FILTER_CONDITIONS"]=data.data.FILTER_CONDITIONS;
                            //是否展示专家过滤条件
                            resultData["IS_SHOW_FILTER_CONDITIONS"]=data.data.IS_SHOW_FILTER_CONDITIONS;
                            onSuccess(data.data, resultData);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //处理医生列表数据
            dealDoctorData: function (doctorList,ADD_CLINIC_TYPE) {
                var resultData = {};//返回医生数据
                var arrisschudleTime = [];//科室下全部医生的号源
                var doctorScheduleTime={};//医生是否有号
                var arrdateConditions = [];//科室下全部医生的排班时间
                var doctorListIsEmpty = false;
                if(doctorList.length==0) {
                    doctorListIsEmpty = true;
                }
                for (var i = 0; i < doctorList.length; i++) {
                    //默认改医生下没有j号源
                    doctorList[i].DOCTOR_SPECIAL_CLINIC = false;
                    doctorList[i].DOCTOR_SCORE = parseFloat(doctorList[i].DOCTOR_SCORE);
                    doctorData.dealDoctorDic(doctorList[i],doctorList[i].DOCTOR_DESC);
                    doctorData.removeRepeateSchedule(doctorList[i],ADD_CLINIC_TYPE);
                    var isschudleTime = [];//一个医生的号源
                    var dateConditions = [];//一个医生的有号日期
                    for (var k = 0; k < doctorList[i].DOCTOR_SCHEDULE_LIST.length; k++) {
                        var isTime = doctorList[i].DOCTOR_SCHEDULE_LIST[k].ISTIME;//一个医生的排班号源 1：有，0：无
                        //如果是转诊,则判断j号源数量是否为空  KYEEAPPC-6916
                        var specialApptCount = doctorList[i].DOCTOR_SCHEDULE_LIST[k].SPECIAL_APPT_COUNT;
                        var specialRegCount =doctorList[i].DOCTOR_SCHEDULE_LIST[k].SPECIAL_REG_COUNT;
                        isTime = doctorList[i].DOCTOR_SCHEDULE_LIST[k].ISTIME;//一个医生的排班号源 1：有，0：无
                        isschudleTime.push(isTime);
                        if(isTime==='1')
                        {
                            dateConditions.push(doctorList[i].DOCTOR_SCHEDULE_LIST[k].CLINIC_DATE);
                        }
                        arrdateConditions.push(dateConditions);
                    }
                    arrisschudleTime.push(isschudleTime);
                    if (arrisschudleTime[i].indexOf("1") != -1) {
                        doctorScheduleTime[doctorList[i].DOCTOR_CODE]="有号";

                    } else {
                        doctorScheduleTime[doctorList[i].DOCTOR_CODE]="无号";
                    }

                }
                var dateConarr = doctorData.dealarrdateConditions(arrdateConditions);
                //有号医生的过滤
                resultData["arrisschudleTime"] = doctorScheduleTime;
                resultData["arrdateConditions"] = dateConarr;
                resultData["doctorListArr"] = doctorList;
                resultData["doctorListIsEmpty"] = doctorListIsEmpty;
                return resultData;
            },
            /*
             * 处理医生介绍数据
             */
            dealDoctorDic:function(doctorList,doctorDic){
                if(doctorDic==null && doctorDic==undefined){
                    doctorList.DOCTOR_DESC_SHOW="暂无信息";
                }else{
                    doctorList.DOCTOR_DESC_SHOW= doctorDic;
                }
            },

            removeRepeateSchedule:function(doctorData,ADD_CLINIC_TYPE)
            {
                var doctorScheduleDatas = doctorData.DOCTOR_SCHEDULE_LIST;
                var doctorSchedule = [];
                for(var j=0;j<doctorScheduleDatas.length;j++){
                    //可预约的排班移除掉（约满0和暂不可约3的保留）
                    if(doctorScheduleDatas[j].ISTIME==="0"||doctorScheduleDatas[j].ISTIME==="3"){
                        //放号提醒，保留挂号排班
                        if(ADD_CLINIC_TYPE=="0"){
                            doctorSchedule.push(doctorScheduleDatas[j]);
                        }else if(doctorScheduleDatas[j].BUSSINESS_TYPE=="0") {
                            doctorSchedule.push(doctorScheduleDatas[j]);
                        }
                    }
                }
                doctorScheduleDatas =doctorSchedule;
                var doctorScheduleArray = [];
                if(doctorScheduleDatas.length)
                {
                    doctorScheduleArray.push(doctorScheduleDatas[0])
                }
                for(var i=1;i<doctorScheduleDatas.length;i++)
                {

                        if(doctorScheduleDatas[i].CLINIC_DATE!==doctorScheduleDatas[i-1].CLINIC_DATE||
                            doctorScheduleDatas[i].CLINIC_DURATION!==doctorScheduleDatas[i-1].CLINIC_DURATION)
                        {
                            doctorScheduleArray.push(doctorScheduleDatas[i]);
                        }

                }
                doctorData.DOCTOR_SCHEDULE_LIST = doctorScheduleArray;
            },
            //end 预约挂号医生列表整改 By 高玉楼
            //过滤重复时间，将有号源的时间转换维数组
            dealarrdateConditions: function (arrdateConditions) {
                var dateConditionsarr = [];
                for (var i = 0; i < arrdateConditions.length; i++) {
                    for (var k = 0; k < arrdateConditions[i].length; k++) {
                        //如果当前数组的第i已经保存进了临时数组，那么跳过，
                        //否则把当前项push到临时数组里面
                        if (dateConditionsarr.indexOf(arrdateConditions[i][k]) == -1) {
                            dateConditionsarr.push(arrdateConditions[i][k]);
                        }
                    }
                }
                return dateConditionsarr.sort();
            },
            confirm: function (rushParam, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "addRushClinicActionC",
                        SCHEDULE_DATA:rushParam.SCHEDULE_DATA,
                        RUSH_SCHEDULE_ID:rushParam.RUSH_SCHEDULE_ID,
                        RUSH_CLINIC_DATE:rushParam.RUSH_CLINIC_DATE,
                        RUSH_CLINIC_DURATION:rushParam.RUSH_CLINIC_DURATION,
                        BUSSINESS_TYPE:rushParam.BUSSINESS_TYPE,
                        DEPT_CODE:rushParam.DEPT_CODE,
                        DEPT_NAME:rushParam.DEPT_NAME,
                        DOCTOR_CODE:rushParam.DOCTOR_CODE,
                        DOCTOR_NAME:rushParam.DOCTOR_NAME,
                        HOSPITAL_ID:rushParam.HOSPITAL_ID,
                        USER_ID:rushParam.USER_ID,
                        USER_VS_ID:rushParam.USER_VS_ID,
                        TYPE:rushParam.TYPE,
                        LONG_TERM:rushParam.LONG_TERM,
                        PATIENT_ID:rushParam.PATIENT_ID,
                        CARD_NO:rushParam.CARD_NO,
                        CARD_PWD:rushParam.CARD_PWD,
                        PATIENT_NAME:rushParam.PATIENT_NAME,
                        IS_CREATE_CARD:rushParam.IS_CREATE_CARD,
                        ADVICE_AMOUNT:rushParam.ADVICE_AMOUNT,
                        IS_ONLY_ZERO:rushParam.IS_ONLY_ZERO,
                        MARK_DESC:rushParam.MARK_DESC
                    },
                    onSuccess: function (data) {
                        //if (data.success) {
                            onSuccess(data);
                        //} else {
                        //    KyeeMessageService.broadcast({
                        //        content: data.message,
                        //        duration: 3000
                        //    });
                        //}
                    }
                });
            },
           judgeExit:function(rushParam, onSuccess){
               HttpServiceBus.connect({
                   url: "/appoint/action/AppointActionC.jspx",
                   params: {
                       op: "judgeRushDetailExitActionC",
                       SCHEDULE_ID:rushParam.SCHEDULE_ID,
                       CLINIC_DATE:rushParam.CLINIC_DATE,
                       CLINIC_DURATION:rushParam.CLINIC_DURATION,
                       DEPT_CODE:rushParam.DEPT_CODE,
                       DOCTOR_CODE:rushParam.DOCTOR_CODE,
                       HOSPITAL_ID:rushParam.HOSPITAL_ID,
                       USER_ID:rushParam.USER_ID,
                       USER_VS_ID:rushParam.USER_VS_ID,
                       TYPE:rushParam.TYPE,
                       LONG_TERM:rushParam.LONG_TERM,
                       CARD_NO:rushParam.CARD_NO
                   },
                   showLoading:false,
                   onSuccess: function (data) {
                           onSuccess(data);
                   }
               });
           },
            judgeExitByDate:function(rushParam, onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "judgeRushDetailExitActionC",
                        //SCHEDULE_ID:rushParam.SCHEDULE_ID,
                        CLINIC_DATE:rushParam.CLINIC_DATE,
                        //CLINIC_DURATION:rushParam.CLINIC_DURATION,
                        DEPT_CODE:rushParam.DEPT_CODE,
                        DOCTOR_CODE:rushParam.DOCTOR_CODE,
                        HOSPITAL_ID:rushParam.HOSPITAL_ID,
                        USER_ID:rushParam.USER_ID,
                        USER_VS_ID:rushParam.USER_VS_ID,
                        TYPE:rushParam.TYPE,
                        LONG_TERM:rushParam.LONG_TERM,
                        CARD_NO:rushParam.CARD_NO
                    },
                    showLoading:true,
                    onSuccess: function (data) {
                        onSuccess(data);
                    }
                });
            },
            //根据主键ID获取用户添加的抢号明细
            getInfoByRushId:function(hospitalId,rushId, onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDetailInfoByRushIdActionC",
                        HOSPITAL_ID:hospitalId,
                        RUSH_ID:rushId
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
            //查询用户当天添加是否超过限制次数
            getUserRushNumber:function(userId,type, onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getUserRushNumberActionC",
                        USER_ID:userId,
                        TYPE:type
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
            //取消抢号记录
            cancelRush:function(hospitalId,rushId, onSuccess){
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "updateCancelRushActionC",
                        HOSPITAL_ID:hospitalId,
                        RUSH_ID:rushId
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
            }
        };

        return doctorData;
    })
    .build();

