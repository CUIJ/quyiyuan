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
    .group("kyee.quyiyuan.appointment.appointment_doctor.service")
    .require(["kyee.framework.service.message", "kyee.quyiyuan.appointment.service"])
    .type("service")
    .name("AppointmentDoctorService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "AppointmentDeptGroupService"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, AppointmentDeptGroupService) {
        //获取预约科室
        var doctorData = {
            //二级科室数据
            JUNIORDEPT_DEPT:{},
            //医生含排版数据
            DOCTOR_LIST: {},
            //获取科室医生列表
            queryDoctorData: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDoctorListActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        BUSSINESS_TYPE:params.bussinessType,
                        DOCTOR_CODE: params.DOCTOR_CODE,
                        USER_VS_ID:params.USER_VS_ID,
                        IS_ONLINE:params.IS_ONLINE,//KYEEAPPC-3907 查询医生列表增加IS_ONLINE字段
                        IS_REFERRAL:params.IS_REFERRAL
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                         //   var doctorList = doctorData.dealdoctorListArr(data.data.rows);
                            var doctorList=data.data.rows;
                            var resultData = doctorData.dealDoctorData(doctorList,params.IS_REFERRAL);
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
            /**
             * 描述：页面初始化获取咨询条款配置
             * 作者：侯蕊
             * 时间：2017年08月09日14:38:36
             */
            queryConsultTips:function(hospitalId,onSuccess){
                HttpServiceBus.connect({
                    url: "third:pay_consult/getHospitalConsultClause",
                    params: {
                        hospitalId: hospitalId
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

            //by jiangpin 查询是否为复诊患者信息
            queryIsSecondVisit:function(param, onSuccess){
            HttpServiceBus.connect({
                url:"third:pay_consult/queryIsSecondVisitInfo",
                showLoading: true,
                params:{
                    userId: param.userId,
                    userVsId: param.userVsId,
                    hospitalId: param.hospitalId,
                    deptCode: param.deptCode,
                    doctorCode: param.doctorCode,
                    idCardNo: param.idCardNo,
                    patientName: param.patientName,
                    phone: param.phone,
                    patientId: param.patientId
                },
                onSuccess:function(data){
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
        //是否获取患者位置信息
        queryIsGetPatientPosition:function(hospitalId, onSuccess){
            HttpServiceBus.connect({
                url:"third:pay_consult/queryIsGetPatientPosition",
                showLoading: true,
                params:{
                    hospitalId: hospitalId,
                },
                onSuccess:function(data){
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

            //处理医生列表数据
            dealDoctorData: function (doctorList,isReferral) {
                var resultData = {};//返回医生数据
                var arrisschudleTime = [];//科室下全部医生的号源
                var doctorScheduleTime={};//医生是否有号
                var arrdateConditions = [];//科室下全部医生的排班时间
                for (var i = 0; i < doctorList.length; i++) {
                    //默认改医生下没有j号源
                    doctorList[i].DOCTOR_SPECIAL_CLINIC = false;
                    doctorList[i].DOCTOR_SCORE = parseFloat(doctorList[i].DOCTOR_SCORE);
                    doctorData.dealDoctorDic(doctorList[i],doctorList[i].DOCTOR_DESC);
                    //将医生排班中的白天排班拆分成上下午排班
                 //   doctorData.splitDayToMorningAndAfternoon(doctorList[i]);
                    //医生排班排序
                   //doctorList[i].DOCTOR_SCHEDULE_LIST.sort(doctorData.compare());
                    //剔除排班重复数据，如果挂号和预约时间重复则只保留挂号数据
                    doctorData.removeRepeateSchedule(doctorList[i]);
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
                            //预约判断j号源数量，大于0 则前台显示转诊号源
                            if(isReferral==2&&doctorList[i].DOCTOR_SCHEDULE_LIST[k].BUSSINESS_TYPE == "0"&&specialApptCount>0){
                                doctorList[i].DOCTOR_SPECIAL_CLINIC=true;
                            }
                            //挂号判断j号源数量，大于0 则前台显示转诊号源
                            if(isReferral==2&&doctorList[i].DOCTOR_SCHEDULE_LIST[k].BUSSINESS_TYPE == "1"&&specialRegCount>0){
                                doctorList[i].DOCTOR_SPECIAL_CLINIC=true;
                            }
                        }
                        arrdateConditions.push(dateConditions);
                    }
                    arrisschudleTime.push(isschudleTime);
                  if (arrisschudleTime[i].indexOf("1") != -1) {
                       doctorScheduleTime[doctorList[i].DOCTOR_CODE]="有号";
                  }else {
                      if(arrisschudleTime[i].indexOf("3")!= -1) {
                          doctorScheduleTime[doctorList[i].DOCTOR_CODE]="暂不可约";
                      } else if(arrisschudleTime[i].indexOf("2")!= -1){
                          doctorScheduleTime[doctorList[i].DOCTOR_CODE]="已下班";
                      }else{
                          doctorScheduleTime[doctorList[i].DOCTOR_CODE]="无号";
                      }
                  }
                }
                var dateConarr = doctorData.dealarrdateConditions(arrdateConditions);
                //有号医生的过滤
                resultData["arrisschudleTime"] = doctorScheduleTime;
                resultData["arrdateConditions"] = dateConarr;
                resultData["doctorListArr"] = doctorList;
                return resultData;
            },
            /*
             * 处理医生介绍数据
             */
            dealDoctorDic:function(doctorList,doctorDic){
                if(doctorDic==null && doctorDic==undefined){
                    doctorList.DOCTOR_DESC_SHOW="暂无信息";
                }else{
                    /*if (doctorDic.length > 35) {
                        doctorList.DOCTOR_DESC_SHOW= doctorDic.substring(0,35) + "...";
                    }
                    else{*/
                        doctorList.DOCTOR_DESC_SHOW= doctorDic;
                   /* }*/
                }
            },

            /**
             * 如果医生排班中有白天，把白天排班拆分成上下午排班
             * @param doctorData 医生对象
             */
            //splitDayToMorningAndAfternoon:function(doctorData)
            //{
            //    var doctorScheduleDatas = doctorData.DOCTOR_SCHEDULE_LIST;
            //    var doctorScheduleArray = [];
            //    for(var i=0;i<doctorScheduleDatas.length;i++)
            //    {
            //        var doctorScheduleData = doctorScheduleDatas[i];
            //        if('白天'===doctorScheduleData.CLINIC_DURATION)
            //        {
            //            doctorScheduleData.CLINIC_DURATION_SHOW = '上午';
            //            doctorScheduleArray.push(doctorScheduleData);
            //            var afternoonScheduleData = angular.copy(doctorScheduleData);
            //            afternoonScheduleData.CLINIC_DURATION_SHOW = '下午';
            //            doctorScheduleArray.push(afternoonScheduleData);
            //        }
            //        else
            //        {
            //            doctorScheduleData.CLINIC_DURATION_SHOW = doctorScheduleData.CLINIC_DURATION;
            //            doctorScheduleArray.push(doctorScheduleData);
            //        }
            //    }
            //    doctorData.DOCTOR_SCHEDULE_LIST = doctorScheduleArray;
            //},
            /**
             * 删除重复的医生排班。当一个医生同一时间既有预约排班又有挂号排班，则只保留排班信息
             */
            removeRepeateSchedule:function(doctorData)
            {
                var doctorScheduleDatas = doctorData.DOCTOR_SCHEDULE_LIST;
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
            //过滤有号医生
            //dealarrdoctor:function(doctorList,doctorScheduleTime){
            //    var doctorSour=[];
            //for(var i=0;i<doctorList.length;i++){
            //    if(doctorScheduleTime[doctorList[i].DOCTOR_CODE]=="有"){
            //        doctorSour.push(doctorList[i]);
            //    }
            //}
            //    return doctorSour;
            //},
            //查询号源
            queryAppointSource: function (params, onSuccess) {
                if('consultationFlag' in params){
                    var param = {
                        op: "getClinicDetailActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        CLINIC_DATE: params.clinicDate,
                        HB_TIME: params.hbTime,
                        DOCTOR_CODE: params.doctorCode,
                        //               PATIENT_ID: params.patientId,
                        USER_VS_ID: params.userVsId,
                        IS_ONLINE: params.IS_ONLINE,
                        HIS_SCHEDULE_ID : params.hisScheduleId,
                        IS_REFERRAL:params.IS_REFERRAL,
                        consultationFlag:params.consultationFlag
                    }
                }else{
                    var param = {
                        op: "getClinicDetailActionC",
                        hospitalID: params.hospitalId,
                        DEPT_CODE: params.deptCode,
                        CLINIC_DATE: params.clinicDate,
                        HB_TIME: params.hbTime,
                        DOCTOR_CODE: params.doctorCode,
                        //               PATIENT_ID: params.patientId,
                        USER_VS_ID: params.userVsId,
                        IS_ONLINE: params.IS_ONLINE,
                        HIS_SCHEDULE_ID : params.hisScheduleId,
                        IS_REFERRAL:params.IS_REFERRAL
                    }
                }
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: param,
                    onSuccess: function (data) {
                        onSuccess(data);
                        /*if (data.success) {
                            var ClinicDetail = data.data;
                            onSuccess(ClinicDetail);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }*/
                    }
                });
            },
            //获取分级科室医生列表
            findDoctorData: function (params, onSuccess) {
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDoctorByAreaActionC",
                        PROVINCE_CODE: params.PROVINCE_CODE,
                        JUNIORDEPT_ID:params.JUNIORDEPT_ID,
                        CITY_CODE:params.CITY_CODE,
                        CLINIC_DATES:params.CLINIC_DATES,
                        HOSPITAL_ID:params.HOSPITAL_ID,
                        PAGE:params.PAGE
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //   var doctorList = doctorData.dealdoctorListArr(data.data.rows);
                            var doctorList=data.data.DOCTOR_LIST;//医生列表
                            //var resultData = doctorData.dealDoctorData(doctorList);
                            onSuccess(data.data.HOSPITAL_LIST, doctorList);
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

