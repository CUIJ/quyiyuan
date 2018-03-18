/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/5
 * 创建原因：确认预约控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appoint.appointConfirm.controller")
    .require([
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
        "kyee.quyiyuan.appointment.result.controller"
    ])
    .type("controller")
    .name("AppointConfirmController")
    .params(["$scope", "$state","$ionicHistory", "KyeeViewService", "AppointConfirmService",  "AppointmentDeptGroupService",
        "CacheServiceBus", "KyeeMessageService", "QueryHisCardService", "PayOrderService", "CustomPatientService",
        "KyeeListenerRegister", "AppointmentRegistDetilService", "HospitalService", "RsaUtilService", "AuthenticationService",
        "AppointmentCreateCardService","AppointmentDoctorDetailService","KyeePhoneService","$ionicScrollDelegate","KyeeI18nService",
        "CommPatientDetailService","PatientCardService","OperationMonitor","$timeout","$compile","MyCareDoctorsService","HospitalSelectorService","CenterUtilService"])
    .action(function ($scope, $state,$ionicHistory, KyeeViewService, AppointConfirmService, AppointmentDeptGroupService,
                      CacheServiceBus, KyeeMessageService, QueryHisCardService, PayOrderService, CustomPatientService,
                      KyeeListenerRegister, AppointmentRegistDetilService, HospitalService, RsaUtilService, AuthenticationService,
                      AppointmentCreateCardService,AppointmentDoctorDetailService,KyeePhoneService,$ionicScrollDelegate,KyeeI18nService,
                      CommPatientDetailService,PatientCardService,OperationMonitor,$timeout,$compile,MyCareDoctorsService,HospitalSelectorService,CenterUtilService) {
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
        var getStarIdNo = function (idNo) {
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
        //将手机号转换为****
        var getStarPhoneNum = function (phoneNum) {
            if (phoneNum == null || phoneNum == undefined || phoneNum == '') {
                return;
            }
            else {
                var len = phoneNum.length;
                var head = phoneNum.substr(0, 3);
                var phoneS = head;
                var tail = phoneNum.substr(len - 4, 4);
                for (var i = 3; i < phoneNum.length - 4; i++) {
                    phoneS = phoneS + '*';
                }
                phoneS = phoneS + tail;
                return phoneS;
            }
        };
        //打开模态窗口
        openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };
        //全局参数
        var memoryCache = CacheServiceBus.getMemoryCache();
        var archiveobj;
        var registobj;
        var temp;
        var addNewCardStyle = "<div style='display: block; width: 100%;'><div style='text-align:center;vertical-align: middle;display:flex;justify-content:center;height:36px;line-height:36px;border-radius:2px;border:1px solid #5baa8a;background-color:white;margin:14px'> <i class='icon ion-plus f18 qy-green' style='display: inline-block;'></i><span class='f14 qy-green' style='padding-left: 10px;display: inline-block'> 添加新就诊卡 </span></div></div>";
        //缓存数据
        var storageCache = CacheServiceBus.getStorageCache();
        var selSchedule=[];
        //组件kyee-area-picker-directive调用的方法onFinashAdrress中的默认值
        var savedValue = {};
        var amountType;//挂号费别：0:普通；1:特殊人群优惠

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "appoint_confirm",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                if($scope.isCardReturn) {
                    $scope.isCardReturn = false;
                    $ionicHistory.goBack(-4);
                } else {
                    $ionicHistory.goBack(AppointmentDoctorDetailService.historyRoute);
                }
            }
        });

        $scope.goBack=function(){
            if($scope.isCardReturn) {
                $scope.isCardReturn = false;
                $ionicHistory.goBack(-4);
            } else {
                $ionicHistory.goBack(AppointmentDoctorDetailService.historyRoute);
            }
        };
        //By maoruikang  儿童号增加处理需求
        $scope.childrenLimit = {
            age:"",
            dept:"",
            info:""
        };
        //By  高萌  触发组件修改患者地址
        // 就诊者现居地数据结构  By  高萌
        $scope.addressModelPresent={
            LIVE_ADDRESS_TEXT:null,
            LIVE_PROVINCE_CODE:null,
            LIVE_PROVINCE_NAME:null,
            LIVE_CITY_CODE:null,
            LIVE_CITY_NAME:null,
            LIVE_PLACE_CODE:null,
            LIVE_PLACE_NAME:null,
            ADDRESS:null };
        // 就诊者出生地数据结构
        $scope.addressModelBirth={
            BIRTH_PROVINCE_CODE:null,
            BIRTH_PROVINCE_NAME:null,
            BIRTH_CITY_CODE:null,
            BIRTH_CITY_NAME:null,
            BIRTH_PLACE_CODE:null,
            BIRTH_PLACE_NAME:null,
            ADDRESS:null};
        // 前台展示患者居住地的默认地址  By  高萌    KYEEAPPC-5789
        if (storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == "" || storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == undefined
            || storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO) == null){
            $scope.addressModelPresent.ADDRESS = "";
            $scope.addressModelBirth.ADDRESS = "";
            $scope.addressModelPresent.LIVE_PROVINCE_NAME = "";
            $scope.addressModelPresent.LIVE_CITY_NAME = "";
            $scope.addressModelPresent.LIVE_PLACE_NAME = "";
            $scope.addressModelPresent.LIVE_PROVINCE_CODE = "";
            $scope.addressModelPresent.LIVE_CITY_CODE = "";
            $scope.addressModelPresent.LIVE_PLACE_CODE = "";
            $scope.addressModelBirth.BIRTH_PROVINCE_NAME = "";
            $scope.addressModelBirth.BIRTH_CITY_NAME = "";
            $scope.addressModelBirth.BIRTH_PLACE_NAME = "";
            $scope.addressModelBirth.BIRTH_PROVINCE_CODE = "";
            $scope.addressModelBirth.BIRTH_CITY_CODE = "";
            $scope.addressModelBirth.BIRTH_PLACE_CODE = "";
            savedValue = {
                "0" : "",
                "1" : "",
                "2" : ""
            };
        }
        else{
            $scope.nowPosition = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LOAD_CURRENT_CITY_INFO);
            $scope.addressModelPresent.ADDRESS = $scope.nowPosition.PROVINCE_NAME + "省-"+$scope.nowPosition.CITY_NAME+"-"+$scope.nowPosition.PLACE_NAME;
            $scope.addressModelBirth.ADDRESS = $scope.addressModelPresent.ADDRESS;
            $scope.addressModelPresent.LIVE_PROVINCE_NAME = $scope.nowPosition.PROVINCE_NAME + "省";
            $scope.addressModelPresent.LIVE_CITY_NAME = $scope.nowPosition.CITY_NAME;
            $scope.addressModelPresent.LIVE_PLACE_NAME = $scope.nowPosition.PLACE_NAME;
            $scope.addressModelPresent.LIVE_PROVINCE_CODE = $scope.nowPosition.PROVINCE_CODE;
            $scope.addressModelPresent.LIVE_CITY_CODE = $scope.nowPosition.CITY_CODE;
            $scope.addressModelPresent.LIVE_PLACE_CODE = $scope.nowPosition.PLACE_CODE;
            $scope.addressModelBirth.BIRTH_PROVINCE_NAME = $scope.nowPosition.PROVINCE_NAME + "省";
            $scope.addressModelBirth.BIRTH_CITY_NAME = $scope.nowPosition.CITY_NAME;
            $scope.addressModelBirth.BIRTH_PLACE_NAME = $scope.nowPosition.PLACE_NAME;
            $scope.addressModelBirth.BIRTH_PROVINCE_CODE = $scope.nowPosition.PROVINCE_CODE;
            $scope.addressModelBirth.BIRTH_CITY_CODE = $scope.nowPosition.CITY_CODE;
            $scope.addressModelBirth.BIRTH_PLACE_CODE = $scope.nowPosition.PLACE_CODE;
            savedValue = {
                "0" : $scope.nowPosition.PROVINCE_CODE,
                "1" : $scope.nowPosition.CITY_CODE,
                "2" : $scope.nowPosition.PLACE_CODE
            };
        }

        //html调用kyee-area-picker-directive组件修改现居地和出生地
        $scope.onFinashAdrress = function(params){
            if(showBirthAddress){
                savedValue = {
                    "0" : params[0].value,
                    "1" : params[1].value,
                    "2" : params[2].value
                };
                $scope.rs = params[0].text + "（" + params[0].value + "）" + params[1].text + "（" + params[1].value + "）" + params[2].text + "（" + params[2].value + "）"
                $scope.addressModelBirth.BIRTH_PROVINCE_CODE=params[0].value;
                $scope.addressModelBirth.BIRTH_PROVINCE_NAME=params[0].text;
                $scope.addressModelBirth.BIRTH_CITY_CODE=params[1].value;
                $scope.addressModelBirth.BIRTH_CITY_NAME=params[1].text;
                $scope.addressModelBirth.BIRTH_PLACE_CODE=params[2].value;
                $scope.addressModelBirth.BIRTH_PLACE_NAME=params[2].text;
                //对港澳台地区进行特殊处理
                if( $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='710000' ||  $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='820000' ||   $scope.addressModelBirth.BIRTH_PROVINCE_CODE=='810000'){
                    $scope.addressModelBirth.ADDRESS= $scope.addressModelBirth.BIRTH_PROVINCE_NAME;
                }else{
                    $scope.addressModelBirth.ADDRESS= $scope.addressModelBirth.BIRTH_PROVINCE_NAME+"-"+ $scope.addressModelBirth.BIRTH_CITY_NAME+"-"+ $scope.addressModelBirth.BIRTH_PLACE_NAME;
                }
            }
            else{
                savedValue = {
                    "0" : params[0].value,
                    "1" : params[1].value,
                    "2" : params[2].value
                };
                $scope.rs = params[0].text + "（" + params[0].value + "）" + params[1].text + "（" + params[1].value + "）" + params[2].text + "（" + params[2].value + "）"
                $scope.addressModelPresent.LIVE_PROVINCE_CODE=params[0].value;
                $scope.addressModelPresent.LIVE_PROVINCE_NAME=params[0].text;
                $scope.addressModelPresent.LIVE_CITY_CODE=params[1].value;
                $scope.addressModelPresent.LIVE_CITY_NAME=params[1].text;
                $scope.addressModelPresent.LIVE_PLACE_CODE=params[2].value;
                $scope.addressModelPresent.LIVE_PLACE_NAME=params[2].text;
                //对港澳台地区进行特殊处理
                if( $scope.addressModelPresent.LIVE_PROVINCE_CODE=='710000' || $scope.addressModelPresent.LIVE_PROVINCE_CODE=='820000' ||  $scope.addressModelPresent.LIVE_PROVINCE_CODE=='810000'){
                    $scope.addressModelPresent.ADDRESS= $scope.addressModelPresent.LIVE_PROVINCE_NAME;
                }else{
                    $scope.addressModelPresent.ADDRESS= $scope.addressModelPresent.LIVE_PROVINCE_NAME+"-"+ $scope.addressModelPresent.LIVE_CITY_NAME+"-"+ $scope.addressModelPresent.LIVE_PLACE_NAME;
                }
            }
            return true;
        };
        // 获取当前位置  By 高萌  KYEEAPPC-5789
        $scope.bindDirective = function(params){
            $scope.show = params.show;
        };
        var showBirthAddress = true;//区分是触发出生地址还是居住地，若该值为true，表示触发的是出生地址，否则是居住地。
        $scope.goBirthAddress = function(){
            showBirthAddress = true;
            $scope.$apply();
            $scope.show(savedValue);
            OperationMonitor.record("countGoBirthAddress", "appoint_confirm");
        };
        $scope.goPresentAddress = function(){
            showBirthAddress = false;
            $scope.$apply();
            $scope.show(savedValue);
            OperationMonitor.record("countGoPresentAddress", "appoint_confirm");
        };

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "appoint_confirm",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                $scope.isCardReturn = false;
                if(PatientCardService.fromAppoint ||  PatientCardService.fromSource == "fromAppoint") {
                    //清空从就诊卡管理页面跳转标识
                    $scope.isCardReturn = true;
                    PatientCardService.fromAppoint = false;
                    PatientCardService.fromSource = undefined;
                }
                //是否从医生主页进入
                $scope.isDoctorInfoEnter = ($ionicHistory.backView().stateName == "doctor_info");
                if($scope.isDoctorInfoEnter) {
                    $scope.isCardReturn = false
                }
                memoryCache = CacheServiceBus.getMemoryCache();
                storageCache = CacheServiceBus.getStorageCache();
                var rushMessageData = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA);
                //pushtype = 1; 有号提醒有余号；pushtype = 2; 有号提醒过期pushtype = 3; 抢号成功pushtype = 4; 抢号失败pushtype = 5; 抢号过期
                if(rushMessageData && (rushMessageData.status == 1)) {
                    var postData = rushMessageData.pageData.POST_DATA;
                    postData.HOSPITAL_ID = rushMessageData.pageData.HOSPITAL_ID;
                    postData.historyRoute = rushMessageData.pageData.historyRoute;
                    postData.USER_ID = rushMessageData.pageData.USER_ID;
                    postData.BUSSINESS_TYPE = rushMessageData.pageData.BUSSINESS_TYPE;
                    postData.RUSH_ID = rushMessageData.pageData.RUSH_ID;
                    postData.CLINIC_DATE = postData.REG_DATE;
                    if(rushMessageData.pageData.POST_DATA.AMOUNT){
                        postData.SUM_FEE = parseFloat(rushMessageData.pageData.POST_DATA.AMOUNT).toFixed(2);
                    }else{
                        postData.SUM_FEE = 0.00;
                    }
                    var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);

                    if(hospitalinfo.id==postData.HOSPITAL_ID){
                        // 把缓存里面的数据传给service
                        AppointmentDoctorDetailService.selSchedule = postData;
                        AppointmentDoctorDetailService.doctorInfo = postData;
                        AppointmentDoctorDetailService.CLINIC_DETAIL = {
                            rows:[]
                        };
                        AppointmentDoctorDetailService.CLINIC_DETAIL.rows.push(postData);
                        AppointmentDoctorDetailService.CLINIC_DETAIL.isHidden = postData.isHidden;
                        AppointmentDoctorDetailService.CLINIC_DETAIL.APPOINT_PAY_WAY = postData.APPOINT_PAY_WAY;
                        AppointmentDoctorDetailService.CLINIC_SOURCE = null;
                        AppointmentDoctorDetailService.ARCHIVE_FEE = postData.ARCHIVE_FEE;
                        //获取hospital_id切换缓存中医院
                        memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, undefined);
                        $scope.initAppointConfirm();
                    }else{
                        MyCareDoctorsService.queryHospitalInfo( postData.HOSPITAL_ID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital( postData.HOSPITAL_ID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    // 把缓存里面的数据传给service
                                    AppointmentDoctorDetailService.selSchedule = postData;
                                    AppointmentDoctorDetailService.doctorInfo = postData;
                                    AppointmentDoctorDetailService.CLINIC_DETAIL = {
                                        rows:[]
                                    };
                                    AppointmentDoctorDetailService.CLINIC_DETAIL.rows.push(postData);
                                    AppointmentDoctorDetailService.CLINIC_DETAIL.isHidden = postData.isHidden;
                                    AppointmentDoctorDetailService.CLINIC_DETAIL.APPOINT_PAY_WAY = postData.APPOINT_PAY_WAY;
                                    AppointmentDoctorDetailService.CLINIC_SOURCE = null;
                                    AppointmentDoctorDetailService.ARCHIVE_FEE = postData.ARCHIVE_FEE;
                                    //获取hospital_id切换缓存中医院
                                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, undefined);
                                    $scope.initAppointConfirm();
                                });
                        });
                    }
                }else{
                    $scope.initAppointConfirm();
                }

                $scope.pageTitle = '确认预约信息';
                $scope.isFromConsulation = false;
                $scope.isConsulationnote = true;
                var backView = $ionicHistory.backView();
                if (backView && backView.stateId === 'consulationnote') { //判断是否从会诊页面跳转过来
                    $scope.pageTitle = '会诊预约确认';
                    $scope.isFromConsulation = true;
                    var tmpData = AppointConfirmService.consulationData;
                    if (tmpData && tmpData.consultationFlag === 'MDT') {
                        $scope.subTitle = 'MDT会诊特需门诊';
                    } else if(tmpData && tmpData.consultationFlag === 'RPP'){
                        $scope.subTitle = '远程病理会诊特需门诊';
                    } else {
                        $scope.subTitle = '普通会诊特需门诊';
                    }
                }
            }
        });
        $scope.initAppointConfirm = function(){
            //切换完医院重新获取缓存
            memoryCache = CacheServiceBus.getMemoryCache();
            storageCache = CacheServiceBus.getStorageCache();
            $scope.showAmountData = false;
            //begin  网络科室标示获取从科室中获取,放入页面监控方法中 By wangwan
            $scope.IS_ONLINE = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE;
            //end 网络科室标示获取从科室中获取,放入页面监控方法中 By wangwan
            //start wangwan 转诊标识 KYEEAPPC-6917
            if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_REFERRAL==2){
                $scope.IS_REFERRAL = 2;
            }else{
                $scope.IS_REFERRAL = 0;
            }
            //由于ng-module只能绑定页面对象就诊者信息
            $scope.patientInf = {
                CARD_NO: "",
                CARD_SHOW: "",
                CARD_NAME:"",
                CARD_TYPE:""
            };
            //如果输入卡信息完成  By  章剑飞  KYEEAPPC-2953
            if (AppointmentCreateCardService.enterInfo) {
                $scope = AppointmentCreateCardService.confirmScope;
                $scope.patientInf.CARD_SHOW = KyeeI18nService.get("appoint_confirm.newCard","申请新卡");
                $scope.patientInf.CARD_NO = -1;
                $scope.PATIENT_ID = -1;
                $scope.appointConfirm();
                AppointmentCreateCardService.enterInfo = false;
                return;
            } else {
                $scope.patientInf.CARD_SHOW = undefined;
                $scope.patientInf.CARD_NO = undefined;
                $scope.PATIENT_ID = undefined;
            }
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取缓存中当前就诊卡信息
            var currentCardinf = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
            //获取缓存中当前登录用户信息
            var currentuser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //获取排班页面用户点击预约时的排班数据
            $scope.AppointconfrimSchedule = AppointmentDoctorDetailService.selSchedule;

            //获取排版页面用户点击预约时的医生信息
            $scope.Appointconfrimdoctor = AppointmentDoctorDetailService.doctorInfo;
            //如果缓存中存在科室，则直接从缓存中获取科室信息
            if(AppointmentDoctorDetailService.doctorInfo) {
                $scope.deptData= {
                    DEPT_CODE:AppointmentDoctorDetailService.doctorInfo.DEPT_CODE,
                    DEPT_NAME:AppointmentDoctorDetailService.doctorInfo.DEPT_NAME
                };
            } else {
                $scope.deptData = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA;
            }
            //获取排班页面点击上下午时查询到的号源附带的就诊卡是否隐藏的参数 false:显示 true 隐藏
            $scope.showCardNo = AppointmentDoctorDetailService.CLINIC_DETAIL.isHidden;
            //就诊卡信息默认不显示
            $scope.cardInfo = false;
            //预约时间
            $scope.APPT_MADE_DATE = new Date($scope.Appointconfrimdoctor.SERVER_TIME).format("yyyy/MM/dd");//服务器时间
            //全局所选择号源数据
            var appointClinicData = AppointmentDoctorDetailService.CLINIC_SOURCE;
            //如果用户选择号源时，获取用户选择的号源
            $scope.ClinicSource = appointClinicData;
            //若是用户选择的号源，则将用户选择的号源重新放入午别字段
            if ($scope.ClinicSource!=null&&$scope.ClinicSource.text != null && $scope.ClinicSource.text != undefined && $scope.ClinicSource != null && $scope.ClinicSource != undefined) {
                $scope.CLINIC_DURATION = $scope.ClinicSource.value2.HB_TIME;//获取用户选择的午别
                $scope.HID = $scope.ClinicSource.value;//获取用户选择的hid（号源）
                //预约选择的号源
                $scope.appointClinicData=$scope.ClinicSource.value2;
                //申请新卡保存号源
                AppointmentCreateCardService.CLINIC_SOURCE = AppointmentDoctorDetailService.CLINIC_SOURCE;////感觉没用，可以删掉了
            } else {
                //不需要用户选择号源
                $scope.CLINIC_DURATION = AppointmentDoctorDetailService.CLINIC_DETAIL.rows[0].HB_TIME;
                $scope.HID = AppointmentDoctorDetailService.CLINIC_DETAIL.rows[0].HID;
                $scope.appointClinicData=AppointmentDoctorDetailService.CLINIC_DETAIL.rows[0];
                //申请新卡保存号源
                AppointmentCreateCardService.CLINIC_SOURCE = AppointmentDoctorDetailService.CLINIC_SOURCE;//感觉没用，可以删掉了
                AppointmentDoctorDetailService.CLINIC_SOURCE = {};
            }

            // 如果EXPENSE_DETAIL不为空，则优先显示明细 任务号：KYEEAPPC-6791
            // 获取的明细数据格式为：""[{ "feedesc":"就诊费", "fee":"10.5" },{ "feedesc":"诊疗费", "fee":"5.5" },{ "feedesc":"陪护费", "fee":"5.5" }]""
            if($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >= 1) {
                if($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "挂号费") {
                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                }
                if($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                }
            }
            var expenseDetail = $scope.appointClinicData.EXPENSE_DETAIL;
            if (expenseDetail && typeof(expenseDetail) == "string") {
                var expenseDetailStart = expenseDetail.indexOf('[');
                var expenseDetailEnd = expenseDetail.indexOf(']');
                expenseDetail = expenseDetail.substring(expenseDetail.indexOf('['), expenseDetail.indexOf(']') + 1);
                try{
                    $scope.appointClinicData.EXPENSE_DETAIL = JSON.parse(expenseDetail);
                }catch(err) {
                    $scope.appointClinicData.EXPENSE_DETAIL = null;
                }
            }
            //获取建档费
            $scope.archiveDetail = AppointmentDoctorDetailService.ARCHIVE_FEE + "";

            //如果号源费用不为空，以号源中的费用为准  wangwan 任务号：KYEEAPPTEST-3493
            $scope.appointClinicData.IS_SHOW_FEE_DETAIL = '0';//默认挂号号源不显示挂号费明细，药事费和诊疗费其中一个不为空，则显示挂号费明细
            if($scope.appointClinicData.PHARMACY_FEE&&parseFloat($scope.appointClinicData.PHARMACY_FEE).toFixed(2)!=0.00){
                selSchedule.PHARMACY_FEE =$scope.appointClinicData.PHARMACY_FEE;
                $scope.appointClinicData.IS_SHOW_FEE_DETAIL = '1';//显示号源挂号费用明细
            }else{
                selSchedule.PHARMACY_FEE = $scope.AppointconfrimSchedule.PHARMACY_FEE;
            }
            //诊疗费
            if($scope.appointClinicData.DIAG_FEE&&parseFloat($scope.appointClinicData.DIAG_FEE).toFixed(2)!=0.00){
                selSchedule.DIAG_FEE = $scope.appointClinicData.DIAG_FEE;
                $scope.appointClinicData.IS_SHOW_FEE_DETAIL = '1';//显示号源挂号费用明细
            }else{
                selSchedule.DIAG_FEE = $scope.AppointconfrimSchedule.DIAG_FEE;
            }
            //总挂号费
            if($scope.appointClinicData.REGISTERED_FEE && parseFloat($scope.appointClinicData.REGISTERED_FEE).toFixed(2)!=0.00){
                selSchedule.SUM_FEE=$scope.appointClinicData.REGISTERED_FEE;
                $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
            }else{
                //将预约费用显示增加￥符号
                if (!$scope.AppointconfrimSchedule.SUM_FEE) {
                    selSchedule.SUM_FEE = "";
                } else {
                    $scope.appointAmount = "¥" + $scope.AppointconfrimSchedule.SUM_FEE;
                    selSchedule.SUM_FEE = $scope.AppointconfrimSchedule.SUM_FEE;
                }
            }
            //计算实际挂号费   wangwan 任务号：KYEEAPPTEST-3493
            if((selSchedule.DIAG_FEE!= undefined&&selSchedule.DIAG_FEE!="")&&(selSchedule.PHARMACY_FEE != undefined&&selSchedule.PHARMACY_FEE!="")){
                selSchedule.REG_FEE = (parseFloat(selSchedule.SUM_FEE)-parseFloat(selSchedule.PHARMACY_FEE)-parseFloat(selSchedule.DIAG_FEE)).toFixed(2);
            }else if(selSchedule.DIAG_FEE!= undefined&&selSchedule.DIAG_FEE!=""){
                selSchedule.REG_FEE = (parseFloat(selSchedule.SUM_FEE)-parseFloat(selSchedule.DIAG_FEE)).toFixed(2);
            }else if(selSchedule.PHARMACY_FEE != undefined&&selSchedule.PHARMACY_FEE!="" ){
                selSchedule.REG_FEE = (parseFloat(selSchedule.SUM_FEE)-parseFloat(selSchedule.PHARMACY_FEE)).toFixed(2);
            }
            // $scope.registFee = "¥"+ selSchedule.REG_FEE;

            $scope.feeDetail = $scope.AppointconfrimSchedule.FEE_DETAIL;
            //门诊位置暂隐藏
            $scope.LOC_INFO = false;
            $scope.PATIENT_NAME = currentPatient.OFTEN_NAME;
            $scope.ID_NO_STAR = getStarIdNo(currentPatient.ID_NO);//将身份证号转换为xxx****xxxx
            $scope.PHONE_NUMBER = getStarPhoneNum(currentPatient.PHONE);//将手机号转换为xxx****xxxx
            //获取就诊卡回调信息
            AppointConfirmService.setClientinfo(function (Clientinfo) {
                //edit by songyangzi  时间：2017年5月2日10:46:57

                $scope.Clientinfo = Clientinfo;
                $scope.patientInf.BIRTH_CERTIFICATE_NO = Clientinfo.BIRTH_CERTIFICATE_NO;
                $scope.trueOrfalse = function () {
                    //只读
                    if (Clientinfo.CARDNO_TO_APPOINT == 0) {
                        $scope.placeholder = KyeeI18nService.get("appoint_confirm.placeholderChooseCard","请选择就诊卡");
                        return true;
                    } else {
                        $scope.placeholder = KyeeI18nService.get("appoint_confirm.placeholderCard","请输入或选择就诊卡");
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

                                if($scope.patientInf.CARD_NAME === '电子健康卡'){
                                    PayOrderService.isHealthCard = true;
                                }else{
                                    PayOrderService.isHealthCard = false;
                                }
                                //获取缓存中当前就诊者信息  By  章剑飞  KYEEAPPTEST-2754
                                var userVsId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                                var hospital_info = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                                var hospitalId = hospital_info.id;
                                //选中就诊者  By  章剑飞  KYEEAPPTEST-2754
                                //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
                                /* QueryHisCardService.updateCardByUserVsId(function () {
                                 }, userVsId, $scope.patientInf.CARD_NO, hospitalId);*/
                                break;
                            }
                        } else {
                            if(Clientinfo.SELECT_FLAG=="1"){
                                $scope.patientInf.CARD_NO = Clientinfo.rows[0].CARD_NO;
                                $scope.patientInf.CARD_SHOW = Clientinfo.rows[0].CARD_SHOW;
                                $scope.PATIENT_ID = Clientinfo.rows[0].PATIENT_ID;
                                $scope.patientInf.CARD_NAME = Clientinfo.rows[0].CARD_NAME;
                                $scope.patientInf.CARD_TYPE = Clientinfo.rows[0].CARD_TYPE;
                                if($scope.patientInf.CARD_NAME === '电子健康卡'){
                                    PayOrderService.isHealthCard = true;
                                }else{
                                    PayOrderService.isHealthCard = false;
                                }
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

                if (Clientinfo.rows != null && Clientinfo.rows.length > 0) {
                    for (var i = 0; i < Clientinfo.rows.length; i++) {
                        if (Clientinfo.rows[i].IS_DEFAULT == '1') {
                            if(Clientinfo.SELECT_FLAG=="1" && Clientinfo.rows[i].CARD_TYPE == "0"){
                                if ($scope.archiveDetail != "undefined" && $scope.archiveDetail != "0") {
                                    if($scope.oneFeeDetailTemp && $scope.oneFeeDetailTemp.length != 0){
                                        $scope.appointClinicData.EXPENSE_DETAIL = angular.copy($scope.oneFeeDetailTemp);
                                        $scope.oneFeeDetailTemp = [];
                                    }
                                    selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.archiveDetail)).toFixed(2);
                                    $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
                                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 0,archiveobj);

                                }
                                if ($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length == 1 && $scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 0, registobj);
                                }
                                //$scope.Fee_Name = "挂号费用：";
                                if($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length == 1) {
                                    if($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                                        $scope.Fee_Name = $scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                                        $scope.FeeType = 1;
                                    }
                                    $scope.oneFeeDetailTemp = angular.copy($scope.appointClinicData['EXPENSE_DETAIL']);
                                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                                }else if($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >1) {
                                    $scope.Fee_Name = "支付费用：";
                                    $scope.FeeType = 2;
                                }
                                break;
                            }
                        }
                    }
                }



                //begin 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼  KYEEAPPC-2917
                //wangwenbo 2015年10月8日09:25:15 增加用户有卡则不显示申请新卡 APPCOMMERCIALBUG-1429
                var addNewCard = false;
                if((menus.length == 0) && ('true' === $scope.Clientinfo.REMOTE_BUILD_CARD
                    || 'input' === $scope.Clientinfo.REMOTE_BUILD_CARD)){
                    var resultMap = {};
                    resultMap["name"] = "";
                    resultMap["text"] =  KyeeI18nService.get("appoint_confirm.newCard","申请新卡");
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
            });
            //如果非首次注册用户，则发送查询就诊卡请求
            /*if(-1===AppointmentDoctorDetailService.historyRoute)
             {*/
            //获取就诊卡方法
            AppointConfirmService.queryClientinfo({IS_ONLINE: AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE});
            /*                }*/
            //获取医院参数
            $scope.isShowAptFee = 1;
            $scope.isShowCasebookFee = 0;//0不显示，1显示
            HospitalService.getParamValueByName(hospitalinfo.id, "isVerifyMedicalCard,IS_SHOW_APT_FEE,virtualCardType,BIRTH_NUMBER_SWITCH,PATIENT_ADDRESS_SWITCH,idNo_Check,CREATE_CASEBOOK_FEE,APPOINT_PAY_WAY,VIRTUAL_APPOINT_USER_TYPE,TJ_CHILDREN_AGE,TJ_CHILDREN_DEPT,CHILDREN_AGE_INFO,MERGER_SUPPORT,PREFERENTIAL_FEE,BUILD_CARD_ADDRESS,EXTRA_PAY_TIP,EXTRA_PAY_DEPT",function (hospitalPara) {
                //是否显示预约费用 0:不显示，1：显示
                // $scope.APPOINT_AMOUNT = hospitalPara.data.APPOINT_AMOUNT;
                //edit by zhoushiyu 获取病历本费用,预约不缴费时不开启病历本费用功能
                $scope.casebookFee = hospitalPara.data.CREATE_CASEBOOK_FEE;
                if(hospitalPara.data.PREFERENTIAL_FEE==1){
                    $scope.isSupportMerge = hospitalPara.data.MERGER_SUPPORT;
                }else{
                    $scope.isSupportMerge = 0;
                }
                var appointway = hospitalPara.data.APPOINT_PAY_WAY;
                //判断病例本费用合法性，非法时，赋值为-1。
                try {
                    var testFee = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/;
                    if((!testFee.test($scope.casebookFee)) || appointway != 1 ) {
                        $scope.isShowCasebookFee = 0;//0不显示，1显示
                        $scope.casebookFee = -1;
                    } else {
                        $scope.isShowCasebookFee = 1;//0不显示，1显示
                        $scope.casebookFee =  parseFloat($scope.casebookFee).toFixed(2);
                        $scope.checkBox = 0;
                    }
                } catch(err) {
                    console.log(err);
                }
                //end by zhoushiyu
                $scope.isVerifyMedicalCardPara = hospitalPara.data.isVerifyMedicalCard;
                $scope.isShowAptFee = hospitalPara.data.IS_SHOW_APT_FEE;
                //KYEEAPPC-4733 确认挂号跳选卡界面是否展示虚拟卡标识  wangwan 2016年1月6日11:01:43
                if(!(hospitalPara.data.virtualCardType.indexOf("1"))){
                    $scope.virtualSupportType=false;
                }else{
                    $scope.virtualSupportType=true;//选卡界面不需要展示虚拟卡
                }
                /*医院参数：是否显示预约费用：IS_SHOW_APT_FEE*/
                $scope.showFee = 1;
                var fee = $scope.appointAmount;
                if(('0'==$scope.isShowAptFee) && (('¥0'==fee)||('¥0.0'==fee)||('¥0.00'==fee))){
                    $scope.showFee = 0;
                }
                // wangchengcheng KYEEAPPC-4850 出生证号是否显示
                $scope.birthNumberSwitch = hospitalPara.data.BIRTH_NUMBER_SWITCH;
                if ($scope.birthNumberSwitch == 1 && currentPatient.ID_NO.indexOf("XNSF") == 0) {
                    $scope.birthNumberSwitchNew = "1";
                    $scope.BIRTH_CERTIFICATE_NO_placeholder =KyeeI18nService.get("appoint_confirm.birthCertificateNoPlaceholder","请输入出生证号");
                } else {
                    $scope.birthNumberSwitchNew = "0";
                }
                //获取医院参数是否需要患者住址信息开关和是否允许虚拟身份证就诊开关 by 高萌
                var patientAddressSwitch = hospitalPara.data.PATIENT_ADDRESS_SWITCH;//是否需要患者住址信息开关
                var idNoCheckSwitch = hospitalPara.data.idNo_Check;//是否允许虚拟身份证就诊开关
                $scope.virtualAppointUserType  = hospitalPara.data.VIRTUAL_APPOINT_USER_TYPE;//虚拟卡预约是否区分用户类型
                //start edit by wangwan  任务号：KYEEAPPC-3616 获取优惠类型
                var params={
                    IS_ONLINE:AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE,
                    USER_ID:currentuser.USER_ID,
                    USER_VS_ID:currentPatient.USER_VS_ID,
                    TYPE:AppointmentDoctorDetailService.selSchedule.BUSSINESS_TYPE,
                    AMOUNT:selSchedule.SUM_FEE,
                    DOCTOR_CLINIC_TYPE: $scope.Appointconfrimdoctor.DOCTOR_CLINIC_TYPE,
                    CLINIC_TYPE:$scope.AppointconfrimSchedule.CLINIC_TYPE
                };
                //初始化优惠活动显示标示为undefined；
                $scope.PreferentialFlag = undefined;
                AppointConfirmService.getPreferentialType(params,function(PreferentialTypeData){
                    //edit by songyangzi  时间：2017年5月2日10:46:57
                    KyeeMessageService.hideLoading();
                    amountType = PreferentialTypeData.AMOUNT_TYPE;//挂号费别：0:普通；1:特殊人群优惠
                    if(amountType == '1'){
                        if(PreferentialTypeData.HAS_SPECIAL_AMOUNT != undefined){
                            selSchedule.SUM_FEE = PreferentialTypeData.HAS_SPECIAL_AMOUNT;
                            if(('0'==$scope.isShowAptFee) && (('¥0'==selSchedule.SUM_FEE)||('¥0.0'==selSchedule.SUM_FEE)||('¥0.00'==selSchedule.SUM_FEE))){
                                $scope.showFee = 0;
                            }
                            $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
                        }
                    }
                    $scope.showAmountData = true;
                    //转诊条款
                    $scope.REFERRAL_TERM_SHOW = false;
                    $scope.REFERRAL_TERM = PreferentialTypeData.REFERRAL_TERM;
                    if($scope.REFERRAL_TERM&&$scope.REFERRAL_TERM!=""){
                        $scope.REFERRAL_TERM_SHOW = true;
                    }
                    //优惠活动展示，如果为0表示返现，1表示全免，2表示减免
                    if(PreferentialTypeData.FLAG==1){
                        $scope.buttonColor="#98C931"
                    }else if(PreferentialTypeData.FLAG==0){
                        $scope.buttonColor="#F8AE2E";
                    }else if(PreferentialTypeData.FLAG==2){
                        $scope.buttonColor="#F77662";
                    }
                    // 修改挂号费用为诊查费 edit by cuijin KYEEAPPC-11628
                    $scope.REG_FEE_REPLACE = PreferentialTypeData.REG_FEE_REPLACE;
                    if($scope.REG_FEE_REPLACE != undefined && $scope.REG_FEE_REPLACE != "" && $scope.REG_FEE_REPLACE != null){
                        $scope.Fee_Name = $scope.REG_FEE_REPLACE + "： "
                        $scope.FeeType = 1;
                    }
                    $scope.PreferentialFlag=PreferentialTypeData.FLAG;
                    $scope.PreferentialMessage=PreferentialTypeData.ACTIVITY_MSG;
                    $scope.userMessage = PreferentialTypeData.MSG;
                    // 查询患者出生地和居住地信息是否存在  By  高萌    KYEEAPPC-5789
                    var existPatientAddress = PreferentialTypeData.EXIST_PATIENT_ADDRESS;
                    //edit by 高萌  KYEEAPPC-5789 是否显示患者出生地和居住地
                    //显示患者出生地（满足条件：显示患者地址开关打开、身份证号为虚拟身份证、该医院支持虚拟身份证预约挂号、患者地址信息不存在）
                    if (patientAddressSwitch == 1 && (currentPatient.ID_NO.indexOf("XNSF") == 0 || currentPatient.ID_NO == "")&& idNoCheckSwitch == 1 && existPatientAddress == false) {
                        $scope.patientBirthAddressSwitch = "1";
                        $scope.BIRTH_ADDRESS_placeholder =KyeeI18nService.get("appoint_confirm.patientAddressPlaceholder","请输入出生地区");
                    } else {
                        $scope.patientBirthAddressSwitch = "0";
                    }
                    //显示患者居住地（满足条件：显示患者地址开关打开、患者地址信息不存在）
                    if (patientAddressSwitch == 1 && existPatientAddress == false) {
                        $scope.patientPresentAddressSwitch ="1";
                        $scope.PRESENT_ADDRESS_placeholder =KyeeI18nService.get("appoint_confirm.patientAddressPlaceholder","请输入现居住地");
                        $scope.DETAIL_ADDRESS_placeholder = KyeeI18nService.get("appoint_confirm.placeholderAddress","请输入现居地详细地址");
                    } else {
                        $scope.patientPresentAddressSwitch = "0";
                    }
                    //end edit by 高萌  KYEEAPPC-5789 是否显示患者出生地和居住地
                    if($scope.userMessage){
                        var dialog = KyeeMessageService.dialog({
                            template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                            scope: $scope,
                            title: KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                            buttons: [
                                {
                                    text: KyeeI18nService.get("appoint_confirm.isOk","确定"),
                                    style:'button-size-l',
                                    click: function () {
                                        dialog.close();
                                    }
                                }
                            ]
                        });
                    }
                    //end  edit by wangwan  任务号：KYEEAPPC-3616获取优惠类型
                    $scope.childrenLimit.info = hospitalPara.data.CHILDREN_AGE_INFO;
                    $scope.childrenLimit.age = hospitalPara.data.TJ_CHILDREN_AGE;
                    $scope.childrenLimit.dept = hospitalPara.data.TJ_CHILDREN_DEPT.split(",");
                    //end by maoruikang  KYEEAPPC-12113 儿童号增加处理需求
                    //edit by maoruikang  APP-30 用户通过APP远程建卡时需要在申请建卡界面录入家庭住址
                    $scope.needAddress = hospitalPara.data.BUILD_CARD_ADDRESS;
                })
                //edit by maoruikang  APP-903 作为趣医用户，在预约挂号苏州九龙医院时，确认预约挂号弹出提示：预约或挂号此医生，需要线下支付另外的费用，以便于用户知晓医院规则
                $scope.extraPayTip = hospitalPara.data.EXTRA_PAY_TIP;
                $scope.extraPayDept = hospitalPara.data.EXTRA_PAY_DEPT.split(",");
            });

            //获取建档费
            //构造挂号费、建档费明细
            var regFee ="";
            regFee = selSchedule.SUM_FEE;
            var registFeeDetail = '{"feedesc":"挂号费","fee":"' + regFee + '"}';
            var archiveFeeDetail = '{"feedesc":"建档费","fee":"' + parseFloat($scope.archiveDetail).toFixed(2) + '"}';
            archiveobj = JSON.parse(archiveFeeDetail);
            registobj = JSON.parse(registFeeDetail);
            if($scope.oneFeeDetailTemp && $scope.oneFeeDetailTemp.length != 0){
                $scope.appointClinicData.EXPENSE_DETAIL = angular.copy($scope.oneFeeDetailTemp);
                $scope.oneFeeDetailTemp = [];
            }
            try {
                if(expenseDetail == undefined || expenseDetail == "") {
                    var expenseDetail = [];
                    //expenseDetail.push(registobj);
                    expenseDetail.push(archiveobj);
                    temp = JSON.stringify(expenseDetail);
                    if($scope.appointClinicData.EXPENSE_DETAIL == "" || $scope.appointClinicData.EXPENSE_DETAIL == undefined) {
                        if($scope.appointClinicData.EXPENSE_DETAIL == "") {
                            var j = [];
                            var i = JSON.stringify(j);
                            $scope.appointClinicData.EXPENSE_DETAIL = JSON.parse(i);
                        }
                    }
                }
            }catch(err) {
                $scope.appointClinicData.EXPENSE_DETAIL = null;
            }

            $scope.oneFeeDetailTemp = [];
            $scope.Fee_Name = "挂号费用：";
            $scope.FeeType = 0;
            if ($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length == 1) {
                if($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                    $scope.Fee_Name = $scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                    $scope.FeeType = 1;
                }
                $scope.oneFeeDetailTemp = angular.copy($scope.appointClinicData['EXPENSE_DETAIL']);
                $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
            }else if($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >1) {
                $scope.Fee_Name = "支付费用：";
                $scope.FeeType = 2;
            }
        };

        $scope.affirmCasebook = function() {
            if($scope.checkBox == 1) {
                $scope.checkBox = 0;
            } else {
                $scope.checkBox = 1;
            }

        };
        //选择卡号
        $scope.selectItem = function (params) {
            $scope.patientInf.CARD_SHOW = params.item.text;//展示值
            //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
            $scope.patientInf.CARD_NO = params.item.value;//唯一属性
            $scope.patientInf.CARD_TYPE = params.item.value3;//唯一属性
            $scope.PATIENT_ID = params.item.value2;//第二属性
            $scope.CARD_TYPE = params.item.value3;//第三属性
            $scope.Card_Type = params.item.value3;//第三属性
            if($scope.oneFeeDetailTemp && $scope.oneFeeDetailTemp.length != 0){
                $scope.appointClinicData.EXPENSE_DETAIL = angular.copy($scope.oneFeeDetailTemp);
                $scope.oneFeeDetailTemp = [];
            }
            if(params.item.name === '电子健康卡'){
                PayOrderService.isHealthCard = true;
            }
            //注挂号费和建档费在费用明细里面的一二位。
            if($scope.archiveDetail != "undefined" && $scope.archiveDetail != "0") {
                if ($scope.Card_Type == "0") {
                    if ($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length == 0 ) {
                        selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.archiveDetail)).toFixed(2);
                        $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
                        $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 0, registobj, archiveobj);
                    }else if($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >= 1) {
                        if($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费" && $scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "挂号费") {
                            selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.archiveDetail)).toFixed(2);
                            $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
                            if($scope.appointClinicData.EXPENSE_DETAIL.length >= 1) {
                                $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 0, archiveobj);
                            }else{
                                $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 0, registobj, archiveobj);
                            }

                        }
                    }
                } else if ($scope.Card_Type != "0") {
                    if ($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >= 1) {
                        if ($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "挂号费") {
                            $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                        }
                        if ($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                            $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                            //总费用减去建档费
                            selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) - parseFloat($scope.archiveDetail)).toFixed(2);
                            $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
                        }
                    }
                }
            }

            $scope.Fee_Name = "挂号费用：";
            $scope.FeeType = 0;
            if ($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length == 1) {
                if($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                    $scope.Fee_Name = $scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                    $scope.FeeType = 1;
                }
                $scope.oneFeeDetailTemp = angular.copy($scope.appointClinicData['EXPENSE_DETAIL']);
                $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
            } else if($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >1) {
                $scope.Fee_Name = "支付费用：";
                $scope.FeeType = 2;
            }

            //申请新卡则不进行选卡操作
            if ($scope.PATIENT_ID != -1) {
                //获取缓存中当前就诊者信息  By  章剑飞  KYEEAPPTEST-2754
                var userVsId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                var hospital_info = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var hospitalId = hospital_info.id;
            } else if ('input' === $scope.Clientinfo.REMOTE_BUILD_CARD) {
                AppointmentCreateCardService.confirmScope = $scope;
                AppointmentCreateCardService.needAddress = $scope.needAddress;
                AppointmentCreateCardService.needPassword = true;
                $state.go('create_card_info');
            } else if ('true' === $scope.Clientinfo.REMOTE_BUILD_CARD && $scope.needAddress === '1'){
                AppointmentCreateCardService.confirmScope = $scope;
                AppointmentCreateCardService.needAddress = $scope.needAddress;
                AppointmentCreateCardService.needPassword = false;
                $state.go('create_card_info');
            }
        };
        //点击添加新就诊卡时跳转界面 zhoushiyu
        $scope.toAddNewCard = function() {
            //预约挂号确认页面进入查卡页面标识 KYEEAPPC-9191 yangmingsi
            PatientCardService.fromSource = "fromAppoint";
            PatientCardService.fromAppoint = true;
            PatientCardService.fromPatientCard = false;
            $state.go("patient_card_add");
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
                $scope.title = KyeeI18nService.get("appoint_confirm.chooseCardNo","请选择就诊卡");
                //调用显示
                //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
                $scope.showPicker($scope.patientInf.CARD_NO);
            }
            //end 当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼

            OperationMonitor.record("countPatientCardNo", "appoint_confirm");
        };
        $scope.showChardNoInf = function(){

            $scope.userMessage =KyeeI18nService.get("appoint_confirm.cardNoinfo","就诊卡是医院存储您就诊卡资料的磁性卡，是您与医院挂号，付款等交互的唯一实体凭据（某些地区可由医保卡代替），由于医疗的特殊和保密性需要，每家医院的就诊卡不通用。为保证您的挂号等操作的顺利进行，请正确填选您正在使用的就诊卡。没有就诊卡的患者，请到您就诊的医院凭个人身份证办理就诊卡。");
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
/*
            $scope.cardInfo = !$scope.cardInfo;
            $ionicScrollDelegate.$getByHandle("confirm_appoint_content").resize();*/
            OperationMonitor.record("countShowChardNoInf", "appoint_confirm");
        };
        //点击选择就诊人
        $scope.changepatient = function () {
            CustomPatientService.F_L_A_G = "appoint_confirm";
            //关闭弹出的儿科限制
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("custom_patient");
            OperationMonitor.record("countChangePatient", "appoint_confirm");
        };
        //预约不缴费
        var appointNoPayRequest = function (paramsConfirm) {
            //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalId,true);
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            AppointConfirmService.confirmAppointNopay(paramsConfirm, function (data) {
                //预约不缴费处理成功，跳转到我的趣医
                if (data.success) {
                    if (hospitalinfo.id == "1001") {
                        KyeeMessageService.message({
                            title: KyeeI18nService.get("appoint_confirm.message","消息"),
                            content: KyeeI18nService.get("appoint_confirm.hospitalmessage","体验医院仅供用户体验，不能作为实际就诊依据"),
                            tapBgToClose:true,
                            onOk:function(message){
                                AppointmentRegistDetilService.RECORD = {
                                    HOSPITAL_ID: hospitalinfo.id,
                                    REG_ID: data.data.REG_ID
                                };
                                AppointmentRegistDetilService.ROUTE_STATE = "appoint_confirm";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                    $state.go("appointment_result");
                            }
                        });
                    }
                    else {
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: hospitalinfo.id,
                            REG_ID: data.data.REG_ID
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = "appoint_confirm";
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                            $state.go("appointment_result");
                    }
                }
                //南京12320平台
                else if (data.message == "njFail") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.njFail","未通过校验，请输入正确的12320账户信息")
                    });
                }
                //南京12320平台
                else if (data.message == "ckFail") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.ckFail","12320用户名或密码错误")
                    });
                }
                //南京12320平台
                else if (data.message == "bind") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.bind","请绑定12320账户")
                    });
                }
                //南京12320平台
                else if (data.message == "bindPhone") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.bindPhone","请绑定手机号")
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
                    var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
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
                        text:  KyeeI18nService.get("appoint_confirm.back","返回"),
                        click: function () {
                            $scope.dialog.close();
                        }
                    }, {
                        text: KyeeI18nService.get("appoint_confirm.callPhone","拨打电话"),
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
                        title: KyeeI18nService.get("appoint_confirm.userError","账号操作异常"),
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
                        title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        buttons: [
                            {
                                text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
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
                   /* KyeeMessageService.confirm({
                        title: KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        content: data.message,
                        /!*cancelText: KyeeI18nService.get("appoint_confirm.cancelMsg","以后再说"),*!/
                        okText: KyeeI18nService.get("appoint_confirm.confirmMsg","立即前往"),

                        onSelect: function (res) {
                            if (res) {
                                var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                                patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                                patient.loginNum = "";         //短信验证码制空
                                var people = angular.copy(patient);
                                CommPatientDetailService.item = people;
                                CommPatientDetailService.F_L_A_G = "appoint_confirm";
                                $state.go('comm_patient_detail');

                            }
                        }
                    });*/
                    var buttons = [{
                        text:  KyeeI18nService.get("appoint_confirm.confirmMsgPerfect","前往完善"),
                        style: "button button-block button-size-l",
                        click: function () {
                            $scope.dialog.close();
                            var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                            patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                            patient.loginNum = "";         //短信验证码制空
                            var people = angular.copy(patient);
                            CommPatientDetailService.item = people;
                            CommPatientDetailService.F_L_A_G = "appoint_confirm";
                            $state.go('comm_patient_detail');
                        }
                    }];
                    //弹出对话框
                    $scope.userMessage = data.message;
                    $scope.dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                        scope: $scope,
                        title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        buttons: buttons
                    });
                }
                // 成人挂儿科的限制
                else if (data.resultCode == "0020620") {
                    var buttons = [{
                        text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
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
                        title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
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
        //预约缴费
        var appointPayRequest = function (paramsConfirm) {
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalId,true);
            AppointConfirmService.confirmAppointPay(paramsConfirm, function (data) {
                //预约缴费时，保存记录成功后跳转到支付页面
                if (data.success) {
                    // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                    //data.data["MARK_DESC"] = $scope.AppointconfrimSchedule.CLINIC_LABEL;
                    if($scope.REG_FEE_REPLACE != undefined && $scope.REG_FEE_REPLACE != "" && $scope.REG_FEE_REPLACE != null){
                        data.data["MARK_DESC"] = $scope.REG_FEE_REPLACE;
                    }else{
                        data.data["MARK_DESC"] = KyeeI18nService.get("appoint_confirm.markDesc","挂号费");
                    }
                    data.data["MARK_DETAIL"] = $scope.AppointconfrimSchedule.CLINIC_LABEL;
                    if(data.data["isSupportMerge"]==1){
                        data.data["AMOUNT"] = parseFloat(data.data["USER_PAY_AMOUNT"]).toFixed(2);
                        data.data["PREFERENTIAL_FEE"]="";
                    }else{
                        data.data["AMOUNT"] = selSchedule.SUM_FEE;
                    }
                    data.data["flag"] = 3;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                    data.data["TRADE_NO"] = data.data.OUT_TRADE_NO;
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
                    data.data["hospitalID"] = hospitalinfo.id;//由于跨医院，需要将hospitalId传递到支付页面
                    //传入确认预约路由
                    data.data["ROUTER"] = "appoint_confirm";
                    data.data["C_REG_ID"] = data.data.REG_ID;
                    var feeStr = data.data["PREFERENTIAL_FEE"];
                    $scope.zeroPay = parseFloat(data.data["USER_PAY_AMOUNT"]).toFixed(2);
                    var FEE;
                    if (feeStr) {
                        FEE = JSON.parse(feeStr);
                        data.data["PREFERENTIAL_LIST"] = FEE;
                    }
                    if($scope.zeroPay <= parseFloat(0.00)&&feeStr){
                        PayOrderService.payData = data.data;
                        KyeeMessageService.confirm({
                            content: $scope.castContent(FEE,parseFloat(selSchedule.SUM_FEE).toFixed(2)),
                            onSelect: function (confirm) {
                                if (confirm) {
                                    AppointmentRegistDetilService.RECORD = {
                                        HOSPITAL_ID: hospitalinfo.id,
                                        REG_ID: data.data.REG_ID,
                                        handleNoPayFlag:"1"
                                    };
                                    AppointmentRegistDetilService.ROUTE_STATE = "appoint_confirm";
                                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                        $state.go("appointment_result");
                                    return;
                                }else{

                                    $scope.cancelPayOrder();
                                    return;

                                }

                            }
                        });

                    }else{
                        PayOrderService.payData = data.data;
                        //0元支付不跳转到支付页面，直接跳转到结果页  by高萌  KYEEAPPC-5987
                        if(data.data["AMOUNT"]  == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                            AppointmentRegistDetilService.RECORD = {
                                HOSPITAL_ID: hospitalinfo.id,
                                REG_ID: data.data.REG_ID,
                                handleNoPayFlag:"1"
                            };
                            AppointmentRegistDetilService.ROUTE_STATE = "appoint_confirm";
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                $state.go("appointment_result");
                        }else
                        {
                            $state.go("payOrder");
                        }

                    }
                }
                else {
                    //预约失败，您今日已经在该科室预约过，不能重复预约！
                    if (data.resultCode == "0020405") {
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
                    //南京12320平台
                    else if (data.message == "njFail") {
                        $state.go("binding12320");
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("appoint_confirm.njFail","未通过校验，请输入正确的12320账户信息")
                        });
                    }
                    //南京12320平台
                    else if (data.message == "ckFail") {
                        $state.go("binding12320");
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("appoint_confirm.ckFail","12320用户名或密码错误")
                        });
                    }
                    //南京12320平台
                    else if (data.message == "bind") {
                        $state.go("binding12320");
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("appoint_confirm.bind","请绑定12320账户")
                        });
                    }
                    //南京12320平台
                    else if (data.message == "bindPhone") {
                        $state.go("binding12320");
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("appoint_confirm.bindPhone","请绑定手机号")
                        });
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
                            text:  KyeeI18nService.get("appoint_confirm.back","返回"),
                            click: function () {
                                $scope.dialog.close();
                            }
                        }, {
                            text:  KyeeI18nService.get("appoint_confirm.callPhone","拨打电话"),
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
                            title: KyeeI18nService.get("appoint_confirm.userError","账号操作异常"),
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
                            title: KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                            buttons: [
                                {
                                    text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
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
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                            content: data.message,
                            cancelText: KyeeI18nService.get("appoint_confirm.cancelMsg","以后再说"),
                            okText: KyeeI18nService.get("appoint_confirm.confrimlMsg","立即前往"),

                            onSelect: function (res) {
                                if (res) {
                                    var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                    patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                                    patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                                    patient.loginNum = "";         //短信验证码制空
                                    var people = angular.copy(patient);
                                    CommPatientDetailService.item = people;
                                    CommPatientDetailService.F_L_A_G = "appoint_confirm";
                                    $state.go('comm_patient_detail');

                                }
                            }
                        });
                    }
                    // 成人挂儿科的限制
                    else if (data.resultCode == "0020620") {
                        var buttons = [{
                            text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
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
                            title: KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
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
        //获取缓存中记录的患者预约输入的物理卡号
        var medicalCardNo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.MEDICAL_CARDNO);
        //预约需要输入卡号，密码对象
        $scope.isVerifyMedicalCard = {
            IN_CARDNO: medicalCardNo,
            IN_CATDPWD: "",
            MIND_CARD: true
        };
        //预约输入就诊卡密码
        var inputCardPwd = function (paramsConfirm) {
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/isVerifyMedicalCard.html",
                scope: $scope,
                title:  KyeeI18nService.get("appoint_confirm.cardNoisOK","预约就诊卡验证"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("appoint_confirm.cancel","取消"),
                        click: function () {
                            dialog.close();
                        }
                    },
                    {
                        text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            if (!$scope.isVerifyMedicalCard.IN_CARDNO && !$scope.isVerifyMedicalCard.IN_CATDPWD) {
                                KyeeMessageService.broadcast({
                                    content:  KyeeI18nService.get("appoint_confirm.notEmptyCard","就诊卡号或密码不能为空"),
                                    duration: 3000
                                });
                            } else {
                                dialog.close();
                                var psw = $scope.isVerifyMedicalCard.IN_CATDPWD;
                                paramsConfirm["MEDICAL_CARD_ID"] = $scope.isVerifyMedicalCard.IN_CARDNO;
                                paramsConfirm["MEDICAL_CARD_PWD"] = RsaUtilService.getRsaResult(psw);
                                appointNoPayRequest(paramsConfirm)
                            }
                        }
                    }
                ]
            });
        };

        //取消订单
        $scope.cancelPayOrder = function () {
            var data = PayOrderService.payData;
            //begin 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884
            PayOrderService.cancelPayOrder(function () {

                $ionicHistory.goBack(-1);

                //跳转页面之后清除数据
                PayOrderService.payData = undefined;
            });
        };
        //0元弹出框修改
        $scope.castContent=function (fee,amount) {
            var contentInfo="";
            for(var data in fee){
                contentInfo=contentInfo+fee[data].preferentialName+"：¥"+parseFloat(fee[data].preferentialFee).toFixed(2)+ "<br>"
            }
            contentInfo="挂号费：¥"+amount + "<br>"+contentInfo+"实际支付：¥0.00";
            return contentInfo;
        };
            //end 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884

            //判断用户是否选中记住就诊卡
        $scope.checked = function (value) {
            $scope.isChecked = !$scope.isChecked;
            //如果选中
            if (value) {
                //想缓存中放入用户输入的卡号
                var medicalCardNo = CacheServiceBus.getMemoryCache();
                medicalCardNo.set(CACHE_CONSTANTS.MEMORY_CACHE.MEDICAL_CARDNO, $scope.isVerifyMedicalCard.IN_CARDNO);
            }
        };

        //判断是否属于网络科室，并走不同分支
        $scope.appointConfirm = function () {
            //获取缓存中当前登录用户信息
            var currentuser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //begin 网络科室标示获取从科室中获取 By 高玉楼 KYEEAPPTEST-2805
            var isOnline = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE;
            //end 网络科室标示获取从科室中获取 By 高玉楼
            var deptCode;
            if(AppointmentDoctorDetailService.doctorInfo) {
                deptCode = AppointmentDoctorDetailService.doctorInfo.DEPT_CODE;
            } else {
                deptCode = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.deptCode;
            }
            //Begin--网络科室进入后需要检测视频插件是否已安装，并登录视频接口服务 张明 2015-7-9
            //进入条件：属于网络科室
            if (isOnline == '1' && typeof(device) != "undefined" && (device.platform == "Android"||device.platform == "iOS")) {
                try {
                    if (typeof(TyRtc) == null || typeof(TyRtc) == undefined || typeof(TyRtc) == "undefined") {
                        KyeeLogger.info("*******视频插件初始化失败！*******");

                        //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                        //视频插件初始化失败，发送请求
                        AppointConfirmService.appointVideoInitFialuer();
                        //end 前端校验阻塞后发送请求 By 高玉楼
                        return;
                    }
                    var userImageUrl="http://quyiyuanoss.oss-cn-qingdao.aliyuncs.com/Official/PublicResource/DefaultDoctorPic/user_female.png";
                    if(currentuser.SEX=="2"){
                        userImageUrl="http://quyiyuanoss.oss-cn-qingdao.aliyuncs.com/Official/PublicResource/DefaultDoctorPic/user_male.png";
                    }
                    var records = [currentuser.PHONE_NUMBER, currentuser.NAME,currentuser.SEX,userImageUrl];
                    TyRtc.login(
                        function (info) {
                            if(!CenterUtilService.isDataBlank($scope.extraPayTip)&&$scope.isInChildList(deptCode,$scope.extraPayDept)&&!AppointmentCreateCardService.enterInfo){
                                $scope.dialog = KyeeMessageService.dialog({
                                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                    // okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                                    template: "modules/business/appoint/views/delay_views/extraPayTip.html",
                                    tapBgToClose:true,
                                    scope: $scope,
                                    // content:tip,
                                    buttons: [
                                        {
                                            text: KyeeI18nService.get("appointment.ok", "知道了"),
                                            style: 'button-size-l',
                                            click: function () {
                                                $scope.dialog.close();
                                                $scope.appointConfirmDo(isOnline);
                                            }
                                        }
                                    ]
                                })
                            }else{
                                $scope.appointConfirmDo(isOnline);
                            }
                        },
                        function (info) {
                            KyeeMessageService.broadcast({
                                content:  "网络科室登录失败！",
                                duration: 3000
                            });
                        }, records
                    );
                } catch (e) {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appoint_confirm.netDeptFaile","网络科室预约失败！"),
                        duration: 3000
                    });
                    //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                    //网络科室预约失败，发送请求
                    AppointConfirmService.appointNetDeptAppointFailuer();
                    //end 前端校验阻塞后发送请求 By 高玉楼
                }
            }
            //else if (isOnline == '1' && typeof(device) != "undefined" && device.platform == "iOS") {
            //    KyeeMessageService.broadcast({
            //        content: KyeeI18nService.get("appoint_confirm.notSuportIos","网络科室暂不支持IOS系统！"),
            //        duration: 3000
            //    });
            //    //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
            //    //网络科室暂不支持IOS系统，发送请求
            //    AppointConfirmService.appointNontSupportIOS();
            //    //end 前端校验阻塞后发送请求 By 高玉楼
            //}
            else if (isOnline == '1' && typeof(device) == "undefined") {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("appoint_confirm.notSuportnetWork","网络科室暂不支持网页版！"),
                    duration: 3000
                });
                //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                //网络科室暂不支持网页版，发送请求
                AppointConfirmService.appointNetDeptSupportWeb();
                //end 前端校验阻塞后发送请求 By 高玉楼
            } else {
                //begin 儿童号增加处理需求 By maoruikang KYEEAPPC-12113
                if($scope.hasChildrenInfo()){
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        content: $scope.childrenLimit.info,
                        cancelText: "否",
                        okText: "是",
                        onSelect: function (flag) {
                            if (flag) {
                                //isOnline = "0";
                                $scope.appointConfirmDo(isOnline);//非网络科室还是走原来的流程
                            }
                        }
                    })
                }else if(!CenterUtilService.isDataBlank($scope.extraPayTip)&&$scope.isInChildList(deptCode,$scope.extraPayDept)&&!AppointmentCreateCardService.enterInfo){
                    $scope.dialog = KyeeMessageService.dialog({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        // okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                        template: "modules/business/appoint/views/delay_views/extraPayTip.html",
                        tapBgToClose:true,
                        scope: $scope,
                        // content:tip,
                        buttons: [
                            {
                                text: KyeeI18nService.get("appointment.ok", "知道了"),
                                style: 'button-size-l',
                                click: function () {
                                    $scope.dialog.close();
                                    $scope.appointConfirmDo(isOnline);
                                }
                            }
                        ]
                    })
                } else{
                    //isOnline = "0";
                    $scope.appointConfirmDo(isOnline);//非网络科室还是走原来的流程
                }
                //end  edit by maoruikang  任务号：KYEEAPPC-12113 儿童号增加处理需求
            }
            //End--网络科室进入后需要检测视频插件是否已安装，并登录视频接口服务

        };
        //点击确认预约
        $scope.appointConfirmDo = function (isOnline) {
            //获取缓存中当前登录用户信息
            var currentuser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取缓存中当前就诊卡信息
            var currentCardinf = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
            //获取缓存中记录的患者预约输入的物理卡号
            var medicalCardNo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.MEDICAL_CARDNO);
            //预约来源
            var appointSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
            //校验就诊者卡信息
            if (!$scope.patientInf.CARD_NO && !$scope.placeholder) {//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框

                //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                //校验就诊者卡失败，向后端发送家这款校验失败的请求
                AppointConfirmService.choosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("appoint_confirm.noCard","请选择就诊卡")
                });
                return;
            }

            if (!$scope.patientInf.CARD_SHOW) {
                //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                //校验就诊者卡失败，向后端发送家这款校验失败的请求
                AppointConfirmService.inputOrChoosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    content: KyeeI18nService.get("appoint_confirm.inputCardtoAppoint","请输入就诊卡号")
                });
                return;
            }
            //wangwan  卡类型取用户选择的 KYEEAPPC-11869
            var tempCardTYpe = $scope.patientInf.CARD_TYPE;
            //若支持患者输入卡号，则将用户输入的信息与卡列表信息对比
            if ($scope.Clientinfo.CARDNO_TO_APPOINT != 0) {
                //检验用户输入的信息是否存在于卡列表中  By  章剑飞  KYEEAPPC-2795
                for (var i = 0; i < $scope.pickerItems.length; i++) {
                    if ($scope.patientInf.CARD_SHOW == $scope.pickerItems[i].text) {
                        //匹配到卡信息则直接使用其信息
                        $scope.PATIENT_ID = $scope.pickerItems[i].value2;
                        $scope.patientInf.CARD_NO = $scope.pickerItems[i].value;
                        //wangwan  卡类型取用户选择的 KYEEAPPC-11869
                        tempCardTYpe = $scope.pickerItems[i].value3;
                        break;
                    }
                }
            }
            //加上病历本费用
            if($scope.checkBox && $scope.casebookFee != -1 && $scope.checkBox == 1) {
                selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.casebookFee)).toFixed(2);
            }

            //如果为远程建卡
            if ($scope.PATIENT_ID == -1) {
                $scope.PATIENT_ID = '';
                $scope.patientInf.CARD_NO = '';
                //远程建卡卡类型为1
                tempCardTYpe = "";
            }
            var paramsConfirm = {
                hospitalId: hospitalinfo.id,
                postdata: {
                    "DEPT_CODE": $scope.deptData.DEPT_CODE,
                    "DEPT_NAME": $scope.deptData.DEPT_NAME,
                    "DOCTOR_CODE": $scope.Appointconfrimdoctor.DOCTOR_CODE,
                    "DOCTOR_NAME": $scope.Appointconfrimdoctor.DOCTOR_NAME,
                    "MARK_DESC": $scope.AppointconfrimSchedule.CLINIC_LABEL,//号别
                    "CLINIC_TYPE": $scope.AppointconfrimSchedule.CLINIC_TYPE,
                    "REG_DATE": $scope.AppointconfrimSchedule.CLINIC_DATE,//预约日期
                    "CLINIC_DURATION": $scope.CLINIC_DURATION,//午别
                    "APPT_MADE_DATE": $scope.APPT_MADE_DATE,//预约时间
                    "AMOUNT_TEXT": $scope.appointAmount,//显示¥的预约费用
                    "AMOUNT": selSchedule.SUM_FEE,//预约费用
                    "AMOUNT_TYPE":amountType,//挂号费别：0:普通；1:特殊人群优惠
                    "PATIENT_ID": $scope.PATIENT_ID,//----------------------------
                    "PATIENT_NAME": $scope.PATIENT_NAME,
                    "ID_NO": currentPatient.ID_NO,//身份证
                    "ID_NO_STAR": $scope.ID_NO_STAR,//加*的身份证
                    "BIRTH_CERTIFICATE_NO":$scope.patientInf.BIRTH_CERTIFICATE_NO, // 出生证号
                    "PHONE_NUMBER": currentPatient.PHONE,//不加* 的电话号码
                    "PHONE_NUMBER_STAR": $scope.PHONE_NUMBER,//加*的手机号
                    "LOC_INFO": $scope.AppointconfrimSchedule.CLINIC_POSITION,//门诊位置
                    "CARD_NO": $scope.patientInf.CARD_NO,//----------------------------------------
                    "HID": $scope.HID,//获取号源
                    "PHARMACY_FEE": selSchedule.PHARMACY_FEE,
                    "DIAG_FEE": selSchedule.DIAG_FEE,
                    "CARD_PWD": AppointmentCreateCardService.password,
                    "ADDRESS": AppointmentCreateCardService.address,
                    "HB_TYPE":$scope.appointClinicData.HB_TYPE,
                    "HB_NO":$scope.appointClinicData.HB_NO,
                    "HIS_SCHEDULE_ID":AppointmentDoctorDetailService.selSchedule.HIS_SCHEDULE_ID,
                    "PRESENT_ADDRESS": $scope.addressModelPresent.ADDRESS,//就诊者现居地址
                    "LIVE_ADDRESS_TEXT": $scope.addressModelPresent.LIVE_ADDRESS_TEXT,//就诊者现居详细地址
                    "LIVE_PROVINCE_CODE": $scope.addressModelPresent.LIVE_PROVINCE_CODE,//就诊者现居地省份行政编码
                    "LIVE_PROVINCE_NAME": $scope.addressModelPresent.LIVE_PROVINCE_NAME,//就诊者现居地省份名称
                    "LIVE_PLACE_CODE": $scope.addressModelPresent.LIVE_PLACE_CODE,//就诊者现居地城市行政编码
                    "LIVE_PLACE_NAME": $scope.addressModelPresent.LIVE_PLACE_NAME,//就诊者现居地城市名称
                    "LIVE_CITY_CODE": $scope.addressModelPresent.LIVE_CITY_CODE,//就诊者现居地地区行政编码
                    "LIVE_CITY_NAME": $scope.addressModelPresent.LIVE_CITY_NAME,//就诊者现居地地区名称
                    "BIRTH_ADDRESS": $scope.addressModelBirth.ADDRESS,//就诊者出生地地址
                    "BIRTH_PROVINCE_CODE": $scope.addressModelBirth.BIRTH_PROVINCE_CODE,//就诊者出生地省份行政编码
                    "BIRTH_PROVINCE_NAME": $scope.addressModelBirth.BIRTH_PROVINCE_NAME,//就诊者现居地省份名称
                    "BIRTH_CITY_CODE": $scope.addressModelBirth.BIRTH_CITY_CODE,//就诊者出生地城市行政编码
                    "BIRTH_CITY_NAME": $scope.addressModelBirth.BIRTH_CITY_NAME,//就诊者出生地城市名称
                    "BIRTH_PLACE_CODE": $scope.addressModelBirth.BIRTH_PLACE_CODE,//就诊者出生地地区行政编码
                    "BIRTH_PLACE_NAME": $scope.addressModelBirth.BIRTH_PLACE_NAME//就诊者出生地地区名称
                },
                "MARK_DESC": $scope.AppointconfrimSchedule.CLINIC_LABEL,//号别
                "HID": $scope.HID + "/" + $scope.CLINIC_DURATION,
                "AMOUNT": selSchedule.SUM_FEE,
                "USER_ID": currentuser.USER_ID,
                "PATIENT_ID": $scope.PATIENT_ID,//-----------------------------
                "USER_VS_ID": currentPatient.USER_VS_ID,
                "APPOINT_SOURCE": appointSource,//预约来源
                "PSWD": currentuser.PASSWORD,//用户密码
                "PHONE": currentuser.PHONE_NUMBER,
                "ADDRESS_ID": $scope.Clientinfo.ADDRESS_ID,//地址ID
                "DEPT_CODE": $scope.deptData.DEPT_CODE,
                "IS_ONLINE": isOnline,
                "IS_REFERRAL":$scope.IS_REFERRAL,
                "REFERRAL_REG_ID":AppointmentDeptGroupService.REFERRAL_REG_ID,
                "REFERRAL_DIRECTION":AppointmentDeptGroupService.REFERRAL_DIRECTION,
                //修改人：任妞     修改时间：2016年8月18日   下午5：46：38   任务号：KYEEAPPC-7336
                "HOSPITAL_AREA":$scope.AppointconfrimSchedule.HOSPITAL_AREA
            };

            var backView = $ionicHistory.backView();
            if (backView && backView.stateId === 'consulationnote') { //从会诊页面过来, 需要在扩展字段中传入会诊相关数据
                var tmpData = AppointConfirmService.consulationData;         //会诊页面传过来的会诊数据 需要添加在扩展字段里
                if (tmpData.REG_ID) {  //请求参数中增加REG_ID
                    paramsConfirm.REG_ID = AppointConfirmService.consulationData.REG_ID;
                }
                paramsConfirm.consultationFlag = tmpData.consultationFlag;
                paramsConfirm.consultPatientKeyId = tmpData.consultPatientKeyId;
                paramsConfirm.reservationId = tmpData.reservationId;
            }

            if ($scope.appointClinicData.EXPENSE_DETAIL) {
                var expenseDetailTemp = angular.copy($scope.appointClinicData.EXPENSE_DETAIL);
                if($scope.oneFeeDetailTemp && $scope.oneFeeDetailTemp.length != 0) {
                    var oneFeeDetailObj = $scope.oneFeeDetailTemp[0];
                    expenseDetailTemp.splice(expenseDetailTemp.length,0,oneFeeDetailObj);
                    $scope.oneFeeDetailTemp = [];
                }
                //开启病历本功能，并且选择购买了病历本，将病历本加入拓展字段
                if($scope.checkBox && $scope.casebookFee != -1 && $scope.checkBox == 1) {
                    var casebookObj = {};
                    casebookObj.feedesc = '病历本';
                    casebookObj.fee = parseFloat($scope.casebookFee).toFixed(2);
                    if(expenseDetailTemp && expenseDetailTemp.length == 0) {
                        expenseDetailTemp.splice(expenseDetailTemp.length, 0 , registobj);
                    }
                    expenseDetailTemp.splice(expenseDetailTemp.length,0,casebookObj);
                }
                if(expenseDetailTemp.length != 0) {
                    paramsConfirm["EXPENSE_DETAIL"] = JSON.stringify(expenseDetailTemp);
                }
            }

            // wangchengcheng 2016年1月14日09:19:26 APPCOMMERCIALBUG-1987
            var appointType = AppointmentDoctorDetailService.CLINIC_DETAIL.APPOINT_PAY_WAY == "1" ? "1" : "0";//0:预约不缴费 1：预约缴费 2：预约后缴费
            var isVerifyMedicalCard = $scope.isVerifyMedicalCardPara;//预约是否输入卡号，卡密码 0：不输入就诊卡号，密码 1：输入就诊卡号
            // 判断出生证号是否合法  KYEEAPPC-4850 2016年1月11日11:34:21 wangchengcheng
            if ($scope.birthNumberSwitchNew == "1" ) {
                var regExpress = /^[A-Za-z0-9]+$/;
                if ($scope.patientInf.BIRTH_CERTIFICATE_NO == undefined || $scope.patientInf.BIRTH_CERTIFICATE_NO == null || $scope.patientInf.BIRTH_CERTIFICATE_NO == "") {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appoint_confirm.birthCertificateNoError1","请输入出生证号！"),
                        duration: 3000
                    });
                    return;
                } else if (!regExpress.test($scope.patientInf.BIRTH_CERTIFICATE_NO)) {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appoint_confirm.birthCertificateNoError2","出生证号不合法！"),
                        duration: 3000
                    });
                    return;
                }
            }
            //校验出生地区是否已输入
            if ($scope.patientBirthAddressSwitch == "1" ) {
                if ($scope.addressModelBirth.ADDRESS == undefined || $scope.addressModelBirth.ADDRESS == null || $scope.addressModelBirth.ADDRESS == "") {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appoint_confirm.birthAddressNoError1","请输入出生地区！"),
                        duration: 3000
                    });
                    return;
                }
            }
            //校验现居住地是否已输入
            if ($scope.patientPresentAddressSwitch == "1" ) {
                if ($scope.addressModelPresent.ADDRESS == undefined || $scope.addressModelPresent.ADDRESS == null || $scope.addressModelPresent.ADDRESS == "") {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appoint_confirm.presentAddressNoError1","请输入现居住地！"),
                        duration: 3000
                    });
                    return;
                }
            }
            //wangwan  对于医院参数开、且卡类型是虚拟卡类型0，则弹框让用户确认收费类型 KYEEAPPC-11869
            paramsConfirm.IS_MEDICAL_TYPE = '';//默认此标识是空的
            if('0'==tempCardTYpe&&"1"==$scope.virtualAppointUserType){
                var dialog = KyeeMessageService.dialog({
                    tapBgToClose : true,
                    template: "modules/business/appoint/views/delay_views/appoint_disting_user_type.html",
                    scope: $scope,
                    title: "提示",
                    buttons: [
                        {
                            text: "自费用户",
                            click: function () {
                                dialog.close();
                                paramsConfirm.IS_MEDICAL_TYPE = '0';
                                if (isVerifyMedicalCard == '1'&&!AppointmentCreateCardService.enterInfo) {
                                    //弹出输入卡号和密码的输入框
                                    inputCardPwd(paramsConfirm);
                                } else {
                                    //预约不缴费
                                    if (appointType == 0) {
                                        //预约不缴费
                                        appointNoPayRequest(paramsConfirm);
                                    } else {
                                        //预约缴费
                                        appointPayRequest(paramsConfirm);
                                    }
                                }
                            }
                        },
                        {
                            text:  "医保用户",
                            style:'button-size-l',
                            click: function () {
                                dialog.close();
                                paramsConfirm.IS_MEDICAL_TYPE = '1';
                                if (isVerifyMedicalCard == '1'&&!AppointmentCreateCardService.enterInfo) {
                                    //弹出输入卡号和密码的输入框
                                    inputCardPwd(paramsConfirm);
                                } else {
                                    //预约不缴费
                                    if (appointType == 0) {
                                        //预约不缴费
                                        appointNoPayRequest(paramsConfirm);
                                    } else {
                                        //预约缴费
                                        appointPayRequest(paramsConfirm);
                                    }
                                }
                            }
                        }
                    ]
                });
            }else{
                if (isVerifyMedicalCard == '1'&&!AppointmentCreateCardService.enterInfo) {
                    //弹出输入卡号和密码的输入框
                    inputCardPwd(paramsConfirm);
                } else {
                    //预约不缴费
                    if (appointType == 0) {
                        //预约不缴费
                        appointNoPayRequest(paramsConfirm);
                    } else {
                        //预约缴费
                        appointPayRequest(paramsConfirm);
                    }
                }
            }


        };
        //跳转到选择地址界面
        $scope.toAddAddress = function () {
            $state.go("address_manage");
            OperationMonitor.record("countToAddAddress", "appoint_confirm");
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
        //修改就诊卡输入框中的内容
        $scope.inputCardNo = function () {
            //将患者输入的卡号作为预约卡号
            $scope.patientInf.CARD_NO = $scope.patientInf.CARD_SHOW;
            //wangwan 输卡，则卡类型是空的 KYEEAPPC-11869
            $scope.patientInf.CARD_TYPE = "";
            //清空PATIENT_ID
            $scope.PATIENT_ID = '';
            if($scope.patientInf.CARD_NO == "" && $scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >= 1) {
                if ($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "挂号费") {
                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                }
                if ($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                    //总费用减去建档费
                    selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) - parseFloat($scope.archiveDetail)).toFixed(2);
                    $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
                }
                $scope.Fee_Name = "挂号费用：";
                $scope.FeeType = 0;
                if ($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length == 1) {
                    if($scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                        $scope.Fee_Name = $scope.appointClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                        $scope.FeeType = 1;
                    }
                    $scope.oneFeeDetailTemp = angular.copy($scope.appointClinicData['EXPENSE_DETAIL']);
                    $scope.appointClinicData.EXPENSE_DETAIL.splice(0, 1);
                } else if($scope.appointClinicData.EXPENSE_DETAIL && $scope.appointClinicData.EXPENSE_DETAIL.length >1) {
                    $scope.Fee_Name = "支付费用：";
                    $scope.FeeType = 2;
                }
            }
        };
        //begin 药事费明细中冒号改进为中文全角冒号 By 高玉楼 KYEEAPPTEST-2819
        //begin 药事服务费 By 高玉楼 KYEEAPPC-2789
        //挂号费明细查看
        $scope.showRegistCostMsg = function () {
            var diageFeeStr, pharmacyFeeStr, regFeeStr;
            if (!selSchedule.REG_FEE) {
                regFeeStr = '';
            }
            else {
                regFeeStr =  KyeeI18nService.get("appoint_confirm.REG_FEE","挂号费：¥") + selSchedule.REG_FEE;
            }
            //诊疗费用显示增加￥符号
            if (!selSchedule.DIAG_FEE) {
                diageFeeStr = "";
            } else {
                diageFeeStr = KyeeI18nService.get("appoint_confirm.DIAG_FEE","<br>诊疗费：¥") + selSchedule.DIAG_FEE;
            }
            //药事费用显示增加￥符号
            if (!selSchedule.PHARMACY_FEE) {
                pharmacyFeeStr = "";
            } else {
                pharmacyFeeStr = KyeeI18nService.get("appoint_confirm.PHARMACY_FEE","<br>药事费：¥") + selSchedule.PHARMACY_FEE;
            }
            //end 药事服务费 By 高玉楼
            KyeeMessageService.message({
                title:  KyeeI18nService.get("appoint_confirm.registAmountDetail","挂号费明细"),
                content: regFeeStr + pharmacyFeeStr + diageFeeStr
            });
        };
        //end 药事服务费 By 高玉楼
        //end 药事费明细中冒号改进为中文全角冒号 By 高玉楼
        //打开模态窗口
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
        //begin  网络科室标示获取从科室中获取 By 高玉楼 KYEEAPPTEST-2805
        $scope.IS_ONLINE = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE;
        //end 网络科室标示获取从科室中获取 By 高玉楼
        // 显示出生证号模板  KYEEAPPC-4850 2016年1月11日11:34:21 wangchengcheng
        $scope.showBirthCertificateNoTemplate = function () {
            var birthCertificateNoTemplateDialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/birth_certificate_no_template.html",
                scope: $scope,
                title: KyeeI18nService.get("appoint_confirm.birthCertificateNoTemplate","出生证模板（仅供参考）"),
                buttons: [{
                    style: "button button-block button-size-l",
                    text:  KyeeI18nService.get("appoint_confirm.birthCertificateNoTemplateIsOk","确定"),
                    click: function () {
                        birthCertificateNoTemplateDialog.close();
                    }
                }]
            });
            OperationMonitor.record("countShowBirthCertificateNoTemplate", "appoint_confirm");
        };
        $scope.gofeedback = function () {
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("aboutquyi_feedback");
            //统计意见反馈各入口点击数量  by 高萌  KYEEAPPC-5534
            OperationMonitor.record("aboutquyi_feedback", "appointRegistResult");
        };
        //将html绑定的ng-clinic事件重新编译 wangchengcheng KYEEAPPC-4908
        footerClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("blacklistDetail"));
                    element.html($scope.blacklistDetail);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };

        /**
         * 当前页面离开时候的监听
         */
        $scope.$on("$ionicView.leave", function(event, data){
            AppointConfirmService.consulationData = {};  //清空会诊页面带过来的数据
        });
        //判断是否配置儿童预约挂号特殊提示信息，如果是，弹出提示且成人可以预约挂号
        $scope.hasChildrenInfo = function(){
            var userBirth = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).DATE_OF_BIRTH;
            var deptCode;
            if(AppointmentDoctorDetailService.doctorInfo) {
                deptCode = AppointmentDoctorDetailService.doctorInfo.DEPT_CODE;
            } else {
                deptCode = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.deptCode;
            }
            var patientAge = CenterUtilService.ageBydateOfBirth(userBirth);
            var j = 0;
            var i;
            for(i=patientAge.length-1 ;i>0;i--){
                if(patientAge.charCodeAt(i)>256){
                    j++;
                }else{
                    break;
                }
            }
            if(j==2){
                patientAge = Number((Number(patientAge.slice(0,patientAge.length-j))/12).toFixed(1));
            }else if(j==1){
                patientAge = Number(patientAge.slice(0,patientAge.length-j));
            }
            if(patientAge >= Number($scope.childrenLimit.age) && $scope.isInChildList(deptCode,$scope.childrenLimit.dept) && $scope.childrenLimit.info != ""){
                return true;
            }else{
                return false;
            }
        };
        //判断科室是否在限制儿童挂号科室列表中
        $scope.isInChildList = function(dept,deptList){
            if(deptList.length == 0){
                return false;
            }
            else {
                for (var i = 0; i < deptList.length; i++) {
                    if (dept == deptList[i]) {
                        return true;
                    } else if (i == deptList.length - 1 && dept != deptList[i]) {
                        return false;
                    }
                }
            }
        }
    })
    .build();


