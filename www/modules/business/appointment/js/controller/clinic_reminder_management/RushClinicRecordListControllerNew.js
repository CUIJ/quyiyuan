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
    .group("kyee.quyiyuan.appointment.regist.rush.list.new.controller")
    .require([ "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.rush.cliic.record.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.controller",
        "kyee.quyiyuan.appointment.rush.clinic.result.success.controller",
        "kyee.quyiyuan.appointment.rush.clinic.waiting.payment.detail.controller",
        "kyee.quyiyuan.appointment.rush.clinic.detail.controller"])
    .type("controller")
    .name("RushClinicRecordListControllerNew")
    .params(["$scope","$rootScope","RushClinicRecordListService","$state","AppointmentRegistDetilService",
        "KyeeUtilsService","KyeeListenerRegister","KyeeI18nService","$ionicHistory","MyCareDoctorsService",
        "HospitalSelectorService","AppointmentDeptGroupService","AppointmentDoctorDetailService","PayOrderService",
        "KyeeMessageService","CacheServiceBus","OperationMonitor","RegistConfirmService","AppointmentDoctorService",
        "AddClinicManagementService","AuthenticationService","KyeeViewService","AccountAuthenticationService","$ionicScrollDelegate"])
    .action(function($scope,$rootScope,RushClinicRecordListService,$state,AppointmentRegistDetilService,
                     KyeeUtilsService,KyeeListenerRegister,KyeeI18nService,$ionicHistory,MyCareDoctorsService,
                     HospitalSelectorService,AppointmentDeptGroupService,AppointmentDoctorDetailService,PayOrderService,
                     KyeeMessageService,CacheServiceBus,OperationMonitor,RegistConfirmService,AppointmentDoctorService,
                     AddClinicManagementService,AuthenticationService,KyeeViewService,AccountAuthenticationService,$ionicScrollDelegate){
        //初始化分页参数
        var memoryCache = CacheServiceBus.getMemoryCache();
        var userId = "";
        var curPage=0;
        //增加监听事件
        KyeeListenerRegister.regist({
            focus : "rush_clinic_record_list_new",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action : function(params){
                //预约挂号记录
                $scope.showTerm = false;//默认不展示预约条款解决，退出页面还展示条款的问题
                userId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
                $scope.isAutoRush = AddClinicManagementService.rush_type;
                $scope.showTitleBar = false;
                curPage = 0;
                $scope.hasHidRemindData = false;
                $scope.hasAutoRushData = false;
                $scope.loadMore();
            }
        });
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "rush_clinic_record_list_new",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        var timer = undefined;
        //页面离开，销毁定时器
        KyeeListenerRegister.regist({
            focus: "rush_clinic_record_list_new",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });
        //返回
        $scope.back = function () {
            $state.go("center->MAIN_TAB");
        };
        //刷新
        $scope.onRefreshBtn = function() {
            //type 0上拉加载；1下拉刷新
            var type = '1';
            $scope.hasHidRemindData = false;
            $scope.hasAutoRushData = false;
            $scope.hidRemindProcessingList = [];//有号提醒待查询记录
            $scope.autoRushProcessingList = [];//自动抢号 正在抢号中记录
            $scope.autoRushUnpaiedList = []; //自动抢号未支付记录（在支付时限内处在待支付模块，超过支付时限在历史抢号模块（未支付））
            $scope.autoRushedList = []; //自动抢号 历史记录
            $scope.loadMore(type);
        };
        $scope.loadMore = function(type) {
            curPage++;
            if(type=='1'){
                curPage=1;
            }
            RushClinicRecordListService.getRushClinicList(type, curPage, function (appointListData) {
                if(type=='1'){
                    $scope.$broadcast('scroll.refreshComplete');
                }else{
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                if(appointListData.resultData.hidRemindProcessingList == undefined || appointListData.resultData.hidRemindProcessingList == null){
                    appointListData.resultData.hidRemindProcessingList = [];
                }
                if(appointListData.resultData.autoRushProcessingList == undefined || appointListData.resultData.autoRushProcessingList == null){
                    appointListData.resultData.autoRushProcessingList = [];
                }
                if(appointListData.resultData.autoRushUnpaiedList == undefined || appointListData.resultData.autoRushUnpaiedList == null){
                    appointListData.resultData.autoRushUnpaiedList = [];
                } if(appointListData.resultData.autoRushedList == undefined || appointListData.resultData.autoRushedList == null){
                    appointListData.resultData.autoRushedList = [];
                }
                if(!($scope.hidRemindProcessingList ||$scope.autoRushProcessingList ||$scope.autoRushedList || $scope.autoRushUnpaiedList)){
                    $scope.hidRemindProcessingList = appointListData.resultData.hidRemindProcessingList;
                    $scope.autoRushProcessingList = appointListData.resultData.autoRushProcessingList;
                    $scope.autoRushUnpaiedList = appointListData.resultData.autoRushUnpaiedList;
                    $scope.autoRushedList = appointListData.resultData.autoRushedList;
                }else{
                    if (type == '1') {
                        //如果是下拉刷新、或者页面初始化
                        $scope.hidRemindProcessingList = appointListData.resultData.hidRemindProcessingList;
                        $scope.autoRushProcessingList = appointListData.resultData.autoRushProcessingList;
                        $scope.autoRushUnpaiedList = appointListData.resultData.autoRushUnpaiedList;
                        $scope.autoRushedList = appointListData.resultData.autoRushedList;
                    } else{
                        //如果是上拉加载更多
                        $scope.hidRemindProcessingList = $scope.hidRemindProcessingList.concat(appointListData.resultData.hidRemindProcessingList);
                        $scope.autoRushedList = $scope.autoRushedList.concat(appointListData.resultData.autoRushedList);
                        $scope.autoRushProcessingList = $scope.autoRushProcessingList.concat(appointListData.resultData.autoRushProcessingList);
                        $scope.autoRushUnpaiedList = $scope.autoRushUnpaiedList.concat(appointListData.resultData.autoRushUnpaiedList);
                    }
                }
                //$scope.$broadcast('scroll.infiniteScrollComplete');
                if(!type||type=='1'){
                    //有号提醒数据
                    if(appointListData.resultData.hidRemindProcessingList.length>0){
                        $scope.hasHidRemindData = true;
                    }else{
                        $scope.hasHidRemindData = false;
                    }
                    //自动抢号数据
                    if(appointListData.resultData.autoRushProcessingList.length>0 || appointListData.resultData.autoRushedList.length>0 || appointListData.resultData.autoRushUnpaiedList.length>0){
                        //上拉加载有数据
                        $scope.hasAutoRushData = true;
                    }else{
                        $scope.hasAutoRushData = false;
                    }
                }
                $scope.appointListNotHidden = appointListData.appointListNotHidden;
                //$scope.$broadcast('scroll.infiniteScrollComplete');
                if($scope.hidRemindProcessingList.length>0||$scope.autoRushedList.length>0||$scope.autoRushProcessingList.length>0 ||$scope.autoRushUnpaiedList.length>0){
                    $scope.dataNotHidden = false;
                    if($scope.hidRemindProcessingList.length>0&&($scope.autoRushedList.length>0||$scope.autoRushProcessingList.length>0||$scope.autoRushUnpaiedList.length>0)){
                        $scope.showTitleBar = true;
                    }else{
                        $scope.showTitleBar = false;
                        if($scope.hidRemindProcessingList.length == 0){
                            $scope.isAutoRush = 1;
                        }
                        if($scope.autoRushedList.length == 0 && $scope.autoRushProcessingList.length == 0 && $scope.autoRushUnpaiedList.length == 0){
                            $scope.isAutoRush = 0;
                        }
                    }
                    if($scope.autoRushUnpaiedList.length>0){
                        this.timers=[];
                        $scope.timeState=false;
                        for(var i=0;i<$scope.autoRushUnpaiedList.length;i++) {
                            //KYEEAPPC-4351 wangwan 修改页面定时器
                            $scope.timerFunction($scope.autoRushUnpaiedList[i]);
                        }
                        //$scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }else{
                    $scope.dataNotHidden = true;
                    $scope.rushDataDetail = KyeeI18nService.get("appointment_regist_list.noRecords", "暂无抢号管理记录");
                }

            });
        };
        //定时器方法
        $scope.timerFunction = function(resultData){
            var app7index=[];
            this.timers=[];
            resultData.timeState=false;
            var remainSenconds = resultData.PAY_REMAIN_TIME;
            if (remainSenconds > 0) {
                app7index.push(i);
                //创建一个定时器对象
                timer = new Object();
                //将定时器对象放入数组，以便遍历释放
                this.timers.push(timer);
                //前台用rushId当做id
                var rushId = resultData.RUSH_ID;
                //启动定时器
                var setTime = function (timer, time, rushId) {
                    var now = new Date(), //服务器时间
                        ms = time - now,
                    //计算出开始时间和现在时间的时间戳差
                        minute = Math.floor(ms / (1000 * 60)),
                    //分钟
                        second = Math.floor(ms / 1000) % 60,
                    //秒
                        label;
                    if (ms > 0) {
                        if (second < 10) {
                            second = '0' + second;
                        }
                        if(minute < 10){
                            minute = '0' + minute;
                        }
                        resultData.PAY_REMAIN_TIME =  minute + KyeeI18nService.get("rush_clinic_record_list_new.minute","分") + second + KyeeI18nService.get("rush_clinic_record_list_new.second","秒");
                        resultData.timeState=true;
                    } else if(ms == 0){
                        resultData.timeState =false;
                        KyeeUtilsService.cancelInterval(timer);
                        $scope.onRefreshBtn();
                    }
                };
                if (remainSenconds) {
                    var now = new Date();
                    var tem2 = now.getTime() + parseInt(remainSenconds) * 1000;
                    now.setTime(tem2);
                    if (now) {

                        timer = KyeeUtilsService.interval({
                            time: 1000,
                            action: function () {
                                setTime(timer, now, rushId);
                            }
                        });
                        setTime(timer, now, rushId);
                    }
                }
            }
        }
        //显示自动抢号还是有号提醒
        $scope.changeRushRecord = function(type){
            $scope.isAutoRush = type;
            $ionicScrollDelegate.$getByHandle("rush_clinic_list_content").scrollTop();
        };
        //删除抢号管理记录
        $scope.delete = function ($index,paidItem) {
          //  $scope.resultData.splice($index, 1);
            $scope.userMessage = "删除后将不再为您监控余号情况，请问是否删除?";
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:KyeeI18nService.get("rush_clinic_record_list_new.messageTitle","温馨提示"),
                buttons: [{
                    text:  KyeeI18nService.get("rush_clinic_record_list_new.cancel","取消"),
                    click: function () {
                        dialog.close();
                    }
                }, {
                    text:  KyeeI18nService.get("rush_clinic_record_list_new.isOk","确定"),
                    style: "button button-block button-size-l",
                    click: function () {
                        dialog.close();
                        $scope.hidRemindProcessingList.splice($index, 1);
                        RushClinicRecordListService.deleteRushRecord(function () {
                            $scope.onRefreshBtn();
                        }, paidItem.RUSH_ID, userId);
                    }
                }]
            });
            //OperationMonitor.record("countDelete", "rush_clinic_record_list");
        };
        //清空失效记录
        $scope.clearFailureRecord = function () {
            RushClinicRecordListService.checkHasClearFailureRecord(function () {
                $scope.userMessage = "将为您删除所有失效的抢号记录，请问是否删除？";
                var dialog = KyeeMessageService.dialog({
                    template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                    scope: $scope,
                    title:KyeeI18nService.get("rush_clinic_record_list_new.messageTitle","温馨提示"),
                    buttons: [{
                        text:  KyeeI18nService.get("rush_clinic_record_list_new.cancel","取消"),
                        click: function () {
                            dialog.close();
                        }
                    }, {
                        text:  KyeeI18nService.get("rush_clinic_record_list_new.isOk","确定"),
                        style: "button button-block button-size-l",
                        click: function () {
                            dialog.close();
                            RushClinicRecordListService.clearFailureRecord(function () {
                                $scope.onRefreshBtn();
                            }, userId);
                        }
                    }]
                });
            }, userId);
            //OperationMonitor.record("countDelete", "rush_clinic_record_list");
        };
        /**
         * 跳转到抢号管理详情界面
         * @param appointListData
         */
        $scope.onRushClinicDetail = function(appointListData){
            if(appointListData.STATUS=='2'){
                //跳转到抢号成功详情页面
                AddClinicManagementService.DOCTOR_INFO = appointListData;
                AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = appointListData.TYPE;
                AddClinicManagementService.ROUTER = "rush_clinic_record_list_new";
                $state.go("rush_clinic_success");
            } else if(appointListData.IS_NEED_PAY_RECORD == '1' && (appointListData.RUSH_PAY_STATUS == '0' || appointListData.RUSH_PAY_STATUS == '3')){
                //跳转到待支付详情页面,支付状态是0：未支付，3：处理中
                AddClinicManagementService.DOCTOR_INFO = appointListData;
                AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = appointListData.TYPE;
                AddClinicManagementService.ROUTER = "rush_clinic_record_list_new";
                $state.go("waiting_for_payment_detail");
            } else{
                AddClinicManagementService.DOCTOR_INFO = appointListData;
                AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = appointListData.TYPE;
                AddClinicManagementService.ROUTER = "rush_clinic_record_list_new";
                $state.go("rush_clinic_detail");
            }
        };

        //跳转到医生详情页面
        $scope.goDoctorInfo=function(record,index){
            AppointmentDoctorDetailService.doctorInfo = record;
            AppointmentDoctorDetailService.doctorCare={
                index : index,
                careFlag: 0
            };
            var deptData = {};
            deptData.DEPT_CODE = record.DEPT_CODE;
            deptData.DEPT_NAME = record.DEPT_NAME;
            deptData.IS_ONLINE = record.IS_ONLINE;
            AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
            MyCareDoctorsService.queryHospitalInfo(record.HOSPITAL_ID, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(record.HOSPITAL_ID, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                        AppointmentDeptGroupService.HOSPITAL_ID_HISTORY = record.HOSPITAL_ID;
                        $state.go('doctor_info');
                    });
            });
        };
        //判断设备是否为ios
        if(window.device != undefined && ionic.Platform.platform() == "ios"){
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.deviceTop= 64;
        }else{
            $scope.deviceTop=44;
        }
    })
    .build();


