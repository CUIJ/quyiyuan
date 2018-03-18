/**
 * 描述：扫码随访患者选择自己的主治医生
 * 创建人：侯蕊
 * 时间：2017年09月01日09:49:42
 */
new KyeeModule()
.group("kyee.quyiyuan.patients_group.attending_doctor.controller")
.require(["kyee.quyiyuan.consultation.consult_doctor_list.controller",
    "kyee.quyiyuan.consultation.consult_doctor_list.service",
    "kyee.quyiyuan.login.service",
    "kyee.quyiyuan.patients_group.attending_doctor.service",
    "kyee.quyiyuan.appointment.doctor_detail.service",
    "kyee.quyiyuan.myquyi.my_care_doctors.service",
    "kyee.quyiyuan.hospital.hospital_selector.service",
    "kyee.quyiyuan.appointment.service"])
.type("controller")
.name("AttendingDoctorController")
.params(["$scope", "$state", "KyeeListenerRegister", "CacheServiceBus",
    "ConsultDoctorListService","LoginService","AttendingDoctorService",
    "AppointmentDoctorDetailService", "AppointmentDeptGroupService",
    "MyCareDoctorsService","HospitalSelectorService","$ionicHistory","KyeeMessageService","KyeeI18nService"])
.action(function ($scope, $state,KyeeListenerRegister,CacheServiceBus,
                  ConsultDoctorListService,LoginService,AttendingDoctorService,
                  AppointmentDoctorDetailService,AppointmentDeptGroupService,
                  MyCareDoctorsService,HospitalSelectorService,$ionicHistory,KyeeMessageService,KyeeI18nService) {
    /**
     * 描述：页面进入监听
     */
    KyeeListenerRegister.regist({
        focus: "attending_doctor",
        when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
        direction : "both",
        action:function(){
            $scope.index = '999';
            $scope.isload = false;
            if(JSON.stringify(AttendingDoctorService.patientInfo) == "{}"){
                var id_no = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).ID_NO;
                var name = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).OFTEN_NAME;
                var phone = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).PHONE;
                AttendingDoctorService.patientInfo={
                    ID_NO:id_no,
                    NAME:name,
                    PHONE_NUMBER:phone
                };
            }
            AttendingDoctorService.patientInfo.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_ID;
            AttendingDoctorService.patientInfo.USER_VS_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            var params = {
                hospitalId:AttendingDoctorService.hospitalId,
                deptCode:AttendingDoctorService.deptCode
            };
            AttendingDoctorService.getDoctorList(params,function (response) {
                if(response.success){
                   var data = response.data;
                   $scope.doctorList = data.doctorList;
                   if($scope.doctorList.length == 0){
                       $scope.showDoctorList = false;
                   }else{
                       $scope.showDoctorList = true;
                   }
                   $scope.hospitalLogo = data.hospitalLogo;
                   $scope.hospitalName = data.hospitalName;
                   $scope.deptName = data.deptName;
                   $scope.isload = true;

                }
            })
        }});


    //showTip();
    $scope.deptInfo = AttendingDoctorService.deptInfo;
    /**
     * 选择医生监听样式的变化
     */
    $scope.chooseDoctor = function(index){
        $scope.index = index;
    }
    /**
     * 监听物理键返回
     */
    KyeeListenerRegister.regist({
        focus: "attending_doctor",
        when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
        action: function () {
            $scope.goBack();
        }
    });

    /**
     * 描述：返回到主页
     */
    $scope.goBack = function(){
        $state.go('home->MAIN_TAB');
    }
    /**
     * 描述：提交保存医患关系
     */
    $scope.submit = function(){
        var doctor = $scope.doctorList[$scope.index];
        var params = {
            USER_ID: AttendingDoctorService.patientInfo.USER_ID,
            scDoctorId:doctor.scDoctorId
        };
        AttendingDoctorService.SaveDoctorPatient(params,function (response) {
            if(response.success){}else{}
        });
        $scope.goToDoctorInfo(doctor);
    }

    $scope.goToConsultDoctor = function(){
        ConsultDoctorListService.hospitalId = AttendingDoctorService.hospitalId;
        $state.go("consult_doctor_list");
    }

    /**
     * [goToDoctorInfo 跳转至医生主页]
     * @param  {[type]} doctor [description]
     * @return {[type]}        [description]
     */
    $scope.goToDoctorInfo = function(doctor){
        var deptData = {
            DEPT_CODE: doctor.deptCode,
            DEPT_NAME: doctor.dept,
            IS_ONLINE: doctor.isOnline,
            DOCTOR_NAME: doctor.name,
            DOCTOR_TITLE: doctor.title,
            HOSPITAL_NAME: doctor.hospital
        };
        var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        if(hospitalInfo && hospitalInfo.id === doctor.hospitalId) {  //若当前选择的医院与该医生所在的医院一样 不切换医院
            setDoctorInfoData(doctor, deptData);
        } else { //当前选择的医院与该医生所在的医院不一样 需要切换医院
            MyCareDoctorsService.queryHospitalInfo(doctor.hospitalId, function (responseData) {  //查询医院信息
                HospitalSelectorService.selectHospital(doctor.hospitalId, responseData.HOSPITAL_NAME, // 切换医院
                    responseData.MAILING_ADDRESS, responseData.PROVINCE_CODE, responseData.PROVINCE_NAME,
                    responseData.CITY_CODE, responseData.CITY_NAME, "医院正在切换中...", function (response) {
                        setDoctorInfoData(doctor, deptData);
                    });
            });
        }
    };
    /**
     * 跳转至医生主页前 向service中存值
     * @param doctor 医生信息
     * @param deptData 科室信息
     */
    function setDoctorInfoData(doctor, deptData){

        //获取缓存中当前就诊者信息  若是此页面去掉了登录过滤 此处需修改
        var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
        AppointmentDoctorDetailService.doctorInfo = {
            HOSPITAL_ID: doctor.hospitalId,
            DEPT_CODE: doctor.deptCode,
            DEPT_NAME: doctor.dept,
            USER_VS_ID: userVsId,
            DOCTOR_CODE: doctor.doctorCode,
            DOCTOR_NAME: doctor.name,
            DOCTOR_TITLE: doctor.title,
            HOSPITAL_NAME: doctor.hospital,
            DOCTOR_DESC: doctor.feature,
            DOCTOR_PIC_PATH: doctor.photo,
            DOCTOR_SEX:doctor.sex
        };
        //跳到医生列表页，将科室放入
        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
        AppointmentDoctorDetailService.activeTab = 1;  //医生主页显示咨询医生tab
        $state.go('doctor_info');
    }
}).build();