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
    .group("kyee.quyiyuan.appointment.rush.clinic.waiting.payment.detail.controller")
    .require([
        "kyee.framework.service.view"
    ])
    .type("controller")
    .name("WaitingForPaymentDetailController")
    .params(["$scope", "$state", "$ionicHistory", "AppointmentDoctorDetailService", "KyeeListenerRegister",
        "FilterChainInvoker", "KyeeMessageService","KyeeUtilsService",
        "AppointmentDeptGroupService","$ionicScrollDelegate","KyeeI18nService",
        "OperationMonitor","CustomPatientService","AddClinicManagementService",
        "AppointmentRegistDetilService","AppointmentCreateCardService","PatientCardService",
        "CacheServiceBus","AuthenticationService","AccountAuthenticationService","PayOrderService"])
    .action(function ($scope, $state, $ionicHistory, AppointmentDoctorDetailService, KyeeListenerRegister,
                      FilterChainInvoker, KyeeMessageService,KyeeUtilsService,
                      AppointmentDeptGroupService,$ionicScrollDelegate,KyeeI18nService,
                      OperationMonitor,CustomPatientService,AddClinicManagementService,
                      AppointmentRegistDetilService,AppointmentCreateCardService,PatientCardService,
                      CacheServiceBus,AuthenticationService,AccountAuthenticationService,PayOrderService) {
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "waiting_for_payment_detail",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backFromRushDetail();
            }
        });
        $scope.backFromRushDetail = function () {
            AddClinicManagementService.rush_type = 1;
            $state.go("rush_clinic_record_list_new");
        };
        var timer = undefined;

        //页面离开，销毁定时器
        KyeeListenerRegister.regist({
            focus: "waiting_for_payment_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "waiting_for_payment_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action: function (params) {
                msg = '';
                payTime = 0;
                payTimeShow = "";

                //上个页面传过来的数据
               /* $scope.doctorInfo = AddClinicManagementService.DOCTOR_INFO;

                AddClinicManagementService.DOCTOR_INFO = {
                    HOSPITAL_ID:"290172",
                    RUSH_ID:"c768f842-81a8-497a-b6f8-bdfffb282110"
                };*/
                $scope.doctorInf = AddClinicManagementService.DOCTOR_INFO;
                $scope.initRushRecord($scope.doctorInf.HOSPITAL_ID, $scope.doctorInf.RUSH_ID);
            }
        });
        $scope.initRushRecord = function(hospitalId,rushId){
            AddClinicManagementService.getInfoByRushId(hospitalId,rushId,function (resultData) {

                $scope.CLINIC_DATA = resultData;
                payTime = parseInt($scope.CLINIC_DATA.PAY_TIME);
                payTimeShow = getPayTime(payTime);
                $scope.CLINIC_DATA.payTime = payTimeShow;
                $scope.showPayment = true;
                if(payTime>0)
                {
                    timer = KyeeUtilsService.interval({
                        time: 1000,
                        action: function () {
                            payTime -= 1;
                            if (payTime > 0) {
                                payTimeShow = getPayTime(payTime);

                            } else {
                                //关闭定时器
                                if (timer != undefined) {
                                    KyeeUtilsService.cancelInterval(timer);
                                }
                                payTimeShow = '00:00';
                                $scope.showPayment = false;
                                $scope.initRushRecord($scope.doctorInf.HOSPITAL_ID, $scope.doctorInf.RUSH_ID);
                            }
                            $scope.CLINIC_DATA.payTime = payTimeShow;
                        }
                    });
                } else {
                    $scope.showPayment = false;
                }
            });
        };
        function getPayTime(payTime){
            var minute = Math.floor(payTime / (60));//分钟
            var second = Math.floor(payTime) % 60;//秒
            if (second < 10) {
                second = '0' + second;
            }
            return "<span style='color: orange'>" + minute + '分' + second + '秒' + "</span>";
        }
        //判断值是否为空
        $scope.isEmpty = function(data){
            if(data!=undefined&&data!=''&&data!=null){
                return false;
            }else{
                return true;
            }
        };
        //取消抢号
        $scope.goToPay = function(){
            var markDesc = AddClinicManagementService.DOCTOR_INFO.CLINIC_LABEL;
            if(markDesc == undefined || markDesc == "" || markDesc == null){
                markDesc = "挂号费";
            }
            var now = new Date();
            var payDeadLine= new Date(now.getTime() + payTime*1000);
            var paydata = {
                HOSPITAL_ID:$scope.CLINIC_DATA.HOSPITAL_ID,
                TRADE_NO:$scope.CLINIC_DATA.RUSH_TRADE_ORDER_NO,
                APPOINT_SUCCESS_PAY: 1,
            // paydata["ROUTER"] = "appointment_regist_list";
                REMAIN_SECONDS : payTime,
                PAY_DEADLINE:payDeadLine,//支付截止时间
            //paydata["flag"] = 4;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费 4挂号缴费
                isShow:"0",
                IS_OPEN_BALANCE:"fail",
                //USER_PAY_AMOUNT:$scope.CLINIC_DATA.ADVANCE_AMOUNT,
                CARD_NO:$scope.CLINIC_DATA.CARD_NO,
                CARD_TYPE:$scope.CLINIC_DATA.CARD_TYPE,
                //paydata["C_REG_ID"]=appointList.C_REG_ID;
                hospitalID: $scope.CLINIC_DATA.HOSPITAL_ID,
                MARK_DESC:markDesc,
                flag:3,
                ROUTER:"waiting_for_payment_detail",
                AMOUNT:$scope.CLINIC_DATA.ADVANCE_AMOUNT,
                MARK_DETAIL: "抢号预交金",
                PRE_PAY_MARK:"1" //抢号预付费标识;1表示是预付费数据

            };
            PayOrderService.payData = paydata;
            $state.go("payOrder");

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
        $scope.hasBarFoot = function () {
            if ($scope.CLINIC_DATA.STATUS == 0 ||
                (($scope.CLINIC_DATA.STATUS == 3 && isEmpty($scope.CLINIC_DATA.REG_ID)) || $scope.CLINIC_DATA.STATUS == 2) ||
                (($scope.CLINIC_DATA.STATUS == 3 || $scope.CLINIC_DATA.STATUS == 4) && $scope.CLINIC_DATA.APPOINT_PAY_WAY == '0' && $scope.CLINIC_DATA.RUSH_CLINIC == '1')) {
                return true;
            } else {
                return false;
            }

        };
    })
    .build();

