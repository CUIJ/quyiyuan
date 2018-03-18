/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/4
 * 创建原因：确认挂号控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.regist.registConfirm.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.regist.regist_registConfirm.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.payOrder.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.regist.regist_registConfirm.service",
        "kyee.quyiyuan.address_manage.controller",
        "kyee.quyiyuan.appointment.create_card.controller",
        "kyee.quyiyuan.appointment.result.controller",
        "kyee.quyiyuan.address_manage.service",
    ])
    .type("controller")
    .name("RegistConfirmController")
    .params(["$scope", "$state","$ionicHistory", "KyeeViewService", "AppointmentDeptGroupService",
        "PayOrderService", "CacheServiceBus", "KyeeMessageService", "QueryHisCardService", "KyeeListenerRegister",
        "CustomPatientService", "AppointmentRegistDetilService", "RegistConfirmService", "AuthenticationService",
        "AppointmentCreateCardService", "RsaUtilService","AppointmentDoctorDetailService","KyeePhoneService",
        "$ionicScrollDelegate","KyeeI18nService","AddressmanageService","HospitalService","CommPatientDetailService",
        "PatientCardService","OperationMonitor","$timeout","$compile","MyCareDoctorsService","HospitalSelectorService","CenterUtilService","KyeeBDMapService","KyeeUtilsService"])
    .action(function ($scope, $state, $ionicHistory,KyeeViewService, AppointmentDeptGroupService,
                      PayOrderService, CacheServiceBus, KyeeMessageService, QueryHisCardService, KyeeListenerRegister,
                      CustomPatientService, AppointmentRegistDetilService, RegistConfirmService, AuthenticationService,
                      AppointmentCreateCardService, RsaUtilService,AppointmentDoctorDetailService,KyeePhoneService,
                      $ionicScrollDelegate,KyeeI18nService,AddressmanageService,HospitalService,CommPatientDetailService,
                      PatientCardService,OperationMonitor,$timeout,$compile,MyCareDoctorsService,HospitalSelectorService,CenterUtilService,KyeeBDMapService,KyeeUtilsService) {

        $scope.RegistconfrimSchedule = {};
        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };
        //打开模态窗口
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
        //由于ng-module只能绑定页面对象就诊者信息
        $scope.patientInf = {
            CARD_NO: "",
            CARD_SHOW: "",
            CARD_NAME:"",
            CARD_TYPE:""
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
                var tail = idNo.substr(len - 4, 4);
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
        //全局参数
        var memoryCache = CacheServiceBus.getMemoryCache();
        var archiveobj;
        var registobj;
        var temp;
        var addNewCardStyle = "<div style='display: block; width: 100%;'><div style='text-align:center;vertical-align: middle;display:flex;justify-content:center;height:36px;line-height:36px;border-radius:2px;border:1px solid #5baa8a;background-color:white;margin:14px'> <i class='icon ion-plus f18 qy-green' style='display: inline-block;'></i><span class='f14 qy-green' style='padding-left: 10px;display: inline-block'> 添加新就诊卡 </span></div></div>";
        //缓存数据
        var storageCache = CacheServiceBus.getStorageCache();
        //挂号号源
        var selSchedule = [];
        //组件kyee-area-picker-directive调用的方法onFinashAdrress中的默认值
        var savedValue = {};
        var amountType;//挂号费别：0:普通；1:特殊人群优惠

        //  By 高萌  KYEEAPPC-5789
        // 就诊者出生地数据结构
        $scope.addressModelBirth={
            BIRTH_PROVINCE_CODE:null,
            BIRTH_PROVINCE_NAME:null,
            BIRTH_CITY_CODE:null,
            BIRTH_CITY_NAME:null,
            BIRTH_PLACE_CODE:null,
            BIRTH_PLACE_NAME:null,
            ADDRESS:null};
        $scope.addressModelPresent={
            LIVE_ADDRESS_TEXT:null,
            LIVE_PROVINCE_CODE:null,
            LIVE_PROVINCE_NAME:null,
            LIVE_CITY_CODE:null,
            LIVE_CITY_NAME:null,
            LIVE_PLACE_CODE:null,
            LIVE_PLACE_NAME:null,
            ADDRESS:null
        };
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
        // By  高萌  触发组件修改患者地址
        $scope.bindDirective = function(params){
            $scope.show = params.show;
        };
        var showBirthAddress = true;//区分是触发出生地址还是居住地，若该值为true，表示触发的是出生地址，否则是居住地。
        $scope.goBirthAddress = function(){
            showBirthAddress = true;
            $scope.$apply();
            $scope.show(savedValue);
            OperationMonitor.record("countGoBirthAddress", "regist_confirm");
        };
        $scope.goPresentAddress = function(){
            showBirthAddress = false;
            $scope.$apply();
            $scope.show(savedValue);
            OperationMonitor.record("countGoPresentAddress", "regist_confirm");
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "regist_confirm",
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
        }
        //By maoruikang  儿童号增加处理需求
        $scope.childrenLimit = {
            age:"",
            dept:"",
            info:""
        };
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "regist_confirm",
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
                $scope.getlocation(function(userLng,userLat){
                    $scope.userLng = userLng;
                    $scope.userLat = userLat;
                });
                memoryCache = CacheServiceBus.getMemoryCache();
                storageCache = CacheServiceBus.getStorageCache();
                var rushMessageData = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA);
                //pushtype = 1; 有号提醒有余号；pushtype = 2; 有号提醒过期pushtype = 3; 抢号成功pushtype = 4; 抢号失败pushtype = 5; 抢号过期
                if(rushMessageData && (rushMessageData.status == 1)) {
                    var postData = rushMessageData.pageData.POST_DATA;
                    postData.HOSPITAL_ID = rushMessageData.pageData.HOSPITAL_ID;
                    postData.APPOINT_PAY_WAY = rushMessageData.pageData.APPOINT_PAY_WAY;
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
                        AppointmentDoctorDetailService.CLINIC_DETAIL = postData;
                        AppointmentDoctorDetailService.CLINIC_SOURCE = postData;
                        AppointmentDoctorDetailService.ARCHIVE_FEE = postData.ARCHIVE_FEE;
                        AppointmentDoctorDetailService.timePeriodShow  = false;
                        //获取hospital_id切换缓存中医院
                        memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, undefined);
                        $scope.initRegistConfirm();
                    }else{
                        MyCareDoctorsService.queryHospitalInfo( postData.HOSPITAL_ID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital( postData.HOSPITAL_ID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    // 把缓存里面的数据传给service
                                    AppointmentDoctorDetailService.selSchedule = postData;
                                    AppointmentDoctorDetailService.doctorInfo = postData;
                                    AppointmentDoctorDetailService.CLINIC_DETAIL = postData;
                                    AppointmentDoctorDetailService.CLINIC_SOURCE = postData;
                                    AppointmentDoctorDetailService.ARCHIVE_FEE = postData.ARCHIVE_FEE;
                                    AppointmentDoctorDetailService.timePeriodShow  = false;
                                    //获取hospital_id切换缓存中医院
                                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, undefined);
                                    $scope.initRegistConfirm();
                                });
                        });
                    }
                }else{
                    $scope.initRegistConfirm();
                }
            }
        });
        $scope.initRegistConfirm = function(){
            $scope.showAmountData = false;
            //start wangwan 转诊标识 KYEEAPPC-6917
            if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_REFERRAL==2){
                $scope.IS_REFERRAL = 2;
            }else{
                $scope.IS_REFERRAL = 0;
            }
            //如果输入卡信息完成  By  章剑飞  KYEEAPPC-2953
            if (AppointmentCreateCardService.enterInfo) {
                $scope = AppointmentCreateCardService.confirmScope;
                $scope.patientInf.CARD_SHOW = KyeeI18nService.get("regist_confirm.applyNewCard","申请新卡");
                $scope.patientInf.CARD_NO = -1;
                $scope.PATIENT_ID = -1;
                $scope.registConfirm();
                AppointmentCreateCardService.enterInfo = false;
                return;
            }
            else
            {
                $scope.patientInf.CARD_SHOW = undefined;
                $scope.patientInf.CARD_NO = undefined;
                $scope.PATIENT_ID = undefined;
            }

            //begin 网络医院标示从科室中获取 By 高玉楼 KYEEAPPTEST-2805
            $scope.IS_ONLINE = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE;
            //end  网络医院标示从科室中获取 By 高玉楼

            //start wangwan 如果路由为网络医院医生，则显示收货地址KYEEAPPC-3577
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取缓存中当前登录用户信息
            var currentuser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //获取缓存中记录的患者预约输入的物理卡号
            var medicalCardNo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.MEDICAL_CARDNO);
            //获取排班页面点击上下午时查询到的号源附带的就诊卡是否隐藏的参数 false:显示 true 隐藏
            $scope.showCardNo = AppointmentDoctorDetailService.CLINIC_DETAIL.isHidden;
            //就诊卡信息默认不显示
            $scope.cardInfo = false;
            //获取排班页面用户点击挂号的排班数据
            $scope.RegistconfrimSchedule = AppointmentDoctorDetailService.selSchedule;
            //获取排版页面用户点击挂号的医生信息
            $scope.Registconfrimdoctor = AppointmentDoctorDetailService.doctorInfo;
            //如果缓存中存在科室，则直接从缓存中获取科室信息
            if(AppointmentDoctorDetailService.doctorInfo)
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
            //end C端首页选择科室后，科室信息优先从缓存中获取 BY 高玉楼
            //门诊位置暂隐藏
            $scope.LOC_INFO = false;
            //所选择号源的全局变量
            var registClinicData = AppointmentDoctorDetailService.CLINIC_SOURCE;
            if(AppointmentDoctorDetailService.timePeriodShow)
            {
                //获取用户号源
                $scope.registClinicData = registClinicData.value2;
                $scope.CLINIC_DURATION =  $scope.registClinicData.HB_TIME;
            }
            else
            {
                $scope.registClinicData = registClinicData;
                $scope.CLINIC_DURATION =  $scope.RegistconfrimSchedule.CLINIC_DURATION;
            }

            // 如果EXPENSE_DETAIL不为空，则优先显示明细 任务号：KYEEAPPC-6791
            // 获取的明细数据格式为：""[{ "feedesc":"就诊费", "fee":"10.5" },{ "feedesc":"诊疗费", "fee":"5.5" },{ "feedesc":"陪护费", "fee":"5.5" }]""
            if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length >= 1) {
                if($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "挂号费") {
                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                }
                if($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                }
            }
            var expenseDetail = $scope.registClinicData.EXPENSE_DETAIL;
            if (expenseDetail && typeof(expenseDetail) == "string") {
                var expenseDetailStart = expenseDetail.indexOf('[');
                var expenseDetailEnd = expenseDetail.indexOf(']');
                expenseDetail = expenseDetail.substring(expenseDetail.indexOf('['), expenseDetail.indexOf(']') + 1);
                try{
                    $scope.registClinicData.EXPENSE_DETAIL = JSON.parse(expenseDetail);
                }catch(err) {
                    $scope.registClinicData.EXPENSE_DETAIL = null;
                    console.log(err);
                }

            }

            //获取建档费
            $scope.archiveDetail = AppointmentDoctorDetailService.ARCHIVE_FEE + "";

            //如果号源费用不为空，以号源中的费用为准  wangwan 2015年12月31日11:28:22
            $scope.registClinicData.IS_SHOW_FEE_DETAIL = '0';//默认挂号号源不显示挂号费明细，药事费和诊疗费其中一个不为空，则显示挂号费明细
            //药事费，如果药事费为0.00，则不取药事费（要与海路确认）
            if($scope.registClinicData.PHARMACY_FEE&&parseFloat($scope.registClinicData.PHARMACY_FEE).toFixed(2)!=0.00){
                //如果诊疗费为0元，则不显示挂号费明细
                selSchedule.PHARMACY_FEE =$scope.registClinicData.PHARMACY_FEE;
                $scope.registClinicData.IS_SHOW_FEE_DETAIL = '1';
            }else{
                selSchedule.PHARMACY_FEE = $scope.RegistconfrimSchedule.PHARMACY_FEE;
            }
            //诊疗费
            if($scope.registClinicData.DIAG_FEE&&parseFloat($scope.registClinicData.DIAG_FEE).toFixed(2)!=0.00){
                selSchedule.DIAG_FEE = $scope.registClinicData.DIAG_FEE;
                $scope.registClinicData.IS_SHOW_FEE_DETAIL = '1';
            }else{
                selSchedule.DIAG_FEE = $scope.RegistconfrimSchedule.DIAG_FEE
            }
            //总挂号费
            if($scope.registClinicData.REGISTERED_FEE&&parseFloat($scope.registClinicData.REGISTERED_FEE).toFixed(2)!=0.00){
                selSchedule.SUM_FEE=$scope.registClinicData.REGISTERED_FEE;
                $scope.registAmount = "¥" + selSchedule.SUM_FEE;
            }else{
                //将挂号费用显示增加￥符号
                if (!$scope.RegistconfrimSchedule.SUM_FEE) {
                    selSchedule.SUM_FEE = "";
                } else {
                    $scope.registAmount = "¥" + $scope.RegistconfrimSchedule.SUM_FEE;
                    selSchedule.SUM_FEE=$scope.RegistconfrimSchedule.SUM_FEE;
                }
            }
            //计算实际挂号费
            if((selSchedule.DIAG_FEE!= undefined&&selSchedule.DIAG_FEE!="")&&(selSchedule.PHARMACY_FEE != undefined&&selSchedule.PHARMACY_FEE!="")){
                selSchedule.REG_FEE = (parseFloat(selSchedule.SUM_FEE)-parseFloat(selSchedule.PHARMACY_FEE)-parseFloat(selSchedule.DIAG_FEE)).toFixed(2);
            }else if(selSchedule.DIAG_FEE!= undefined&&selSchedule.DIAG_FEE!=""){
                selSchedule.REG_FEE = (parseFloat(selSchedule.SUM_FEE)-parseFloat(selSchedule.DIAG_FEE)).toFixed(2);
            }else if(selSchedule.PHARMACY_FEE != undefined&&selSchedule.PHARMACY_FEE!="" ){
                selSchedule.REG_FEE = (parseFloat(selSchedule.SUM_FEE)-parseFloat(selSchedule.PHARMACY_FEE)).toFixed(2);
            }

            var registF = $scope.registAmount;
            $scope.fee = 1;
            if(('¥0'==registF)||('¥0.0'==registF)||('¥0.00'==registF)){
                $scope.fee = 0;
            }
            $scope.feeDetail = $scope.RegistconfrimSchedule.FEE_DETAIL;
            $scope.PATIENT_NAME = currentPatient.OFTEN_NAME;
            $scope.ID_NO_STAR = getStarIdNo(currentPatient.ID_NO);//将身份证号转换为xxx*****xxxx
            $scope.PHONE_NUMBER = getStarPhoneNum(currentPatient.PHONE);//将手机号转换为xxx****xxxx
            $scope.HID = $scope.registClinicData.HID;
            $scope.RegistconfrimSchedule.timeToSeeDoctor = $scope.registClinicData.HB_TIME;
            //start 获取就诊者就诊卡信息
            RegistConfirmService.setClientinfo(function (Clientinfo) {
                $scope.Clientinfo = Clientinfo;
                $scope.patientInf.BIRTH_CERTIFICATE_NO = Clientinfo.BIRTH_CERTIFICATE_NO;
                $scope.trueOrfalse = function () {
                    //只读
                    if (Clientinfo.CARDNO_TO_APPOINT == 0) {
                        $scope.placeholder = KyeeI18nService.get("regist_confirm.placeholderChooseCard","请选择就诊卡");
                        return true;
                    } else {
                        $scope.placeholder = KyeeI18nService.get("regist_confirm.inputOrChooseCard","请输入或选择就诊卡");
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
                                //选中就诊卡  By  章剑飞  KYEEAPPTEST-2754
                                //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
                                /*QueryHisCardService.updateCardByUserVsId(function () {
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
                        resultMap["value"] = Clientinfo.rows[i].CARD_NO;
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
                                        $scope.registClinicData.EXPENSE_DETAIL = angular.copy($scope.oneFeeDetailTemp);
                                        $scope.oneFeeDetailTemp = [];
                                    }
                                    selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.archiveDetail)).toFixed(2);
                                    $scope.registAmount = "¥" + selSchedule.SUM_FEE;
                                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 0,archiveobj);

                                }
                                if ($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length == 1 && $scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 0, registobj);
                                }
                                //$scope.Fee_Name = "挂号费用：";
                                if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length == 1) {
                                    if($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                                        $scope.Fee_Name = $scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                                        $scope.FeeType = 1;
                                    }
                                    $scope.oneFeeDetailTemp = angular.copy($scope.registClinicData['EXPENSE_DETAIL']);
                                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                                }else if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length >1) {
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
                    resultMap["text"] = KyeeI18nService.get("regist_confirm.applyNewCard","申请新卡");
                    resultMap["value2"] = -1;
                    resultMap["value"] = -1;
                    resultMap["value3"] = 0;
                    menus.push(resultMap);
                    addNewCard = true;
                }
                if(Clientinfo.SUPPORT_PHYSICALCARD == 1) {
                    addNewCard = true;
                }
                if(addNewCard) {
                    $scope.footerBar = addNewCardStyle;
                }
                //控制器中绑定数据
                $scope.pickerItems = menus;
                //end 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼
            });
            //获取就诊卡信息

            var params={
                IS_ONLINE:AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE,
                USER_ID:currentuser.USER_ID,
                USER_VS_ID:currentPatient.USER_VS_ID,
                TYPE:AppointmentDoctorDetailService.selSchedule.BUSSINESS_TYPE,
                AMOUNT:selSchedule.SUM_FEE,
                DOCTOR_CLINIC_TYPE: $scope.Registconfrimdoctor.DOCTOR_CLINIC_TYPE,
                CLINIC_TYPE:$scope.RegistconfrimSchedule.CLINIC_TYPE
            }

            RegistConfirmService.queryClientinfo(params);
            //end 获取就诊者就诊卡信息
            //初始化优惠活动显示标示为undefined；
            //start edit by wangwan  任务号：KYEEAPPC-3616获取优惠类型
            $scope.PreferentialFlag = undefined;
            RegistConfirmService.getPreferentialType(params,function(PreferentialTypeData){
                amountType = PreferentialTypeData.AMOUNT_TYPE;//挂号费别：0:普通；1:特殊人群优惠
                if(amountType == '1'){
                    if(PreferentialTypeData.HAS_SPECIAL_AMOUNT != undefined){
                        selSchedule.SUM_FEE = PreferentialTypeData.HAS_SPECIAL_AMOUNT;
                        if(('¥0'==selSchedule.SUM_FEE)||('¥0.0'==selSchedule.SUM_FEE)||('¥0.00'==selSchedule.SUM_FEE)){
                            $scope.fee = 0;
                        }
                        $scope.registAmount = "¥" +  selSchedule.SUM_FEE;
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
                if($scope.userMessage){
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
                $scope.isShowRegFee = 1;
                $scope.isShowCasebookFee = 0;//0不显示，1显示
                var hospitalId_info = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                //获取缓存中当前就诊者信息
                var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                HospitalService.getParamValueByName(hospitalId_info.id, "IS_SHOW_REG_FEE,getParamValueByName,virtualCardType,BIRTH_NUMBER_SWITCH,PATIENT_ADDRESS_SWITCH,idNo_Check,CREATE_CASEBOOK_FEE,REGIST_PAY_WAY,TJ_CHILDREN_AGE,TJ_CHILDREN_DEPT,CHILDREN_AGE_INFO,SIGN_RANGE,LIMIT_ALERT,RANGE_LIMIT_DEPT,MERGER_SUPPORT,PREFERENTIAL_FEE,BUILD_CARD_ADDRESS,EXTRA_PAY_TIP,EXTRA_PAY_DEPT", function (hospitalPara) {
                    //edit by zhoushiyu 获取病历本费用,预约不缴费时不开启病历本费用功能
                    $scope.casebookFee = hospitalPara.data.CREATE_CASEBOOK_FEE;
                    if(hospitalPara.data.PREFERENTIAL_FEE==1){
                        $scope.isSupportMerge = hospitalPara.data.MERGER_SUPPORT;
                    }else{
                        $scope.isSupportMerge=0;
                    }
                    var registway = hospitalPara.data.REGIST_PAY_WAY;
                    //判断病例本费用合法性，非法时，赋值为-1。
                    try {
                        var testFee = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/;
                        if((!testFee.test($scope.casebookFee)) || registway != 1 ) {
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
                    //是否显示预约费用 0:不显示，1：显示
                    $scope.isShowRegFee = hospitalPara.data.IS_SHOW_REG_FEE;
                    //KYEEAPPC-4733 确认挂号跳选卡界面是否展示虚拟卡标识  wangwan 2016年1月6日11:01:43
                    if(!(hospitalPara.data.virtualCardType.indexOf("3"))){//indexof如果是包括字符则返回值为0，不包括，则返回值为-1
                        $scope.virtualSupportType=false;
                    }else{
                        $scope.virtualSupportType=true;//选卡界面不需要展示虚拟卡
                    }
                    // wangchengcheng KYEEAPPC-4850 出生证号是否显示
                    $scope.birthNumberSwitch = hospitalPara.data.BIRTH_NUMBER_SWITCH;
                    if ($scope.birthNumberSwitch == 1 && currentPatient.ID_NO.indexOf("XNSF") == 0) {
                        $scope.birthNumberSwitchNew = "1";
                        $scope.BIRTH_CERTIFICATE_NO_placeholder =KyeeI18nService.get("regist_confirm.birthCertificateNoPlaceholder","请输入出生证号");
                    } else {
                        $scope.birthNumberSwitchNew = "0";
                    }
                    //获取医院参数是否需要患者住址信息开关和是否允许虚拟身份证就诊开关 by 高萌
                    var patientAddressSwitch = hospitalPara.data.PATIENT_ADDRESS_SWITCH;//是否需要患者住址信息开关
                    var idNoCheckSwitch = hospitalPara.data.idNo_Check;//是否允许虚拟身份证就诊开关
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
                        $scope.DETAIL_ADDRESS_placeholder =KyeeI18nService.get("appoint_confirm.patientAddressPlaceholder","请输入现居地详细地址");
                    } else {
                        $scope.patientPresentAddressSwitch = "0";
                    }
                    //end edit by 高萌  KYEEAPPC-5789 是否显示患者出生地和居住地
                    $scope.childrenLimit.info = hospitalPara.data.CHILDREN_AGE_INFO;
                    $scope.childrenLimit.age = hospitalPara.data.TJ_CHILDREN_AGE;
                    $scope.childrenLimit.dept = hospitalPara.data.TJ_CHILDREN_DEPT.split(",");
                    //end by maoruikang  KYEEAPPC-12113 儿童号增加处理需求
                    //edit by cuijin app-31 用户在指定科室进行挂号时，会根据当前位置判断是否允许挂号
                    $scope.signRange = hospitalPara.data.SIGN_RANGE;
                    $scope.limitAlert = hospitalPara.data.LIMIT_ALERT;
                    $scope.rangeLimitDept = hospitalPara.data.RANGE_LIMIT_DEPT;
                    // edit by maoruikang  APP-30 用户通过APP远程建卡时需要在申请建卡界面录入家庭住址
                    $scope.needAddress = hospitalPara.data.BUILD_CARD_ADDRESS;
                    //edit by maoruikang  APP-903 作为趣医用户，在预约挂号苏州九龙医院时，确认预约挂号弹出提示：预约或挂号此医生，需要线下支付另外的费用，以便于用户知晓医院规则
                    $scope.extraPayTip = hospitalPara.data.EXTRA_PAY_TIP;
                    $scope.extraPayDept = hospitalPara.data.EXTRA_PAY_DEPT.split(",");
                });
            });
            //end  edit by wangwan  任务号：KYEEAPPC-3616获取优惠类型

            //获取建档费
            //构造挂号费、建档费明细
            var regFee ="";
            regFee = selSchedule.SUM_FEE;
            var registFeeDetail = '{"feedesc":"挂号费","fee":"' + regFee + '"}';
            var archiveFeeDetail = '{"feedesc":"建档费","fee":"' + parseFloat($scope.archiveDetail).toFixed(2) + '"}';
            archiveobj = JSON.parse(archiveFeeDetail);
            registobj = JSON.parse(registFeeDetail);
            //判断有无明细，若有则在明细前增加挂号费、建档费明细；若无明细则构建挂号费、建档费明细。
            if($scope.oneFeeDetailTemp && $scope.oneFeeDetailTemp.length != 0){
                $scope.registClinicData.EXPENSE_DETAIL = angular.copy($scope.oneFeeDetailTemp);
                $scope.oneFeeDetailTemp = [];
            }
            try {
                if(expenseDetail == undefined || expenseDetail == "") {
                    var expenseDetail = [];
                    //expenseDetail.push(registobj);
                    expenseDetail.push(archiveobj);
                    temp = JSON.stringify(expenseDetail);
                    if($scope.registClinicData.EXPENSE_DETAIL == "" || $scope.registClinicData.EXPENSE_DETAIL == undefined) {
                        var j = [];
                        var i = JSON.stringify(j);
                        $scope.registClinicData.EXPENSE_DETAIL = JSON.parse(i);
                    }
                }
            }catch(err) {
                $scope.registClinicData.EXPENSE_DETAIL = null;
                console.log(err);
            }
            $scope.oneFeeDetailTemp = [];
            $scope.Fee_Name = "挂号费用：";
            $scope.FeeType = 0;
            if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length == 1) {
                if($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                    $scope.Fee_Name = $scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                    $scope.FeeType = 1;
                }
                $scope.oneFeeDetailTemp = angular.copy($scope.registClinicData['EXPENSE_DETAIL']);
                $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
            } else if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length >1){
                $scope.Fee_Name = "支付费用：";
                $scope.FeeType = 2;
            }
        }
        $scope.affirmCasebook = function() {
            if($scope.checkBox == 1) {
                $scope.checkBox = 0;
            } else {
                $scope.checkBox = 1;
            }

        };
        //选择卡号
        $scope.selectItem = function (params) {
            //将选中的卡号显示到页面上
            $scope.patientInf.CARD_SHOW = params.item.text;
            $scope.patientInf.CARD_NO = params.item.value;
            $scope.patientInf.CARD_TYPE = params.item.value3;
            $scope.PATIENT_ID = params.item.value2;
            $scope.Card_Type = params.item.value3;//第三属性
            if(params.item.name === '电子健康卡'){
                PayOrderService.isHealthCard = true;
            }else{
                PayOrderService.isHealthCard = false;
            }
            if($scope.oneFeeDetailTemp && $scope.oneFeeDetailTemp.length != 0){
                $scope.registClinicData.EXPENSE_DETAIL = angular.copy($scope.oneFeeDetailTemp);
                $scope.oneFeeDetailTemp = [];
            }

            if($scope.archiveDetail != "undefined" && $scope.archiveDetail != "0") {
                if ($scope.Card_Type == "0") {
                    if ($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length == 0 ) {
                        selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.archiveDetail)).toFixed(2);
                        $scope.registAmount = "¥" + selSchedule.SUM_FEE;
                        $scope.registClinicData.EXPENSE_DETAIL.splice(0, 0, registobj, archiveobj);
                    }else if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length >= 1) {
                        if($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费" && $scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "挂号费") {
                            selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.archiveDetail)).toFixed(2);
                            $scope.registAmount = "¥" + selSchedule.SUM_FEE;
                            if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length >= 1) {
                                $scope.registClinicData.EXPENSE_DETAIL.splice(0, 0,archiveobj);
                            }else {
                                $scope.registClinicData.EXPENSE_DETAIL.splice(0, 0, registobj, archiveobj);
                            }
                        }
                    }
                } else if ($scope.Card_Type != "0") {
                    if ($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length >= 1) {
                        if ($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "挂号费") {
                            $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                        }
                        if ($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                            $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                            //总费用减去建档费
                            selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) - parseFloat($scope.archiveDetail)).toFixed(2);
                            $scope.registAmount = "¥" + selSchedule.SUM_FEE;
                        }
                    }
                }
            }

            $scope.Fee_Name = "挂号费用：";
            $scope.FeeType = 0;
            //$scope.oneFeeDetailTemp = JSON.parse(JSON.stringify(""));
            if ($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length == 1 ) {
                if($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                    $scope.Fee_Name = $scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                    $scope.FeeType = 1;
                }
                $scope.oneFeeDetailTemp = angular.copy($scope.registClinicData['EXPENSE_DETAIL']);
                $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
            } else if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length > 1) {
                $scope.Fee_Name = "支付费用：";
                $scope.FeeType = 2;
            }

            //申请新卡则不进行选卡操作
            if ($scope.PATIENT_ID != -1) {
                //获取缓存中当前就诊者信息  By  章剑飞  KYEEAPPTEST-2754
                var userVsId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                var hospital_info = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var hospitalId = hospital_info.id;
                //选中就诊者  By  章剑飞  KYEEAPPTEST-2754
                //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
                /*QueryHisCardService.updateCardByUserVsId(function () {
                }, userVsId, $scope.patientInf.CARD_NO, hospitalId);*/
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
        //点击选择就诊人
        $scope.changepatient = function () {
            CustomPatientService.F_L_A_G = "regist_confirm";
            //关闭弹出的儿科限制
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("custom_patient");
            OperationMonitor.record("countChangePatient", "regist_confirm");
        };
        $scope.toAddNewCard = function() {
            //预约挂号确认页面进入查卡页面标识 KYEEAPPC-9191 yangmingsi
            PatientCardService.fromSource = "fromAppoint";
            PatientCardService.fromAppoint = true;
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
                $scope.title = KyeeI18nService.get("regist_confirm.pleaseChooseCard","请选择就诊卡");
                //调用显示
                $scope.showPicker($scope.patientInf.CARD_NO);
            }
            //end 当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼

            OperationMonitor.record("countPatientCardNo", "regist_confirm");
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
                        $ionicScrollDelegate.$getByHandle("confirm_regist_content").resize();*/
            OperationMonitor.record("countShowChardNoInf", "regist_confirm");
        };
        //判断是否属于网络科室，并走不同分支
        $scope.registConfirm = function () {
            //获取缓存中当前登录用户信息
            var currentuser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //start wangwan 如果路由为网络医院医生，则isOnline=1  KYEEAPPC-3577

            //begin  网络医院标示从科室中获取 By 高玉楼 KYEEAPPTEST-2805
            var isOnline = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE;

            //end wangwan 如果路由为网络医院医生，则isOnline=1  KYEEAPPC-3577
            //end  网络医院标示从科室中获取 By 高玉楼
            var deptCode;
            if(AppointmentDoctorDetailService.doctorInfo) {
                deptCode = AppointmentDoctorDetailService.doctorInfo.DEPT_CODE;
            } else {
                deptCode = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.deptCode;
            }
            //Begin--网络科室进入后需要检测视频插件是否已安装，并登录视频接口服务 张明 2015-7-9
            // 进入条件：属于网络科室
            if (isOnline == '1' && typeof(device) != "undefined" && (device.platform == "Android"||device.platform == "iOS")) {
                try {
                    /*alert(TyRtc);*/
                    if (typeof(TyRtc) == null || typeof(TyRtc) == undefined || typeof(TyRtc) == "undefined") {
                        /*alert(TyRtc);*/
                        KyeeLogger.info(KyeeI18nService.get("regist_confirm.videoInitFalse","*******视频插件初始化失败！*******"));
                        //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                        //视频插件初始化失败，向后台发送请求
                        RegistConfirmService.registeVideoInitFailure();
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
                                    template: "modules/business/regist/views/delay_views/extraPayTip.html",
                                    tapBgToClose:true,
                                    scope: $scope,
                                    // content:tip,
                                    buttons: [
                                        {
                                            text: KyeeI18nService.get("role_view.iKnow", "知道了"),
                                            style: 'button-size-l',
                                            click: function () {
                                                $scope.dialog.close();
                                                $scope.registConfirmDo(isOnline);
                                            }
                                        }
                                    ]
                                })
                            }else{
                                $scope.registConfirmDo(isOnline);
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
                        content: KyeeI18nService.get("regist_confirm.netWorkRegFail","网络科室挂号失败！"),
                        duration: 3000
                    });
                    //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                    //网络科室挂号失败，向后台发送请求
                    RegistConfirmService.registerNetDeptAppointFailure();
                    //end 前端校验阻塞后发送请求 By 高玉楼
                }
            }
            //else if (isOnline == '1' && typeof(device) != "undefined" && device.platform == "iOS") {
            //    KyeeMessageService.broadcast({
            //        content: KyeeI18nService.get("regist_confirm.netWorkNotSupportIOS","网络科室暂不支持IOS系统！"),
            //        duration: 3000
            //    });
            //    //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
            //    //网络科室暂不支持IOS系统，向后台发送请求
            //    RegistConfirmService.registeNonsupportIOS();
            //    //end 前端校验阻塞后发送请求 By 高玉楼
            //}
            else if (isOnline == '1' && typeof(device) == "undefined") {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("regist_confirm.netWorkNotSupportWebPage","网络科室暂不支持网页版！"),
                    duration: 3000
                });
                //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                //网络科室暂不支持网页版，向后台发送请求
                RegistConfirmService.registerNetDeptSupportWeb();
                //end 前端校验阻塞后发送请求 By 高玉楼
            } else {
                if($scope.hasChildrenInfo()) {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("appoint_confirm.messageTitle", "温馨提示"),
                        content: $scope.childrenLimit.info,
                        cancelText: "否",
                        okText: "是",
                        onSelect: function (flag) {
                            if (flag) {
                                isOnline = "0";//这里到时要改为0
                                $scope.registConfirmDo(isOnline);//非网络科室还是走原来的流程
                            }
                        }
                    })
                }else if(!CenterUtilService.isDataBlank($scope.extraPayTip)&&$scope.isInChildList(deptCode,$scope.extraPayDept)&&!AppointmentCreateCardService.enterInfo){
                    $scope.dialog = KyeeMessageService.dialog({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        // okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                        template: "modules/business/regist/views/delay_views/extraPayTip.html",
                        tapBgToClose:true,
                        scope: $scope,
                        // content:tip,
                        buttons: [
                            {
                                text: KyeeI18nService.get("role_view.iKnow", "知道了"),
                                style: 'button-size-l',
                                click: function () {
                                    $scope.dialog.close();
                                    isOnline = "0";//这里到时要改为0
                                    $scope.registConfirmDo(isOnline);//非网络科室还是走原来的流程
                                }
                            }
                        ]
                    })
                }else{
                    isOnline = "0";//这里到时要改为0
                    $scope.registConfirmDo(isOnline);//非网络科室还是走原来的流程
                }
            }
            //End--网络科室进入后需要检测视频插件是否已安装，并登录视频接口服务

            //OperationMonitor.record("countConfirmRegist", "regist_confirm");
        };
        //点击确认挂号
        $scope.registConfirmDo = function (isOnline) {

            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);

            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取缓存中当前登录用户信息
            var currentuser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //edit by cuijin app-31 用户在指定科室进行挂号时，会根据当前位置判断是否允许挂号
            if($scope.RANGE_LIMIT_REGIST()){
                return;
            }
            //校验就诊者卡信息
            if (!$scope.patientInf.CARD_NO && !$scope.placeholder) {//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                //校验就诊者卡失败，向后端发送家这款校验失败的请求
                RegistConfirmService.choosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("regist_confirm.whetherChooseCard","请选择就诊卡")
                });
                return;
            }
            if (!$scope.patientInf.CARD_SHOW) {
                //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                //校验就诊者卡失败，向后端发送家这款校验失败的请求
                RegistConfirmService.inputOrChoosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    content: KyeeI18nService.get("regist_confirm.PleaseInputOrChooseCard","请输入就诊卡号")
                });
                return;
            }
            //若支持患者输入卡号，则将用户输入的信息与卡列表信息对比
            if ($scope.Clientinfo.CARDNO_TO_APPOINT != 0) {
                //检验用户输入的信息是否存在于卡列表中  By  章剑飞  KYEEAPPC-2795
                for (var i = 0; i < $scope.pickerItems.length; i++) {
                    if ($scope.patientInf.CARD_SHOW == $scope.pickerItems[i].text) {
                        //匹配到卡信息则直接使用其信息
                        $scope.PATIENT_ID = $scope.pickerItems[i].value2;
                        $scope.patientInf.CARD_NO = $scope.pickerItems[i].value;
                        break;
                    }
                }
            }
            //加上病历本费用
            if($scope.checkBox && $scope.casebookFee != -1 && $scope.checkBox == 1) {
                selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) + parseFloat($scope.casebookFee)).toFixed(2);
            }

            //申请新卡
            if ($scope.PATIENT_ID == -1) {
                $scope.PATIENT_ID = '';
                $scope.patientInf.CARD_NO = '';
            }
            var paramsConfirm = {
                "hospitalID": hospitalinfo.id,
                "postdata": {
                    "DEPT_CODE": $scope.deptData.DEPT_CODE,
                    "DEPT_NAME": $scope.deptData.DEPT_NAME,
                    "DOCTOR_CODE": $scope.Registconfrimdoctor.DOCTOR_CODE,
                    "DOCTOR_NAME": $scope.Registconfrimdoctor.DOCTOR_NAME,
                    "MARK_DESC": $scope.RegistconfrimSchedule.CLINIC_LABEL,//号别
                    "CLINIC_TYPE": $scope.RegistconfrimSchedule.CLINIC_TYPE,
                    "REG_DATE": $scope.RegistconfrimSchedule.CLINIC_DATE,//挂号日期
                    "CLINIC_DURATION": $scope.RegistconfrimSchedule.timeToSeeDoctor,//午别
                    "AMOUNT_TEXT": $scope.registAmount,//显示¥的挂号费用
                    "AMOUNT": selSchedule.SUM_FEE,//挂号费用
                    "AMOUNT_TYPE":amountType,//挂号费别：0:普通；1:特殊人群优惠
                    "PATIENT_ID": $scope.PATIENT_ID,
                    "PATIENT_NAME": $scope.PATIENT_NAME,
                    "ID_NO": currentPatient.ID_NO,//身份证
                    "ID_NO_STAR": $scope.ID_NO_STAR,//加*的身份证
                    "BIRTH_CERTIFICATE_NO":$scope.patientInf.BIRTH_CERTIFICATE_NO, // 出生证号
                    "PHONE_NUMBER_STAR": $scope.PHONE_NUMBER,//加*的手机号
                    "LOC_INFO": $scope.RegistconfrimSchedule.CLINIC_POSITION,//门诊位置
                    "CARD_NO": $scope.patientInf.CARD_NO,
                    "HID": $scope.HID,//获取号源
                    "DIAG_FEE": selSchedule.DIAG_FEE,
                    "PHARMACY_FEE": selSchedule.PHARMACY_FEE,
                    "CARD_PWD": AppointmentCreateCardService.password,
                    "ADDRESS": AppointmentCreateCardService.address,
                    "HB_TYPE":$scope.registClinicData.HB_TYPE,
                    "HB_NO":$scope.registClinicData.HB_NO,
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
                "MARK_DESC": $scope.RegistconfrimSchedule.CLINIC_LABEL,//号别
                "HID": $scope.HID + "/" + $scope.RegistconfrimSchedule.timeToSeeDoctor,
                "AMOUNT": selSchedule.SUM_FEE,
                "USER_ID": currentuser.USER_ID,
                "PATIENT_ID": $scope.PATIENT_ID,
                "USER_VS_ID": currentPatient.USER_VS_ID,
                "ADDRESS_ID": $scope.Clientinfo.ADDRESS_ID,//地址ID
                "DEPT_CODE": $scope.deptData.DEPT_CODE,
                "IS_ONLINE": isOnline,
                "IS_REFERRAL":$scope.IS_REFERRAL,
                "REFERRAL_REG_ID":AppointmentDeptGroupService.REFERRAL_REG_ID,
                "REFERRAL_DIRECTION":AppointmentDeptGroupService.REFERRAL_DIRECTION,

                //修改人：任妞     修改时间：2016年8月18日   下午5：46：38   任务号：KYEEAPPC-7336
                "HOSPITAL_AREA": $scope.RegistconfrimSchedule.HOSPITAL_AREA

            };
            if ($scope.registClinicData.EXPENSE_DETAIL) {
                var expenseDetailTemp = angular.copy($scope.registClinicData.EXPENSE_DETAIL);
                if($scope.oneFeeDetailTemp && $scope.oneFeeDetailTemp.length != 0) {
                    var oneFeeDetailObj = $scope.oneFeeDetailTemp[0];
                    expenseDetailTemp.splice(expenseDetailTemp.length,0,oneFeeDetailObj);
                    $scope.oneFeeDetailTemp = [];
                }
                //开启病历本功能，并且选择购买了病历本，将病历本加入拓展字段
                if($scope.checkBox && $scope.casebookFee != -1 && $scope.checkBox == 1) {
                    var casebookObj = new Object();
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
            //确认挂号请求
            var isVerifyMedicalCard = hospitalinfo.is_regist_card_pwd;//挂号是否输入卡号，卡密码 0：不输入就诊卡号，密码 1：输入就诊卡号
            // 判断出生证号是否合法
            if ($scope.birthNumberSwitchNew == "1" ) {
                var regExpress = /^[A-Za-z0-9]+$/;
                if ($scope.patientInf.BIRTH_CERTIFICATE_NO == undefined || $scope.patientInf.BIRTH_CERTIFICATE_NO == null || $scope.patientInf.BIRTH_CERTIFICATE_NO == "") {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("regist_confirm.birthCertificateNoError1","请输入出生证号！"),
                        duration: 3000
                    });
                    return;
                } else if (!regExpress.test($scope.patientInf.BIRTH_CERTIFICATE_NO)) {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("regist_confirm.birthCertificateNoError2","出生证号不合法！"),
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
            /* //校验现居住地详细地址是否已输入
             if ($scope.patientPresentAddressSwitch == "1" ) {
                 if ($scope.addressModelPresent.LIVE_ADDRESS_TEXT == undefined || $scope.addressModelPresent.LIVE_ADDRESS_TEXT == null || $scope.addressModelPresent.LIVE_ADDRESS_TEXT == "") {
                     KyeeMessageService.broadcast({
                         content:  KyeeI18nService.get("appoint_confirm.presentAddressNoError1","请输入现居地详细地址！"),
                         duration: 3000
                     });
                     return;
                 }
             }*/
            if (isVerifyMedicalCard == "1" && paramsConfirm.postdata.CARD_NO != '') {
                //挂号需要输入卡号，密码对象
                $scope.isVerifyRegistMedicalCard = {
                    IN_CARDNO: $scope.patientInf.CARD_NO,//无需存入缓存，现在如果挂号成功，后台会有机制将此卡号设置为默认卡号，下次会自动查询出来，前台无需处理  -张明
                    IN_CARDPWD: ""
                };
                inputCardPwd(paramsConfirm);
            } else {
                confirmRegist(paramsConfirm);
            }


        };
        //确认挂号请求  (增加就诊卡密码输入功能，将请求交互方法提出来，方便程序扩展  张明 KYEEAPPC-3020)
        var confirmRegist = function (paramsConfirm) {
            //如果路由来自网络医院，则不从缓存中获取医院信息

            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalID,true);

            RegistConfirmService.confirmRegist(paramsConfirm, function (data) {
                //根据请求返回判断：
                if (data.success) {
                    // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                    // data.data["MARK_DESC"] = $scope.RegistconfrimSchedule.CLINIC_LABEL;
                    if($scope.REG_FEE_REPLACE != undefined && $scope.REG_FEE_REPLACE != "" && $scope.REG_FEE_REPLACE != null){
                        data.data["MARK_DESC"] = $scope.REG_FEE_REPLACE;
                    }else{
                        data.data["MARK_DESC"] = KyeeI18nService.get("appoint_confirm.markDesc","挂号费");
                    }
                    data.data["MARK_DETAIL"] = $scope.RegistconfrimSchedule.CLINIC_LABEL;
                    if(data.data["isSupportMerge"]==1){
                        data.data["AMOUNT"] = data.data["USER_PAY_AMOUNT"];
                        data.data["PREFERENTIAL_FEE"]="";
                    }else{
                        data.data["AMOUNT"] = selSchedule.SUM_FEE;
                    }
                    data.data["flag"] = 1;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3:预约缴费
                    data.data["TRADE_NO"] = data.data.OUT_TRADE_NO;
                    data.data["hospitalID"] = hospitalinfo.id;//由于跨医院，需要将hospitalId传递到支付页面
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
                    data.data["CLINIC_DURATION"] = $scope.RegistconfrimSchedule.timeToSeeDoctor;
                    data.data["C_REG_ID"] = data.data.REG_ID;
                    //传入确认挂号路由
                    data.data["ROUTER"] = "regist_doctorSchedule";


                    if (data.data.businessType == "REGIST_NOPAY") {
                        //挂号不缴费
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: hospitalinfo.id,
                            REG_ID: data.data.REG_ID
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = "regist_confirm";

                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                        $state.go("appointment_result");

                        //edit by wangwan KYEEAPPC-3372 直连医院模式下，挂号成功后底部不显示处理中信息的问题
                        /* KyeeMessageService.broadcast({
                             content: data.message,
                             duration: 5000
                         });*/
                    }
                    else {
                        //挂号缴费
                        var feeStr = data.data["PREFERENTIAL_FEE"];
                        $scope.zeroPay = parseFloat(data.data["USER_PAY_AMOUNT"]).toFixed(2);
                        var FEE;
                        if(feeStr){
                            FEE=JSON.parse(feeStr);
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
                                        AppointmentRegistDetilService.ROUTE_STATE = "regist_confirm";
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
                            if(data.data["AMOUNT"] == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                                AppointmentRegistDetilService.RECORD = {
                                    HOSPITAL_ID: hospitalinfo.id,
                                    REG_ID: data.data.REG_ID,
                                    handleNoPayFlag:"1"
                                };
                                AppointmentRegistDetilService.ROUTE_STATE = "regist_confirm";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                $state.go("appointment_result");
                            }else
                            {
                                $state.go("payOrder");
                            }

                        }
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
                        /*  KyeeMessageService.confirm({
                              title: KyeeI18nService.get("regist_confirm.messageTitle","温馨提示"),
                              content: data.message,
                              cancelText: KyeeI18nService.get("regist_confirm.cancelMsg","以后再说"),
                              okText: KyeeI18nService.get("regist_confirm.confirmlMsg","立即前往"),

                              onSelect: function (res) {
                                  if (res) {
                                      var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                      patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                                      patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                                      patient.loginNum = "";         //短信验证码制空
                                      var people = angular.copy(patient);
                                      CommPatientDetailService.item = people;
                                      CommPatientDetailService.F_L_A_G = "regist_confirm";
                                      $state.go('comm_patient_detail');

                                  }
                              }
                          });*/
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
                                confirmRegist(paramsConfirm)
                            }
                        }
                    }
                ]
            });
        };
        //跳转到选择地址界面
        $scope.toAddAddress = function () {

            AddressmanageService.ROUTER="regist_confirm";
            $state.go("address_manage");
            OperationMonitor.record("countToAddAddress", "regist_confirm");
        };
        //跳转到配送范围页面 吴伟刚 KYEEAPPC-2919 网络医院增加查看可配送范围
        $scope.toSendAddress = function () {
            KyeeViewService.openModalFromUrl({
                url: "modules/business/appoint/views/send_address.html",
                scope: $scope,
                animation: "scale-in"
            });
            OperationMonitor.record("countToSendAddress", "regist_confirm");
        };
        //修改就诊卡输入框中的内容
        $scope.inputCardNo = function () {
            //将患者输入的卡号作为预约卡号
            $scope.patientInf.CARD_NO = $scope.patientInf.CARD_SHOW;

            //清空PATIENT_ID
            $scope.PATIENT_ID = '';
            if($scope.registClinicData.EXPENSE_DETAIL && $scope.patientInf.CARD_NO == "" && $scope.registClinicData.EXPENSE_DETAIL.length >= 1 ) {
                if ($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "挂号费") {
                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                }
                if ($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] == "建档费") {
                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                    //总费用减去建档费
                    selSchedule.SUM_FEE = (parseFloat(selSchedule.SUM_FEE) - parseFloat($scope.archiveDetail)).toFixed(2);
                    $scope.registAmount = "¥" + selSchedule.SUM_FEE;
                }
                $scope.Fee_Name = "挂号费用：";
                $scope.FeeType = 0;
                if ($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length == 1 ) {
                    if($scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                        $scope.Fee_Name = $scope.registClinicData['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                        $scope.FeeType = 1;
                    }
                    $scope.oneFeeDetailTemp = angular.copy($scope.registClinicData['EXPENSE_DETAIL']);
                    $scope.registClinicData.EXPENSE_DETAIL.splice(0, 1);
                } else if($scope.registClinicData.EXPENSE_DETAIL && $scope.registClinicData.EXPENSE_DETAIL.length >1) {
                    $scope.Fee_Name = "支付费用：";
                    $scope.FeeType = 2;
                }
            }
        };
        //begin 药事费明细中冒号改进为中文全角冒号 By 高玉楼 KYEEAPPTEST-2819
        //begin 药事服务费 By 高玉楼 KYEEAPPC-2789
        //挂号费明细查看
        $scope.showRegistCostMsg = function () {
            var diagFeeStr, pharmacyFeeStr, regFeeStr;
            //挂号费用显示增加￥符号
            if (!selSchedule.REG_FEE) {
                regFeeStr = '';
            }
            else {
                regFeeStr = KyeeI18nService.get("regist_confirm.registFee","挂号费：¥") + selSchedule.REG_FEE;
            }
            //将诊疗费用显示增加￥符号
            if (!selSchedule.DIAG_FEE) {
                diagFeeStr = "";
            } else {
                diagFeeStr = "<br>" + KyeeI18nService.get("regist_confirm.treatmentFee","诊疗费：¥") + selSchedule.DIAG_FEE;
            }
            //将药事费用显示增加￥符号
            if (!selSchedule.PHARMACY_FEE) {
                pharmacyFeeStr = "";
            } else {
                pharmacyFeeStr = "<br>" + KyeeI18nService.get("regist_confirm.dispensingFee","药事费：¥") + selSchedule.PHARMACY_FEE;
            }
            KyeeMessageService.message({
                title: KyeeI18nService.get("regist_confirm.registFeeDetail","挂号费明细"),
                content: regFeeStr + pharmacyFeeStr + diagFeeStr
            });
        };

        $scope.appointRuleShow = false;
        $scope.appointRule1 = KyeeI18nService.get("regist_confirm.appointRuleOne","预约成功，请按照短信指引前往医院就诊");
        $scope.appointRule2 = KyeeI18nService.get("regist_confirm.appointRuleTwo","实名信息预约，就诊者信息不符将无法取号就医");
        /**
         * 展开或收缩医生简介
         */
        $scope.showAppointRule = function () {
            $scope.appointRuleShow = !$scope.appointRuleShow;
        };

        //start wangwan 如果路由为网络医院医生，则显示收货地址KYEEAPPC-3577*/
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
        // wangchengcheng 2016年1月21日13:54:15 KYEEAPPTEST-3265
        $scope.showBirthCertificateNoTemplate = function () {
            var birthCertificateNoTemplateDialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/birth_certificate_no_template.html",
                scope: $scope,
                title: KyeeI18nService.get("regist_confirm.birthCertificateNoTemplate","出生证模板（仅供参考）"),
                buttons: [{
                    style: "button button-block button-size-l",
                    text:  KyeeI18nService.get("regist_confirm.birthCertificateNoTemplateIsOk","确定"),
                    click: function () {
                        birthCertificateNoTemplateDialog.close();
                    }
                }]
            });
            OperationMonitor.record("countShowBirthCertificateNoTemplate", "regist_confirm");
        };
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
        //edit by cuijin app-31 用户在指定科室进行挂号时，会根据当前位置判断是否允许挂号
        $scope.lat1 = "";
        $scope.lng1 = "";
        $scope.radii = "";
        $scope.userLng = "";
        $scope.userLat = "";
        $scope.RANGE_LIMIT_REGIST = function(){
            if($scope.isNotNullOrEmpty($scope.rangeLimitDept) && $scope.isNotNullOrEmpty($scope.limitAlert) && $scope.isNotNullOrEmpty($scope.signRange) ){
                $scope.rangeLimitDeptTemp = $scope.rangeLimitDept.split(",");
                for(var i=0; i<$scope.rangeLimitDeptTemp.length; i++){
                    if($scope.rangeLimitDeptTemp[i] == $scope.deptData.DEPT_CODE){
                        $scope.dealSignRange();
                        if($scope.isNotNullOrEmpty($scope.lat1) && $scope.isNotNullOrEmpty($scope.lng1) && $scope.isNotNullOrEmpty($scope.radii) && $scope.isNotNullOrEmpty($scope.userLat) && $scope.isNotNullOrEmpty($scope.userLng)){
                            var distance = $scope.getGreatCircleDistance($scope.lat1, $scope.lng1, $scope.userLat, $scope.userLng);
                            if (distance != -1) {
                                if (distance < parseInt($scope.radii)) {
                                    return false;
                                } else {
                                    KyeeMessageService.message({
                                        title: KyeeI18nService.get("update_user.sms","温馨提示"),
                                        content: $scope.limitAlert,
                                        okText: KyeeI18nService.get("role_view.iKnow","知道了")
                                    });
                                    return true;
                                }
                            } else {
                                //未打开定位系统提示
                                KyeeMessageService.message({
                                    title: KyeeI18nService.get("update_user.sms","温馨提示"),
                                    content: "该科室挂号需要获取您的当前位置，请先在系统设置中打开当前应用获取定位的权限!",
                                    okText: KyeeI18nService.get("role_view.iKnow","知道了")
                                });
                                return true;
                            }
                        }else{
                            //未打开定位系统提示
                            KyeeMessageService.message({
                                title: KyeeI18nService.get("update_user.sms","温馨提示"),
                                content: "该科室挂号需要获取您的当前位置，请先在系统设置中打开当前应用获取定位的权限!",
                                okText: KyeeI18nService.get("role_view.iKnow","知道了")
                            });
                            return true;
                        }
                        break;
                    }
                }
            }else{
                return false;
            }
        }
        $scope.isNotNullOrEmpty = function(string){
            if(string != "" && string != null & string != undefined){
                return true;
            }else{
                return false;
            }
        }
        $scope.dealSignRange = function(){
            var hospitalLatAndLng = $scope.signRange.split('-');
            if(hospitalLatAndLng.length<2)
            {
                return true;
            }
            var hosptail1Array = hospitalLatAndLng[0].split(',');
            $scope.radii = hospitalLatAndLng[1];
            if(hosptail1Array.length>=2)
            {
                $scope.lng1 = hosptail1Array[0];
                $scope.lat1 = hosptail1Array[1];
            }
        }
        $scope.getlocation = function(onSuccess){
            //获取IOS中用户所在地理位置的经纬度
            if(window.device && window.device.platform == "iOS"){
                if(navigator.map&&navigator.map.getLatitudeAndLongtitude)
                {
                    navigator.map.getLatitudeAndLongtitude(function(retVal){
                        if(retVal&&retVal.Latitude&&retVal.Longtitude)
                        {
                            onSuccess(retVal.Longtitude,retVal.Latitude);
                        }
                    },function(error) {
                        // return true;
                    },[]);
                }
            }
            else if(window.device && window.device.platform == "Android"){
                KyeeBDMapService.getCurrentPosition(function(retval){
                    if(retval&&retval.latitude&&retval.longitude)
                    {
                        onSuccess(retval.longitude,retval.latitude);
                    }
                },function(retval) {
                    //return true;
                });
            }
            else {
                new BMap.Geolocation().getCurrentPosition(function(ralation){
                    onSuccess(ralation.point.lng,ralation.point.lat);
                },function (error) {
                    //return true;
                });
            }
        };
        //计算两个经纬度之间的距离
        $scope.getGreatCircleDistance = function(lat1,lng1,lat2,lng2){
            if((lat2== undefined || lat2 =="" || lat2 == null) || (lng2 == undefined || lng2 =="" || lng2 == null)) {
                return -1;
            }
            //地球半径
            var EARTH_RADIUS = 6378137.0;    //单位M
            var PI = Math.PI;
            var radLat1 = lat1*PI/180.0;
            var radLat2 = lat2*PI/180.0;

            var a = radLat1 - radLat2;
            var b = lng1*PI/180.0 - lng2*PI/180.0;

            var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
            s = s*EARTH_RADIUS;
            s = Math.round(s*10000)/10000.0;

            return s;
        };
    })
    .build();

