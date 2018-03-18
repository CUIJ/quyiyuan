/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/16
 * 创建原因：预约挂号医生控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.rush.clinic.detail.controller")
    .require([
        "kyee.framework.service.view"
    ])
    .type("controller")
    .name("RushClinicDetailController")
    .params(["$scope", "$state", "$ionicHistory", "AppointmentDoctorDetailService", "KyeeListenerRegister",
        "FilterChainInvoker", "KyeeMessageService","KyeeUtilsService",
        "AppointmentDeptGroupService","$ionicScrollDelegate","KyeeI18nService",
       "OperationMonitor","CustomPatientService","AddClinicManagementService",
        "AppointmentRegistDetilService","AppointmentCreateCardService","PatientCardService",
        "CacheServiceBus","AuthenticationService","AccountAuthenticationService","MyRefundDetailNewService",
        "MyCareDoctorsService","HospitalSelectorService","StatusBarPushService"])
    .action(function ($scope, $state, $ionicHistory, AppointmentDoctorDetailService, KyeeListenerRegister,
                      FilterChainInvoker, KyeeMessageService,KyeeUtilsService,
                      AppointmentDeptGroupService,$ionicScrollDelegate,KyeeI18nService,
                      OperationMonitor,CustomPatientService,AddClinicManagementService,
                      AppointmentRegistDetilService,AppointmentCreateCardService,PatientCardService,
                      CacheServiceBus,AuthenticationService,AccountAuthenticationService,MyRefundDetailNewService,
                      MyCareDoctorsService,HospitalSelectorService,StatusBarPushService) {
        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "rush_clinic_detail",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backFromRushDetail();
            }
        });
        $scope.backFromRushDetail = function () {
            StatusBarPushService.webJump = undefined;
            AddClinicManagementService.rush_type = 1;
            $state.go("rush_clinic_record_list_new");
        };
        var memoryCache = CacheServiceBus.getMemoryCache();
        KyeeListenerRegister.regist({
            focus: "rush_clinic_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            //direction : "both",
            action: function (params) {
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "rush_clinic_detail"){
                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, null);
                }
            }
        });
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "rush_clinic_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action: function (params) {

                var rushMessageData = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA);
                //pushtype = 1; 有号提醒有余号；pushtype = 2; 有号提醒过期pushtype = 3; 抢号成功pushtype = 4; 抢号失败pushtype = 5; 抢号过期
                if(rushMessageData && (rushMessageData.status == 4 || rushMessageData.status == 5)) {
                    // 把缓存里面的数据传给service
                    AddClinicManagementService.DOCTOR_INFO = rushMessageData.pageData;
                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, undefined);
                }
                //start 微信消息过来的页面  wangwan
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "rush_clinic_detail"){
                    var record = {};
                    record.HOSPITAL_ID = decodeURI(weiXinParams.hospitalID);
                    record.RUSH_ID = decodeURI(weiXinParams.rushId);
                    record.ADD_CLINIC_TYPE = decodeURI(weiXinParams.addClinicType);
                    AddClinicManagementService.DOCTOR_INFO = record;
                    var hospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(weiXinParams.hospitalID==hospitalInfo.id){
                        //上个页面传过来的数据
                        $scope.doctorInfo = AddClinicManagementService.DOCTOR_INFO;
                        $scope.initRushRecord(AddClinicManagementService.DOCTOR_INFO.HOSPITAL_ID, $scope.doctorInfo.RUSH_ID);
                    }else{
                        MyCareDoctorsService.queryHospitalInfo(weiXinParams.hospitalID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital(weiXinParams.hospitalID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    //上个页面传过来的数据
                                    $scope.doctorInfo = AddClinicManagementService.DOCTOR_INFO;
                                    $scope.initRushRecord(AddClinicManagementService.DOCTOR_INFO.HOSPITAL_ID, $scope.doctorInfo.RUSH_ID);
                                });
                        });
                    }
                }else{
                    //上个页面传过来的数据
                    $scope.doctorInfo = AddClinicManagementService.DOCTOR_INFO;
                    $scope.initRushRecord(AddClinicManagementService.DOCTOR_INFO.HOSPITAL_ID, $scope.doctorInfo.RUSH_ID);
                }
                //end 微信消息过来的页面  wangwan

            }
        });
        $scope.initRushRecord = function(hospitalId,rushId){
            AddClinicManagementService.getInfoByRushId(hospitalId,rushId,function (resultData) {
                $scope.CLINIC_DATA = resultData;
                $scope.showFee = false;
                $scope.showRefundDetail = false;
                if($scope.CLINIC_DATA.APPOINT_PAY_WAY && $scope.CLINIC_DATA.REGIST_PAY_WAY && !($scope.isEmpty($scope.CLINIC_DATA.ADVANCE_AMOUNT))){
                    $scope.showFee = true;
                    $scope.CLINIC_DATA.ADVANCE_AMOUNT_SHOW = "¥"+resultData.ADVANCE_AMOUNT;
                    if(!($scope.isEmpty($scope.CLINIC_DATA.REFUND_AMOUNT)) && $scope.CLINIC_DATA.REFUND_AMOUNT != '0' && $scope.CLINIC_DATA.HAS_BALANCE){
                        $scope.showRefundDetail = true;
                    }
                }
            });
        };
        //判断值是否为空
        $scope.isEmpty = function(data){
            if(data!=undefined&&data!=''&&data!=null){
                return false;
            }else{
                return true;
            }
        };
        //取消抢号
        $scope.cancelRush = function(rushRecord){
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("rush_clinic_detail.sms", "消息"),
                content: KyeeI18nService.get("rush_clinic_detail.outTime", "取消后将不能为您抢该医生的号，请问是否确认？"),
                onSelect: function (flag) {
                    if (flag) {
                        AddClinicManagementService.cancelRush(rushRecord.HOSPITAL_ID,rushRecord.RUSH_ID,function(result){
                            $scope.initRushRecord(rushRecord.HOSPITAL_ID,rushRecord.RUSH_ID);
                        });
                    }
                }
            })

        };
        //添加抢号
        $scope.againRush = function(rushRecord){
            var userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            AddClinicManagementService.getUserRushNumber(userId,rushRecord.TYPE,function(result){
                var AUTHENTICATION_SUCCESS = result.AUTHENTICATION_SUCCESS;
                var FLAG = result.FLAG;
                var MESSAGE_AUTHENTICATION = result.AUTHENTICATION_MESSAGE;

                if(!AUTHENTICATION_SUCCESS){
                    if (checkMsg()) {
                        KyeeMessageService.confirm({
                            title: "温馨提示",
                            content: MESSAGE_AUTHENTICATION,
                            okText: KyeeI18nService.get("commonText.selectOk", "立即前往"),
                            cancelText: KyeeI18nService.get("commonText.selectCancel", "以后再说"),
                            onSelect: function (res) {
                                if (res) {
                                    AuthenticationService.lastClass = 'rush_clinic_detail';
                                    goToAuthentication(FLAG);
                                }
                            }
                        });
                    }
                }else{
                    AddClinicManagementService.DOCTOR_INFO = rushRecord;
                    AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = rushRecord.TYPE;
                    //AddClinicManagementService.DOCTOR_INFO.RUSH_ID = null;
                    //AddClinicManagementService.HOSPITAL_INFO =hospitalInfo;
                    AddClinicManagementService.ROUTER = "rush_clinic_detail";
                    $state.go("add_clinic_management_new");

                }
            })


        };
        //验证用户是否完善账户信息
        function checkMsg() {
            var idNo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).ID_NO;
            if (idNo) {
                return true;
            }
            AccountAuthenticationService.isAuthSuccess = '0';
            $state.go('account_authentication');
            return false;
        };
        function goToAuthentication(realNameFlag){
            var currentCustomPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //认证类型： 0：实名认证，1：实名追述
            AuthenticationService.AUTH_TYPE = 0;
            //0：就诊者，1：用户
            AuthenticationService.AUTH_SOURCE = 1;
            AuthenticationService.HOSPITAL_SM = {
                OFTEN_NAME: currentCustomPatient.NAME,
                ID_NO: currentCustomPatient.ID_NO,
                PHONE: currentCustomPatient.PHONE_NUMBER,
                FLAG: realNameFlag
            };
            $scope.openModalDoctorInfo('modules/business/center/views/authentication/authentication.html');

        };
        //预约挂号详情
        $scope.goToSeeDetail = function(rushRecord){
            AppointmentRegistDetilService.ROUTE_STATE="rush_clinic_detail";
            AppointmentRegistDetilService.RECORD=rushRecord;
            $state.go("appointment_regist_detil");
        };
        //查看退费详情
        $scope.goToRefund = function(CLINIC_DATA){
            MyRefundDetailNewService.OUT_TRADE_NO=CLINIC_DATA.RUSH_TRADE_ORDER_NO;
            MyRefundDetailNewService.RUSH_TYPE='rush';
            $state.go('refund_detail_new');

        }
        $scope.hasBarFoot = function () {
            if ($scope.CLINIC_DATA.STATUS == 0 ||
                (($scope.CLINIC_DATA.STATUS == 3 && $scope.isEmpty($scope.CLINIC_DATA.REG_ID)) || $scope.CLINIC_DATA.STATUS == 2) ||
                (($scope.CLINIC_DATA.STATUS == 3 || $scope.CLINIC_DATA.STATUS == 4) && $scope.CLINIC_DATA.RUSH_CLINIC == '1')) {
                return true;
            } else {
                return false;
            }

        };
    })
    .build();

