/**
 * 描述： 视频问诊控制器
 * 作者:  wangsannv
 * 时间:  2017年3月31日11:22:52
 */

new KyeeModule()
    .group("kyee.quyiyuan.appointment.video_interrogation.controller")
    .require([
        "kyee.quyiyuan.appointment.video_interrogation.service",
        "kyee.framework.service.view",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.appoint.appoint_appointConfirm.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.appoint.binding12320.controller",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.quyiyuan.address_manage.controller",
        "kyee.quyiyuan.appointment.create_card.controller",
        "kyee.quyiyuan.appoint.sendAddressController.controller",
        "kyee.quyiyuan.appointment.result.controller",
        "kyee.quyiyuan.appointment.video_interrogation.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service"
    ])
    .type("controller")
    .name("VideoInterrogationController")
    .params(["$scope", "$state","$ionicHistory", "KyeeViewService", "AppointConfirmService",  "AppointmentDeptGroupService",
        "CacheServiceBus", "KyeeMessageService", "QueryHisCardService", "PayOrderService", "CustomPatientService",
        "KyeeListenerRegister", "HospitalService", "RsaUtilService", "AuthenticationService",
        "AppointmentCreateCardService","AppointmentDoctorDetailService","KyeePhoneService","$ionicScrollDelegate","KyeeI18nService",
        "CommPatientDetailService","PatientCardService","OperationMonitor","$timeout","$compile","MyCareDoctorsService","HospitalSelectorService",
        "VideoInterrogationService","KyeeDeviceInfoService","KyeeUtilsService","AppointmentRegistDetilService","AppointmentRegistListService",
        "AddressmanageService","RegistConfirmService","$window"])
    .action(function ($scope, $state,$ionicHistory, KyeeViewService, AppointConfirmService, AppointmentDeptGroupService,
                      CacheServiceBus, KyeeMessageService, QueryHisCardService, PayOrderService, CustomPatientService,
                      KyeeListenerRegister, HospitalService, RsaUtilService, AuthenticationService,
                      AppointmentCreateCardService,AppointmentDoctorDetailService,KyeePhoneService,$ionicScrollDelegate,KyeeI18nService,
                      CommPatientDetailService,PatientCardService,OperationMonitor,$timeout,$compile,MyCareDoctorsService,
                      HospitalSelectorService,VideoInterrogationService,KyeeDeviceInfoService,KyeeUtilsService,AppointmentRegistDetilService,AppointmentRegistListService,
                      AddressmanageService,RegistConfirmService,$window) {
        var memoryCache = CacheServiceBus.getMemoryCache();
        var storageCache = CacheServiceBus.getStorageCache();
        var addNewCardStyle = "<div style='display: block; width: 100%;'><div style='text-align:center;vertical-align: middle;display:flex;justify-content:center;height:36px;line-height:36px;border-radius:2px;border:1px solid #5baa8a;background-color:white;margin:14px'> <i class='icon ion-plus f18 qy-green' style='display: inline-block;'></i><span class='f14 qy-green' style='padding-left: 10px;display: inline-block'> 添加新就诊卡 </span></div></div>";
        $scope.netHosRegistFeeType = VideoInterrogationService.netHosRegistFeeType; //网络医院挂号收款模式

        /**
         *  获取URL参数
         */
        function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = $window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "video_interrogation",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {

                $scope.CONFIRM_BACK = false;
                //重新从缓存中获取数据
                $scope.REG_ID = VideoInterrogationService.REG_ID;
                $scope.currentStatusCode = '1';//当前页面处于的状态-补充信息
                // 头部状态栏展示所需数据
                $scope.statusData = [
                    {
                        'statusCode': 1,
                        'statusName': '网络挂号'
                    }, {
                        'statusCode': 2,
                        'statusName': '等待接诊'

                    }, {
                        'statusCode': 3,
                        'statusName': '问诊完成'
                    }
                ];
                $scope.loadInterrogationData();
            }
        });
        $scope.loadInterrogationData = function(){

            if($scope.notEmpty(VideoInterrogationService.REG_ID)){
                $scope.PROCESS_FLAG = -1;
                $scope.requestBack = false;//详情请求是否回来
                $scope.initAppointDetail();
            }else if(($window.location.search).indexOf("wxPublicService") != -1 && getQueryString("regId")!=null){
                var regId  = getQueryString("regId");
                var hospitalId = getQueryString("hospitalId");
                var param={
                    REG_ID:regId,
                    HOSPITAL_ID:hospitalId
                };
                VideoInterrogationService.queryAppointDetail(param, function (detailData,resultCode){
                    $scope.goToComment(detailData);
                })
            } else{
                //如果主键为空，说明是从医生详情页面跳转过来（确认视频问诊）
                $scope.HAS_REG_ID = false;//是否有主键
                $scope.PROCESS_FLAG = -1;//视频问诊的阶段：-1确认阶段；1等待接诊；2问诊完成；3超时未处理
                $scope.needAddress = true;//默认地址是选中状态
                var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                HospitalService.getParamValueByName(hospitalInfo.id, "NET_HOS_QUERY_CARD_CASH,DISTRIBUTION_TYPE,DISTRIBUTION_SCOPE_SWITCH",function (hospitalPara) {
                    var netHosQueryCardCash = hospitalPara.data.NET_HOS_QUERY_CARD_CASH;//是否展示温馨提示
                    $scope.DISTRIBUTION_TYPE = hospitalPara.data.DISTRIBUTION_TYPE;//医院配送支持类型 0:不支持,1:用户自由选择,2:用户必须填写
                    var distributionScopeSwitch = hospitalPara.data.DISTRIBUTION_SCOPE_SWITCH;//是否划定配送范围 0:否,1:是
                    if(distributionScopeSwitch=='1'){
                        $scope.DISTRIBUTION_SCOPE_SWITCH =true;
                    }else{
                        $scope.DISTRIBUTION_SCOPE_SWITCH =false;
                    }
                    if(netHosQueryCardCash=='1'){
                        $scope.NET_HOS_QUERY_CARD_CASH = true;//是否展示温馨提示
                    }else{
                        $scope.NET_HOS_QUERY_CARD_CASH = false;
                    }
                    $scope.initAppointConfirm(hospitalInfo);   //初始化数据
                });
            }
        };
        //初始化数据
        $scope.initAppointConfirm = function(hospitalInfo){
            memoryCache = CacheServiceBus.getMemoryCache();
            storageCache = CacheServiceBus.getStorageCache();
            //获取缓存中医院信息
            //获取医院名称
            $scope.LOGO_PHOTO = hospitalInfo.LOGO_PHOTO;
            $scope.hospitalName=hospitalInfo.name;
            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取当前就诊者的姓名
            $scope.petientName= currentPatient.OFTEN_NAME;
            //获取缓存中当前登录用户信息
            $scope.ID_NO_STAR= getIdNo(currentPatient.ID_NO);//将身份证号转换为xxx****xxxx
            var isOnline = hospitalInfo.isOnline;
            $scope.IS_ONLINE = hospitalInfo.isOnline;
            // 网络科室标示获取从科室中获取,放入页面监控方法中
            //转诊标识
            $scope.IS_REFERRAL = 0;
            //由于ng-module只能绑定页面对象就诊者信息
            $scope.patientInf = {
                CARD_NO: "",
                CARD_SHOW: "",
                CARD_NAME:"",
                CARD_TYPE:""
            };
            //如果输入卡信息完成
            if (AppointmentCreateCardService.enterInfo) {
                $scope = AppointmentCreateCardService.confirmScope;
                $scope.patientInf.CARD_SHOW = "申请新卡";
                $scope.patientInf.CARD_NO = -1;
                $scope.PATIENT_ID = -1;
                $scope.appointConfirm();
                AppointmentCreateCardService.enterInfo = false;
                return;
            }
            else
            {
                $scope.patientInf.CARD_SHOW = undefined;
                $scope.patientInf.CARD_NO = undefined;
                $scope.PATIENT_ID = undefined;
            }

            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取缓存中当前就诊卡信息
            var currentCardinf = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
            //获取缓存中当前登录用户信息
            var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //点击视频问诊时的排班信息
            $scope.AppointconfrimSchedule = VideoInterrogationService.netWorkShedule[0].DOCTOR_SCHEDULE_LIST[0];
            //医生列表页点击预约时的医生信息
            $scope.Appointconfrimdoctor = AppointmentDoctorDetailService.doctorInfo;
            //号源信息
            $scope.ClinicSource = VideoInterrogationService.clinicDetail;
            $scope.CLINIC_DURATION = $scope.ClinicSource.rows[0].HB_TIME;
            $scope.HID = $scope.ClinicSource.rows[0].HID;
            $scope.appointClinicData=$scope.ClinicSource.rows[0];
            //start 页面需要信息
            $scope.deptCode=$scope.Appointconfrimdoctor.DEPT_CODE;
            $scope.deptName=$scope.Appointconfrimdoctor.DEPT_NAME;
            $scope.doctorName=$scope.Appointconfrimdoctor.DOCTOR_NAME;
            $scope.doctorTitle=$scope.Appointconfrimdoctor.DOCTOR_TITLE;
            $scope.DOCTOR_SEX = $scope.Appointconfrimdoctor.DOCTOR_SEX;
            $scope.DOCTOR_PIC_PATH = $scope.Appointconfrimdoctor.DOCTOR_PIC_PATH;

            $scope.clinicDuration=$scope.AppointconfrimSchedule.CLINIC_DURATION;
            $scope.clinicLabel=$scope.AppointconfrimSchedule.CLINIC_LABEL;
            $scope.clinicDate= $scope.AppointconfrimSchedule.CLINIC_DATE;//就诊日期
            $scope.clinicType= $scope.AppointconfrimSchedule.CLINIC_TYPE;
            $scope.businessType= $scope.AppointconfrimSchedule.BUSSINESS_TYPE;
            $scope.showCardNo = $scope.ClinicSource.isHidden;
            $scope.appointAmount = "¥" + $scope.AppointconfrimSchedule.SUM_FEE;
            $scope.sumFee = $scope.AppointconfrimSchedule.SUM_FEE;
            //end 页面需要信息

            //如果缓存中存在科室，则直接从缓存中获取科室信息
            if($scope.Appointconfrimdoctor)
            {
                $scope.deptData=
                {
                    DEPT_CODE:AppointmentDoctorDetailService.doctorInfo.DEPT_CODE,
                    DEPT_NAME:AppointmentDoctorDetailService.doctorInfo.DEPT_NAME
                };
            }
            else
            {
                $scope.deptData = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA;
            }


            AppointConfirmService.setClientinfo(function (Clientinfo) {

                $scope.Clientinfo = Clientinfo;
                $scope.patientInf.BIRTH_CERTIFICATE_NO = Clientinfo.BIRTH_CERTIFICATE_NO;
                $scope.trueOrfalse = function () {
                    //只读
                    if (Clientinfo.CARDNO_TO_APPOINT == 0) {
                        $scope.placeholder = "请选择就诊卡";
                        return true;
                    } else {
                        $scope.placeholder = "请输入或选择就诊卡";
                        return false;
                    }
                };
                var menus = [];
                if (Clientinfo.rows != null && Clientinfo.rows.length > 0) {
                    for (var i = 0; i < Clientinfo.rows.length; i++) {
                        if (Clientinfo.rows[i].IS_DEFAULT == '1') {
                            if(Clientinfo.SELECT_FLAG=="1"){
                                $scope.patientInf.CARD_NO = Clientinfo.rows[i].CARD_NO;
                                $scope.patientInf.CARD_SHOW = Clientinfo.rows[i].CARD_SHOW;
                                $scope.PATIENT_ID = Clientinfo.rows[i].PATIENT_ID;
                                $scope.patientInf.CARD_NAME = Clientinfo.rows[i].CARD_NAME;
                                $scope.patientInf.CARD_TYPE = Clientinfo.rows[i].CARD_TYPE;
                                //获取缓存中当前就诊者信息
                                var userVsId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                                var hospital_info = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                                var hospitalId = hospital_info.id;
                                //选中就诊者
                                //在点击确认预约、确认挂号时，发请求去后台更新默认卡
                                break;
                            }
                        } else {
                            if(Clientinfo.SELECT_FLAG=="1"){
                                $scope.patientInf.CARD_NO = Clientinfo.rows[0].CARD_NO;
                                $scope.patientInf.CARD_SHOW = Clientinfo.rows[0].CARD_SHOW;
                                $scope.PATIENT_ID = Clientinfo.rows[0].PATIENT_ID;
                                $scope.patientInf.CARD_NAME = Clientinfo.rows[0].CARD_NAME;
                                $scope.patientInf.CARD_TYPE = Clientinfo.rows[0].CARD_TYPE;
                            }
                        }
                    }

                    //选择卡组件赋值
                    for (var i = 0; i < Clientinfo.rows.length; i++) {
                        var resultMap = {};
                        if(Clientinfo.rows[i].CARD_NAME == null || Clientinfo.rows[i].CARD_NAME == undefined || Clientinfo.rows[i].CARD_NAME == ""){
                            resultMap["name"] = "";
                        }
                        else{
                            resultMap["name"] =  Clientinfo.rows[i].CARD_NAME;
                        }
                        resultMap["text"] = Clientinfo.rows[i].CARD_SHOW;
                        resultMap["value2"] = Clientinfo.rows[i].PATIENT_ID;
                        resultMap["value"] = Clientinfo.rows[i].CARD_NO;//唯一属性CARD_NO
                        resultMap["value3"] = Clientinfo.rows[i].CARD_TYPE;
                        menus.push(resultMap);
                    }
                }

                //begin 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面
                //  增加用户有卡则不显示申请新卡
                var addNewCard = false;
                if((menus.length == 0) && ('true' === $scope.Clientinfo.REMOTE_BUILD_CARD
                    || 'input' === $scope.Clientinfo.REMOTE_BUILD_CARD)){
                    var resultMap = {};
                    resultMap["name"] = "";
                    resultMap["text"] =  "申请新卡";
                    resultMap["value2"] = -1;
                    resultMap["value"] = -1;
                    resultMap["value3"] = 0;
                    menus.push(resultMap);
                    addNewCard = true;
                }
                //控制器中绑定数据：
                //查看就诊卡
                if(Clientinfo.SUPPORT_PHYSICALCARD == 1) {
                    addNewCard = true;
                }
                if(addNewCard) {
                    $scope.footerBar = addNewCardStyle;
                }
                $scope.pickerItems = menus;
                //end 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼
                //判断地址是否在范围之内
                $scope.IS_IN_DISTRIBUTION_RANGE = true;//默认是在配送范围之内
                if($scope.isAdressPromoteShow()&&$scope.DISTRIBUTION_SCOPE_SWITCH&&$scope.notEmpty($scope.Clientinfo.ADDRESS_ID)){
                    //需要收货地址  且 划定配送范围 且 有地址，则去后台验证是否范围之内
                    var paramRande = {
                        HOSPITAL_ID: hospitalInfo.id,
                        ADDRESS_ID: $scope.Clientinfo.ADDRESS_ID
                    };
                    VideoInterrogationService.isInDistributionRange(paramRande,function(isRange){
                        //地址是否在范围之内
                        $scope.IS_IN_DISTRIBUTION_RANGE  = isRange;
                    })
                }
            });
            //获取就诊卡方法
            AppointConfirmService.queryClientinfo({IS_ONLINE: isOnline});

        };
        $scope.initAppointDetail = function(){
            storageCache = CacheServiceBus.getStorageCache();
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var paramsDetil = {
                HOSPITAL_ID: hospitalinfo.id,
                REG_ID:$scope.REG_ID
            };
            VideoInterrogationService.queryAppointDetail(paramsDetil, function (detailData,resultCode){
                $scope.PROCESS_FLAG = detailData.BUSINESS_STATUS;//视频问诊的阶段：-1确认阶段；1等待接诊；2问诊完成；3超时未处理
                if($scope.PROCESS_FLAG==-1 || $scope.PROCESS_FLAG==-2){
                    $scope.currentStatusCode = '1';//当前页面处于的状态-补充信息
                }else if($scope.PROCESS_FLAG==1){
                    $scope.currentStatusCode = '2';//当前页面处于的状态-补充信息
                }else{
                    $scope.currentStatusCode = '4';//当前页面处于的状态-补充信息
                }
                if($scope.PROCESS_FLAG==3){
                    // 头部状态栏展示所需数据
                    $scope.statusData = [
                        {
                            'statusCode': 1,
                            'statusName': '网络挂号'
                        }, {
                            'statusCode': 2,
                            'statusName': '等待接诊'

                        }, {
                            'statusCode': 3,
                            'statusName': '超时未处理'
                        }
                    ];
                }else if($scope.PROCESS_FLAG==5){
                    // 头部状态栏展示所需数据
                    $scope.statusData = [
                        {
                            'statusCode': 1,
                            'statusName': '网络挂号'
                        }, {
                            'statusCode': 2,
                            'statusName': '等待接诊'

                        }, {
                            'statusCode': 3,
                            'statusName': '取消问诊'
                        }
                    ];
                }
                $scope.requestBack = true;
                $scope.HAS_REG_ID = true;//是否有主键
                $scope.needAddress = false;//默认地址是选中状态
                $scope.detailData = detailData;
                $scope.iconColor = $scope.getIconColor(detailData);//判断显示图标
                $scope.hospitalName = detailData.HOSPITAL_NAME;
                //显示数据
                $scope.deptName=detailData.DEPT_NAME;
                $scope.doctorName=detailData.DOCTOR_NAME;
                $scope.doctorTitle=detailData.CLINIC_TYPE;
                $scope.appointAmount = detailData.AMOUNT;
                $scope.DOCTOR_SEX = detailData.DOCTOR_SEX;
                $scope.DOCTOR_PIC_PATH = detailData.DOCTOR_PHOTO;
                $scope.LOGO_PHOTO = detailData.HOSPIAL_PHOTO;
                $scope.petientName = detailData.PATIENT_NAME;
                $scope.clinicDuration=detailData.CLINIC_DURATION;
                $scope.clinicLabel=detailData.CLINIC_LABEL;
                $scope.clinicDate= detailData.REG_DATE;//就诊日期
                $scope.clinicType= detailData.CLINIC_TYPE;
                $scope.ID_NO_STAR= detailData.ID_NO;
                $scope.CARD_NO_SHOW = detailData.CARD_NO;
                $scope.ADDRESS_SHOW = detailData.DRUG_DELIVERY_INFO.ADDRESS;
                $scope.sumFee = detailData.AMOUNT;
                $ionicScrollDelegate.$getByHandle("video_inteerogation_content").resize();
                $ionicScrollDelegate.$getByHandle("video_inteerogation_content").scrollTop();
            })
        };
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "video_interrogation",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToDoctorInfo();
            }
        });
        //单击返回按钮，返回到医生详情页面
        $scope.backToDoctorInfo=function(){
            if(!$scope.notEmpty(VideoInterrogationService.REG_ID)){
                AppointmentDoctorDetailService.activeTab = 2;
                $state.go("doctor_info");
            }else{
                if(VideoInterrogationService.ROUTER=='doctor_info'&&$scope.requestBack){
                    $state.go("myquyi->MAIN_TAB.medicalGuide");
                }if(VideoInterrogationService.ROUTER=='myquyi->MAIN_TAB'){
                    $state.go("myquyi->MAIN_TAB");
                }else{
                    var backView = $ionicHistory.backView();
                    if (backView && backView.stateId === "doctor_info"){
                        AppointmentDoctorDetailService.activeTab = 2;
                    }
                    $ionicHistory.goBack(-1);
                }
            }
        };

        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };

        //跳转到选择地址界面
        $scope.toAddAddress = function () {
            $state.go("address_manage");
            OperationMonitor.record("countToAddAddress", "video_interrogation");
        };

         //评价医生
        $scope.goToComment = function(detailData) {
            detailData.DOCTOR_PIC_PATH =detailData.DOCTOR_PHOTO;
            AppointmentRegistListService.goToComment(detailData);
            OperationMonitor.record("countGoToComment", "video_interrogation");
        };
        $scope.gofeedback = function () {
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("aboutquyi_feedback");
        };
        //点击确认预约挂号按钮，进行预约挂号
        $scope.toAppoint = function () {
            //获取缓存中当前登录用户信息
            var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //获取缓存中医院信息
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取缓存中当前就诊卡信息
            var currentCardinf = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
            //获取缓存中记录的患者预约输入的物理卡号
            var medicalCardNo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.MEDICAL_CARDNO);
            //预约来源
            var appointSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
            //校验就诊者卡信息
            if (!$scope.patientInf.CARD_NO || !$scope.patientInf.CARD_SHOW) {
                //校验就诊者卡失败，向后端发送家这款校验失败的请求
                AppointConfirmService.choosePatientIdCardCheck();
                // 前端校验阻塞后发送请求
                KyeeMessageService.broadcast({
                    content: "请选择就诊卡"
                });
                return;
            }
            var addressId = $scope.Clientinfo.ADDRESS_ID;
            //如果需要地址，但是没有，则需要提示
            if($scope.isAdressPromoteShow()&&$scope.needAddress){
                if(!$scope.notEmpty(addressId)){
                    KyeeMessageService.broadcast({
                        content: "请选择收货地址"
                    });
                    return;
                }else if(!$scope.IS_IN_DISTRIBUTION_RANGE){
                    KyeeMessageService.broadcast({
                        content: "该地址不在配送范围之内，请重新选择收货地址"
                    });
                    return;
                }
            }else if($scope.isAdressPromoteShow()&&!$scope.needAddress){
                addressId = "";
            }else{
                addressId = "";
            }
            // 判断出生证号是否合法
            if ($scope.birthNumberSwitchNew == "1" ) {
                var regExpress = /^[A-Za-z0-9]+$/;
                if ($scope.patientInf.BIRTH_CERTIFICATE_NO == undefined || $scope.patientInf.BIRTH_CERTIFICATE_NO == null || $scope.patientInf.BIRTH_CERTIFICATE_NO == "") {
                    KyeeMessageService.broadcast({
                        content: "请输入出生证号！",
                        duration: 3000
                    });
                    return;
                } else if (!regExpress.test($scope.patientInf.BIRTH_CERTIFICATE_NO)) {
                    KyeeMessageService.broadcast({
                        content: "出生证号不合法！",
                        duration: 3000
                    });
                    return;
                }
            }
            //如果为远程建卡
            if ($scope.PATIENT_ID == -1) {
                $scope.PATIENT_ID = '';
                $scope.patientInf.CARD_NO = '';
            }
            var paramsConfirm = {
                "hospitalId": hospitalInfo.id,  //预约用参
                "hospitalID": hospitalInfo.id,  //挂号用参
                "postdata": {
                    "DEPT_CODE": $scope.deptData.DEPT_CODE,
                    "DEPT_NAME": $scope.deptData.DEPT_NAME,
                    "DOCTOR_CODE": $scope.Appointconfrimdoctor.DOCTOR_CODE,
                    "DOCTOR_NAME": $scope.Appointconfrimdoctor.DOCTOR_NAME,
                    "MARK_DESC": $scope.AppointconfrimSchedule.CLINIC_LABEL,//号别
                    "CLINIC_TYPE": $scope.AppointconfrimSchedule.CLINIC_TYPE,
                    "REG_DATE": $scope.AppointconfrimSchedule.CLINIC_DATE,//预约日期
                    "CLINIC_DURATION": $scope.AppointconfrimSchedule.CLINIC_DURATION,//午别
                    "AMOUNT": $scope.AppointconfrimSchedule.SUM_FEE,//预约费用
                    "PATIENT_ID": $scope.PATIENT_ID,//----------------------------
                    "PATIENT_NAME": $scope.petientName,
                    "ID_NO": currentPatient.ID_NO,//身份证
                    "ID_NO_STAR": $scope.ID_NO_STAR,//加*的身份证
                    "BIRTH_CERTIFICATE_NO":$scope.patientInf.BIRTH_CERTIFICATE_NO, // 出生证号
                    "PHONE_NUMBER": currentPatient.PHONE,//不加* 的电话号码
                    "PHONE_NUMBER_STAR": $scope.PHONE_NUMBER,//加*的手机号
                    "LOC_INFO": $scope.AppointconfrimSchedule.CLINIC_POSITION,//门诊位置
                    "CARD_NO": $scope.patientInf.CARD_NO,//----------------------------------------
                    "HID": $scope.HID,//获取号源
                    "PHARMACY_FEE": $scope.AppointconfrimSchedule.PHARMACY_FEE,
                    "DIAG_FEE": $scope.AppointconfrimSchedule.DIAG_FEE,
                    "CARD_PWD": AppointmentCreateCardService.password,
                    "HB_TYPE":$scope.appointClinicData.HB_TYPE,
                    "HB_NO":$scope.appointClinicData.HB_NO,
                    "HIS_SCHEDULE_ID":''
                },
                "ONLINE_BUSINESS_TYPE":"0",//  1是购药/开单  0视频问诊
                "MARK_DESC": $scope.AppointconfrimSchedule,//号别
                "HID": $scope.HID + "/" + $scope.CLINIC_DURATION,
                "AMOUNT": $scope.AppointconfrimSchedule.SUM_FEE,
                "USER_ID": currentUser.USER_ID,
                "PATIENT_ID": $scope.PATIENT_ID,//-----------------------------
                "USER_VS_ID": currentPatient.USER_VS_ID,
                "APPOINT_SOURCE": appointSource,//预约来源
                "PHONE": currentUser.PHONE_NUMBER,
                "ADDRESS_ID":addressId,//地址ID
                "DEPT_CODE": $scope.deptData.DEPT_CODE,
                "IS_ONLINE": "1",
                "IS_REFERRAL":$scope.IS_REFERRAL,
                "REFERRAL_REG_ID":AppointmentDeptGroupService.REFERRAL_REG_ID,
                "REFERRAL_DIRECTION":AppointmentDeptGroupService.REFERRAL_DIRECTION,
                "HOSPITAL_AREA":$scope.AppointconfrimSchedule.HOSPITAL_AREA
            };
            if($scope.businessType == '0'){//预约
                //预约不缴费
                appointNoPayRequest(paramsConfirm);
            }else {// 挂号
                //确认挂号请求
                var isVerifyMedicalCard = hospitalInfo.is_regist_card_pwd;//挂号是否输入卡号，卡密码 0：不输入就诊卡号，密码 1：输入就诊卡号
                if (isVerifyMedicalCard == "1" && paramsConfirm.postdata.CARD_NO != '') {
                    //挂号需要输入卡号，密码对象
                    $scope.isVerifyRegistMedicalCard = {
                        IN_CARDNO: $scope.patientInf.CARD_NO,//无需存入缓存，现在如果挂号成功，后台会有机制将此卡号设置为默认卡号，下次会自动查询出来，前台无需处理  -张明
                        IN_CARDPWD: ""
                    };
                    //输入就诊卡密码
                    inputCardPwd(paramsConfirm);
                } else {
                    registPayRequest(paramsConfirm);
                }
            }
        };

        //预约不缴费
        var appointNoPayRequest = function (paramsConfirm) {
            //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalId,true);
            //获取缓存中医院信息
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            AppointConfirmService.confirmAppointNopay(paramsConfirm, function (data) {
                //预约不缴费处理成功，跳转到我的趣医
                if (data.success) {
                    if (hospitalInfo.id == "1001") {
                        KyeeMessageService.message({
                            title: "消息",
                            content: "体验医院仅供用户体验，不能作为实际就诊依据",
                            tapBgToClose:true,
                            onOk:function(message){
                                VideoInterrogationService.REG_ID=data.data.REG_ID;
                                $scope.REG_ID = VideoInterrogationService.REG_ID;
                                $scope.CONFIRM_BACK = true;
                                $scope.loadInterrogationData();
                            }
                        });
                    }
                    else {
                        VideoInterrogationService.REG_ID=data.data.REG_ID;
                        $scope.REG_ID = VideoInterrogationService.REG_ID;
                        $scope.CONFIRM_BACK = true;
                        $scope.loadInterrogationData();
                    }
                }
                //南京12320平台
                else if (data.message == "njFail") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: "未通过校验，请输入正确的12320账户信息"
                    });
                }
                //南京12320平台
                else if (data.message == "ckFail") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: "12320用户名或密码错误"
                    });
                }
                //南京12320平台
                else if (data.message == "bind") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content:"请绑定12320账户"
                    });
                }
                //南京12320平台
                else if (data.message == "bindPhone") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content:"请绑定手机号"
                    });
                }
                //预约失败，您今日已经在该科室预约过，不能重复预约！
                else if (data.resultCode == "0020405") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
                // 校验就诊者信息
                else if (data.resultCode == "0020638") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                    var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    var current = angular.copy(currentPatient);//可直接操作缓存问题
                    CommPatientDetailService.editPatient(current);
                }
                //请绑定就诊者的手机号后，再进行预约
                else if (data.resultCode == "0020505") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                    //TODO
                }
                //请绑定个人信息的手机号后，再进行预约
                else if (data.resultCode == "0020504") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                    //TODO
                }
                //预约不支持虚拟卡
                else if (data.resultCode == "0020503") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
                //需要实名认证后再预约挂号  By  章剑飞  KYEEAPPC-2862
                else if (data.resultCode == "0020526") {
                    if (data.data.flag == '0') {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    } else {
                        KyeeMessageService.confirm({
                            content: data.message,
                            onSelect: function (confirm) {
                                if (confirm) {
                                    AuthenticationService.lastClass = 'appointConfirm';
                                    var userInfo = memoryCache.get('currentCustomPatient');
                                    AuthenticationService.HOSPITAL_SM = {
                                        OFTEN_NAME: userInfo.OFTEN_NAME,
                                        ID_NO: userInfo.ID_NO,
                                        PHONE: userInfo.PHONE,
                                        USER_VS_ID:userInfo.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                        FLAG: data.data.flag
                                    };
                                    //跳转页面
                                    $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                }
                            }
                        });
                    }
                }
                // 黑名单提示
                else if (data.resultCode == "0020612") {
                    var buttons = [{
                        text:  "返回",
                        click: function () {
                            $scope.dialog.close();
                        }
                    }, {
                        text:"拨打电话",
                        style: "button button-block button-size-l",
                        click: function () {
                            click2call();
                        }
                    }];
                    if(data.message.indexOf('意见反馈')>-1){
                        data.message = data.message.replace('意见反馈', '<span class="qy-blue text_decoration" ng-click="gofeedback()">意见反馈</span>');
                    }
                    //弹出对话框
                    $scope.blacklistDetail = data.message;
                    footerClick();
                    $scope.dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/regist/views/delay_views/blacklist_detail.html",
                        scope: $scope,
                        title: "账号操作异常",
                        buttons: buttons
                    });
                    click2call = function () {
                        KyeePhoneService.callOnly("4000801010");
                    };
                }
                //增加爽约限制提示
                else if(data.resultCode=="0020533"){
                    $scope.userMessage = data.message;
                    var dialog = KyeeMessageService.dialog({
                        template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                        scope: $scope,
                        title:"温馨提示",
                        buttons: [
                            {
                                text: "确定",
                                style:'button-size-l',
                                click: function () {
                                    dialog.close();
                                }
                            }
                        ]
                    });
                }
                //儿童是否校验
                else if(data.resultCode == "0020539"){
                  var buttons = [{
                        text: "前往完善",
                        style: "button button-block button-size-l",
                        click: function () {
                            $scope.dialog.close();
                            var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                            patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                            patient.loginNum = "";         //短信验证码制空
                            var people = angular.copy(patient);
                            CommPatientDetailService.item = people;
                            CommPatientDetailService.F_L_A_G = "video_interrogation";
                            $state.go('comm_patient_detail');
                        }
                    }];
                    //弹出对话框
                    $scope.userMessage = data.message;
                    $scope.dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                        scope: $scope,
                        title:"温馨提示",
                        buttons: buttons
                    });
                }
                // 成人挂儿科的限制
                else if (data.resultCode == "0020620") {
                    var buttons = [{
                        text:  "确定",
                        style: "button button-block button-size-l",
                        click: function () {
                            $scope.dialog.close();
                        }
                    }];
                    //弹出对话框
                    $scope.ageLimit = data.message;
                    $scope.dialog = KyeeMessageService.dialog({
                        template: "modules/business/regist/views/delay_views/age_limit.html",
                        scope: $scope,
                        title:"温馨提示",
                        buttons: buttons
                    });
                }
                else {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
            });
        };
        //修改就诊卡输入框中的内容
        $scope.inputCardNo = function () {
            //将患者输入的卡号作为预约卡号
            $scope.patientCard.CARD_NO = $scope.patientCard.CARD_SHOW;
            //清空PATIENT_ID
            $scope.PATIENT_ID = '';
        };
        //点击选择就诊卡
        $scope.showpatientCardNo = function () {
            //begin  当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼 KYEEAPPC-2917
            if (!$scope.pickerItems.length) {
                //KYEEAPPC-4733 确认挂号跳选卡界面是否展示虚拟卡标识  wangwan 2016年1月6日11:01:43
                PatientCardService.filteringVirtualCard.isFilteringVirtual=$scope.virtualSupportType;
                PatientCardService.fromSource = "fromAppoint";
                PatientCardService.fromAppoint = true;
                $state.go("patient_card_select");

            } else {
                $scope.title = "请选择就诊卡";
                //调用显示
                //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
                $scope.showPicker($scope.patientInf.CARD_NO);
            }
            //end 当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼

            OperationMonitor.record("countPatientCardNo", "video_interrogation");
        };

        //点击添加新就诊卡时跳转界面
        $scope.toAddNewCard = function() {
            //预约挂号确认页面进入查卡页面标识
            PatientCardService.fromSource = "fromAppoint";
            PatientCardService.fromAppoint = true;
            PatientCardService.fromPatientCard = false;
            $state.go("patient_card_add");
        };

        //挂号确认界面输入就诊卡密码  张明  KYEEAPPC-3020
        var inputCardPwd = function (paramsConfirm) {
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/regist/views/delay_views/isVerifyMedicalCard.html",
                scope: $scope,
                title: KyeeI18nService.get("regist_confirm.cardVerification","挂号就诊卡验证"),
                buttons: [
                    {
                        text: KyeeI18nService.get("commonText.cancelMsg","取消"),
                        click: function () {
                            dialog.close();
                        }
                    },
                    {
                        text: KyeeI18nService.get("commonText.ensureMsg","确定"),
                        style:'button-size-l',
                        click: function () {
                            if (!$scope.isVerifyRegistMedicalCard.IN_CARDNO || !$scope.isVerifyRegistMedicalCard.IN_CARDPWD) {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("regist_confirm.cardOrPassWordCannotEmpty","就诊卡号或密码不能为空"),
                                    duration: 3000
                                });
                            } else {
                                dialog.close();
                                var psw = $scope.isVerifyRegistMedicalCard.IN_CARDPWD;
                                paramsConfirm["postdata"]["CARD_NO"] = $scope.isVerifyRegistMedicalCard.IN_CARDNO;
                                paramsConfirm["postdata"]["CARD_PWD"] = RsaUtilService.getRsaResult(psw);
                                registPayRequest(paramsConfirm);
                            }
                        }
                    }
                ]
            });
        };

        //挂号缴费
        var registPayRequest = function (paramsConfirm) {
            //在点击提交申请时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalId, true);
            //获取缓存中医院信息
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            RegistConfirmService.confirmRegist(paramsConfirm, function (data) {
                //根据请求返回判断：
                if (data.success) {

                    $scope.REG_ID = VideoInterrogationService.REG_ID =data.data.REG_ID;
                    if (data.data.businessType != "REGIST_NOPAY") {
                        data.data["MARK_DESC"] = KyeeI18nService.get("regist_confirm.markDesc","挂号费");
                        data.data["MARK_DETAIL"] = $scope.AppointconfrimSchedule.CLINIC_LABEL;
                        ///////////////////////////////
                        data.data["FEE_TYPE"] = $scope.netHosRegistFeeType; // 挂号费用收款模式  0预约挂号模式；1付费咨询模式
                        data.data["FEE_NAME"] = "挂号费"; // 费用名称
                        data.data["AMOUNT"] = $scope.sumFee;    // 费用金额
                        ///////////////////////////////////
                        data.data["flag"] = 1;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3:预约缴费
                        data.data["TRADE_NO"] = data.data.OUT_TRADE_NO;
                        data.data["hospitalID"] = hospitalInfo.id;//由于跨医院，需要将hospitalId传递到支付页面
                        data.data["HID"] = $scope.HID;
                        data.data["CARD_NO"] = $scope.patientInf.CARD_NO;
                        if ($scope.Clientinfo.rows) {
                            data.data["CARD_TYPE"] = '';
                            for (var i = 0; i <$scope.Clientinfo.rows.length; i++) {
                                if ($scope.patientInf.CARD_NO == $scope.Clientinfo.rows[i].CARD_NO) {
                                    data.data["CARD_TYPE"] = $scope.Clientinfo.rows[i].CARD_TYPE;
                                    break;
                                }
                            }
                        }
                        data.data["PATIENT_ID"] = $scope.PATIENT_ID;
                        data.data["CLINIC_DURATION"] = $scope.AppointconfrimSchedule.CLINIC_DURATION;
                        data.data["C_REG_ID"] = data.data.REG_ID;
                        //传入确认挂号路由
                        data.data["ROUTER"] = "video_interrogation";
                        PayOrderService.payData = data.data;
                        $state.go("payOrder");
                    }else{
                        $scope.CONFIRM_BACK = true;
                        $scope.loadInterrogationData();
                    }
                } else {
                    //挂号不缴费，挂号失败，请重试；
                    if (data.resultCode == "0020602") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                    // 校验就诊者信息
                    else if (data.resultCode == "0020638") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                        var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                        var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
                        CommPatientDetailService.editPatient(current);
                    }
                    //挂号缴费生成订单号失败；
                    else if (data.resultCode == " 0020606") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                    //挂号不支持虚拟卡，生成订单号失败；
                    else if (data.resultCode == "0020607") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                    //挂号手机号为空，跳转绑定默认就诊者，生成订单号失败
                    else if (data.resultCode == "0020608") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                        //跳转到默认就诊者信息维护界面
                        //$state.go("update_user");
                        {
                            var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                            patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                            patient.loginNum = "";         //短信验证码制空
                            CommPatientDetailService.item = patient;
                            CommPatientDetailService.F_L_A_G = "regist_confirm";
                            $state.go('comm_patient_detail');
                        }

                    }
                    //挂号手机号为空，跳转绑定附加就诊者，生成订单号失败；
                    else if (data.resultCode == "0020609") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                        //跳转到附加就诊者信息维护界面
                        $state.go("comm_patient_detail");
                    }
                    //需要实名认证后再预约挂号  By  章剑飞  KYEEAPPC-2862
                    else if (data.resultCode == "0020526") {
                        if (data.data.flag == '0') {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        } else {
                            KyeeMessageService.confirm({
                                content: data.message,
                                onSelect: function (confirm) {
                                    if (confirm) {
                                        AuthenticationService.lastClass = 'appointConfirm';
                                        var userInfo = memoryCache.get('currentCustomPatient');
                                        AuthenticationService.HOSPITAL_SM = {
                                            OFTEN_NAME: userInfo.OFTEN_NAME,
                                            ID_NO: userInfo.ID_NO,
                                            PHONE: userInfo.PHONE,
                                            USER_VS_ID:userInfo.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                            FLAG: data.data.flag
                                        };
                                        //跳转页面
                                        $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                    }
                                }
                            });
                        }
                    }
                    // 黑名单提示
                    else if (data.resultCode == "0020612") {
                        var buttons = [{
                            text: KyeeI18nService.get("regist_confirm.goBack","返回"),
                            click: function () {
                                $scope.dialog.close();
                            }
                        }, {
                            text: KyeeI18nService.get("regist_confirm.callServicePhone","拨打电话"),
                            style: "button button-block button-size-l",
                            click: function () {
                                click2call();
                            }
                        }];
                        if(data.message.indexOf('意见反馈')>-1){
                            data.message = data.message.replace('意见反馈', '<span class="qy-blue text_decoration" ng-click="gofeedback()">意见反馈</span>');
                        }
                        //弹出对话框
                        $scope.blacklistDetail = data.message;
                        footerClick();
                        $scope.dialog = KyeeMessageService.dialog({
                            tapBgToClose : true,
                            template: "modules/business/regist/views/delay_views/blacklist_detail.html",
                            scope: $scope,
                            title: KyeeI18nService.get("regist_confirm.accountOperationException","账号操作异常"),
                            buttons: buttons
                        });
                        click2call = function () {
                            KyeePhoneService.callOnly("4000801010");
                        };
                    }
                    //增加爽约限制提示
                    else if(data.resultCode=="0020533"){
                        $scope.userMessage = data.message;
                        var dialog = KyeeMessageService.dialog({
                            template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                            scope: $scope,
                            title: KyeeI18nService.get("regist_confirm.kindlyReminder","温馨提示"),
                            buttons: [
                                {
                                    text: KyeeI18nService.get("commonText.ensureMsg","确定"),
                                    style:'button-size-l',
                                    click: function () {
                                        dialog.close();
                                    }
                                }
                            ]
                        });
                    }
                    //儿童是否校验
                    else if(data.resultCode == "0020539"){
                        var buttons = [{
                            text:  KyeeI18nService.get("regist_confirm.confirmMsgPerfect","前往完善"),
                            style: "button button-block button-size-l",
                            click: function () {
                                $scope.dialog.close();
                                var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                                patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                                patient.loginNum = "";         //短信验证码制空
                                var people = angular.copy(patient);
                                CommPatientDetailService.item = people;
                                CommPatientDetailService.F_L_A_G = "regist_confirm";
                                $state.go('comm_patient_detail');
                            }
                        }];
                        //弹出对话框
                        $scope.userMessage = data.message;
                        $scope.dialog = KyeeMessageService.dialog({
                            template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                            scope: $scope,
                            title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                            buttons: buttons
                        });
                    }
                    // 成人挂儿科的限制
                    else if (data.resultCode == "0020620") {
                        var buttons = [{
                            text: KyeeI18nService.get("regist_confirm.confirm","确认"),
                            style: "button button-block button-size-l",
                            click: function () {
                                $scope.dialog.close();
                            }
                        }];
                        //弹出对话框
                        $scope.ageLimit = data.message;
                        $scope.dialog = KyeeMessageService.dialog({
                            template: "modules/business/regist/views/delay_views/age_limit.html",
                            scope: $scope,
                            title: KyeeI18nService.get("regist_confirm.prompt","提示"),
                            buttons: buttons
                        });
                    }
                    else {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                }
            });
        };

        //是否选择了收货地址
        $scope.isAddressShow=function(){
            if($scope.notEmpty($scope.Clientinfo.ADDRESS_NAME)&&$scope.notEmpty($scope.Clientinfo.ADDRESS_ID)){
              return true;
            }else{
                return false;
            }
        };
        //判断非空的方法
        $scope.notEmpty = function(data){
            if(data!=undefined&&data!=''&&data!=null){
                return true;
            }else{
                return false
            }
        };

        //是否需要收货地址
        $scope.isAdressPromoteShow=function(){
            //PROCESS_FLAG 视频问诊的阶段：-1确认阶段；1等待接诊；2问诊完成；3超时未处理
            if($scope.PROCESS_FLAG=='-1'&&($scope.DISTRIBUTION_TYPE=='1'||$scope.DISTRIBUTION_TYPE=='2')){
                return true;
            }else{
                return false
            }
        };
        $scope.choseNeedAddress = function(needAddress){
            //如果地址必须选，则用户必须选中地址
            if(needAddress){
                //$scope.DISTRIBUTION_TYPE=='2'则表明必须选择地址
                if($scope.DISTRIBUTION_TYPE=='2'){
                    return;
                }else{
                    $scope.needAddress = !needAddress;
                }
            }else{
                $scope.needAddress = !needAddress
            }
            $ionicScrollDelegate.$getByHandle("video_inteerogation_content").resize();
            $ionicScrollDelegate.$getByHandle("video_inteerogation_content").scrollBottom();
        };
        //日期格式化
        Date.prototype.format = function (format) {
            var o = {
                "M+": this.getMonth() + 1, //month
                "d+": this.getDate(), //day
                "h+": this.getHours(), //hour
                "m+": this.getMinutes(), //minute
                "s+": this.getSeconds(), //second
                "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
                "S": this.getMilliseconds() //millisecond
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        };

        //将身份证号转换为****
        var getIdNo = function (idNo) {
            if (idNo == null || idNo == undefined || idNo == '') {
                return;
            }
            else {
                var len = idNo.length;
                var head = idNo.substr(0, 3);
                var idNoS = head;
                var tail = idNo.substr(len - 4, 4);//substr(len - 6, 6);
                for (var i = 3; i < idNo.length - 4; i++) {
                    idNoS = idNoS + '*';
                }
                idNoS = idNoS + tail;
                return idNoS;
            }
        };
        //打开模态窗口
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
        //点击选择就诊人
        $scope.changePatient = function () {
            CustomPatientService.F_L_A_G = "video_interrogation";
            //关闭弹出的儿科限制
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("custom_patient");
            OperationMonitor.record("countChangePatient", "video_interrogation");
        };


        //选择卡号
        $scope.selectItem = function (params) {
            $scope.patientInf.CARD_SHOW = params.item.text;//展示值
            //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
            $scope.patientInf.CARD_NO = params.item.value;//唯一属性
            $scope.PATIENT_ID = params.item.value2;//第二属性
            $scope.CARD_TYPE = params.item.value3;//第三属性
            $scope.Card_Type = params.item.value3;//第三属性
            if ('input' === $scope.Clientinfo.REMOTE_BUILD_CARD) {
                AppointmentCreateCardService.confirmScope = $scope;
                $state.go('create_card_info');
            }
        };
        $scope.showChardNoInf = function(){

            $scope.userMessage ="就诊卡是医院存储您就诊卡资料的磁性卡，是您与医院挂号，付款等交互的唯一实体凭据（某些地区可由医保卡代替），由于医疗的特殊和保密性需要，每家医院的就诊卡不通用。为保证您的挂号等操作的顺利进行，请正确填选您正在使用的就诊卡。没有就诊卡的患者，请到您就诊的医院凭个人身份证办理就诊卡。";
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"温馨提示",
                buttons: [
                    {
                        text: "确定",
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("countShowChardNoInf", "video_interrogation");
        };
        //跳转到配送范围页面 吴伟刚 KYEEAPPC-2919 网络医院增加查看可配送范围
        $scope.toSendAddress = function () {
            KyeeViewService.openModalFromUrl({
                url: "modules/business/appoint/views/send_address.html",
                scope: $scope,
                animation: "scale-in"
            });
            OperationMonitor.record("countToSendAddress", "appoint_confirm");
        };
        $scope.toCancelClinic = function(detail){
            $scope.dialog = KyeeMessageService.dialog({
                template: "modules/business/appointment/views/delay_views/cancleRecord.html",
                scope: $scope,
                title: "取消提示",
                buttons: [
                    {
                        text:"取消",
                        click: function () {
                            $scope.dialog.close();
                        }
                    },
                    {
                        text: "确定",
                        style: 'button-size-l',
                        click: function () {
                            $scope.dialog.close();
                            var regCanPara = {
                                hospitalId: detail.HOSPITAL_ID,
                                regId: detail.REG_ID,
                                cRegId: detail.REG_ID
                            };
                            AppointmentRegistDetilService.appointCancel(regCanPara, function (){
                                $scope.initAppointDetail();
                                $ionicScrollDelegate.$getByHandle("video_inteerogation_content").scrollTop();
                            })
                        }
                    }
                ]
            });

        };
        $scope.getIconColor = function(detailData){
            var flag = 3;//0处理中图标，1、成功图标 2 失败图标 3不显示图标
            if(detailData.TYPE=='0'){
                if(detailData.APPOINT_TYPE=='2'||detailData.APPOINT_TYPE=='4'){
                    //预约失败、取消预约失败
                    flag = 2;
                }else if(detailData.APPOINT_TYPE=='0'||detailData.APPOINT_TYPE=='11'){
                    //预约处理中、取消预约处理中
                    flag = 0;
                }else if (detailData.APPOINT_TYPE=='1'||detailData.APPOINT_TYPE=='3'){
                    //预约成功、取消预约成功
                    flag = 1;
                }
            }else {
                if(detailData.REGIST_TYPE=='2'||detailData.REGIST_TYPE=='5'){
                    //挂号失败、取消挂号失败
                    flag = 2;
                }else if(detailData.REGIST_TYPE=='0'||detailData.REGIST_TYPE=='11'){
                    //挂号处理中、取消挂号处理中
                    flag = 0;
                }else if(detailData.REGIST_TYPE=='1'||detailData.REGIST_TYPE=='4'){
                    //挂号成功、取消挂号成功
                    flag = 1;
                }
            }
            return flag;
        }
    })
    .build();
