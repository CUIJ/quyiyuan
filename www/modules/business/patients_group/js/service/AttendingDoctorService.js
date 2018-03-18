/**
 * 作者：侯蕊
 * 描述：增加扫码随访选择主治医生页面
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.attending_doctor.service")
    .require([])
    .type("service")
    .name("AttendingDoctorService")
    .params([
        "HttpServiceBus",
        "KyeeMessageService",
        "KyeeI18nService",
        "CacheServiceBus"
    ])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeI18nService,CacheServiceBus) {
        var def = {
            doctorInfo:{},
            patientInfo:{},
            deptInfo:{},

            /**
             * 描述：根据科室信息获取该科室的医生列表
             */
            getDoctorList: function(params, success, fail){
                HttpServiceBus.connect({

                    url: "third:patientDoctor/follow/doctor/list",
                    params: {
                        hospitalId:params.hospitalId,
                        deptCode:params.deptCode
                    },
                    showLoading: params.showLoading,
                    onSuccess: function(response){
                        typeof success === 'function' && success(response);
                    },
                    onError: function(error){
                        typeof fail === 'function' && fail(error);
                    }
                });
            },
            /**
             * 描述：保存扫码随访的医患关系
             * 创建人：侯蕊
             * 时间：2017年09月01日09:49:42
             */
            SaveDoctorPatient: function(params, success, fail){
                HttpServiceBus.connect({

                    url: "third:patientDoctor/follow/doctor/save",
                    params: {
                        USER_ID:params.USER_ID,
                        scDoctorId:params.scDoctorId
                    },
                    showLoading: params.showLoading,
                    onSuccess: function(response){
                        typeof success === 'function' && success(response);
                    },
                    onError: function(error){
                        typeof fail === 'function' && fail(error);
                    }
                });
            },
            /**
             * 描述：调用医院+获取用户信息
             * 创建人：陈艳婷
             * 时间：2017年10月26日18:36:26
             * @param params
             */
            getHplusUserInf: function(params,success, fail){
                HttpServiceBus.connect({
                    url: "third:patientDoctor/follow/hplus/userInfo",
                    params: {
                        hospitalizationNo:params.hospitalizationNo,//住院号
                        clinicNo:params.clinicNo,//门诊号
                        phoneNumber:params.phoneNumber,//手机号
                        idNo:params.idNo,//身份证号
                        patientName:params.patientName,//姓名
                        deptType:params.deptType,//科室类型（undefined;0：住院；1：门诊）
                        hospitalId:params.hospitalId,
                        isChild:params.isChild //是否儿童（0否，1是）
                    },
                    showLoading: true,
                    onSuccess: function(response){
                        typeof success === 'function' && success(response);
                    },
                    onError: function(error){
                        typeof fail === 'function' && fail(error);
                    }
                });
            },
            /**
             * 描述：调用HCRM获取随访记录
             * 创建人：陈艳婷
             * 时间：2017年11月1日17:27:09
             * @param params
             */
            getHplusFollowTab: function(params,success, fail){
                HttpServiceBus.connect({
                    url: "third:patientDoctor/follow/hcrm/getTab",
                    params: {
                        phoneNumber:params.phoneNumber,//手机号
                        idNo:params.idNo,//身份证号
                        patientName:params.patientName,//姓名
                        deptType:params.deptType,//科室类型（undefined;0：住院；1：门诊）
                        hospitalId:params.hospitalId,
                        hospitalizationNo:params.hospitalizationNo,//住院号
                        clinicNo:params.clinicNo  //门诊号
                    },
                    showLoading: false,
                    onSuccess: function(response){
                        typeof success === 'function' && success(response);
                    },
                    onError: function(error){
                        typeof fail === 'function' && fail(error);
                    }
                });
            }
        }
        return def;
    }).build();
