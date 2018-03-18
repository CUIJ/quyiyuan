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
    .group("kyee.quyiyuan.appointment.rush.clinic.result.success.controller")
    .require([
        //"kyee.framework.service.view"
        "kyee.quyiyuan.appointment.appointment_regist_detil.controller",
        "kyee.quyiyuan.aboutquyi.controller"
    ])
    .type("controller")
    .name("RushClinicResultSuccessController")
    .params(["$scope", "$state", "$ionicHistory", "AppointmentDoctorDetailService", "KyeeListenerRegister",
        "FilterChainInvoker", "KyeeMessageService","KyeeUtilsService",
        "AppointmentDeptGroupService","$ionicScrollDelegate","KyeeI18nService",
        "OperationMonitor","CustomPatientService","AddClinicManagementService",
        "AppointmentRegistDetilService","AppointmentCreateCardService","PatientCardService",
        "CacheServiceBus","AppointConfirmService","AppointmentRegistListService","KyeeDeviceInfoService",
        "KyeeShareService","AboutQuyiService","MyRefundDetailNewService","MyCareDoctorsService","HospitalSelectorService",
        "LoginService"])
    .action(function ($scope, $state, $ionicHistory, AppointmentDoctorDetailService, KyeeListenerRegister,
                      FilterChainInvoker, KyeeMessageService,KyeeUtilsService,
                      AppointmentDeptGroupService,$ionicScrollDelegate,KyeeI18nService,
                      OperationMonitor,CustomPatientService,AddClinicManagementService,
                      AppointmentRegistDetilService,AppointmentCreateCardService,PatientCardService,
                      CacheServiceBus,AppointConfirmService,AppointmentRegistListService,KyeeDeviceInfoService,
                      KyeeShareService,AboutQuyiService,MyRefundDetailNewService,MyCareDoctorsService,HospitalSelectorService,
                      LoginService) {
        //缓存数据
        var showPicker = undefined;
        var selDoctor= AddClinicManagementService.DOCTOR_INFO;
        $scope.schedulepage=0;//初始化医生排班页数
        $scope.emptySchedule=false;//初始化不显示“暂无数据”

        //就诊经验初始化数据
        $scope.totalInfo = {};
        $scope.totalInfo.SUGGEST_AVERAGE_SCORE = 0;
        $scope.totalInfo.SUGGEST_COUNT = 0;
        var memoryCache = CacheServiceBus.getMemoryCache();
        var userId ="";
        var userVsId="";
        var isEmptyOrNull=function(data){
            if(data!=null&&data!=""&&data!=undefined){
                return false;
            }else{
                return true;
            }
        };

        // 分享的链接和标题
        $scope.shareData = []; // 参数顺序：url, title, description
        $scope.shareData.push( "https://app.quyiyuan.com/APP/share/ShareAppointCode/share.html");
        $scope.shareData.push("趣医院—移动互联时代的就医方式");
        $scope.shareData.push("就医全流程，趣医全搞定。");
        $scope.hasShareMenu = false; // 分享区域是否显示在页面上

        // 分享面板方法绑定
        $scope.bind = function(params){
            $scope.showShareMenu = params.show;
            $scope.hideShareMenu = params.hide;
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "rush_clinic_success",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                if($scope.hasShareMenu){
                    $scope.hideShareMenu();
                } else {
                    $scope.back();
                }
            }
        });

        $scope.back = function () {
            AddClinicManagementService.rush_type = 1;
            $state.go("rush_clinic_record_list_new");
        };
        KyeeListenerRegister.regist({
            focus: "rush_clinic_success",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction : "both",
            action: function (params) {
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "rush_clinic_success"){
                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, null);
                    //解决微信到医生列表页，没有拦截登录。用户到确认预约页面手动登录，
                    // 导致又跳回到医生列表页 (如果页面拦截登录，则不需要此行代码)  wangwan
                    LoginService.isWeiXinReqFlag =0;
                }
            }
        });
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "rush_clinic_success",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action: function (params) {

                var rushMessageData = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA);
                if(rushMessageData && rushMessageData.status == 3) {
                    AddClinicManagementService.DOCTOR_INFO = rushMessageData.pageData;
                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, undefined);
                }
                //start 微信消息过来的页面  wangwan
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "rush_clinic_success"){
                    var record = {};
                    record.HOSPITAL_ID = decodeURI(weiXinParams.hospitalID);
                    record.RUSH_ID = decodeURI(weiXinParams.rushId);
                    AddClinicManagementService.DOCTOR_INFO = record;
                    var hospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(weiXinParams.hospitalID==hospitalInfo.id){
                        $scope.initRushData();
                         }else{
                        MyCareDoctorsService.queryHospitalInfo(weiXinParams.hospitalID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital(weiXinParams.hospitalID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    $scope.initRushData();
                                });
                        });
                    }
                }else{
                    $scope.initRushData();
                    }
                //end 微信消息过来的页面  wangwan
            }
        });
        $scope.initRushData = function(){

            //上个页面传过来的数据
            $scope.HOSPITAL_ID = AddClinicManagementService.DOCTOR_INFO.HOSPITAL_ID;
            $scope.RUSH_ID = AddClinicManagementService.DOCTOR_INFO.RUSH_ID;
            //$scope.RUSH_ID = "6a95a51d-a11c-435a-89ce-8623cde7d682";
            //$scope.HOSPITAL_ID = "290172";
            $scope.RUSH_DETAIL_LIST = [];
            $scope.pageData = [];

            $ionicScrollDelegate.$getByHandle("rush_clinic_success").scrollTop();
            AddClinicManagementService.getInfoByRushId($scope.HOSPITAL_ID, $scope.RUSH_ID,function (resultData) {
                $scope.rushData = resultData;

                $scope.RUSH_DETAIL_LIST = $scope.rushData.RUSH_DETAIL_LIST;
                for (var t = 0; t < $scope.RUSH_DETAIL_LIST.length; t++) {
                    if($scope.RUSH_DETAIL_LIST[t].STATUS==2){
                        $scope.RUSH_DETAIL = $scope.RUSH_DETAIL_LIST[t];
                        break;
                    }
                }
                //处理就诊日期显示
                if($scope.rushData.CLINIC_DURATON_APPOINT){
                    var clinicDuration = $scope.rushData.CLINIC_DURATON_APPOINT.split('/');
                    $scope.REG_DATE_TIME = $scope.rushData.REG_DATE + ' ' + clinicDuration[clinicDuration.length - 1];
                }else{
                    $scope.REG_DATE_TIME = "";

                }
                //处理就诊医生显示
                var doctorName = $scope.rushData.DOCTOR_NAME;
                var deptName = $scope.rushData.DEPT_NAME;
                $scope.clinicDoctor = doctorName + '(' + deptName + ')';
                //处理用户手机号显示
                if($scope.rushData.PHONE_NUMBER){
                    $scope.customPhoneShow = ($scope.rushData.PHONE_NUMBER.replace(/(.{3}).*(.{4})/,"$1****$2"));
                }
                //如果抢号时长的小时数为空或为0，则不展示
                if(isEmptyOrNull($scope.rushData.RUSH_SUM_HOUR) || ($scope.rushData.RUSH_SUM_HOUR =="0" || ($scope.rushData.RUSH_SUM_HOUR==undefined))){
                    $scope.RUSH_SUM_HOUR_SHOW = false;
                }else{
                    $scope.RUSH_SUM_HOUR_SHOW = true;
                }
                $scope.showFee = false;
                $scope.showRefundDetail = false;
                if($scope.rushData.APPOINT_PAY_WAY && $scope.rushData.REGIST_PAY_WAY && (!isEmptyOrNull($scope.rushData.ADVANCE_AMOUNT))){
                    $scope.showFee = true;
                    $scope.payStatus = '(' + $scope.rushData.PAYMENT_STATUS_SHOW + ')';
                    if(!($scope.isEmpty($scope.rushData.REFUND_AMOUNT)) && $scope.rushData.REFUND_AMOUNT != '0'){
                        $scope.showRefundDetail = true;
                    }
                }

            });
        }

        //查看退费详情
        $scope.goToRefund = function(CLINIC_DATA){
            MyRefundDetailNewService.OUT_TRADE_NO=CLINIC_DATA.RUSH_TRADE_ORDER_NO;
            MyRefundDetailNewService.RUSH_TYPE='rush';
            $state.go('refund_detail_new');

        };

        //判断值是否为空
        $scope.isEmpty = function(data){
            if(data!=undefined&&data!=''&&data!=null){
                return false;
            }else{
                return true;
            }
        };

        $scope.showRushDetail=function() {
            for (var t = 0; t < $scope.RUSH_DETAIL_LIST.length; t++) {
                if($scope.RUSH_DETAIL_LIST[t].STATUS==2){
                    $scope.RUSH_DETAIL = $scope.RUSH_DETAIL_LIST[t];
                    break;
                }
            }
        };

        // 查看详情
        $scope.todetail = function () {
            AppointmentRegistDetilService.ROUTE_STATE = "rush_clinic_success";
            var appointList = {
                HOSPITAL_ID: $scope.rushData.HOSPITAL_ID,
                REG_ID: $scope.rushData.REG_ID
            }
            AppointmentRegistDetilService.RECORD=appointList;

            $state.go('appointment_regist_detil');
        };

    })
    .build();

