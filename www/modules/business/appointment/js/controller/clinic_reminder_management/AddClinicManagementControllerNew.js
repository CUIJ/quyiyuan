/**
 * 产品名称：quyiyuan
 * 创建者：gaomeng
 * 创建时间：2016年10月19日13:48:39
 * 创建原因：预约抢号新版页面
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.add.clinic.management.controller.new")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.add_clinic_management.schedule_calendar.service"
    ])
    .type("controller")
    .name("AddClinicManagementControllerNew")
    .params(["$scope", "$state", "$ionicHistory", "AppointmentDoctorDetailService", "KyeeListenerRegister",
        "FilterChainInvoker", "KyeeMessageService","KyeeUtilsService",
        "AppointmentDeptGroupService","$ionicScrollDelegate","KyeeI18nService",
        "OperationMonitor","CustomPatientService","AddClinicManagementService",
        "AppointmentRegistDetilService","AppointmentCreateCardService","PatientCardService",
        "CacheServiceBus","AppointConfirmService","AppointmentRegistListService","KyeePhoneService",
        "ScheduleCalendarService","CommPatientDetailService","AuthenticationService","KyeeViewService",
        "$timeout","$compile","PayOrderService"])
    .action(function ($scope, $state, $ionicHistory, AppointmentDoctorDetailService, KyeeListenerRegister,
                      FilterChainInvoker, KyeeMessageService,KyeeUtilsService,
                      AppointmentDeptGroupService,$ionicScrollDelegate,KyeeI18nService,
                      OperationMonitor,CustomPatientService,AddClinicManagementService,
                      AppointmentRegistDetilService,AppointmentCreateCardService,PatientCardService,
                      CacheServiceBus,AppointConfirmService,AppointmentRegistListService,KyeePhoneService,
                      ScheduleCalendarService,CommPatientDetailService,AuthenticationService,KyeeViewService,
                      $timeout,$compile,PayOrderService) {
        //缓存数据
        var showPicker = undefined;
        $scope.schedulepage=0;//初始化医生排班页数
        var memoryCache = CacheServiceBus.getMemoryCache();
        var userId ="";
        var userVsId="";
        $scope.dateList = "";
        var isEmptyOrNull=function(data){
            if(data!=null&&data!=""&&data!=undefined){
                return false;
            }else{
                return true;
            }
        };
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "add_clinic_management_new",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backFromAddClinic();
            }
        });
        KyeeListenerRegister.regist({
            focus: "add_clinic_management_new",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                AppointmentCreateCardService.password = "";
                AppointmentCreateCardService.enterInfo = false;
                $scope.dateList = "";
            }
        });
        $scope.backFromAddClinic = function () {
            AppointmentCreateCardService.password = "";
            AppointmentCreateCardService.enterInfo = false;
            if(AddClinicManagementService.ROUTER =="rush_clinic_record_list_new"){
                AddClinicManagementService.rush_type = 1;
                $state.go("rush_clinic_record_list_new");
            }else if(AddClinicManagementService.ROUTER=="rush_clinic_detail"){
                $state.go("rush_clinic_detail");
            }else{
                $ionicHistory.goBack(-1);
            }
        };
        $scope.hasFooter = function(){
            if(isEmptyOrNull($scope.doctorInfo.RUSH_ID)){
                return true;
            }else{
                return false;
            }
        };
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "add_clinic_management_new",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "both",
            action: function (params) {
                //上个页面传过来的数据
                $scope.dateList = "";
                //edit gaomeng by 从抢号管理页面弹框，有号提醒过期进行重新抢号到该页面  2016年12月19日11:05:06
                var rushMessageData = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA);
                if(rushMessageData && rushMessageData.status == 2) {
                    rushMessageData.pageData.POST_DATA.HOSPITAL_ID = rushMessageData.pageData.HOSPITAL_ID;
                    AddClinicManagementService.DOCTOR_INFO =  rushMessageData.pageData.POST_DATA;
                    AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = rushMessageData.pageData.POST_DATA.TYPE;
                    memoryCache.set(CACHE_CONSTANTS.MEMORY_CACHE.RUSH_MESSAGE_DATA, undefined);
                }
                memoryCache = CacheServiceBus.getMemoryCache();
                $scope.doctorInfo = AddClinicManagementService.DOCTOR_INFO;
                //如果没有标识抢号还是有好提醒，则默认是抢号的
                if($scope.doctorInfo&&($scope.doctorInfo.ADD_CLINIC_TYPE==undefined||$scope.doctorInfo.ADD_CLINIC_TYPE===''||$scope.doctorInfo.ADD_CLINIC_TYPE==null)){
                    $scope.doctorInfo.ADD_CLINIC_TYPE = '1';
                }
                //end gaomeng by 从抢号管理页面弹框，进行重新抢号到该页面  2016年12月19日11:05:06
                $scope.RUSH_DETAIL_LIST = [];
                $scope.pageData = [];
                $scope.pageData = $scope.doctorInfo;
                $scope.choosedItem = 0;

                if (!AppointmentCreateCardService.enterInfo) {
                    $scope.patientInf.CARD_SHOW = undefined;
                    $scope.patientInf.CARD_NO = undefined;
                    $scope.PATIENT_ID = undefined;
                }
                //切换就诊者，因此要处理
                var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);

                userId =currentUser.USER_ID;
                userVsId = currentPatient.USER_VS_ID;
                $scope.patientName = currentPatient.OFTEN_NAME;
                ////如果是有号提醒，则不展示就诊卡，则不用查卡
                //if($scope.doctorInfo.ADD_CLINIC_TYPE=='1'){
                //    $scope.getCardInfo();
                //}
                //如果从抢号管理页面进入，则有RUSH_ID，则只展示，不能修改
                $scope.LONG_TERM = "0";//默认不显示30天不限
                //无数据
                $scope.showEmpty = false;
                //转诊标识
                $scope.IS_REFERRAL = 0;
                //initCalendarData(AppointmentDoctorService.SCHEDULE_LIST);
                $scope.scheduleDataIndex = "";
                //查30天排班(包含预估的排班)
                $scope.getDoctorSchedule();

            }
        });
        // 初始化号源日历信息
        var initCalendarData = function(scheduleList){
            //星期列表
            $scope.dayNames = [ '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            if(scheduleList.length > 0){
                $scope.scheduleData = ScheduleCalendarService.formatScheduleCalendarData(scheduleList);
                //console.log($scope.scheduleData);
            }
        };

        /**
         * 选择排班
         * @param schedule
         */
        $scope.selectDate = function(schedule,scheduleLineDate,index)
        {
            //所选排班元素
            if(schedule==""||schedule==null||schedule==undefined){
                return;
            }
            //所选排班所在行元素
            if(scheduleLineDate == undefined || scheduleLineDate == null || scheduleLineDate.length <1){
                return;
            }
            //0:无排班  1:有号   2：可抢号  3：待放号
            if(schedule.clinicType == "2" || schedule.clinicType == "3"){
                //如果排班被点击之前是false，说明现在是要选中，则给后台发请求，判断是否存在，存在则给提示return，不存在则继续
                if(!schedule.CLINIC_IS_TAKEN){
                    if ($scope.PATIENT_ID == -1) {
                        var cardNo="";
                    }else{
                        var cardNo = $scope.patientInf.CARD_NO;
                    }
                    //判断是否重复日期，必须先选卡
                    if ($scope.doctorInfo.ADD_CLINIC_TYPE == '1'&&!$scope.patientInf.CARD_NO && !$scope.placeholder) {//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                        AppointConfirmService.choosePatientIdCardCheck();
                        //end 前端校验阻塞后发送请求 By 高玉楼
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("add_clinic_management_new.noCard","请选择就诊卡")
                        });
                        return;
                    }
                    if ($scope.doctorInfo.ADD_CLINIC_TYPE == '1'&&!$scope.patientInf.CARD_SHOW) {
                        AppointConfirmService.inputOrChoosePatientIdCardCheck();
                        //end 前端校验阻塞后发送请求 By 高玉楼
                        KyeeMessageService.broadcast({//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                            content: KyeeI18nService.get("add_clinic_management_new.inputCardtoAppoint","请输入就诊卡号")
                        });
                        return;
                    }
                    //

                    var param={
                        //SCHEDULE_ID:schedule.SCHEDULE_ID,
                        CLINIC_DATE:schedule.CLINIC_DATE,
                        //CLINIC_DURATION:schedule.CLINIC_DURATION,
                        DEPT_CODE:$scope.pageData.DEPT_CODE,
                        DOCTOR_CODE:$scope.pageData.DOCTOR_CODE,
                        HOSPITAL_ID:$scope.pageData.HOSPITAL_ID,
                        USER_ID:userId,
                        USER_VS_ID: userVsId,
                        TYPE:$scope.doctorInfo.ADD_CLINIC_TYPE,
                        LONG_TERM:$scope.LONG_TERM,
                        CARD_NO:cardNo
                    };
                    AddClinicManagementService.judgeExitByDate(param,function(result){
                        if(result.success){
                            var data = result.data;
                            if(data.EXIT=="false"){
                                schedule.CLINIC_IS_TAKEN = true;
                                dealClinicScheduleClass(schedule,scheduleLineDate);
                                $scope.LONG_TERM="0";
                            }else{
                                KyeeMessageService.broadcast({
                                    content: data.REASON,
                                    duration: 3000
                                });
                            }
                        }else{
                            KyeeMessageService.broadcast({
                                content: result.message,
                                duration: 3000
                            });
                        }
                    });
                }else{
                    schedule.CLINIC_IS_TAKEN=!schedule.CLINIC_IS_TAKEN;
                    //如果排班有被点击，则清除掉30天不限
                    if(schedule.CLINIC_IS_TAKEN){
                        $scope.LONG_TERM="0";
                    }
                    dealClinicScheduleClass(schedule,scheduleLineDate);
                }
            }
        };

        //处理选中日期样式  gaomeng  2017年3月30日08:51:37
        var dealClinicScheduleClass = function(schedule,scheduleLineDate){
            var startLineDay = scheduleLineDate[0].dayCode;
            var lengthLine = scheduleLineDate.length;
            var currentDay = schedule.dayCode;
            var currentIndex = currentDay - startLineDay;
            var afterClinicIsTaken = false; //后一天是否选中，默认未选中
            if(schedule.CLINIC_IS_TAKEN){
                if(2 == schedule.clinicType ||3 == schedule.clinicType){
                   // clinicType 0:无排班  1:有号   2：可抢号  3：待放号
                    if(1 == lengthLine){
                        if(2 == schedule.clinicType){
                            schedule.styleClass = "selectedOrangeOptional";
                        }else{
                            schedule.styleClass = "selectedBlueOptional";
                        }
                        return;
                    }else {
                        //先判断后一天是否选中
                        if(6 == currentIndex || currentIndex + 1 == lengthLine){
                            afterClinicIsTaken = false;
                        }else{
                            afterClinicIsTaken = scheduleLineDate[currentIndex + 1].CLINIC_IS_TAKEN;
                        }
                        if(afterClinicIsTaken && schedule.clinicType == scheduleLineDate[currentIndex + 1].clinicType){
                            if(2 == schedule.clinicType){
                                schedule.styleClass = "selectedOrangeOptionalLeft";
                                if(currentIndex != 0 &&  "selectedOrangeOptionalLeft" == scheduleLineDate[currentIndex + 1].styleClass){
                                    scheduleLineDate[currentIndex + 1].styleClass = "selectedOrangeOptionalMidle";
                                    schedule.styleClass = "selectedOrangeOptionalLeft";
                                    dealBeforeClinicSchedule(schedule, scheduleLineDate, currentIndex);
                                    return;
                                }
                            } else {
                                schedule.styleClass = "selectedBlueOptionalLeft";
                                if(currentIndex != 0 && "selectedBlueOptionalLeft" == scheduleLineDate[currentIndex + 1].styleClass){
                                    scheduleLineDate[currentIndex + 1].styleClass = "selectedBlueOptionalMidle";
                                    schedule.styleClass = "selectedBlueOptionalLeft";
                                    dealBeforeClinicSchedule(schedule, scheduleLineDate, currentIndex);
                                    return;
                                }
                            }
                            var afterCount = 0;
                            for(;afterCount<lengthLine-2 - currentIndex;){
                                afterCount++;
                                afterClinicIsTaken = scheduleLineDate[currentIndex + 1 + afterCount].CLINIC_IS_TAKEN;
                                if(afterClinicIsTaken  && schedule.clinicType == scheduleLineDate[currentIndex + 1 + afterCount].clinicType){
                                    if(2 == scheduleLineDate[currentIndex + afterCount].clinicType){
                                        scheduleLineDate[currentIndex + afterCount].styleClass = "selectedOrangeOptionalMidle";
                                    }else {
                                        scheduleLineDate[currentIndex + afterCount].styleClass = "selectedBlueOptionalMidle";
                                    }
                                }else{
                                    if(afterClinicIsTaken && schedule.clinicType == scheduleLineDate[currentIndex +  afterCount].clinicType){
                                        if(2 == scheduleLineDate[currentIndex + afterCount].clinicType){
                                            scheduleLineDate[currentIndex + afterCount].styleClass = "selectedOrangeOptionalRight";
                                            if("selectedOrangeOptional" == scheduleLineDate[currentIndex - 1].styleClass){
                                                scheduleLineDate[currentIndex - 1].styleClass = "selectedOrangeOptionalLeft";
                                                schedule.styleClass = "selectedOrangeOptionalMidle";
                                            }else if("selectedOrangeOptionalRight" == scheduleLineDate[currentIndex - 1].styleClass){
                                                scheduleLineDate[currentIndex - 1].styleClass = "selectedOrangeOptionalMidle";
                                                schedule.styleClass = "selectedOrangeOptionalMidle";
                                            }
                                        }else {
                                            scheduleLineDate[currentIndex + afterCount].styleClass = "selectedBlueOptionalRight";
                                            if("selectedBlueOptional" == scheduleLineDate[currentIndex - 1].styleClass){
                                                scheduleLineDate[currentIndex - 1].styleClass = "selectedBlueOptionalLeft";
                                                schedule.styleClass = "selectedBlueOptionalMidle";
                                            }else if("selectedBlueOptionalRight" == scheduleLineDate[currentIndex - 1].styleClass){
                                                scheduleLineDate[currentIndex - 1].styleClass = "selectedBlueOptionalMidle";
                                                schedule.styleClass = "selectedBlueOptionalMidle";
                                            }
                                        }
                                        return;
                                    }else{
                                        if(2 == scheduleLineDate[currentIndex + afterCount].clinicType){
                                            scheduleLineDate[currentIndex + afterCount].styleClass = "selectedOrangeOptionalRight";
                                        }else {
                                            scheduleLineDate[currentIndex + afterCount].styleClass = "selectedBlueOptionalRight";
                                        }
                                    }
                                    if( 0 == currentIndex){
                                        if(2 == scheduleLineDate[currentIndex + afterCount].clinicType){
                                            scheduleLineDate[currentIndex + afterCount].styleClass = "selectedOrangeOptionalRight";
                                        }else {
                                            scheduleLineDate[currentIndex + afterCount].styleClass = "selectedBlueOptionalRight";
                                        }
                                        return;
                                    }else{
                                        //后一天没有被选中，且所选日期不是该行第一个，再判断前一天是否选中
                                        dealBeforeClinicSchedule(schedule, scheduleLineDate, currentIndex);
                                        return;
                                    }
                                }
                            }
                            if(lengthLine- 2 - currentIndex == afterCount && afterClinicIsTaken  && schedule.clinicType == scheduleLineDate[currentIndex + 1 + afterCount].clinicType){
                                if(2 == scheduleLineDate[currentIndex + afterCount +1].clinicType){
                                    scheduleLineDate[currentIndex + afterCount +1].styleClass = "selectedOrangeOptionalRight";
                                }else {
                                    scheduleLineDate[currentIndex + afterCount +1].styleClass = "selectedBlueOptionalRight";
                                }
                                if( 0 == currentIndex){
                                    return;
                                }else {
                                    dealBeforeClinicSchedule(schedule, scheduleLineDate, currentIndex);
                                    return;
                                }
                            }
                        }else{
                            dealBeforeClinicSchedule(schedule, scheduleLineDate, currentIndex);
                            return;
                        }
                    }
                }
            }else{
                dealCancleClinicSchedule(schedule, scheduleLineDate, currentIndex, lengthLine);
            }
        }
        //高萌  2017年3月31日10:20:19  处理前一天日期是否选中的样式
        var dealBeforeClinicSchedule = function(schedule, scheduleLineDate, currentIndex){
            var afterClinicIsTaken = false;
            var lengthLine = scheduleLineDate.length;
            if(6 == currentIndex || currentIndex + 1 == lengthLine){
                afterClinicIsTaken = false;
            }else{
                afterClinicIsTaken = scheduleLineDate[currentIndex + 1].CLINIC_IS_TAKEN;
            }
            var beforeClinicIsTaken = false;//前一天是否选中，默认未选中
            //后一天没有被选中，再判断前一天是否选中
            if(0 == currentIndex){
                beforeClinicIsTaken = false;
            }else{
                beforeClinicIsTaken = scheduleLineDate[currentIndex - 1].CLINIC_IS_TAKEN;
            }
            if(beforeClinicIsTaken && schedule.clinicType == scheduleLineDate[currentIndex - 1].clinicType){
                if(2 == schedule.clinicType){
                    schedule.styleClass = "selectedOrangeOptionalRight";
                    if(afterClinicIsTaken){
                        if("selectedOrangeOptionalRight" == scheduleLineDate[currentIndex - 1].styleClass){
                            scheduleLineDate[currentIndex - 1].styleClass = "selectedOrangeOptionalMidle";
                            if(schedule.clinicType == scheduleLineDate[currentIndex + 1].clinicType){
                                schedule.styleClass = "selectedOrangeOptionalMidle";
                            }else{
                                schedule.styleClass = "selectedOrangeOptionalRight";
                            }
                            return;
                        }else if("selectedOrangeOptional" == scheduleLineDate[currentIndex - 1].styleClass){
                            scheduleLineDate[currentIndex - 1].styleClass = "selectedOrangeOptionalLeft";
                            if(schedule.clinicType == scheduleLineDate[currentIndex + 1].clinicType){
                                schedule.styleClass = "selectedOrangeOptionalMidle";
                            }else{
                                schedule.styleClass = "selectedOrangeOptionalRight";
                            }
                            return;
                        }
                    }

                }else{
                    schedule.styleClass = "selectedBlueOptionalRight";
                    if(afterClinicIsTaken){
                        if( "selectedBlueOptionalRight" == scheduleLineDate[currentIndex - 1].styleClass){
                            scheduleLineDate[currentIndex - 1].styleClass = "selectedBlueOptionalMidle";
                            if(schedule.clinicType == scheduleLineDate[currentIndex + 1].clinicType){
                                schedule.styleClass = "selectedBlueOptionalMidle";
                            }else{
                                schedule.styleClass = "selectedBlueOptionalRight";
                            }
                            return;
                        }else if("selectedBlueOptional" == scheduleLineDate[currentIndex - 1].styleClass){
                            scheduleLineDate[currentIndex - 1].styleClass = "selectedBlueOptionalLeft";
                            schedule.styleClass = "selectedBlueOptionalMidle";
                            return;
                        }
                    }
                }
                var beforeCount = 0;
                for(;beforeCount< currentIndex - 1;){
                    beforeCount++;
                    beforeClinicIsTaken = scheduleLineDate[currentIndex - 1 - beforeCount].CLINIC_IS_TAKEN;
                    if(beforeClinicIsTaken && schedule.clinicType == scheduleLineDate[currentIndex - 1 - beforeCount].clinicType){
                        if( 2 == scheduleLineDate[currentIndex - beforeCount].clinicType){
                            scheduleLineDate[currentIndex - beforeCount].styleClass = "selectedOrangeOptionalMidle";
                        }else{
                            scheduleLineDate[currentIndex - beforeCount].styleClass = "selectedBlueOptionalMidle";
                        }
                    }else{
                        if( 2 == scheduleLineDate[currentIndex - beforeCount].clinicType){
                            scheduleLineDate[currentIndex - beforeCount].styleClass = "selectedOrangeOptionalLeft";
                        }else{
                            scheduleLineDate[currentIndex - beforeCount].styleClass = "selectedBlueOptionalLeft";
                        }
                        return;
                    }
                }
                if(currentIndex - 1 == beforeCount && beforeClinicIsTaken && schedule.clinicType == scheduleLineDate[0].clinicType){
                    if( 2 == scheduleLineDate[0].clinicType){
                        scheduleLineDate[0].styleClass = "selectedOrangeOptionalLeft";
                    }else{
                        scheduleLineDate[0].styleClass = "selectedBlueOptionalLeft";
                    }
                }
            }else{
                if(afterClinicIsTaken && schedule.clinicType == scheduleLineDate[currentIndex + 1].clinicType){
                    if(2 == schedule.clinicType){
                        schedule.styleClass = "selectedOrangeOptionalLeft";
                    }else {
                        schedule.styleClass = "selectedBlueOptionalLeft";
                    }
                }else{
                    //后一天和前一天都没有被选中
                    if(2 == schedule.clinicType){
                        schedule.styleClass = "selectedOrangeOptional";
                    }else {
                        schedule.styleClass = "selectedBlueOptional";
                    }
                }
                return;
            }
        }
        //高萌 2017年4月6日20:51:12 处理取消所选日期的样式
        var dealCancleClinicSchedule = function(schedule, scheduleLineDate, currentIndex, lengthLine){
            if(1 == lengthLine){
                if(2 == schedule.clinicType){
                    schedule.styleClass = "orangeOptional";
                }else {
                    schedule.styleClass = "blueOptional";
                }
                return;
            }else{
                if(2 == schedule.clinicType){
                    if("selectedOrangeOptionalLeft" == schedule.styleClass || "selectedOrangeOptionalMidle" == schedule.styleClass){
                        if("selectedOrangeOptionalMidle" == scheduleLineDate[currentIndex+1].styleClass){
                            scheduleLineDate[currentIndex+1].styleClass = "selectedOrangeOptionalLeft";
                        }else if("selectedOrangeOptionalRight" == scheduleLineDate[currentIndex+1].styleClass){
                            scheduleLineDate[currentIndex+1].styleClass = "selectedOrangeOptional";
                        }

                    }
                    if("selectedOrangeOptionalRight" == schedule.styleClass || "selectedOrangeOptionalMidle" == schedule.styleClass){
                        if("selectedOrangeOptionalMidle" == scheduleLineDate[currentIndex-1].styleClass){
                            scheduleLineDate[currentIndex-1].styleClass = "selectedOrangeOptionalRight";
                        }else if("selectedOrangeOptionalLeft" == scheduleLineDate[currentIndex-1].styleClass){
                            scheduleLineDate[currentIndex-1].styleClass = "selectedOrangeOptional";
                        }
                    }
                    schedule.styleClass = "orangeOptional";
                }else{
                    if("selectedBlueOptionalMidle" == schedule.styleClass || "selectedBlueOptionalLeft" == schedule.styleClass){
                        if("selectedBlueOptionalMidle" == scheduleLineDate[currentIndex+1].styleClass){
                            scheduleLineDate[currentIndex+1].styleClass = "selectedBlueOptionalLeft";

                        }else if("selectedBlueOptionalRight" == scheduleLineDate[currentIndex+1].styleClass){
                            scheduleLineDate[currentIndex+1].styleClass = "selectedBlueOptional";
                        }
                    }
                    if("selectedBlueOptionalMidle" == schedule.styleClass || "selectedBlueOptionalRight" == schedule.styleClass){
                        if("selectedBlueOptionalMidle" == scheduleLineDate[currentIndex-1].styleClass){
                            scheduleLineDate[currentIndex-1].styleClass = "selectedBlueOptionalRight";
                        }else if("selectedBlueOptionalLeft" == scheduleLineDate[currentIndex-1].styleClass){
                            scheduleLineDate[currentIndex-1].styleClass = "selectedBlueOptional";
                        }
                    }
                    schedule.styleClass = "blueOptional";
                }
            }
        }
        //高萌  2017年3月31日10:20:19  待放号和可抢号的解释
        $scope.rushTips = function() {
            $scope.dialog = KyeeMessageService.dialog({
                tapBgToClose : true,
                template: "modules/business/appointment/views/clinic_reminder_management/rush_schedule_tip.html",
                scope: $scope,
                title: KyeeI18nService.get("appointment.messageTitle", "提示"),
                buttons: [
                    {
                        text: KyeeI18nService.get("appointment.ok", "知道了"),
                        style: 'button-size-l',
                        click: function () {
                            $scope.dialog.close();
                        }
                    }
                ]
            });
        }
        $scope.getDoctorSchedule = function(){
            var param = {
                hospitalId:$scope.pageData.HOSPITAL_ID,
                deptCode:$scope.pageData.DEPT_CODE,
                bussinessType:2,
                USER_VS_ID:userVsId,
                DOCTOR_CODE:$scope.pageData.DOCTOR_CODE,
                IS_ONLINE:AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE,//查医生列表增加IS_ONLINE 参数
                IS_REFERRAL:$scope.IS_REFERRAL,
                ADD_CLINIC_TYPE:$scope.doctorInfo.ADD_CLINIC_TYPE
            };
            AddClinicManagementService.queryCanRushScheduleList(param,function (data,resultData) {
                $scope.dateList = resultData;
                //日历初始化
                initCalendarData($scope.dateList);
                //如果是有号提醒，则不展示就诊卡，则不用查卡
                if($scope.doctorInfo.ADD_CLINIC_TYPE=='1'){
                    $scope.getCardInfo();
                }
                $scope.getDoctorScheduleFee();
            });
        };
        $scope.getDoctorScheduleFee = function(){
            var param = {
                hospitalId:$scope.pageData.HOSPITAL_ID,
                deptCode:$scope.pageData.DEPT_CODE,
                bussinessType:2,
                USER_VS_ID:userVsId,
                DOCTOR_CODE:$scope.pageData.DOCTOR_CODE,
                IS_ONLINE:AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE,//查医生列表增加IS_ONLINE 参数
                IS_REFERRAL:$scope.IS_REFERRAL,
                ADD_CLINIC_TYPE:$scope.doctorInfo.ADD_CLINIC_TYPE
            };
            AddClinicManagementService.queryDoctorScheduleFee(param,function (resultData) {
                $scope.feeList = resultData.SCHEDULE_FEE;
                if($scope.feeList != undefined && $scope.feeList != null){
                    $scope.paymentFee = $scope.feeList[0];
                }
                $scope.IS_ONLY_ZERO = resultData.IS_ONLY_ZERO;
                $scope.APPOINT_PAY_WAY = resultData.APPOINT_PAY_WAY;
                $scope.REGIST_PAY_WAY = resultData.REGIST_PAY_WAY;
                $scope.DECLARATION_SHOW = resultData.DECLARATION_SHOW;
                $scope.FEE_SHOW = resultData.FEE_SHOW
            });
        };
        $scope.changeFee=function(fee,index)
        {
            $scope.paymentFee = fee;
            $scope.choosedItem = index;
        }
        function showSelectScheduleList() {
            for (var t = 0; t < $scope.RUSH_DETAIL_LIST.length; t++) {
                var date = new Date($scope.RUSH_DETAIL_LIST[t].CLINIC_DATE);
                var day = date.getDate();
                var month = (date.getMonth() + 1);
                if ((date.getMonth() + 1) < 10) {
                    month = "0" + (date.getMonth() + 1);
                }
                if (date.getDate() < 10) {
                    day = "0" + (date.getDate());
                }
                $scope.RUSH_DETAIL_LIST[t].CLINIC_DATE_SHOW = (month) + "月" + day + "日";
                $scope.RUSH_DETAIL_LIST[t].CLINIC_DURATION_SHOW = $scope.RUSH_DETAIL_LIST[t].CLINIC_DURATION;
            }
        }
        $scope.getCardInfo = function(){
            //start 获取就诊者就诊卡信息
            AppointmentRegistDetilService.setClientinfo(function (Clientinfo) {
                $scope.Clientinfo = Clientinfo;
                /*$scope.patientInf.BIRTH_CERTIFICATE_NO = Clientinfo.BIRTH_CERTIFICATE_NO;*/
                $scope.trueOrfalse = function () {
                    //只读
                    if (Clientinfo.CARDNO_TO_APPOINT == 0) {
                        $scope.placeholder = "";
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
                            if (Clientinfo.SELECT_FLAG == "1") {
                                $scope.patientInf.CARD_NO = Clientinfo.rows[i].CARD_NO;
                                $scope.patientInf.CARD_SHOW = Clientinfo.rows[i].CARD_SHOW;
                                $scope.PATIENT_ID = Clientinfo.rows[i].PATIENT_ID;
                                $scope.patientInf.CARD_NAME = Clientinfo.rows[i].CARD_NAME;
                                break;
                            }
                        } else {
                            if (Clientinfo.SELECT_FLAG == "1") {
                                $scope.patientInf.CARD_NO = Clientinfo.rows[0].CARD_NO;
                                $scope.patientInf.CARD_SHOW = Clientinfo.rows[0].CARD_SHOW;
                                $scope.PATIENT_ID = Clientinfo.rows[0].PATIENT_ID;
                                $scope.patientInf.CARD_NAME = Clientinfo.rows[0].CARD_NAME;
                            }
                        }
                    }
                    for (var i = 0; i < Clientinfo.rows.length; i++) {
                        var resultMap = {};
                        if (Clientinfo.rows[i].CARD_NAME == null || Clientinfo.rows[i].CARD_NAME == undefined || Clientinfo.rows[i].CARD_NAME == "") {
                            resultMap["name"] = "";
                        }
                        else {
                            resultMap["name"] = Clientinfo.rows[i].CARD_NAME;
                        }
                        resultMap["text"] = Clientinfo.rows[i].CARD_SHOW;
                        resultMap["value2"] = Clientinfo.rows[i].PATIENT_ID;
                        resultMap["value"] = Clientinfo.rows[i].CARD_NO;
                        resultMap["value3"] = Clientinfo.rows[i].CARD_TYPE;
                        menus.push(resultMap);
                    }
                }
                //begin 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼  KYEEAPPC-2917
                //wangwenbo 2015年10月8日09:25:15 增加用户有卡则不显示申请新卡 APPCOMMERCIALBUG-1429
                if((menus.length == 0) && ('true' === $scope.Clientinfo.REMOTE_BUILD_CARD
                    || 'input' === $scope.Clientinfo.REMOTE_BUILD_CARD)){
                    var resultMap = {};
                    resultMap["name"] = "";
                    resultMap["text"] = "申请新卡";
                    resultMap["value2"] = -1;
                    resultMap["value"] = -1;
                    menus.push(resultMap);
                }
                //控制器中绑定数据
                $scope.pickerItems = menus;
                //end 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼
            });
            var params={
                IS_ONLINE:0,
                USER_ID:userId,
                USER_VS_ID:userVsId,
                HOSPITAL_ID:$scope.pageData.HOSPITAL_ID
            };
            AppointmentRegistDetilService.queryClientinfo(params);
            //end 获取就诊者就诊卡信息
        };
        ///**
        // * 如果用户选择了日期筛选医生，则定位到用户选择的最小日期的排班
        // */
        //function toSelectData(doctorScheduleArr){
        //    var selectDate=AppointmentDoctorDetailService.selectDate.sort();
        //    var schedule=doctorScheduleArr;
        //    var scheduleClinicDate=null;
        //    for(var i=0;i<schedule.length;i++){
        //        var doctordate=new Date(schedule[i].CLINIC_DATE);
        //        doctordate=doctordate.getFullYear()+"-"+(doctordate.getMonth()+1)+"-"+doctordate.getDate();
        //        if(selectDate.indexOf(doctordate)>-1){
        //            scheduleClinicDate=schedule[i].CLINIC_DATE;
        //            break;
        //        }
        //    }
        //    if(scheduleClinicDate !=null){
        //        var pageIndex=0;
        //        var scheduleClinicDate=new Date(scheduleClinicDate.replace(/-/g, '/'));
        //        for(var j=1;j<$scope.weekMouthlimit.length;j++){
        //            var weeklimit=$scope.weekMouthlimit[j];
        //            var startDate= weeklimit.split("-")[0];
        //            var endDate= weeklimit.split("-")[1];
        //            startDate=new Date(startDate);
        //            endDate=new Date(endDate);
        //            if(scheduleClinicDate>=startDate && scheduleClinicDate<=endDate){
        //                pageIndex=j;
        //            }
        //        }
        //    }
        //    for(var s=0;s<pageIndex;s++){
        //        var screenSize = KyeeUtilsService.getInnerSize();
        //        if( $scope.schedulepage!=$scope.pageArr.length-1){
        //            $scope.schedulepage++;
        //            $ionicScrollDelegate.$getByHandle("doctor_schedule").scrollTo(screenSize.width*($scope.schedulepage),0,false);
        //            $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
        //        }
        //    }
        //}

        /**
         * 任务单号：KYEEAPPC-5251
         * 任务内容：点击医生列表跳转到医生排班页面日期组件默认定位有排班的周
         * 创建时间：2016-02-25
         * 创建者：王亚宁
         */
        function showDoctorScheduleByDate(scheduleMorningData,scheduleAfterData){
            var emptyPageTotalNum = 0;
            for(var i = 0;i<scheduleMorningData.length; i+=7){
                filterResult = filterEmptySchedule(scheduleMorningData.slice(i,i+7),scheduleAfterData.slice(i,i+7));
                if(filterResult){
                    emptyPageTotalNum+=1;
                } else {
                    break;
                }
            }
            //根据空白页数确定初始化时跳转界面
            if(emptyPageTotalNum > 0){
                $scope.nextWeekSchedule(emptyPageTotalNum,false);
            }
        }

        /**
         * 过滤空白排班页数
         * 创建时间：2016-02-25
         * 创建者：王亚宁
         */
        function filterEmptySchedule(morningWeekData,afterWeekData){
            var filterResult = false;
            var hasDataNum = 0;//获取非空白排班数据，包括早上和下午
            var morningContent = "";
            var afterContent = "";
            for(index in morningWeekData){
                morningContent = morningWeekData[index].showShedule;
                if("" != morningContent && undefined != morningContent){
                    hasDataNum+=1;
                }
            }
            for(index in afterWeekData){
                afterContent = afterWeekData[index].showShedule;
                if("" != afterContent && undefined != afterContent){
                    hasDataNum+=1;
                }
            }
            if(hasDataNum == 0){
                filterResult = true;
            }
            return filterResult;
        }

        /**
         * 获取指定日期的下一天日期
         * @param date 指定日期
         * @returns {*} 下一天日期的字符串（格式为YYYY/MM/DD）
         */
        function getNextDateStr(date) {
            date.setDate(date.getDate() + 1);
            return KyeeUtilsService.DateUtils.formatFromDate(date, 'YYYY/MM/DD');
        }

        //定义一个比较器
        function compare(propertyName) {
            return function (object1, object2) {
                var value1 = object1[propertyName];
                var value2 = object2[propertyName];
                if (value2 > value1) {
                    return -1;
                }
                else if (value2 < value1) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        }
        var schlastUpdateTime=-10;
        $scope.startSchedule = function(){

            var ts = KyeeUtilsService.interval({
                time: 200,
                action: function () {

                    if((new Date().getTime() - schlastUpdateTime) > 200){
                        KyeeUtilsService.cancelInterval(ts);
                        $scope.schedulepage = (Math.round($ionicScrollDelegate.$getByHandle("doctor_schedule").getScrollPosition().left / (KyeeUtilsService.getInnerSize().width - 16*2)));
                        $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
                    }
                }
            });
        };
        //监听用户滑动
        $scope.lestionScheduleScroll=function(){
            schlastUpdateTime = new Date().getTime();
        };
        //修改导航历史
        $scope.updateHistory = function () {
            var historyId = $ionicHistory.currentHistoryId();
            var viewHistory = $ionicHistory.viewHistory().histories[historyId].stack;
            //修改ionic导航历史
            for (var i = 0; i < viewHistory.length; i++) {
                if (viewHistory[i].stateId == 'appointment_doctor_info') {
                    viewHistory[i].stateId = 'appointment_info';
                    viewHistory[i].stateName = 'appointment_info';
                    break;
                }
            }
        };
        //绑定选择事件
        $scope.bind = function (params) {
            showPicker = params.show;
        };
        //点击选择就诊人
        $scope.changepatient = function () {
            $scope.doctorScheduleShow = false;
            CustomPatientService.F_L_A_G = "add_clinic_management_new";
            /*//关闭弹出的儿科限制
             if($scope.dialog){
             $scope.dialog.close();
             }*/
            $state.go("custom_patient");
            OperationMonitor.record("countChangePatient", "add_clinic_management_new");
        };
        //由于ng-module只能绑定页面对象就诊者信息
        $scope.patientInf = {
            CARD_NO: "",
            CARD_SHOW: "",
            CARD_NAME:""
        };
        //修改就诊卡输入框中的内容
        $scope.inputCardNo = function () {
            //将患者输入的卡号作为预约卡号
            $scope.patientInf.CARD_NO = $scope.patientInf.CARD_SHOW;
            //清空PATIENT_ID
            $scope.PATIENT_ID = '';
        };
        $scope.showChardNoInf = function(){

            $scope.userMessage ="就诊卡是医院存储您就诊卡资料的磁性卡，是您与医院挂号，付款等交互的唯一实体凭据（某些地区可由医保卡代替），由于医疗的特殊和保密性需要，每家医院的就诊卡不通用。为保证您的挂号等操作的顺利进行，请正确填选您正在使用的就诊卡。没有就诊卡的患者，请到您就诊的医院凭个人身份证办理就诊卡。";
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"温馨提示",
                buttons: [
                    {
                        text:  KyeeI18nService.get("add_clinic_management_new.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("countShowChardNoInf", "add_clinic_management_new");
        };
        //点击选择就诊卡
        $scope.showpatientCardNo = function () {
            //begin  当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼 KYEEAPPC-2917
            if (!$scope.pickerItems.length) {
                //KYEEAPPC-4733 确认挂号跳选卡界面是否展示虚拟卡标识  wangwan 2016年1月6日11:01:43
                PatientCardService.filteringVirtualCard.isFilteringVirtual=$scope.virtualSupportType;
                $state.go("patient_card_select");
            } else {
                $scope.title = "请选择就诊卡";
                //调用显示
                $scope.showPicker($scope.patientInf.CARD_NO);
            }
            //end 当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼
            OperationMonitor.record("countPatientCardNo", "add_clinic_management_new");
        };
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };
        //选择卡号
        $scope.selectItem = function (params) {
            $scope.patientInf.CARD_SHOW = params.item.text;//展示值
            //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
            $scope.patientInf.CARD_NO = params.item.value;//唯一属性
            $scope.PATIENT_ID = params.item.value2;//第二属性
            $scope.Card_Type = params.item.value3;//第三属性
            //申请新卡则不进行选卡操作
            if ($scope.PATIENT_ID != -1) {

            } else if ('input' === $scope.Clientinfo.REMOTE_BUILD_CARD) {
                AppointmentCreateCardService.confirmScope = $scope;
                $state.go('create_card_info');
            }
        };
        //删除抢号管理记录
        $scope.delete = function () {
            AppointmentRegistListService.deleteRushRecord(function () {
                AddClinicManagementService.rush_type = 1;
                $state.go('rush_clinic_record_list_new');
            }, $scope.doctorInfo.RUSH_ID, userId);
        };
        //点击30天不限
        $scope.longTerm = function(){
            if($scope.LONG_TERM=="0"){
                $scope.LONG_TERM ="1";
                //如果点击30天不限，则清掉点击的排班
                for(var i=0;i<$scope.dateList.length;i++){
                    $scope.dateList[i].CLINIC_IS_TAKEN = false;
                    //if( $scope.dateList[i].text &&  $scope.dateList[i].clinicType == 2){
                    if($scope.dateList[i].clinicType == 2){
                        $scope.dateList[i].styleClass = "orangeOptional"
                        //$scope.dateList[i].text = "可抢号";
                    }
                    //if( $scope.dateList[i].text &&  $scope.dateList[i].clinicType == 3){
                    if($scope.dateList[i].clinicType == 3){
                        $scope.dateList[i].styleClass = "blueOptional"
                        //$scope.dateList[i].text = "待放号";
                    }
                }
            }else{
                $scope.LONG_TERM ="0";
            }
        },
        //确认
        $scope.confirm = function(ScheduleArray){
            if($scope.LONG_TERM=="0"){
                var scheduleData =[] ;
                for(var i=0;i<ScheduleArray.length;i++){
                    if(ScheduleArray[i]!=""){
                        if(ScheduleArray[i].CLINIC_IS_TAKEN){
                            for(var j=0;j<ScheduleArray[i].DOCTOR_SCHEDULE_LIST.length;j++){
                                if(scheduleData.length==0){
                                    scheduleData.push(ScheduleArray[i].DOCTOR_SCHEDULE_LIST[j]);
                                }else{
                                    var schedule = new Object();
                                    schedule.CLINIC_DATE=ScheduleArray[i].DOCTOR_SCHEDULE_LIST[j].CLINIC_DATE;
                                    schedule.CLINIC_DURATION=ScheduleArray[i].DOCTOR_SCHEDULE_LIST[j].CLINIC_DURATION;
                                    scheduleData.push(schedule);
                                }

                            }
                        }
                    }else{
                        continue;
                    }
                }
                if(scheduleData.length==0){
                    if($scope.doctorInfo.ADD_CLINIC_TYPE=="0"){
                        KyeeMessageService.broadcast({
                            content: "您没有选择有号提醒的日期,请选择"
                        });
                        return;
                    }else{
                        KyeeMessageService.broadcast({
                            content: "您没有选择自动抢号的日期,请选择"
                        });
                        return;
                    }

                }
            }
            //$scope.doctorInfo.ADD_CLINIC_TYPE == '1'表示自动抢号
            if ($scope.doctorInfo.ADD_CLINIC_TYPE == '1'&&!$scope.patientInf.CARD_NO && !$scope.placeholder) {//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                AppointConfirmService.choosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("add_clinic_management_new.noCard","请选择就诊卡")
                });
                return;
            }
            //$scope.doctorInfo.ADD_CLINIC_TYPE == '1'表示自动抢号
            if ($scope.doctorInfo.ADD_CLINIC_TYPE == '1'&&!$scope.patientInf.CARD_SHOW) {
                AppointConfirmService.inputOrChoosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    content: KyeeI18nService.get("add_clinic_management_new.inputCardtoAppoint","请输入就诊卡号")
                });
                return;
            }
            //如果为远程建卡
            if ($scope.PATIENT_ID == -1) {
                $scope.PATIENT_ID = '';
                $scope.patientInf.CARD_NO = '';
            }
            var createCard = 0;
            //选择申请新卡时，patientId为-1
            if ($scope.patientInf.CARD_NO == '') {
                createCard = 1;
            }

            $scope.adviceAmount = $scope.paymentFee;
            var rushParam = {
                SCHEDULE_DATA:JSON.stringify(scheduleData),
                DEPT_CODE:$scope.pageData.DEPT_CODE,
                DEPT_NAME:$scope.doctorInfo.DEPT_NAME,
                DOCTOR_CODE:$scope.pageData.DOCTOR_CODE,
                DOCTOR_NAME:$scope.pageData.DOCTOR_NAME,
                HOSPITAL_ID:$scope.pageData.HOSPITAL_ID,
                USER_ID:userId,
                USER_VS_ID: "",
                TYPE: $scope.doctorInfo.ADD_CLINIC_TYPE,
                PATIENT_ID: "",
                CARD_NO: "",
                CARD_PWD: "",
                LONG_TERM:$scope.LONG_TERM,
                PATIENT_NAME:"",
                IS_CREATE_CARD: 0,
                ADVICE_AMOUNT:$scope.adviceAmount,//抢号预缴金  2.3.80版本以后新增
                IS_ONLY_ZERO:$scope.IS_ONLY_ZERO//该医生挂号费只有0元的情况
            };
            if ($scope.doctorInfo.ADD_CLINIC_TYPE == '1') {
                rushParam.PATIENT_ID = $scope.PATIENT_ID;
                rushParam.CARD_NO = $scope.patientInf.CARD_NO;
                rushParam.CARD_PWD = AppointmentCreateCardService.password;
                rushParam.USER_VS_ID = userVsId;
                rushParam.PATIENT_NAME = $scope.patientName;
                rushParam.IS_CREATE_CARD = createCard;
            }
            AddClinicManagementService.confirm(rushParam,function(result){
                if(result.success){
                    AddClinicManagementService.rush_type = $scope.doctorInfo.ADD_CLINIC_TYPE;
                    if($scope.doctorInfo.ADD_CLINIC_TYPE == '1'){
                        if ($scope.Clientinfo.rows) {
                            result.data["CARD_TYPE"] = '';
                            for (var i = 0; i <$scope.Clientinfo.rows.length; i++) {
                                if ($scope.patientInf.CARD_NO == $scope.Clientinfo.rows[i].CARD_NO) {
                                    result.data["CARD_TYPE"] = $scope.Clientinfo.rows[i].CARD_TYPE;
                                    break;
                                }
                            }
                        }
                        //提供给抢号待支付详情页面
                        AddClinicManagementService.DOCTOR_INFO.MARK_DESC = result.data.MARK_DESC;
                        var now = new Date();
                        var payDeadLine= new Date(now.getTime()+result.data.PAY_REMAIN_TIME*1000);
                        //跳转到支付页面需要的参数
                        var rushPayDate = {
                            HOSPITAL_ID:$scope.pageData.HOSPITAL_ID,
                            MARK_DESC: result.data.MARK_DESC,
                            MARK_DETAIL:KyeeI18nService.get("add_clinic_management_new.markDetail","抢号预交金"),
                            AMOUNT:$scope.adviceAmount,
                            USER_PAY_AMOUNT:$scope.adviceAmount,
                            isShow:"0",
                            IS_OPEN_BALANCE:"fail",
                            APPOINT_SUCCESS_PAY:1,
                            REMAIN_SECONDS:result.data.PAY_REMAIN_TIME, //支付剩余时间
                            PAY_DEADLINE:payDeadLine,//支付截止时间
                            flag:3,//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                            TRADE_NO:result.data.OUT_TRADE_NO,
                            CARD_NO:$scope.patientInf.CARD_NO,
                            CART_TYPE:result.data["CARD_TYPE"],
                            PATIENT_ID:$scope.PATIENT_ID,
                            hospitalID:$scope.pageData.HOSPITAL_ID,
                            ROUTER:"rush_clinic_record_list_new",
                            PRE_PAY_MARK:"1" //抢号预付费标识;1表示是预付费数据
                        };
                        PayOrderService.payData = rushPayDate;
                        // 挂号费不为0元跳转缴费页面
                        if(!$scope.IS_ONLY_ZERO && $scope.adviceAmount != null && $scope.adviceAmount != "" && $scope.adviceAmount != undefined){
                            AddClinicManagementService.DOCTOR_INFO = result.data;
                            AddClinicManagementService.DOCTOR_INFO.HOSPITAL_ID = $scope.pageData.HOSPITAL_ID;
                            AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = $scope.doctorInfo.ADD_CLINIC_TYPE;
                            $state.go("payOrder");
                        }else{
                            AddClinicManagementService.DOCTOR_INFO = result.data;
                            AddClinicManagementService.DOCTOR_INFO.HOSPITAL_ID = $scope.pageData.HOSPITAL_ID;
                            AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = $scope.doctorInfo.ADD_CLINIC_TYPE;
                            $state.go("rush_clinic_detail");
                        }
                    }else{
                        $state.go("rush_clinic_record_list_new");
                    }
                }
                //南京12320平台
                else if (result.message == "njFail") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.njFail","未通过校验，请输入正确的12320账户信息")
                    });
                }
                //南京12320平台
                else if (result.message == "ckFail") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.ckFail","12320用户名或密码错误")
                    });
                }
                //南京12320平台
                else if (result.message == "bind") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.bind","请绑定12320账户")
                    });
                }
                //南京12320平台
                else if (result.message == "bindPhone") {
                    $state.go("binding12320");
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appoint_confirm.bindPhone","请绑定手机号")
                    });
                }
                //预约失败，您今日已经在该科室预约过，不能重复预约！
                else if (result.resultCode == "0020405") {
                    KyeeMessageService.broadcast({
                        content: result.message,
                        duration: 5000
                    });
                }
                // 校验就诊者地址信息
                else if (result.resultCode == "0020638") {
                    KyeeMessageService.broadcast({
                        content: result.message,
                        duration: 5000
                    });
                    var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
                    CommPatientDetailService.editPatient(current);
                }
                //请绑定就诊者的手机号后，再进行预约
                else if (result.resultCode == "0020505") {
                    KyeeMessageService.broadcast({
                        content: result.message,
                        duration: 5000
                    });
                    //TODO
                }
                //请绑定个人信息的手机号后，再进行预约
                else if (result.resultCode == "0020504") {
                    KyeeMessageService.broadcast({
                        content: result.message,
                        duration: 5000
                    });
                    //TODO
                }
                //预约不支持虚拟卡
                else if (result.resultCode == "0020503") {
                    KyeeMessageService.broadcast({
                        content: result.message,
                        duration: 5000
                    });
                }
                //需要实名认证后再预约挂号  By  章剑飞  KYEEAPPC-2862
                else if (result.resultCode == "0020526") {
                    if (result.data.flag == '0') {
                        KyeeMessageService.broadcast({
                            content: result.message
                        });
                    } else {
                        KyeeMessageService.confirm({
                            content: result.message,
                            onSelect: function (confirm) {
                                if (confirm) {
                                    AuthenticationService.lastClass = 'add_clinic_management_new';
                                    var userInfo = memoryCache.get('currentCustomPatient');
                                    AuthenticationService.HOSPITAL_SM = {
                                        OFTEN_NAME: userInfo.OFTEN_NAME,
                                        ID_NO: userInfo.ID_NO,
                                        PHONE: userInfo.PHONE,
                                        USER_VS_ID:userInfo.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                        FLAG: result.data.flag
                                    };
                                    //跳转页面
                                    $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                }
                            }
                        });
                    }
                }
                // 黑名单提示
                else if (result.resultCode == "0020612") {
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
                    if(result.message.indexOf('意见反馈')>-1){
                        result.message = result.message.replace('意见反馈', '<span class="qy-blue text_decoration" ng-click="gofeedback()">意见反馈</span>');
                    }
                    //弹出对话框
                    $scope.blacklistDetail = result.message;
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
                else if(result.resultCode=="0020533"){
                    $scope.userMessage = result.message;
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
                else if(result.resultCode == "0020539"){
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
                    $scope.userMessage = result.message;
                    $scope.dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                        scope: $scope,
                        title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        buttons: buttons
                    });
                }
                // 成人挂儿科的限制
                else if (result.resultCode == "0020620") {
                    var buttons = [{
                        text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
                        style: "button button-block button-size-l",
                        click: function () {
                            $scope.dialog.close();
                        }
                    }];
                    //弹出对话框
                    $scope.ageLimit = result.message;
                    $scope.dialog = KyeeMessageService.dialog({
                        template: "modules/business/regist/views/delay_views/age_limit.html",
                        scope: $scope,
                        title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        buttons: buttons
                    });
                }
                else {
                    KyeeMessageService.broadcast({
                        content: result.message,
                        duration: 5000
                    });
                }
            })

        };
        //打开模态窗口
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
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
    })
    .build();


