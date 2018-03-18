/**
 * 产品名称：quyiyuan
 * 创建者：GAOMENG
 * 创建时间：2016年9月9日01:06:09
 * 创建原因：抢号管理记录
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.regist.rush.controller")
    .require([ "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.regist.List.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.controller"])
    .type("controller")
    .name("RushClinicRecordListController")
    .params(["$scope","$rootScope","AppointmentRegistListService","$state","AppointmentRegistDetilService",
        "KyeeUtilsService","KyeeListenerRegister","KyeeI18nService","$ionicHistory","MyCareDoctorsService",
        "HospitalSelectorService","AppointmentDeptGroupService","AppointmentDoctorDetailService","PayOrderService",
        "KyeeMessageService","CacheServiceBus","OperationMonitor","RegistConfirmService","AppointmentDoctorService",
        "AddClinicManagementService","AuthenticationService","KyeeViewService","AccountAuthenticationService"])
    .action(function($scope,$rootScope,AppointmentRegistListService,$state,AppointmentRegistDetilService,
                     KyeeUtilsService,KyeeListenerRegister,KyeeI18nService,$ionicHistory,MyCareDoctorsService,
                     HospitalSelectorService,AppointmentDeptGroupService,AppointmentDoctorDetailService,PayOrderService,
                     KyeeMessageService,CacheServiceBus,OperationMonitor,RegistConfirmService,AppointmentDoctorService,
                     AddClinicManagementService,AuthenticationService,KyeeViewService,AccountAuthenticationService){
        //初始化分页参数
        //业务类型 0：预约；1：挂号
        var businessType = '0';
        //缓存数据
        var storageCache = CacheServiceBus.getStorageCache();
        var memoryCache = CacheServiceBus.getMemoryCache();
        var userId = "";
        var showPicker = undefined;
        var curPage=0;
        var pageSize=6;
        var userVsId = "";
       $scope.hasmore=false;
        //增加监听事件
        KyeeListenerRegister.regist({
            focus : "rush_clinic_record_list",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action : function(params){
                //预约挂号记录
                curPage=0;
                //抢号管理标识
                $scope.IS_RUSH_CLINIC = 1;
                $scope.loadMore();
                $scope.showTerm = false;//默认不展示预约条款解决，退出页面还展示条款的问题
                userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            }
        });
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "rush_clinic_record_list",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        //返回
        $scope.back = function () {
            AppointmentRegistListService.ROUTE_STATE = "";
            $state.go("center->MAIN_TAB");
        };
        //刷新
        $scope.onRefreshBtn = function() {
            //下拉刷新标识  wangwan  2015年12月16日15:29:55
            var type='1';
            $scope.loadMore(type);
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.loadMore = function(type) {
            curPage++;
            if (type == '1') {
                curPage = 1;
            }
            AppointmentRegistListService.getRushClinicList(type, curPage, function (appointListData) {

                if (!$scope.resultData) {
                    $scope.resultData = appointListData.resultData;
                } else {
                    if (type == '1') {
                        //如果是下拉刷新
                        $scope.resultData = appointListData.resultData;
                    } else {
                        //如果是上拉加载更多
                        $scope.resultData = $scope.resultData.concat(appointListData.resultData);
                    }
                }
                if (!type) {
                    $scope.hasmore = appointListData.resultData.length > 0;
                }
                $scope.appointListNotHidden = appointListData.appointListNotHidden;
                $scope.$broadcast('scroll.infiniteScrollComplete');

                if (!$scope.resultData || $scope.resultData.length == 0) {
                    $scope.dataNotHidden = true;
                    $scope.dataDetail = KyeeI18nService.get("appointment_regist_list.noRecords", "暂无抢号管理记录");
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
        //删除抢号管理记录
        $scope.delete = function ($index,paidItem) {
            $scope.resultData.splice($index, 1);
            AppointmentRegistListService.deleteRushRecord(function () {
                $scope.onRefreshBtn();
            }, paidItem.RUSH_ID, userId);
            //OperationMonitor.record("countDelete", "rush_clinic_record_list");
        };
        //跳转预约挂号详情
        $scope.onRushClinicRecordListTap = function(appointListData) {
            var paramsDetil = {
                hospitalId: appointListData.HOSPITAL_ID,
                regId: appointListData.REG_ID
            };
            AppointmentRegistDetilService.ROUTE_STATE="rush_clinic_record_list";
         // AppointmentRegistDetilService.queryAppointRegistParaDetil(paramsDetil);
            AppointmentRegistDetilService.RECORD=appointListData;
            $state.go("appointment_regist_detil");
        };
    //    //跳转添加自动抢号和有号提醒页面
    //    $scope.onRushClinicRecordListTap = function(appointListData) {
    //})
        //查看条款内容高度是否超过屏幕高度，是则显示点击加载更多
        footerClick = function(id){
            $timeout(
                function () {
                    $scope.element=document.getElementById(id).scrollHeight;
                    var  screenHeight = KyeeUtilsService.getInnerSize().height-320;
                    if($scope.element>screenHeight){
                        $scope.showMore=true;
                        document.getElementById(id).style.cssText="height:"+(screenHeight-25)+"px";
                    }else{
                        $scope.showMore=false;
                    }
                },
                200
            );
        };
        /**
         * 页面跳转
         * @param routerName
         */
        function goToAppointment(routerName){
            if(routerName=='regist_confirm'){
                RegistConfirmService.ROOTER='doctor_info';
            }
            //如果已经登录，则跳转都确认预约或确认挂号页面
            if(CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN))
            {
                //解决弹出条款，又弹出添加添加就诊者会导致APP界面锁死的问题。wangwan  2016年1月26日16:24:24
                timer = KyeeUtilsService.interval({
                    time: 1000,
                    action: function () {
                        $state.go(routerName);
                        AppointmentDoctorDetailService.historyRoute = -1;
                        KyeeUtilsService.cancelInterval(timer);
                    }
                });
            }
            //如果未登录，则跳转到注册页面
            else
            {
                if(AppConfig.BRANCH_VERSION=="03"){
                    window.location.href="javascript:window.myObject.login()";
                }else{
                    $state.go("appointment_register");
                    AppointmentDoctorDetailService.historyRoute = -3;
                }

            }
        };
        //弹出预约挂号条款
        function showPrompt (status,appointListData) {
            //定义对话框的按钮
            var buttons = [{
                text:  KyeeI18nService.get("doctor_info.cancel","取消"),
                click: function () {
                    $scope.dialog.close();
                }
            }, {
                text:  KyeeI18nService.get("doctor_info.isOk","确定"),
                style: "button button-block button-size-l",
                click: function () {
                    $scope.dialog.close();
                    if (status == 1) {//预约
                        goToAppointment("appoint_confirm");
                    } else {//挂号
                        goToAppointment("regist_confirm");
                    }
                }
            }];
            //status 1表示预约，2表示挂号
            if (status == 1) {//预约
                if (!appointListData.APPOINT_NOTIFICATION) {
                    //如果预约条款为空，则不弹出条款
                    goToAppointment("appoint_confirm");
                    return;
                }
                //条款内容为预约条款，不显示网络医院挂号条款
                $scope.APPOINT_NOTIFICATION_SHOW=appointListData.APPOINT_NOTIFICATION;
                $scope.appointNotificationShow=true;
                $scope.registNotificationShow=false;
                $scope.dialog = KyeeMessageService.dialog({
                    template: "modules/business/appointment/views/appointment_doctor_detail/appointNotification.html",
                    scope: $scope,
                    title:  KyeeI18nService.get("doctor_info.appointRegistRule","预约挂号条款"),
                    buttons: buttons
                });
                $scope.id="notification.appointId";
                footerClick($scope.id);
            } else {
               //挂号
                if (!appointListData.REGISTER_NOTIFICATION) {
                    //如果挂号条款为空，则不弹出条款
                    goToAppointment("regist_confirm");
                    return;
                }
                //条款内容为挂号条款,不显示网络医院挂号条款
                $scope.REGIST_NOTIFICATION_SHOW=appointListData.REGISTER_NOTIFICATION;
                $scope.registNotificationShow=true;
                $scope.appointNotificationShow=false;
                //$scope.NOTIFICATION = selDoctor.REGISTER_NOTIFICATION;
                $scope.dialog = KyeeMessageService.dialog({
                    template: "modules/business/appointment/views/appointment_doctor_detail/appointNotification.html",
                    scope: $scope,
                    title:  KyeeI18nService.get("doctor_info.appointRegistRule","预约挂号条款"),
                    buttons: buttons
                });
                $scope.id="notificationId.registId";
                footerClick($scope.id);
            }
        };
        /**
         * 预约
         * @param schedule
         */
        function appoint(appointListData)
        {
            var doctor =  appointListData;
            var CLINIC_DATE = KyeeUtilsService.DateUtils.formatFromDate(new Date(appointListData.CLINIC_DATE), 'YYYY/MM/DD');
            var params = {
                "hospitalId": doctor.HOSPITAL_ID,
                "deptCode": doctor.DEPT_CODE,
                "doctorCode": doctor.DOCTOR_CODE,
                "hbTime": doctor.CLINIC_DURATION,//---参数传入错误
                "clinicDate": CLINIC_DATE,
                "hisScheduleId" : doctor.SCHEDULE_ID,
                "IS_REFERRAL":"0"
            };
            /**
             * 查询医生号源
             */
            AppointmentDoctorService.queryAppointSource(params, function (resultData) {
                //KYEEAPPC-6612 获取号源为空，则将排班ISTIME置为0
                if(resultData.success) {
                    var ClinicDetail = resultData.data;
                    AppointmentDoctorDetailService.CLINIC_SOURCE = {};//清除掉选择号源控件的数据，以防止预约挂号不选择号源时，该服务数据不空导致的问题
                    AppointmentDoctorDetailService.ARCHIVE_FEE = ClinicDetail.ARCHIVE_FEE;
                    //向确认预约服务中传入号源数据
                    AppointmentDoctorDetailService.CLINIC_DETAIL = ClinicDetail;
                    //取当前时间
                    var datet = new Date();
                    var dated = KyeeUtilsService.DateUtils.formatFromDate(datet, 'YYYY/MM/DD');
                    if (ClinicDetail.rows.length > 1 && CLINIC_DATE == dated) {
                        var resultMap = {};
                        resultMap["text"] = ClinicDetail.rows[ClinicDetail.rows.length - 1].HB_TIME;
                        resultMap["value"] = ClinicDetail.rows[ClinicDetail.rows.length - 1].HID;
                        resultMap["value2"] = ClinicDetail.rows[ClinicDetail.rows.length - 1];//存的是号源的所有属性
                        AppointmentDoctorDetailService.CLINIC_SOURCE = resultMap;
                    }
                    showPrompt(1, appointListData);
                }else{
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("update_user.sms", "消息"),
                        content: KyeeI18nService.get("rush_clinic_record_list.NoClinic", "暂无可用号源！"),
                        onSelect: function (flag) {
                            if (flag) {
                                AppointmentRegistListService.updateRushRecord(function () {
                                    $scope.onRefreshBtn();
                                }, appointListData.RUSH_ID, userId, '0');
                            }
                        }
                    })
                }
            });
        };
        //挂号
        function regist (appointListData) {
            var doctor =  appointListData;
            var rushId = appointListData.RUSH_ID;
            var CLINIC_DATE = KyeeUtilsService.DateUtils.formatFromDate(new Date(appointListData.CLINIC_DATE), 'YYYY/MM/DD');
            var params = {
                "hospitalID": doctor.HOSPITAL_ID,
                "deptCode": doctor.DEPT_CODE,
                "doctorCode": doctor.DOCTOR_CODE,
                "hbTime": doctor.CLINIC_DURATION,//---参数传入错误
                "clinicDate": CLINIC_DATE,
                "hisScheduleId" : doctor.SCHEDULE_ID,
                "IS_REFERRAL":"0"
            };
            RegistConfirmService.queryClinicData(params, function (resultData) {
                //KYEEAPPC-6612 获取号源为空，则将排班ISTIME置为0
                if(resultData.success){
                    var clinicData = resultData.data;
                    AppointmentDoctorDetailService.CLINIC_DETAIL = clinicData;
                    AppointmentDoctorDetailService.ARCHIVE_FEE = clinicData.ARCHIVE_FEE;
                    if (clinicData.rows.length == 0) {
                        KyeeMessageService.broadcast({
                            content:  KyeeI18nService.get("rush_clinic_record_list.NoClinic","暂无可用号源！"),
                            duration: 3000
                        });
                        //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                        RegistConfirmService.registerGetHisFailure();
                        //end 前端校验阻塞后发送请求 By 高玉楼
                        return;
                    }else if(clinicData.rows.length == 1){
                        AppointmentDoctorDetailService.CLINIC_SOURCE = clinicData.rows[0];
                    }else if(clinicData.rows.length > 1){
                        AppointmentDoctorDetailService.CLINIC_SOURCE = clinicData.rows[clinicData.rows.length-1];
                    }else{
                    }
                    showPrompt(2,appointListData);
                    } else {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get("update_user.sms", "消息"),
                        content: KyeeI18nService.get("rush_clinic_record_list.NoClinic", "暂无可用号源！"),
                        onSelect: function (flag) {
                            if (flag) {
                                AppointmentRegistListService.updateRushRecord(function () {
                                    $scope.onRefreshBtn();
                                }, appointListData.RUSH_ID, userId, '0');
                            }
                        }
                    })
                }
            });
        };
        /**
         * 跳转到预约或挂号确认页面
         * @param appointListData
         */
        $scope.onAppiontMentConfirm=function(appointListData)
        {
            //有号提醒的"预约挂号"
            if(appointListData.STATUS == 1){
                //若用户长时间停留在抢号管理页面并未进行预约挂号，则需要反查该记录状态是否已过期
                AppointmentRegistListService.getRushRecordStatus(appointListData.RUSH_ID, userId,function (resultData) {
                    //反查后该记录为“已过期”
                    if(resultData.STATUS == 4){
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("update_user.sms", "消息"),
                            content: KyeeI18nService.get("rush_clinic_record_list.outTime", "该记录已过期！"),
                            onSelect: function (flag) {
                                if (flag) {
                                    AppointmentRegistListService.updateRushRecord(function () {
                                        $scope.onRefreshBtn();
                                    }, appointListData.RUSH_ID, userId, resultData.STATUS);
                                }
                            }
                        })
                    }
                    //反查后该记录为“有余号”
                    else if (resultData.STATUS == 1){
                        AppointmentDoctorDetailService.selSchedule = appointListData;
                        AppointmentDoctorDetailService.doctorInfo = appointListData;
                        if (appointListData.BUSSINESS_TYPE == '0') {
                            //预约
                            appoint(appointListData);
                        } else if (appointListData.BUSSINESS_TYPE == '1') {
                            //挂号
                            regist(appointListData);
                        }
                    }else{
                    }
                });
            }
            //抢号失败后对应的“重新抢号”
            if(appointListData.STATUS == 3){
                //AppointmentDoctorInfoController.goToAddClinic(appointListData.TYPE);
                AddClinicManagementService.getUserRushNumber(userId,"1",function(result){
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
                                        AuthenticationService.lastClass = 'doctor_info';
                                        goToAuthentication(FLAG);
                                    }
                                }
                            });
                        }
                    }else{
                        var hospitalInfo={
                            HOSPITAL_NAME: appointListData.HOSPITAL_NAME,
                            HOSPITAL_ID :appointListData.HOSPITAL_ID
                        };
                        AddClinicManagementService.DOCTOR_INFO = appointListData;
                        AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = appointListData.TYPE;
                        AddClinicManagementService.DOCTOR_INFO.RUSH_ID = null;
                        AddClinicManagementService.HOSPITAL_INFO =hospitalInfo;
                        AddClinicManagementService.ROUTER = "rush_clinic_record_list";
                        $state.go("add_clinic_management_new");
                    }
                })

            }
        };
        /**
         * 跳转到抢号管理详情界面
         * @param appointListData
         */
        $scope.onRushClinicDetail = function(appointListData){
            var hospitalInfo={
                HOSPITAL_NAME: appointListData.HOSPITAL_NAME,
                HOSPITAL_ID :appointListData.HOSPITAL_ID
            };
            AddClinicManagementService.DOCTOR_INFO = appointListData;
            AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = appointListData.TYPE;
            AddClinicManagementService.DOCTOR_INFO.RUSH_ID = appointListData.RUSH_ID;
            AddClinicManagementService.HOSPITAL_INFO =hospitalInfo;
            AddClinicManagementService.ROUTER = "rush_clinic_record_list";
            $state.go("rush_clinic_detail");
        }

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
        //打开模态窗口
        $scope.openModalDoctorInfo = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
    })
    .build();


