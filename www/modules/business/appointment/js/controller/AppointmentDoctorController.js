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
    .group("kyee.quyiyuan.appointment.appointment_doctor.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.appointment.appointment_doctor.service",
        "kyee.quyiyuan.appointment.doctor_info.controller",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appoint.appoint_appointConfirm.service",
        "kyee.quyiyuan.regist.registConfirm.controller",
        "kyee.quyiyuan.appoint.appointConfirm.controller",
        "kyee.quyiyuan.regist.regist_registConfirm.service",
        "kyee.quyiyuan.appointment.register.controller"
    ])
    .type("controller")
    .name("AppointmentDoctorController")
    .params(["$scope", "$state","$ionicScrollDelegate", "KyeeViewService", "AppointmentDeptGroupService", "CacheServiceBus", "AppointmentDoctorService",
        "KyeeUtilsService", "AppointmentDoctorDetailService","KyeeMessageService","KyeeListenerRegister","HomeService",
        "FilterChainInvoker","AppointConfirmService","RegistConfirmService","HospitalSelectorService","KyeeI18nService","$ionicHistory","OperationMonitor",
        "MyCareDoctorsService","LoginService","StatusBarPushService"])
    .action(function ($scope, $state,$ionicScrollDelegate, KyeeViewService, AppointmentDeptGroupService,
                      CacheServiceBus, AppointmentDoctorService, KyeeUtilsService, AppointmentDoctorDetailService,
                      KyeeMessageService,KyeeListenerRegister,HomeService,FilterChainInvoker,AppointConfirmService,
                      RegistConfirmService,HospitalSelectorService,KyeeI18nService,$ionicHistory,OperationMonitor,
                      MyCareDoctorsService,LoginService,StatusBarPushService) {
        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "appointment_doctor",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        //返回
        $scope.back = function () {
            if (AppointmentDoctorService.ROUTE_STATE == "appointment_result" || StatusBarPushService.webJump) {
                StatusBarPushService.webJump = undefined;
                AppointmentDoctorService.ROUTE_STATE = "";
                $state.go("home->MAIN_TAB");
            }
            else {
                $ionicHistory.goBack(-1);
            }
        };
        //业务类型 0：预约；1：挂号
        var businessType = 0;
        //患者选择的日期
        var selectDate=[];
        //患者选择的职称
        var clinicData=[];
        //缓存数据
        var storageCache= CacheServiceBus.getStorageCache();
        //处理排班日期数据
        function doctorDate(){
            var weekDateShow=[]; //用于显示的日期
            var weekDate=[];  //用于计算的日期
            var showweek=[]; //标识用户是否选中日期 0:未选中，1:已选中
            var showweekClinic=[];//标识用户是否选中职称：0未选中，1：已选中
            var now =new Date();
            //如果当前日期是周日，则开始日期为当前周的周一
            if(now.getDay()==0){
                //获取周日的前一天日期
                now = new Date(now.getTime() - 24*60*60*1000);
            }
            var nowDayOfWeek = now.getDay();         //今天本周的第几天
            var nowDay = now.getDate();              //当前日
            var nowMonth = now.getMonth();           //当前月
            var nowYear = now.getFullYear();             //当前年
            //获得本周的开始日期
            var WeekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
            for(var i=0;i<21;i++){
                var nextDate= new Date(WeekStartDate.getTime()+(i+1)*24*3600*1000);
                weekDateShow.push((nextDate.getMonth()+1)+"-"+nextDate.getDate());
                weekDate.push(nextDate.getFullYear()+"-"+(nextDate.getMonth()+1)+"-"+nextDate.getDate())
                showweek.push(0);
            }
            //初始化职称默认为不选中
            for(var i=0;i< $scope.FILTER_CONDITIONS.length;i++){
                showweekClinic.push(0);
            }
            $scope.overlayData={
                weekDateShow:weekDateShow,
                weekDate:weekDate,
                showweek:showweek,
                showweekClinic:showweekClinic,
                IS_SHOW_FILTER_CONDITIONS:$scope.IS_SHOW_FILTER_CONDITIONS,
                FILTER_CONDITIONS:$scope.FILTER_CONDITIONS
            };
        }

        //初始化预约挂号条款不显示
        $scope.registNotificationShow=false;
        $scope.appointNotificationShow=false;
        $scope.viewCatch=true;
        KyeeListenerRegister.regist({
            focus: "appointment_doctor",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction : "both",
            action: function (params) {
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "appointment_doctor"){
                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, null);
                    //解决微信到医生列表页，没有拦截登录。用户到确认预约页面手动登录，
                    // 导致又跳回到医生列表页 (如果页面拦截登录，则不需要此行代码)  wangwan
                    LoginService.isWeiXinReqFlag =0;
                }
            }
        });
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "appointment_doctor",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "appointment_doctor"){
                    var deptData = {};
                    deptData.DEPT_CODE = decodeURI(weiXinParams.deptCode);
                    deptData.DEPT_NAME = decodeURI(weiXinParams.deptName);
                    AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =deptData;
                    var hospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(weiXinParams.hospitalID==hospitalInfo.id){
                        $scope.loadData();
                    }else{
                        MyCareDoctorsService.queryHospitalInfo(weiXinParams.hospitalID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital(weiXinParams.hospitalID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    $scope.loadData();
                                });
                        });
                    }
                }else{
                    $scope.loadData();
                }
            }
        });
       $scope.loadData=function(){

            $scope.viewCatch=false;
            $scope.doctorarr="";
            //获取用户选择的科室
            var deptData  = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA;
           //是否转诊，转诊标识,1表示转诊
           if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_REFERRAL==2){
               $scope.IS_REFERRAL =  AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_REFERRAL;
           }else{
               $scope.IS_REFERRAL = 0;

           }
            $scope.deptData = deptData;
            //获取缓存中医院信息
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);

           $scope.HAS_REAL_DEPT=$scope.deptData.HAS_REAL_DEPT;

            $scope.sceduleIsEmpty = false;
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var  userVsId =   currentPatient?currentPatient.USER_VS_ID:'';
            // 初始化医生选择和日期选择显示内容
            //$scope.selectedDoctorText = KyeeI18nService.get("appointment_doctor.allDoctor","所有排班"),
            //$scope.selectedDateText = KyeeI18nService.get("appointment_doctor.chooseDate","选择日期"),
            //标题科室名称
            $scope.deptName= KyeeI18nService.get("appointment.deptName","{{deptName}}",{deptName:  $scope.deptData.DEPT_NAME});

            //根据来源判断获取数据：appoint-获取预约医生及排班，regist-获取挂号医生排班，其他-获取预约挂号医生排班
            //bussinessType:0 获取预约医生及排班，1：获取挂号医生排班，2：获取预约挂号医生排班
            //获取科室医生
            var params = {
                hospitalId: hospitalInfo.id,
                deptCode: $scope.deptData.DEPT_CODE,
                USER_VS_ID: userVsId,
                bussinessType:2,
                IS_ONLINE:AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE,//查医生列表增加IS_ONLINE 参数
                IS_REFERRAL:$scope.IS_REFERRAL
            };
            //获取医生数据
            AppointmentDoctorService.queryDoctorData(params, function (doctor, resultData) {
                //是否显示预约费用
                $scope.IS_SHOW_AMOUNT=doctor.IS_SHOW_AMOUNT;
                $scope.HID_REMIND = doctor.HID_REMIND;
                $scope.HID_REMIND_CARE = doctor.HID_REMIND_CARE;
                $scope.CARE_MSG = '放号提醒';
                $scope.CARE_COLOR = '';
                if (doctor.HID_REMIND_CARE.CARE == 1) {
                    $scope.CARE_MSG = '取消提醒';
                }

                var refreshGuideClose = localStorage['refreshGuideClose'];
                $scope.REFRESH_GUIDE = '1';
                if (refreshGuideClose) {
                    $scope.REFRESH_GUIDE = '0';
                }

                //暂无数据
                if (resultData.doctorListArr.length <= 0 || resultData.doctorListArr == undefined || resultData.doctorListArr == null) {
                    $scope.empty = true;
                }else{
                    //解决页面缓存导致提示信息一直存在的问题  By  章剑飞  KYEEAPPTEST-2797
                    $scope.empty = false;
                }
                AppointmentDoctorService.DOCTOR_LIST = resultData.doctorListArr;
                //如果有满足条件的医生排班，则只显示满足条件的医生排班
                // var doctorarr = formatDoctorInfo(resultData.doctorListArr,HomeService.selDateStr);
                if(resultData.doctorListArr.length===0)
                {
                    $scope.sceduleIsEmpty = true;
                }
                $scope.doctorarr = resultData.doctorListArr;

                //所有有号源的医生
                $scope.arrisschudleTime = resultData.arrisschudleTime;
                $scope.arrisschudleCopy=angular.copy(resultData.arrisschudleTime);
                //是否展示医生职称过滤
                $scope.IS_SHOW_FILTER_CONDITIONS=resultData.IS_SHOW_FILTER_CONDITIONS;
                //医生职称过滤的条件
                $scope.FILTER_CONDITIONS=resultData.FILTER_CONDITIONS;
                //by  gaomeng  $scope.showMYD为true,医院满意度展示，否则满意度隐藏
                $scope.showMYD  = false;
                if(doctor.ISSHOW_MYD == 1){
                    $scope.showMYD = true;
                }
                //处理排班数据
                doctorDate();
                //选择排班的前三个展示给医生列表
                getTopThreeSchedule($scope.doctorarr);
                //武汉同济三级科室deptName增加
                doctorDeptAdd();
                //首页日期选择判断
                if(HomeService.selDateStr!=""&& HomeService.selDateStr!=undefined && HomeService.selDateStr!=null){
                    var selDateStr=new Date(HomeService.selDateStr);
                    selDateStr=selDateStr.getFullYear()+"-"+(selDateStr.getMonth()+1)+"-"+selDateStr.getDate();
                    selectDate.push(selDateStr);
                    $scope.dealselectdate();
                }
            });
        };
        //edit by cuijin 武汉同济三级科室
        function doctorDeptAdd(){
            $scope.HAS_REAL_DEPT = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.HAS_REAL_DEPT;
            $scope.realDeptList = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.realDeptList;
            if($scope.HAS_REAL_DEPT == 1 && $scope.realDeptList){
                $scope.realDeptListArr = $scope.realDeptList.substring($scope.realDeptList.indexOf('['),$scope.realDeptList.indexOf(']') + 1);
                $scope.realDeptListJson = JSON.parse($scope.realDeptListArr);
                for(var i=0;i<$scope.doctorarr.length;i++){
                    for(var j=0;j<$scope.realDeptListJson.length;j++){
                        if($scope.doctorarr[i].DEPT_CODE == $scope.realDeptListJson[j].realDeptCode){
                            $scope.doctorarr[i].DEPT_NAME = $scope.realDeptListJson[j].realDeptName;
                            $scope.doctorarr[i].HAS_REAL_DEPT = 1;
                            break;
                        }
                    }
                }
            }
        }
        //end by cuijin
        //刷新
        $scope.onRefreshBtn = function() {
            $scope.loadData();
            $scope.$broadcast('scroll.refreshComplete');
        };
        //KYEEAPPC-5358   预约挂号页面改版  wangwan 2016年3月9日19:47:51
        getTopThreeSchedule=function(doctorarr){
            //获取排班的前三个日期供医生列表使用
            for(var i=0;i<doctorarr.length;i++){
                var schedule = doctorarr[i].DOCTOR_SCHEDULE_LIST;
                var scheduleDate="";
                //将每个医生的前三个排班拼到SCHEDULE_DATE，供医生列表使用
                for (var j=0;j<3 && j<schedule.length;j++){
                    var date=new Date(schedule[j].CLINIC_DATE);
                    var nowScheduleDate ="";
                    if(j==0){
                        nowScheduleDate = (date.getMonth()+1)+"月"+date.getDate()+"日"+schedule[j].CLINIC_DURATION;
                    }else{
                        nowScheduleDate ="、"+(date.getMonth()+1)+"月"+date.getDate()+"日"+schedule[j].CLINIC_DURATION;
                    }
                    //医生列表可预约后的日期展示ISTIME为可用的排班日期  wangwan  KYEEAPPC-5613
                    if(schedule[j].ISTIME=='1'){
                        scheduleDate = scheduleDate+nowScheduleDate;
                    }
                }
                if (scheduleDate.indexOf("、") == 0) {
                    scheduleDate = scheduleDate.substring(1, scheduleDate.length);
                }
                $scope.doctorarr[i].SCHEDULE_DATE=scheduleDate;
            }
        };
        //初始化日期筛选医生组件
        $scope.binds = function (params) {
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                selectDate:  $scope.selectDate,
                getDate:$scope.getDate,
                allDate:$scope.allDate,
                isallselect:$scope.isallselect,
                dealselectdate:$scope.dealselectdate,
                isoverToday:$scope.isoverToday,
                allClinic:$scope.allClinic,
                isallselectClinic:$scope.isallselectClinic,
                getClinic:$scope.getClinic,
                resetData:$scope.resetData
            });
        };
        //判断设备是否为ios
        if(window.device != undefined && ionic.Platform.platform() == "ios"){
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.deviceTop= 64;
        }else{
            $scope.deviceTop=44;
        }

        //根据日期筛选医生列表
        //修改原因：增加弹出面板高度自适应； 修改时间：20160224 修改人：王亚宁
        $scope.getDoctorbyDate=function(){
            var showDocoterNum =  $scope.FILTER_CONDITIONS.length;
            var lineNum = 0;
            var doctorContentHeight = 0;
            //显示医生筛选内容
            if(0 != showDocoterNum){
                lineNum = Math.ceil(showDocoterNum/6);
                doctorContentHeight = 45;
            }
            doctorContentHeight += lineNum*40;
            $scope.datePanelStyle = 45+161+doctorContentHeight+50;
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.showOverlay();
                });
            }, 100);
            OperationMonitor.record("countAppointmentDoctorScreen", "appointment_doctor");
        };

        //患者选择的日期
        $scope.selectDate=function(){
            $scope.hideOverlay();
            $scope.dealselectdate();
            $ionicScrollDelegate.$getByHandle("doctor_list").scrollTop();
        };
        //重置患者选择的日期
        $scope.resetData=function(){
            //不限时间
            $scope.allDate();
            //不限职称
            $scope.allClinic();
        };
        //判断日期是否超过当天日期
        $scope.isoverToday=function(date){
            var date=new Date(date.replace(/-/g, '/'));
            var nowdate=new Date();
            if(date.getFullYear()+"-"+date.getMonth()+1+"-"+date.getDate()==nowdate.getFullYear()+"-"+nowdate.getMonth()+1+"-"+nowdate.getDate()){
                return false;
            }else{
                return date<nowdate;
            }
        };
        ////不限时间
        $scope.allDate=function(){
            var select=$scope.isallselect();
            if(select)
            {
                if($scope.overlayData.showweek.indexOf(1)>-1){
                    for(var i=0;i<$scope.overlayData.showweek.length;i++){
                        if($scope.overlayData.showweek[i]==1){
                            $scope.overlayData.showweek[i]=0;
                        }
                    }
                }
            }
        };
        //选中不限时间
        $scope.isallselect=function(){
            if($scope.overlayData!=undefined){
                if($scope.overlayData.showweek.indexOf(1)>-1 ){
                    return true;
                }
                else{
                    for(var i=0;i<selectDate.length;i++){
                        selectDate.pop();
                    }
                    return false
                }
            }
        };
        //全部职称
        $scope.allClinic=function(){
            var select=$scope.isallselectClinic();
            if(select)
            {
                if($scope.overlayData.showweekClinic.indexOf(1)>-1){
                    for(var i=0;i<$scope.overlayData.showweekClinic.length;i++){
                        if($scope.overlayData.showweekClinic[i]==1){
                            $scope.overlayData.showweekClinic[i]=0;
                        }
                    }
                }
            }
        };
        //选中全部职称
        $scope.isallselectClinic=function(){
            if($scope.overlayData!=undefined){
                if($scope.overlayData.showweekClinic.indexOf(1)>-1 ){
                    return true;
                }
                else{
                    for(var i=0;i<clinicData.length;i++){
                        clinicData.pop();
                    }
                    return false
                }
            }
        };
        ////获取用户选中的日期
        $scope.getDate=function(date,index){
            var isSelect=false;
            var selectdate=new Date(date.replace(/-/g, '/'));
            var nowdate=new Date();
            if(selectdate.getFullYear()+"-"+selectdate.getMonth()+1+"-"+selectdate.getDate()==nowdate.getFullYear()+"-"+nowdate.getMonth()+1+"-"+nowdate.getDate()){
                isSelect= false;
            }else{
                isSelect=selectdate<nowdate;
            }
            if(!isSelect){
                if($scope.overlayData.showweek[index]==0){
                    $scope.overlayData.showweek[index]=1;
                    if(selectDate.indexOf(date)<0){  //是否包含date
                        selectDate.push(date);
                    }
                }else{
                    $scope.overlayData.showweek[index]=0;
                    if(selectDate.indexOf(date)>-1){  //是否包含date
                        selectDate=KyeeKit.without(selectDate,date);
                    }
                }
            }else{
                return ;
            }
        };
        ///获取用户选择的职称
        $scope.getClinic=function(clinic,index){
            if($scope.overlayData.showweekClinic[index]==0){
                $scope.overlayData.showweekClinic[index]=1;
                if(clinicData.indexOf(clinic)<0){  //是否包含date
                    clinicData.push(clinic);
                }
            }else{
                $scope.overlayData.showweekClinic[index]=0;
                if(clinicData.indexOf(clinic)>-1){  //是否包含date
                    clinicData=KyeeKit.without(clinicData,clinic);
                }
            }
        };

        //begin 预约挂号医生列表整改 By 高玉楼  KYEEAPPC-3007
        /**
         * 跳转到医生详情页面
         * @param doctor
         */
        $scope.showDoctorInfo=function(doctor, index){
            $scope.DOCTOR_MSG = doctor.DOCTOR_TIP;
            if($scope.DOCTOR_MSG){
                $scope.dialog = KyeeMessageService.dialog({
                    title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                    // okText: KyeeI18nService.get("commonText.iknowMsg", "我知道了"),
                    template: "modules/business/appointment/views/delay_views/doctorInfoPrompt.html",
                    tapBgToClose:true,
                    scope: $scope,
                    // content:tip,
                    buttons: [
                        {
                            text: KyeeI18nService.get("appointment.ok", "知道了"),
                            style: 'button-size-l',
                            click: function () {
                                $scope.dialog.close();
                                AppointmentDoctorDetailService.doctorInfo = doctor;
                                AppointmentDoctorDetailService.selectDate = selectDate;
                                if ($scope.HAS_REAL_DEPT == 1) {
                                    AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = doctor.DEPT_NAME;
                                } else {
                                    AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = $scope.deptData.DEPT_NAME;
                                }
                                AppointmentDoctorDetailService.doctorCare = {
                                    index: index,
                                    careFlag: 0
                                };
                                $state.go('doctor_info');
                            }
                        }
                    ]
                    })
            }else
                {
                    AppointmentDoctorDetailService.doctorInfo = doctor;
                    AppointmentDoctorDetailService.selectDate = selectDate;
                    if ($scope.HAS_REAL_DEPT == 1) {
                        AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = doctor.DEPT_NAME;
                    } else {
                        AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = $scope.deptData.DEPT_NAME;
                    }
                    AppointmentDoctorDetailService.doctorCare = {
                        index: index,
                        careFlag: 0
                    };
                    $state.go('doctor_info');
                }
        };

        $scope.closeRefreshGuide=function() {
            localStorage['refreshGuideClose']  = '1';
            $scope.loadData();
        }

        $scope.hidRemind=function(remindCare) {
            //获取缓存中医院信息
            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_FILTER",
                token: "appointment_doctor",
                onFinash: function () {
                    $state.go('appointment_doctor');
                    var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    var userID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_ID;
                    var params = {
                        hospitalId: hospitalInfo.id,
                        deptCode: $scope.deptData.DEPT_CODE,
                        deptName: $scope.deptData.DEPT_NAME,
                        userID: userID
                    };
                    if (remindCare.CARE == 0) {
                        params.hidCare = 1;
                    } else {
                        params.hidCare = 0;
                    }
                    AppointmentDeptGroupService.hidRemindCare(params, function(data){
                        $scope.HID_REMIND_CARE.CARE = data.CARE;
                    });
                }
            });
            OperationMonitor.record("countAppointmentDoctorHidRemind", "appointment_doctor");

        }

        /**
         * 选择医院
         */
        $scope.selectHospital = function(){
            HospitalSelectorService.returnView = '';
            $state.go('hospital_selector');
        };
        //按职称过滤排班
        dealschedulebyClinic=function(doctorSchedulelist,doctorListArr,doctorList){
            var doctorScheduleShow=[];
            for(var j=0;j<doctorSchedulelist.length;j++) {
                var clinicType = doctorSchedulelist[j].CLINIC_TYPE;
                for (var k = 0; k < clinicData.length; k++) {
                    if (clinicType == clinicData[k]) {
                        doctorScheduleShow.push(doctorSchedulelist[j]);
                        break;
                    }
                }
            }
            if(doctorScheduleShow.length){
                doctorListArr.DOCTOR_SCHEDULE_LIST_SHOW=doctorScheduleShow;
                doctorList.push(doctorListArr);
            }
            //   return;
        };
        //按时间过滤排班
        dealschedulebyTime=function(doctorSchedulelist,doctorListArr,doctorArr,doctorFullList){
            //记录医生排班和所选的筛选日期匹配情况
            var arrisschudleFlag="";
            //记录展示的选的筛选日期
            var selectDateSet="";
            var showDateCount=0;
            for(var j=0;j<doctorSchedulelist.length;j++){
                var doctorSchedule=doctorSchedulelist[j];
                var doctordate=new Date(doctorSchedule.CLINIC_DATE);
                doctordate=doctordate.getFullYear()+"-"+(doctordate.getMonth()+1)+"-"+doctordate.getDate();
                for(var s=0;s<selectDate.length;s++){
                    if(doctordate==selectDate[s]){
                        if(doctorSchedule.ISTIME==0){
                            //0代表对应的日期无号，1代表有号
                            arrisschudleFlag=arrisschudleFlag+'0';
                        }else{
                            if(doctorSchedule.BUSSINESS_TYPE==0&&doctorSchedule.APPOINT_COUNT<=0){
                                arrisschudleFlag=arrisschudleFlag+'0';
                            }else if(doctorSchedule.BUSSINESS_TYPE==1&&doctorSchedule.REG_COUNT<=0){
                                arrisschudleFlag=arrisschudleFlag+'0';
                            }else{
                                arrisschudleFlag=arrisschudleFlag+'1';
                                var date=new Date(selectDate[s].replace(/-/g,'/'));
                                if(showDateCount<3){
                                    if(showDateCount==0){
                                        selectDateSet = (date.getMonth()+1)+"月"+date.getDate()+"日"+doctorSchedulelist[j].CLINIC_DURATION;
                                        showDateCount++;
                                    }else{
                                        selectDateSet =selectDateSet+"、"+(date.getMonth()+1)+"月"+date.getDate()+"日"+doctorSchedulelist[j].CLINIC_DURATION;
                                        showDateCount++;
                                    }
                                }
                            }
                        }

                    }
                }
            }
            if(arrisschudleFlag.length>0){
                if(arrisschudleFlag.indexOf('1')<0){
                    //如果不包含1则证明所选日期能都是无号
                    $scope.arrisschudleTime[doctorSchedulelist[0].DOCTOR_CODE]='无号';
                    doctorFullList.push(doctorListArr);
                }else{
                    //否则包含1则证明所选日期肯定有有号的日期
                    doctorArr.push(doctorListArr);
                }
                //去掉莫名的逗号
                if (selectDateSet.indexOf("、") == 0) {
                    selectDateSet = selectDateSet.substring(1, selectDateSet.length);
                }
                doctorListArr.SCHEDULE_DATE=selectDateSet;
            }
        };
        /*
         * 处理筛选后的医生
         */
        $scope.dealselectdate=function(){
            //gch 每次点击确定把初始值排班信息copy
            $scope.arrisschudleTime=angular.copy($scope.arrisschudleCopy);
            var doctorListArr= AppointmentDoctorService.DOCTOR_LIST;
            if(selectDate.length|| clinicData.length){
                var doctorArr=[];
                var doctorList=[];
                //用来记录排班已满的医生信息
                var doctorFullList=[];
                //按时间筛选医生
                if(selectDate.length){
                    for(var i=0;i<doctorListArr.length;i++){
                        var doctorSchedule=doctorListArr[i];
                        dealschedulebyTime(doctorSchedule.DOCTOR_SCHEDULE_LIST,doctorListArr[i],doctorArr,doctorFullList);

                    }
                    $scope.doctorarr=doctorArr.concat(doctorFullList);
                }
                //按职称筛选医生
                if(clinicData.length){
                    if(selectDate.length){
                        for(var i=0;i<doctorArr.length;i++){
                            var doctorSchedule=doctorArr[i];
                            dealschedulebyClinic(doctorSchedule.DOCTOR_SCHEDULE_LIST,doctorArr[i],doctorList);
                        }
                    }else{
                        for(var i=0;i<doctorListArr.length;i++) {
                            var doctorSchedule = doctorListArr[i];
                            dealschedulebyClinic(doctorSchedule.DOCTOR_SCHEDULE_LIST, doctorListArr[i], doctorList);
                        }
                    }
                    $scope.doctorarr=doctorList;
                }
            }else{
                //gch 如果未选时间点击确定，选择排班的前三个展示给医生列表
                getTopThreeSchedule($scope.doctorarr);
                $scope.doctorarr=doctorListArr;
            }

            //判断筛选后是否有医生
            if($scope.doctorarr.length==0){
                $scope.sceduleIsEmpty = true;
            }else{
                $scope.sceduleIsEmpty = false;
            }

        };
        /**
         * 移除字符串中的空格
         * 解决医生名中有空格的问题
         * @param value
         * @returns {*}
         */
        $scope.removeSpace = function (value) {
            if(value){
                return value.replace(/\s+/g,"");
            } else {
                return "";
            }
        };


        /**
         * 注册页面回退事件
         */
        KyeeListenerRegister.regist({
            focus : "appointment_doctor",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){
                if(!AppointmentDoctorDetailService.doctorCare){
                    return;
                }else{
                    //如果careFlag是1表示此医生被关注，给此医生记录数加1
                    if(AppointmentDoctorDetailService.doctorCare.careFlag=='1'){
                        $scope.doctorarr[AppointmentDoctorDetailService.doctorCare.index].CARE_COUNT++;
                    }
                    //如果careFlag是-1表示此医生被关注，给此医生记录数减1
                    if(AppointmentDoctorDetailService.doctorCare.careFlag=='-1'){
                        $scope.doctorarr[AppointmentDoctorDetailService.doctorCare.index].CARE_COUNT--;
                    }
                }
                //处理完后给清空数据，防止影响其他页面
                AppointmentDoctorDetailService.doctorCare=null;
            }
        });
        //KYEEAPPC-5358   预约挂号页面改版  wangwan 2016年3月9日19:47:51
        //获取当前星星的样式：空星、半星、满星
        $scope.getXingClass = function(score, idx){
            var cls = "";
            var x = score - idx;
            if(x >= 0){
                //满星
                cls = "icon-favorite2";//吴伟刚 KYEEAPPC-4773 满意度页面细节优化
            }else if(x >= -0.5){
                //半星
                cls = "icon-favorite1";
            }/*else if(x < -0.5){
             //空星
             cls = "icon-favorite empty_star";
             }*/
            return cls;
        };
    }).build();

