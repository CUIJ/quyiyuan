/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月20日19:45:28
 * 创建原因：预约挂号医生详情页面服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.doctor_detail.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("AppointmentDoctorDetailService")
    .params(["HttpServiceBus", "KyeeMessageService", "KyeeUtilsService", "CacheServiceBus"])
    .action(function (HttpServiceBus, KyeeMessageService, KyeeUtilsService, CacheServiceBus) {
        var def = {
            APPOINTMENT_NOTICE:undefined,
            doctorInfo: undefined,
            selSchedule:undefined,
            CLINIC_SOURCE:'',
            CLINIC_DETAIL:'',
            timePeriodShow:'',
            networkFlag:'',
            //网络医院传递的医院信息  edit by wangwan
            hospitalInfo:'',
            //跳转到确认挂号或确认预约的历史轨迹，
            historyRoute:-1,
            activeTab: 0,  //医生主页默认展示预约挂号tab

            doctorQRcodeData: null, //扫码关注医生跳转至医生主页传递的数据
            //全局参数
            memoryCache: CacheServiceBus.getMemoryCache(),
            //缓存数据
            storageCache: CacheServiceBus.getStorageCache(),
            //获取医生排班信息
            loadData: function (getData, doctorInfo) {
                var me = this;
                var storageCache = CacheServiceBus.getStorageCache();
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: {
                        op: "getDoctorListActionC",
                        DEPT_CODE: doctorInfo.DEPT_CODE,
                        DOCTOR_CODE: doctorInfo.DOCTOR_CODE,
                        hospitalID: storageCache.get('hospitalInfo').id
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var doctorList = data.data.rows;
                            if(doctorList.length == 0){
                                getData(me.doctorInfo);i++
                            }else{
                                doctorList[0].HOSPITAL_NAME = storageCache.get('hospitalInfo').name;
                                doctorList[0].HOSPITAL_ID = storageCache.get('hospitalInfo').id;
                                doctorList[0].DEPT_NAME = doctorInfo.DEPT_NAME;
                                if(me.doctorInfo.BUSSINESS_TYPE != undefined){  //从我的关注中进入
                                    var scheduleListAll = doctorList[0].DOCTOR_SCHEDULE_LIST;
                                    var scheduleList = [];
                                    for(var i=0; i<scheduleListAll.length; i++){
                                        if(scheduleListAll[i].BUSSINESS_TYPE == me.doctorInfo.BUSSINESS_TYPE){
                                            scheduleList.push(scheduleListAll[i]);
                                        }
                                    }
                                    doctorList[0].DOCTOR_SCHEDULE_LIST = scheduleList;
                                    me.doctorInfo = doctorList[0];
                                }else{
                                    me.doctorInfo = doctorList[0];
                                }
                                getData(me.doctorInfo);
                            }
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //加载关注信息
            loadDoctorCareInfo: function(getData, doctorInfo){
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalId= storageCache.get('hospitalInfo').id;
                var me = this;

                var memoryCache = CacheServiceBus.getMemoryCache();
                var userVsId = undefined;
                if(memoryCache.get('currentCustomPatient') != undefined){
                    userVsId = memoryCache.get('currentCustomPatient').USER_VS_ID;
                }
                HttpServiceBus.connect({
                    url: "patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params: {
                        op: "queryDoctorCareInfo",
                        hospitalId:hospitalId,
                        doctorCode:doctorInfo.DOCTOR_CODE,
                        userVsId: userVsId,
                        DEPT_CODE:doctorInfo.DEPT_CODE
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data.data);
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
             * [careDoctor (取消)关注医生]
             * @param  {[string]} careStatus [关注状态: 0(取消关注)，1(关注)]
             * @param  {[number]} careSource [关注来源: 0(患者手动关注，默认)，1(扫医生二维码关注)]
             * @return {[type]}            [description]
             */
            careDoctor: function (careStatus, careSource) {
                var hospitalId= this.storageCache.get('hospitalInfo').id;
                //表示网络医院的hospital_id
                if(this.networkFlag=='1'){
                    hospitalId =this.hospitalInfo.HOSPITAL_ID
                }
                var doctorCode = this.doctorInfo.DOCTOR_CODE;
                var deptCode = this.doctorInfo.DEPT_CODE;
                var userVsId = "";
                var patientId = "";
                var currentCustomPatient = this.memoryCache.get('currentCustomPatient');
                var currentCardInfo = this.memoryCache.get('currentCardInfo');
                if (currentCustomPatient != undefined && currentCustomPatient.USER_VS_ID != undefined){
                    userVsId = currentCustomPatient.USER_VS_ID;
                }
                if ( currentCardInfo != undefined){
                    patientId = currentCardInfo.PATIENT_ID;
                }

                HttpServiceBus.connect({
                    url: "patientwords/action/PatientWordsActionC.jspx",
                    showLoading: false,
                    params: {
                        op: 'saveCareDoctor',
                        hospitalId: hospitalId,
                        doctorCode: doctorCode,
                        careFlag: careStatus,
                        patientId: patientId,
                        userVsId: userVsId,
                        DEPT_CODE: deptCode,
                        careSource: careSource || 0
                    },
                    onSuccess: function (data) {
                        if (!data.success) {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                    }
                });
            },
            //start wangwan 判断有没有挂号 KYEEAPPC-3577
            //判断用户有无挂号
            judgeRegist:function(networkDoctorInfo,onsuccess){
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    showLoading: false,
                    params: {
                        op: "getDoctorDetailActionC",
                        HOSPITAL_ID:networkDoctorInfo.HOSPITAL_ID,
                        DEPT_CODE:networkDoctorInfo.DEPT_CODE,
                        DOCTOR_CODE:networkDoctorInfo.DOCTOR_CODE,
                        IS_ONLINE:networkDoctorInfo.IS_ONLINE,
                        USER_ID:networkDoctorInfo.USER_ID,
                        USER_VS_ID:networkDoctorInfo.USER_VS_ID

                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onsuccess(data.data);
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
             * (取消)关注医生
             * @param param
             *   {
             *      hospitalId [number] [必传]
             *      doctorCode [string] [必传]
             *      careFlag   [number] [必传] //(取消)关注标志: 1(关注); 0(取消关注)
             *      userVsId   [number] [必传]
             *      deptCode   [string] [必传]
             *      careSource [number] [必传]//关注来源: 0(患者手动关注，默认)，1(扫医生二维码关注)
             *      patientId  [number] [非必传]
             *      showLoading[boolean] [非必传]
             *    }
             * @param success
             * @param error
             */
            careDoctor2: function(param, success, error){
                HttpServiceBus.connect({
                    url: "patientwords/action/PatientWordsActionC.jspx",
                    showLoading: param.showLoading || false,
                    params: {
                        op: 'saveCareDoctor',
                        hospitalId: param.hospitalId,
                        doctorCode: param.doctorCode,
                        careFlag: param.careFlag,
                        userVsId: param.userVsId,
                        DEPT_CODE: param.deptCode,
                        careSource: param.careSource || 0,
                        patientId: param.patientId
                    },
                    onSuccess: function (response) {
                        if (response.success) {
                            typeof success === 'function' && success(response);
                        } else {
                            typeof error === 'function' && error(response);
                        }
                    },
                    onError: function (err) {
                        typeof error === 'function' && error(err);
                    }
                });
            },

            /**
             * 获取当前选择的医院的id
             * @returns {null}
             */
            getCurrentHospitalId: function(){
                var hospitalInfo = this.storageCache.get('hospitalInfo');
                return hospitalInfo ? hospitalInfo.id : null;
            },

            /**
             * 获取医生列表(医生信息中包含排班)
             * @param param
             *  {
             *    hospitalId, 若不传，则取当前选择的医院
             *    deptCode
             *    doctorCode, 若不传，则获取医生列表, 若传此值，则只查询该医生的信息，包括排班
             *    showLoading 若不传 则展示加载圈
             *  }
             * @param success
             * @param fail
             */
            getDoctorList: function (param, success, fail) {
                var hospitalId = param.hospitalId || this.getCurrentHospitalId();
                if (!hospitalId) { return; }
                if("hid" in param || 'consultationFlag' in param) {
                    var params = {
                            op: "getDoctorListActionC",
                            hospitalID: hospitalId,
                            DEPT_CODE: param.deptCode,
                            DOCTOR_CODE: param.doctorCode,
                            assignDate: param.assignDate,
                            hid:param.hid,
                            consultationFlag:param.consultationFlag
                        }
                }else{
                    var params = {
                        op: "getDoctorListActionC",
                        hospitalID: hospitalId,
                        DEPT_CODE: param.deptCode,
                        DOCTOR_CODE: param.doctorCode,
                        assignDate: param.assignDate,
                    }
                }
                HttpServiceBus.connect({
                    url: "appoint/action/AppointActionC.jspx",
                    params: params,
                    showLoading: param.showLoading,
                    onSuccess: function (response) {
                        if (response.success) {
                            typeof success === 'function' && success(response.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: response.message,
                                duration: 3000
                            });
                            typeof fail === 'function' && fail(response);
                        }
                    },
                    onError: function(error) {
                        typeof fail === 'function' && fail(error);
                    }
                });
            }
        };
        return def;
    })
    .build();

