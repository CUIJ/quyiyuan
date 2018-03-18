/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年8月12日14:03:45
 * 创建原因：预约挂号医生详情控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.doctor_info.controller")
    .require([
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appointment.doctorSuggest.service",
        "kyee.quyiyuan.appointment.register.controller",
        "kyee.quyiyuan.regist.registConfirm.controller",
        "kyee.quyiyuan.appoint.appointConfirm.controller",
        "kyee.quyiyuan.appointment.notice.controller",
        "kyee.quyiyuan.appointment.rush.clinic.detail.controller",
        "kyee.quyiyuan.appointment.add.clinic.management.service",
        "kyee.quyiyuan.appointment.add.clinic.management.controller.new",
        "kyee.quyiyuan.appointment.video_interrogation.controller",
        "kyee.quyiyuan.appointment.video_interrogation.service",
        "kyee.quyiyuan.appointment.purchase_medincine.controller",
        "kyee.quyiyuan.appointment.purchase_medince.service",
        "kyee.quyiyuan.appointment.doctor_consultation.service",
        "kyee.quyiyuan.consultation.add_information.controller",
        "kyee.quyiyuan.consultation.add_information.service",
        "kyee.quyiyuan.consultation.wait_chatting.service",
        "kyee.quyiyuan.consultation.order.controller",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.multiplequery.multiplequerycity.service",
        "kyee.quyiyuan.consultation.show_pictures.service",
        "kyee.quyiyuan.appointment.doctor_action.controller",
        "kyee.quyiyuan.appointment.doctor_action.service",
        "kyee.quyiyuan.consultation.view_full_text.service",
        "kyee.quyiyuan.consultation.view_full_text.controller"
    ])
    .type("controller")
    .name("AppointmentDoctorInfoController")
    .params(["$scope", "$location", "$state", "$ionicHistory", "$ionicModal",
        "CacheServiceBus", "AppointmentDoctorDetailService", "KyeeListenerRegister",
        "FilterChainInvoker", "KyeeMessageService","KyeeUtilsService","HomeService",
        "AppointmentDoctorSuggestService","AppointConfirmService","RegistConfirmService",
        "AppointmentDeptGroupService","AppointmentDoctorService","$ionicScrollDelegate","KyeeI18nService","$timeout",
        "$ionicViewSwitcher","OperationMonitor","AddClinicManagementService","AccountAuthenticationService",
        "AuthenticationService","KyeeViewService","VideoInterrogationService","DoctorConsultationService","AddInformationService","WaitChattingService",
        "PurchaseMedinceService","MyCareDoctorsService","HospitalSelectorService","LoginService","$ionicSlideBoxDelegate","IMUtilService",
        "StatusBarPushService","MultipleQueryCityService","ShowPicturesService","AppointmentDoctorActionService","ViewFullTextService"])
    .action(function ($scope, $location, $state, $ionicHistory, $ionicModal,
                      CacheServiceBus, AppointmentDoctorDetailService, KyeeListenerRegister,
                      FilterChainInvoker, KyeeMessageService,KyeeUtilsService,HomeService,
                      AppointmentDoctorSuggestService,AppointConfirmService,RegistConfirmService,
                      AppointmentDeptGroupService,AppointmentDoctorService,$ionicScrollDelegate,KyeeI18nService,$timeout,
                      $ionicViewSwitcher,OperationMonitor,AddClinicManagementService,AccountAuthenticationService,
                      AuthenticationService,KyeeViewService,VideoInterrogationService,DoctorConsultationService,AddInformationService,WaitChattingService,
                      PurchaseMedinceService,MyCareDoctorsService,HospitalSelectorService,LoginService,$ionicSlideBoxDelegate,IMUtilService,
                      StatusBarPushService,MultipleQueryCityService,ShowPicturesService,AppointmentDoctorActionService,ViewFullTextService) {
        //业务类型 0：预约；1：挂号
        var businessType = '0';
        //缓存数据
        var storageCache = CacheServiceBus.getStorageCache();
        var memoryCache = CacheServiceBus.getMemoryCache();
        var loginFalg = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
        var showPicker,selDoctor= AppointmentDoctorDetailService.doctorInfo;
        var hospitalInfo=storageCache.get("hospitalInfo");
        var wordsPreLine = Math.floor((window.innerWidth -10*2)/14);
        //页数
        var page = 0;
        //每页行数
        var pageSize = 6;
        //下拉标识符
        var loadMoreFlag = false;
        var selDateStr;
        $scope.schedulepage=0;//初始化医生排班页数
        $scope.emptySchedule=false;//初始化不显示“暂无数据”
        var backView = $ionicHistory.backView();
        //就诊经验初始化数据
        $scope.totalInfo = {
            SUGGEST_AVERAGE_SCORE: 0,
            SUGGEST_COUNT: 0
        };
        $scope.toggleShowAll = function(action) {
            if(action.lines > 6){
                ViewFullTextService.content = action.content;
                $state.go("view_full_text");
                return;
            }
            action.isShowAll = !action.isShowAll;
        };
        //by jiangpin
        var imState = 0;//图文咨询功能状态
        var phoneState = 0;//电话咨询功能状态
        var videoState = 0;//视频咨询功能状态
        var imFree = 0;//图文咨询是否免费
        var phoneFree = 0;//电话咨询是否免费
        var videoFree = 0;//视频咨询是否免费
        var isSecondVisitPatient = false;//是否是复诊患者
        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        /**
         * 描述：获取咨询小贴士
         * 作者：侯蕊
         * 时间：2017年08月10日15:28:25
         * */
        function initConsultTip(){
            //获取咨询小贴士信息
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            AppointmentDoctorService.queryConsultTips(hospitalId,function (data) {
                $scope.isShowConsultTip = false;
                if(data!= null && data.consultTip != null){
                    $scope.isShowConsultTip = true;
                    $scope.consultTips = data.consultTip;
                    $scope.consultTipsList  = $scope.consultTips.split("。");
                    $ionicSlideBoxDelegate.update();
                }
            });
        }

        $scope.doctorActionList = [];
        $scope.goDoctorAction = function(){

            $state.go("doctor_action");
        };
        $scope.preview = function(imgList,index){
            ShowPicturesService.ACTIVESLIDE = index; //定义页面初始展示第几张图
            ShowPicturesService.IMGLIST = imgList;
            KyeeViewService.openModalFromUrl({
                url: "modules/business/consultation/views/template/show_picture.html",
                scope: $scope,
                animation: "slide-in-right"
            });
        };
        //评论初始化
        $scope.msgs = [];
        //页面初始化时，医生关注状态
        var caretype = false;
        $scope.activeTab = 0;//初始化页签

        //add by chenyanting  新增方便门诊 start
        $scope.videoNetworkSchedule = [];//视频问诊网络排班
        $scope.videoSourceDetail; //视频问诊号源
        $scope.videoStatusData = {//视频问诊是否可操作状态列表
            flag: true // 默认不显示空格
        };
        $scope.videoTips = [
            {
                tipName:'医生面对面问诊'
            },
            {
                tipName:'支持药品配送'
            },
            {
                tipName:'未接诊不收取任何费用'
            }
        ];
        $scope.purchaseNetworkSchedule = [];//购药开单网络排班
        $scope.purchaseSourceDetail;//购药开单号源
        $scope.purchaseStatusData = {//购药开单诊是否可操作状态列表
            flag: true // 默认不显示空格
        };
        $scope.purchaseTips = [
            {
                tipName:'一键购药开单'
            },
            {
                tipName:'未回复不收取任何费用'
            }
        ];
        $scope.patientCount = 0;   //总服务人数
        $scope.toDetailFlag;//是否存在未完成的网络预约挂号记录
        $scope.regId; //已存在的未完成网络预约挂号记录ID
        $scope.videoOpenFlag = hospitalInfo.is_video_inteergation_enable;//视频问诊开通状态
        $scope.purchaseOpenFlag = hospitalInfo.is_remote_purchase_enable;//购药开单开通状态
        //add by chenyanting  新增方便门诊 end

        /**
         * 描述：扫码随访页面进入时弹出提示信息
         */
        var showTip = function(){
            $scope.dialog = KyeeMessageService.dialog({
                tapBgToClose : true,
                template: "modules/business/patients_group/views/attending_doctor_tips.html",
                scope: $scope,
                title: KyeeI18nService.get("attending_doctor.title","温馨提醒"),
                buttons: [{
                    style:'button-size-l',
                    text: KyeeI18nService.get("apply_cash.back","确认"),
                    click: function () {
                        $scope.dialog.close();
                    }
                }]
            });
        };


        /**
         * 点击弹出咨询小贴士
         * 作者：侯蕊
         * 时间：2017年08月09日14:03:53
         */
        $scope.showConsultTip = function(){
            $scope.dialog = KyeeMessageService.dialog({
                tapBgToClose : true,
                template: "modules/business/appointment/views/appointment_doctor_detail/consult_tips.html",
                scope: $scope,
                title: KyeeI18nService.get("consult_tips.title","咨询医生小贴士"),
                buttons: [{
                    style:'button-size-l',
                    text: KyeeI18nService.get("apply_cash.back","确认"),
                    click: function () {
                        $scope.dialog.close();
                    }
                }]
            });
        };

        //付费咨询初始化数据
        var notOpen = KyeeI18nService.get("appointment_doctor.notOpen","暂未开通");
        $scope.consultation = {
            loadConsultationFlag: false,    //是否加载完成付费咨询数据标识
            loadConsultFlag: false,         //是否加载完成诊前诊后数据标识
            imRealPrice: notOpen,
            phoneRealPrice: notOpen,
            videoRealPrice: notOpen,
            isShowImOriPrice: false,        //是否展示图文咨询原价占据的内容
            isShowPhoneOriPrice: false,     //是否展示电话咨询原价占据的内容
            isShowVideoOriPrice: false      //是否展示视频咨询原价占据的内容
        };


        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "doctor_info",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToDoctorList();
            }
        });

        //针对非APP端，监听不到物理返回建后退的处理
        KyeeListenerRegister.regist({
            focus: "doctor_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction : "both",
            action: function (params) {
                $scope.showTerm=false;
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "doctor_info"){
                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, null);
                    //解决微信到医生列表页，没有拦截登录。用户到确认预约页面手动登录，
                    // 导致又跳回到医生列表页 (如果页面拦截登录，则不需要此行代码)  wangwan
                    LoginService.isWeiXinReqFlag =0;
                }
            }
        });

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "doctor_info",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "both",
            action: function (params) {
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward == "doctor_info"){
                    var weiXinData = {};
                    weiXinData.HOSPITAL_ID = decodeURI(weiXinParams.hospitalID);
                    weiXinData.DEPT_CODE = decodeURI(weiXinParams.deptCode);
                    weiXinData.DEPT_NAME = decodeURI(weiXinParams.deptName);
                    weiXinData.DOCTOR_CODE = decodeURI(weiXinParams.doctorCode);
                    weiXinData.DOCTOR_NAME = decodeURI(weiXinParams.doctorName);
                    AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =weiXinData;
                    AppointmentDoctorDetailService.doctorInfo = weiXinData;
                    var hospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(weiXinParams.hospitalID==hospitalInfo.id){
                        $scope.initDoctorInfo();
                    }else{
                        MyCareDoctorsService.queryHospitalInfo(weiXinParams.hospitalID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital(weiXinParams.hospitalID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    $scope.initDoctorInfo();
                                });
                        });
                    }
                }else{
                    $scope.initDoctorInfo();
                }
            }
        });
        $scope.initDoctorInfo = function(){
            selDoctor= AppointmentDoctorDetailService.doctorInfo;
            //得到医生动态信息
            AppointmentDoctorActionService.getDoctorAction({
                hospitalId:AppointmentDoctorDetailService.doctorInfo.HOSPITAL_ID,
                deptCode:AppointmentDoctorDetailService.doctorInfo.DEPT_CODE,
                doctorCode:AppointmentDoctorDetailService.doctorInfo.DOCTOR_CODE,
                showLoading:false,
                currentPage:0,
                pageSize:10
            },function(data){
                if(data && data.DoctorDynamicsList && data.DoctorDynamicsList.length>0){
                    var list = angular.copy(data.DoctorDynamicsList);
                    angular.forEach(list,function(item,index,array){
                        item.content = item.content.replace(/(\\r|\\n)/g,'');
                        item.isShowAll = false;
                        item.lines = Math.ceil(item.content.length/wordsPreLine);
                        item.pictureArray = [];
                        if(item.pictures == ''){
                            return
                        }
                        var array = item.pictures.split(",");
                        angular.forEach(array,function(pic){
                            item.pictureArray.push({
                                imgUrl:pic
                            });
                        });
                    });
                    if(list.length > 2){
                        $scope.showMoreAction = true;
                    }
                    $scope.doctorActionList = list.splice(0,2);
                }

            });
                if (AppointmentDoctorDetailService.activeTab === 1){
                    AppointmentDoctorDetailService.activeTab = 0;
                    $scope.activeTab = 1;
                }else if(AppointmentDoctorDetailService.activeTab === 2){
                    AppointmentDoctorDetailService.activeTab = 0;
                    $scope.activeTab = 2;
                } else {
                    $scope.activeTab = 0;//初始化页签
                }
                $scope.showRush = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).showRush;
                if(!$scope.showRush){
                    $scope.showRush = '0';
                }
                //上个页面传过来的数据
                $scope.showTerm = false;//默认不展示预约条款解决，退出页面还展示条款的问题
                $scope.pageData = AppointmentDoctorDetailService.doctorInfo;
                if(backView.stateId == 'consult_doctor_list' || backView.stateId == 'attending_doctor') {
                    if ($scope.pageData.DOCTOR_SEX == 1) {
                        $scope.pageData.DOCTOR_SEX = 0;
                    } else {
                        $scope.pageData.DOCTOR_SEX = 1;
                    }
                }
                //获取咨询小贴士信息
                AppointmentDoctorService.queryConsultTips($scope.pageData.HOSPITAL_ID,function (data) {
                    $scope.isShowConsultTip = false;
                    if(data!= null && data.consultTip != null){
                        $scope.isShowConsultTip = true;
                        $scope.consultTips = data.consultTip;
                        $scope.consultTipsList  = $scope.consultTips.split("。");
                        $ionicSlideBoxDelegate.update();
                    }
                });
                //判断从微信过去是否可以获取到医生名字(lizhihu)
                if($scope.pageData.DOCTOR_NAME == 'undefined' || $scope.pageData.DOCTOR_NAME == undefined){
                    $scope.pageData.DOCTOR_NAME = ''
                }
                AppointmentDoctorDetailService.doctorInfo.HOSPITAL_NAME = storageCache.get('hospitalInfo').name;
                AppointmentDoctorDetailService.doctorInfo.HOSPITAL_ID = storageCache.get('hospitalInfo').id;
                //医院参数，咨询医生是否展示
                $scope.CONSULT_DOCTOR = parseInt(storageCache.get('hospitalInfo').CONSULT_DOCTOR);
                //医院参数，网络门诊是否展示
                $scope.NETWORK_CLINIC = storageCache.get('hospitalInfo').NETWORK_CLINIC;

                if ($scope.NETWORK_CLINIC != '1' && $scope.activeTab == 2) {  //页签显示 处理异常
                    $scope.activeTab = 0;
                }
                if ($scope.CONSULT_DOCTOR != '1' && $scope.activeTab == 1){   //页签显示 处理异常
                    $scope.activeTab = 0;
                }

                showIsNotNotification();//判断是命名‘预约条款’还是‘挂号条款’
                $scope.scheduleDateArray = [];
                $scope.morningScheduleArray = [];
                $scope.afternoonScheduleArray = [];
                //医生简介默认显示
                $scope.doctorDescShow = true;
                //医生动态默认显示
                $scope.doctorActionDes = true;
                //默认显示医生排班
                $scope.doctorScheduleShow = true;
                //医生评价默认显示
                $scope.doctorAssessShow = true;
                ////根据上个页面决定显示内容
                AppointmentDoctorDetailService.doctorInfo.showTitle = KyeeI18nService.get("doctor_info.chooseAppointDate","选择预约时间");
                //无数据
                $scope.showEmpty = false;
                $scope.emptyText = KyeeI18nService.get("doctor_info.noEvaluation","暂无评价");
                $scope.loadMore();
                if(AppointmentDoctorDetailService.doctorInfo) {
                    $scope.deptName = AppointmentDoctorDetailService.doctorInfo.DEPT_NAME;
                } else {
                    $scope.deptName = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.DEPT_NAME;
                }
                //转诊标识
                $scope.IS_REFERRAL = 0;
                if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_REFERRAL==2){
                    $scope.IS_REFERRAL = 2;
                }else{
                    $scope.IS_REFERRAL = 0;
                }
                //上个页面传的预约挂号排班
                if (!$scope.pageData.DOCTOR_SCHEDULE_LIST) {
                    var param = {
                        hospitalId:AppointmentDoctorDetailService.doctorInfo.HOSPITAL_ID,
                        deptCode:$scope.pageData.DEPT_CODE,
                        bussinessType:2,
                        USER_VS_ID:$scope.pageData.USER_VS_ID,
                        DOCTOR_CODE:$scope.pageData.DOCTOR_CODE,
                        IS_ONLINE:AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE,//查医生列表增加IS_ONLINE 参数
                        IS_REFERRAL:$scope.IS_REFERRAL
                    };
                    AppointmentDoctorService.queryDoctorData(param,function (data,resultData) {
                        if(resultData.doctorListArr&&resultData.doctorListArr.length) {
                            $scope.pageData = resultData.doctorListArr[0];
                            //上个页面传过来的路由，医生主页返回做特殊处理
                            $scope.pageData.ROOT_NAME = AppointmentDoctorDetailService.doctorInfo.ROOT_NAME;
                            AppointmentDoctorDetailService.doctorInfo =$scope.pageData;
                            AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = $scope.deptName;
                            $scope.pageData.showTitle =  KyeeI18nService.get("doctor_info.chooseAppointDate","选择预约时间");
                            selDoctor = $scope.pageData;
                            showIsNotNotification();
                            if($scope.pageData.DOCTOR_SCHEDULE_LIST.length){
                                //将排班按时间从大到小排序
                                var doctorScheduleArr;
                                if($scope.pageData.DOCTOR_SCHEDULE_LIST_SHOW){
                                    doctorScheduleArr=$scope.pageData.DOCTOR_SCHEDULE_LIST_SHOW.sort(compare("CLINIC_DATE"));
                                }else{
                                    doctorScheduleArr=$scope.pageData.DOCTOR_SCHEDULE_LIST.sort(compare("CLINIC_DATE"));
                                }
                                var maxindex=doctorScheduleArr.length-1;
                                //获取最大排班时间
                                var maxClinicDate=doctorScheduleArr[maxindex].CLINIC_DATE;
                                //计算排班星期及日期
                                detailWeekDate(maxClinicDate);
                                //计算医生排班
                                detailSchedule(doctorScheduleArr);
                                //如果用户选择了日期筛选，则定位到用户选择的最小时间
                                if( AppointmentDoctorDetailService.selectDate !=undefined &&  AppointmentDoctorDetailService.selectDate.length>0){
                                    toSelectData(doctorScheduleArr);
                                }
                            }else{
                                //无排班数据
                                $scope.emptySchedule=true;
                            }
                        }else{
                            //无排班数据
                            $scope.emptySchedule=true;
                        }
                    });
                } else {
                    if($scope.pageData.DOCTOR_SCHEDULE_LIST.length){
                        //将排班按时间从大到小排序
                        var doctorScheduleArr,
                            scheduleListShow = $scope.pageData.DOCTOR_SCHEDULE_LIST_SHOW;
                        if(scheduleListShow){
                            doctorScheduleArr = scheduleListShow.sort(compare("CLINIC_DATE"));
                        }else{
                            doctorScheduleArr = $scope.pageData.DOCTOR_SCHEDULE_LIST.sort(compare("CLINIC_DATE"));
                        }
                        var maxindex = doctorScheduleArr.length-1,
                            maxClinicDate=doctorScheduleArr[maxindex].CLINIC_DATE;//获取最大排班时间
                        detailWeekDate(maxClinicDate);//计算排班星期及日期
                        detailSchedule(doctorScheduleArr);//计算医生排班
                        var selectDate = AppointmentDoctorDetailService.selectDate;
                        if(selectDate && selectDate.length>0){ //如果用户选择了日期筛选，则定位到用户选择的最小时间
                            toSelectData(doctorScheduleArr);
                        }
                    }else{
                        //无排班数据
                        $scope.emptySchedule = true;
                    }
                }
                var page = 0;

                //加载医生关注信息
                AppointmentDoctorDetailService.loadDoctorCareInfo(function (data) {
                    if (data.careFlag == undefined || data.careFlag === '0') {
                        $scope.CARE = false;
                        caretype = false;
                        //微信公众号 扫码关注医生 点击进来
                        if(backView && (backView.stateId === 'qrcode_skip_controller' || backView.stateId === 'record_patient_number') && AppointmentDoctorDetailService.doctorQRcodeData) {
                            var param = AppointmentDoctorDetailService.doctorQRcodeData,
                                patientInfo = memoryCache.get('currentCustomPatient'),
                                currentCardInfo = memoryCache.get('currentCardInfo');
                            if (patientInfo && patientInfo.USER_VS_ID){
                                //将医生设置为我关注的医生
                                param.userVsId = patientInfo.USER_VS_ID;
                                param.careFlag = 1;
                                param.careSource = 1;
                                if (currentCardInfo && currentCardInfo.patientId) {
                                    param.patientId = currentCardInfo.patientId;
                                }
                                AppointmentDoctorDetailService.careDoctor2(param);
                                $scope.CARE = true;
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("appointment_regist_deti.isCancelAppoint", "您已成功关注该医生"),
                                    duration: 3000
                                });
                            }
                            AppointmentDoctorDetailService.doctorQRcodeData = null;
                        }
                        if(backView.stateId == 'attending_doctor'){
                            showTip();
                        }
                    } else {
                        $scope.CARE = true;
                        caretype = true;
                    }

                    //by  gaomeng  $scope.showMYD为true,医院满意度展示，否则满意度隐藏
                    $scope.showMYD = false;
                    if (data.ISSHOW_MYD == 1) {
                        $scope.showMYD = true;
                    }
                }, $scope.pageData);

                //付费咨询---start
                if($scope.CONSULT_DOCTOR === 1){ //咨询医生显示开关打开
                    var doctorInfo = $scope.pageData,
                        conParam = {
                            hospitalId: doctorInfo.HOSPITAL_ID,
                            deptCode: doctorInfo.DEPT_CODE,
                            doctorCode: doctorInfo.DOCTOR_CODE
                        };
                    loadConsultationData(conParam);
                }
                //付费咨询---start
                //   --获取总就诊人数 start--
                var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var networkDoctorInfo=angular.copy(AppointmentDoctorDetailService.doctorInfo);
                var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if(currentUser){
                    networkDoctorInfo.USER_ID=currentUser.USER_ID;
                }else{
                    networkDoctorInfo.USER_ID="";
                }
                if(currentPatient){
                    networkDoctorInfo.USER_VS_ID=currentPatient.USER_VS_ID;
                }else{
                    networkDoctorInfo.USER_VS_ID="";
                }
                //网络门诊、显示开关打开一个
                if($scope.CONSULT_DOCTOR === 1 || $scope.NETWORK_CLINIC=='1'){
                    if($scope.NETWORK_CLINIC=='1'){
                        networkDoctorInfo.IS_ONLINE='1';
                    }
                    //查询是否是复诊患者
                    initSubsequentVisit();
                    AppointmentDoctorDetailService.judgeRegist(networkDoctorInfo, function(judgeRegistResult){
                        /*start 总服务人数*/
                        if(judgeRegistResult.ALREADY_VISIT_COUNT == undefined){
                            $scope.patientCount = 0;
                        }else{
                            $scope.patientCount = judgeRegistResult.ALREADY_VISIT_COUNT; //总就诊人数
                        }
                        /*end 总服务人数*/

                        /*处理 查用户挂网络号的详情 start*/
                        var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                        var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                        if(currentUser&&currentPatient){
                            $scope.onlineBusinessType = judgeRegistResult.ONLINE_BUSINESS_TYPE;
                            $scope.toDetailFlag = judgeRegistResult.FLAG;
                            $scope.regId = judgeRegistResult.REG_ID;
                        }
                        /*处理 查用户挂网络号的详情 end*/
                        //add by wangsannv  获取网络医院医生的排班信息
                        if($scope.NETWORK_CLINIC=='1'){  //是网络医院
                            PurchaseMedinceService.netHosRegistFeeType = judgeRegistResult.NET_HOS_REGIST_FEE_TYPE;
                            VideoInterrogationService.netHosRegistFeeType = judgeRegistResult.NET_HOS_REGIST_FEE_TYPE;
                            var param={
                                hospitalId:AppointmentDoctorDetailService.doctorInfo.HOSPITAL_ID,
                                deptCode:$scope.pageData.DEPT_CODE,
                                businessType:'2',  //查预约和挂号排班
                                DOCTOR_CODE:$scope.pageData.DOCTOR_CODE,
                                IS_ONLINE:'1'   //只查网络门诊
                            };

                            VideoInterrogationService.queryDoctorData(param,function(result){
                                $scope.videoNetworkSchedule = result['diagnosisList'];
                                $scope.initStatusMessageInfo("VIDEO",$scope.videoOpenFlag,result['diagnosisList']);
                                $scope.purchaseNetworkSchedule = result['prescriptionList'];
                                $scope.initStatusMessageInfo("PURCHASE",$scope.purchaseOpenFlag,result['prescriptionList']);
                            });
                        }
                    });

                }
            };


        /**
         * 作者： 陈艳婷
         * 描述：根据查询结果组合页面显示数据
         * @param model  VIDEO为视频问诊，PURCHASE为购药开单
         * @param isOpenFlag    功能是否开通
         * @param list  网络排班
         */
        $scope.initStatusMessageInfo = function(model,isOpenFlag,list){
            var statusMessageData = {
                statusCode: "",
                statusName: "",
                message: "",
                flag: false
            };
            if(isOpenFlag == 1){
                var status;
                if(list && list.length > 0){
                    //医生的状态   0 表示 正在问诊中 ，1 表示 已约满， 2 网络停诊
                    status = list[0].NETWORK_STATUS;
                }
                if($scope.toDetailFlag!=1 && status==1){
                    //已约满
                    statusMessageData['statusCode'] = "1";
                    statusMessageData['statusName'] = "当天"+(model=='VIDEO'?"问诊":"服务")+"人数已满";
                    statusMessageData['message'] = "医生的接诊名额已满";
                    statusMessageData['flag'] = false;
                }else if($scope.toDetailFlag!=1 && status==2){
                    //网络停诊
                    statusMessageData['statusCode'] = "2";
                    statusMessageData['statusName'] = "网络停诊";
                    statusMessageData['message'] = "医生的接诊名额已满";
                    statusMessageData['flag'] = false;
                }else if($scope.toDetailFlag!=1 && status==0){
                    //问诊中
                    statusMessageData['statusCode'] = "0";
                    statusMessageData['statusName'] = "正在问诊中";
                    statusMessageData['flag'] = true;
                }else if($scope.toDetailFlag!=1 && !status){
                    //无网络排班
                    statusMessageData['statusCode'] = "4";
                    statusMessageData['statusName'] = "暂无网络排班";
                    statusMessageData['message'] = "当前医生暂无排班";
                    statusMessageData['flag'] = false;
                }
            }else{
                statusMessageData['statusCode'] = "3";
                statusMessageData['statusName'] = "未开通";
                statusMessageData['message'] = "该功能暂未开通";
                statusMessageData['flag'] = false;
            }

            if(model=='VIDEO'){
                //视频问诊状态初始化
                $scope.videoStatusData = statusMessageData;
            }else if(model=='PURCHASE'){
                //购药开单状态初始化
                $scope.purchaseStatusData = statusMessageData;
            }
        };
        /**
         * 如果用户选择了日期筛选医生，则定位到用户选择的最小日期的排班
         */
        function toSelectData(doctorScheduleArr){
            var selectDate=AppointmentDoctorDetailService.selectDate.sort();
            var schedule=doctorScheduleArr;
            var scheduleClinicDate=null;
            for(var i=0;i<schedule.length;i++){
                var doctordate=new Date(schedule[i].CLINIC_DATE);
                doctordate=doctordate.getFullYear()+"-"+(doctordate.getMonth()+1)+"-"+doctordate.getDate();
                if(selectDate.indexOf(doctordate)>-1){
                    scheduleClinicDate=schedule[i].CLINIC_DATE;
                    break;
                }
            }
            if(scheduleClinicDate !=null){
                var pageIndex=0;
                var scheduleClinicDate=new Date(scheduleClinicDate.replace(/-/g, '/'));
                for(var j=1;j<$scope.weekMouthlimit.length;j++){
                    var weeklimit=$scope.weekMouthlimit[j];
                    var startDate= weeklimit.split("-")[0];
                    var endDate= weeklimit.split("-")[1];
                    startDate=new Date(startDate);
                    endDate=new Date(endDate);
                    if(scheduleClinicDate>=startDate && scheduleClinicDate<=endDate){
                        pageIndex=j;
                    }
                }
            }
            for(var s=0;s<pageIndex;s++){
                var screenSize = KyeeUtilsService.getInnerSize();
                if( $scope.schedulepage!=$scope.pageArr.length-1){
                    $scope.schedulepage++;
                    $ionicScrollDelegate.$getByHandle("doctor_schedule").scrollTo(screenSize.width*($scope.schedulepage),0,false);
                    $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
                }
            }
        }

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

        //处理排班日期
        function detailWeekDate(maxClinicDate){
            var maxClinicDateIsSunday = false;
            //var maxClinicDate="2015/12/16";
            //根据最大日期获取所在日期的星期日的日期
            var clinicDate = new Date(maxClinicDate);          //当前日期
            var clinicDayOfWeek = clinicDate.getDay();         //当前周的第几天
            var clinicDay = clinicDate.getDate();              //当前日
            var clinicMonth = clinicDate.getMonth();           //当前月
            var clinicYear = clinicDate.getFullYear();             //当前年
            if(clinicDayOfWeek == 0) {
                maxClinicDateIsSunday = true;
            }
            //获取下一天日期
            function NextDay(d){
                d = +d + 1000*60*60*24;
                d = new Date(d);
                return d;
            }
            //获得最大日期所在周的开始日期
            //var maxWeekStartDate = new Date(clinicYear, clinicMonth, clinicDay - clinicDayOfWeek);
            // var getMaxWeekStartDate=(maxWeekStartDate.getMonth()+1)+"月"+NextDay(maxWeekStartDate).getDate()+"日";
            //获得最大日期所在周的结束日期
            var maxWeekEndDate = new Date(clinicYear, clinicMonth, clinicDay + (6 - clinicDayOfWeek));

            //根据当前日期获取本周起始日期，和结束日期
            var now = new Date();                    //当前日期
            var serviceTime = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SERVER_TIME);
            if(serviceTime!=undefined&&serviceTime!=''&&serviceTime!=null){
                now  = KyeeUtilsService.DateUtils.parse(serviceTime,"YYYY-MM-DD");      //当前日期
            }
            //如果当前日期是周日，则开始日期为当前周的周一
            if(now.getDay()==0){
                //获取周日的前一天日期
                now = new Date(now.getTime() - 24*60*60*1000);
                var sunDay=7;
            }
            var nowDayOfWeek = now.getDay();         //今天本周的第几天
            var nowDay = now.getDate();              //当前日
            var nowMonth = now.getMonth();           //当前月
            var nowYear = now.getFullYear();             //当前年
            //(getNextDay(getWeekEndDate).getMonth()+1)+"月"+getNextDay(getWeekEndDate).getDate()+"日";
            //获得本周的开始日期
            var WeekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
            $scope.WeekStartDate=WeekStartDate;
            var getWeekStartDate=(NextDay(WeekStartDate).getMonth()+1)+"月"+NextDay(WeekStartDate).getDate()+"日";
            //获得本周的结束日期
            var WeekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
            $scope.WeekEndDate=WeekEndDate;
            var getWeekEndDate= (NextDay(WeekEndDate).getMonth()+1)+"月"+NextDay(WeekEndDate).getDate()+"日";
            $scope.weekMouthDate=getWeekStartDate+"-"+getWeekEndDate;
            // 给日期类对象添加日期差方法，返回日期与diff参数日期的时间差，单位为天
            Date.prototype.diff = function(date){
                return (this.getTime() - date.getTime())/(24 * 60 * 60 * 1000);
            };
            //星期
            var weekArr=[];
            //日期
            var weekDate=[];
            var weekDateShow=[];
            var diff = maxWeekEndDate.diff(WeekStartDate)+1;
            //当前数据有几页
            var pageArr=[];
            var tempIon = false;//排班下按钮的样式显示
            for(var i=0;i<diff/7;i++){
                if(maxClinicDateIsSunday) {
                    maxClinicDateIsSunday = false;
                    tempIon = true;
                    continue;
                }
                if(tempIon) {
                    pageArr.push(i-1);
                } else {
                    pageArr.push(i);
                }
            }
            $scope.pageArr=pageArr;
            //是否显示剩余号源数量
            $scope.SHOW_CLINIC_NUMBER = storageCache.get('hospitalInfo').SHOW_CLINIC_NUMBER;
            if($scope.SHOW_CLINIC_NUMBER =='1'){
                $scope.DOCTOR_COL_BOX_WIDTH = ($scope.pageArr.length*(KyeeUtilsService.getInnerSize().width - 14*2 - 20))+'px';
                $scope.DOCTOR_COL_WIDTH = (KyeeUtilsService.getInnerSize().width- 10*2 - 20)+'px';
            }else{
                $scope.DOCTOR_COL_BOX_WIDTH = ($scope.pageArr.length*(KyeeUtilsService.getInnerSize().width - 14*2))+'px';
                $scope.DOCTOR_COL_WIDTH = (KyeeUtilsService.getInnerSize().width- 10*2)+'px';

            }
            if(pageArr.length != diff/7) {
                //若不相等表示排班的最大日期是周日，下一周的排班都将为空，因此将减去7天的显示。
                diff = diff - 7;
            }
            for(var i=0;i<diff;i++){

                function getNextDay(d){
                    d = +d + 1000*60*60*24*(i+1);
                    d = new Date(d);
                    return d;
                }
                weekDate.push((getNextDay(WeekStartDate).getMonth()+1)+"-"+getNextDay(WeekStartDate).getDate());
                weekDateShow.push((getNextDay(WeekStartDate).getMonth()+1)+"-"+getNextDay(WeekStartDate).getDate());
                if(i%7==0){
                    weekArr.push("周一");
                }
                else if(i%7==1){
                    weekArr.push("周二");
                }
                else if(i%7==2){
                    weekArr.push("周三");
                }
                else if(i%7==3){
                    weekArr.push("周四");
                }
                else if(i%7==4){
                    weekArr.push("周五");
                }
                else if(i%7==5){
                    weekArr.push("周六");
                }
                else if(i%7==6){
                    weekArr.push("周日");
                }
            }
            //如果当前日期是周日
            if(sunDay==7){
                weekArr[6]="今天";
            }else{
                weekArr[nowDayOfWeek-1]="今天";
            }
            //计算每一周的起始时间和结束时
            var weekMouth=[];
            var weekLimit=[];
            weekMouth[0]=getWeekStartDate+"-"+getWeekEndDate;
            weekLimit[0]=getWeekStartDate+"-"+getWeekEndDate;
            for(var i=1;i<$scope.pageArr.length;i++){
                function NextWeek(d){
                    d = +d + (1000*60*60*24*(i*7+1));
                    d = new Date(d);
                    return d;
                }
                var getWeekStartDate=(NextWeek($scope.WeekStartDate).getMonth()+1)+"月"+NextWeek($scope.WeekStartDate).getDate()+"日";
                var weekLimitStart= $scope.WeekStartDate.getFullYear()+"/"+ (NextWeek($scope.WeekStartDate).getMonth()+1)+"/"+NextWeek($scope.WeekStartDate).getDate();
                var getWeekEndDate= (NextWeek($scope.WeekEndDate).getMonth()+1)+"月"+NextWeek($scope.WeekEndDate).getDate()+"日";
                var weekLimitEnd= $scope.WeekEndDate.getFullYear()+"/"+ (NextWeek($scope.WeekEndDate).getMonth()+1)+"/"+NextWeek($scope.WeekEndDate).getDate();
                weekMouth[i]=getWeekStartDate+"-"+getWeekEndDate;
                weekLimit[i]=weekLimitStart+"-"+weekLimitEnd;
            }
            $scope.weekMouth=weekMouth;
            $scope.weekMouthlimit=weekLimit;
            $scope.weekList=weekArr;
            $scope.weekDate=weekDate;
            //weekDateShow[nowDayOfWeek-1]="";
            //如果当前日期是周日
            /* if(sunDay==7){
             weekDateShow[6]="";
             }else{
             weekDateShow[nowDayOfWeek-1]="";
             }*/
            $scope.weekDateList=weekDateShow;
        }
        //处理排班数据
        function detailSchedule(doctorScheduleArr){
            var morningArray = [];//上午排班数组，如果当前医生上午无排班，数组内当前值为true,否则为false
            var afternoonArray = [];//下午排班数组，如果当前医生下午无排班，数组内当前值为true,否则为false
            for(var i=0;i< $scope.weekDate.length;i++){
                for(var j=0;j<doctorScheduleArr.length;j++){
                    var clinicDate= KyeeUtilsService.DateUtils.formatFromString(doctorScheduleArr[j].CLINIC_DATE,'YYYY/MM/DD', 'MM-DD');
                    var weekDateList= KyeeUtilsService.DateUtils.formatFromString($scope.weekDate[i],'MM-DD', 'MM-DD');
                    if(clinicDate== weekDateList){
                        if (doctorScheduleArr[j].CLINIC_DURATION === '上午' || doctorScheduleArr[j].CLINIC_DURATION === '白天'|| doctorScheduleArr[j].CLINIC_DURATION === '全天' || doctorScheduleArr[j].CLINIC_DURATION === '昼夜') {
                            if(doctorScheduleArr[j].CLINIC_DURATION === '上午'){
                                if(doctorScheduleArr[j].ISTIME==1)
                                {
                                    doctorScheduleArr[j].showShedule = '上午';
                                }else if(doctorScheduleArr[j].ISTIME==2){
                                    doctorScheduleArr[j].showShedule = '下班';
                                }else if(doctorScheduleArr[j].ISTIME==3){
                                    doctorScheduleArr[j].showShedule = '暂不可约';
                                }
                                else if(doctorScheduleArr[j].ISTIME==4){
                                    doctorScheduleArr[j].showShedule = '停诊';
                                }else{
                                    doctorScheduleArr[j].showShedule = '约满';
                                }
                                morningArray.push(doctorScheduleArr[j]);
                            }
                            else if(doctorScheduleArr[j].CLINIC_DURATION === '全天'){

                                if(doctorScheduleArr[j].ISTIME==1)
                                {
                                    doctorScheduleArr[j].showShedule = '全天';
                                }else if(doctorScheduleArr[j].ISTIME==2){
                                    doctorScheduleArr[j].showShedule = '下班';
                                }else if(doctorScheduleArr[j].ISTIME==3){
                                    doctorScheduleArr[j].showShedule = '暂不可约';
                                }else if(doctorScheduleArr[j].ISTIME==4){
                                    doctorScheduleArr[j].showShedule = '停诊';
                                }else{
                                    doctorScheduleArr[j].showShedule = '约满';
                                }
                                morningArray.push(doctorScheduleArr[j]);
                            }
                            else if(doctorScheduleArr[j].CLINIC_DURATION === '白天'){
                                if(doctorScheduleArr[j].ISTIME==1)
                                {
                                    doctorScheduleArr[j].showShedule = '白天';
                                }else if(doctorScheduleArr[j].ISTIME==2){
                                    doctorScheduleArr[j].showShedule = '下班';
                                }else if(doctorScheduleArr[j].ISTIME==3){
                                    doctorScheduleArr[j].showShedule = '暂不可约';
                                }else if(doctorScheduleArr[j].ISTIME==4){
                                    doctorScheduleArr[j].showShedule = '停诊';
                                }else{
                                    doctorScheduleArr[j].showShedule = '约满';
                                }
                                morningArray.push(doctorScheduleArr[j]);
                            }
                            else if(doctorScheduleArr[j].CLINIC_DURATION === '昼夜'){
                                if( doctorScheduleArr[j].ISTIME==1)
                                {
                                    doctorScheduleArr[j].showShedule = '昼夜';
                                }else if(doctorScheduleArr[j].ISTIME==2){
                                    doctorScheduleArr[j].showShedule = '下班';
                                }else if(doctorScheduleArr[j].ISTIME==3){
                                    doctorScheduleArr[j].showShedule = '暂不可约';
                                }else if(doctorScheduleArr[j].ISTIME==4){
                                    doctorScheduleArr[j].showShedule = '停诊';
                                }else{
                                    doctorScheduleArr[j].showShedule = '约满';
                                }
                                morningArray.push( doctorScheduleArr[j]);
                            }
                        }
                        if ( doctorScheduleArr[j].CLINIC_DURATION === '下午') {
                            if ( doctorScheduleArr[j].ISTIME == 1) {
                                doctorScheduleArr[j].showShedule = '下午';
                            }else if(doctorScheduleArr[j].ISTIME==2){
                                doctorScheduleArr[j].showShedule = '下班';
                            }else if(doctorScheduleArr[j].ISTIME==3){
                                doctorScheduleArr[j].showShedule = '暂不可约';
                            }else if(doctorScheduleArr[j].ISTIME==4){
                                doctorScheduleArr[j].showShedule = '停诊';
                            }else{
                                doctorScheduleArr[j].showShedule = '约满';
                            }
                            afternoonArray.push( doctorScheduleArr[j]);
                        }
                    }
                }
                //无上午排班
                if (morningArray.length <= i) {
                    morningArray.push('');
                }
                //无下午排班
                if (afternoonArray.length <= i) {
                    afternoonArray.push('');
                }
            }
            $scope.morningScheduleArray=morningArray;
            $scope.afternoonScheduleArray=afternoonArray;
            showDoctorScheduleByDate(morningArray,afternoonArray);
        }
        //展示日期
        $scope.getweeklist=function(index){
            return $scope.weekList[index];
        };
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
        //点击下一周
        //KYEEAPPC-5251，增加过滤空排班界面，add by wangyaning
        $scope.nextWeekSchedule=function(emptyPageTotalNum,animationFlag){
            var screenSize = KyeeUtilsService.getInnerSize();
            if( $scope.schedulepage!=$scope.pageArr.length-1){
                //$scope.schedulepage++;
                $scope.schedulepage+=emptyPageTotalNum;
                $ionicScrollDelegate.$getByHandle("doctor_schedule").scrollTo(screenSize.width*($scope.schedulepage),0,animationFlag);
                $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
            }
            OperationMonitor.record("countNextWeekSchedule", "doctor_info");
        };
        //点击上一周
        $scope.lastWeekSchedule=function(){
            var screenSize = KyeeUtilsService.getInnerSize();
            if( $scope.schedulepage!=0){
                $scope.schedulepage--;
                $ionicScrollDelegate.$getByHandle("doctor_schedule").scrollTo(screenSize.width*($scope.schedulepage),0,true);
                $scope.weekMouthDate=$scope.weekMouth[$scope.schedulepage];
            }
            OperationMonitor.record("countLastWeekSchedule", "doctor_info");
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

        //是否关注医生
        $scope.careDoctor = function () {
            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_FILTER",
                token: "appointment_doctor_detail",
                onFinash: function () {
                    $state.go('doctor_info');
                    var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                    if (!currentCustomPatient || !currentCustomPatient.USER_VS_ID) {
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("doctor_info.message","消息"),
                            content: KyeeI18nService.get("doctor_info.choosePatient","您还没有选择就诊者，是否选择？"),
                            onSelect: function (res) {
                                if (res) {
                                    $state.go('custom_patient');
                                }
                            }
                        });
                    } else {
                        //修改是否关注状态
                        $scope.CARE = !$scope.CARE;
                        var careStatus = '';
                        //根据是否关注状态设置人数
                        if ($scope.CARE) {
                            $scope.careNum++;
                            careStatus = '1';
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("appointment_regist_deti.isCancelAppoint", "您已成功关注该医生"),
                                duration: 3000
                            });
                            if(AppointmentDoctorDetailService.doctorCare){
                                //wangwan KYEEAPPTEST-3228  医生详情页关注数问题优化
                                if(!caretype){
                                    AppointmentDoctorDetailService.doctorCare.careFlag = 1;
                                }else{
                                    AppointmentDoctorDetailService.doctorCare.careFlag =0;
                                }
                            }
                        } else {
                            $scope.careNum--;
                            careStatus = '0';
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("appointment_regist_deti.isCancelAppoint","您已取消关注该医生"),
                                duration: 3000
                            });
                            if(AppointmentDoctorDetailService.doctorCare){
                                //wangwan KYEEAPPTEST-3228  医生详情页关注数问题优化
                                if(caretype){
                                    AppointmentDoctorDetailService.doctorCare.careFlag = -1;
                                }else{
                                    AppointmentDoctorDetailService.doctorCare.careFlag =0;
                                }
                            }
                        }
                        //保存数据
                        AppointmentDoctorDetailService.careDoctor(careStatus);
                    }
                }
            });

            OperationMonitor.record("countFavoritBox", "doctor_info");
        };

        /**
         * 展开或收缩医生简介
         */
        $scope.showDoctorDesc = function () {
            $ionicScrollDelegate.$getByHandle("doctor_info_content").resize();
            $scope.doctorDescShow = !$scope.doctorDescShow;
            if(!$scope.doctorDescShow){
                $ionicScrollDelegate.$getByHandle("doctor_info_content").scrollTop();
            }
            OperationMonitor.record("countDocotorDesc", "doctor_info");
        };
        /**
         * 展开或收缩医生动态
         */
        $scope.showDoctorAction = function(){
            $scope.doctorActionDes = !$scope.doctorActionDes;
        };
        /**
         * 展开或收缩医生排班
         */
        $scope.showDoctorSchedule = function () {
            $scope.doctorScheduleShow = !$scope.doctorScheduleShow;
            OperationMonitor.record("countDoctorSchedule", "doctor_info");
        };

        /**
         * 展开或收缩医生评价
         */
        $scope.showDoctorAssess = function (){
            $scope.doctorAssessShow = !$scope.doctorAssessShow;
            $ionicScrollDelegate.$getByHandle("doctor_info_content").resize();
            OperationMonitor.record("countDoctorAssess", "doctor_info");
        };


        //加载数据
        $scope.loadMore = function(){
            page++;
            var doctorInfo = AppointmentDoctorDetailService.doctorInfo;
            AppointmentDoctorSuggestService.loadData(doctorInfo.HOSPITAL_ID, doctorInfo.DOCTOR_CODE, page, pageSize,function(data) {
                //无上刷操作，不需要再次加载数据
                var rows = data.rows;
                loadMoreFlag = rows.length >= pageSize;
                if(rows.length) {
                    $scope.totalInfo.SUGGEST_AVERAGE_SCORE = rows[0].SUGGEST_AVERAGE_SCORE;
                    $scope.totalInfo.SUGGEST_COUNT = rows[0].SUGGEST_COUNT;

                    //KYEEAPPC-4710  zhangming   2015.12.28  去掉没有文字描述的评价
                    var newDataRow = [];
                    for(var i = 0;i < rows.length; i++) {
                        if(rows[i].SUGGEST_VALUE || rows[i].SUGGEST_APPEND){
                            var SUGGEST_DATE = rows[i].SUGGEST_DATE;
                            rows[i].SUGGEST_DATE = KyeeUtilsService.DateUtils.formatFromDate(new Date(SUGGEST_DATE),'YYYY/MM/DD ');
                            newDataRow.push(data.rows[i]);
                        }
                    }
                    $scope.msgs = $scope.msgs.concat(newDataRow);
                }

                //通知directive已加载完成
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        //判断是否还有更多数据
        $scope.moreDataCanBeLoaded = function(){
            return loadMoreFlag;
        };


        //绑定选择事件
        $scope.bind = function (params) {
            showPicker = params.show;
        };
        //选择号源
        $scope.selectItem = function (params) {
            //判断是预约还是挂号
            if (businessType == '0') {  //0：预约  1：挂号
                AppointmentDoctorDetailService.CLINIC_SOURCE = params.item;
                showPrompt(1);
            }else{
                AppointmentDoctorDetailService.CLINIC_SOURCE = params.item;
                showPrompt(2);
            }
        };

        /**
         * 预约
         * @param schedule
         */
        function appoint(schedule,index,durationType) {
            businessType = '0';
            var doctor =  AppointmentDoctorDetailService.doctorInfo;
            var CLINIC_DATE = KyeeUtilsService.DateUtils.formatFromDate(new Date(schedule.CLINIC_DATE), 'YYYY/MM/DD');
            var params = {
                "hospitalId": doctor.HOSPITAL_ID,
                "deptCode": doctor.DEPT_CODE,
                "doctorCode": doctor.DOCTOR_CODE,
                "hbTime": schedule.CLINIC_DURATION,//---参数传入错误
                "clinicDate": CLINIC_DATE,
                "hisScheduleId" : schedule.HIS_SCHEDULE_ID,
                "IS_REFERRAL":$scope.IS_REFERRAL
            };

            /**
             * 查询医生号源
             */
            $scope.showTerm = true;
            AppointmentDoctorService.queryAppointSource(params, function (resultData) {
                //KYEEAPPC-6612 获取号源为空，则将排班ISTIME置为0
                if(resultData.success){
                    var ClinicDetail = resultData.data;
                    AppointmentDoctorDetailService.CLINIC_SOURCE = {};//清除掉选择号源控件的数据，以防止预约挂号不选择号源时，该服务数据不空导致的问题

                    AppointmentDoctorDetailService.ARCHIVE_FEE = ClinicDetail.ARCHIVE_FEE;

                    //想确认预约服务中传入号源数据、排班数据
                    AppointmentDoctorDetailService.selSchedule = schedule;
                    AppointmentDoctorDetailService.CLINIC_DETAIL = ClinicDetail;
                    if (ClinicDetail.rows.length > 1) {
                        var menus = [];
                        for (var i = 0; i < ClinicDetail.rows.length; i++) {
                            var resultMap = {};
                            //KYEEAPPC-4795 号源格式优化(apk)   wangwan  2016年1月4日18:11:34
                            var hbType="";
                            if(ClinicDetail.rows[i].HB_TYPE){
                                if(ClinicDetail.rows[i].REGISTERED_FEE){
                                    var hbType=ClinicDetail.rows[i].HB_TYPE+" "+"¥"+ClinicDetail.rows[i].REGISTERED_FEE;
                                }else{
                                    var hbType=ClinicDetail.rows[i].HB_TYPE;
                                }
                            }
                            //如果没有剩余号源数量，则不显示
                            var remainCount=ClinicDetail.rows[i].REMAIN_COUNT;
                            if(remainCount==undefined||remainCount==""||remainCount==null){
                                remainCount="";
                            }
                            resultMap["text"] = ClinicDetail.rows[i].HB_TIME+" "+ClinicDetail.rows[i].HB_NO+" "+ hbType+" "+remainCount;
                            resultMap["value"] = ClinicDetail.rows[i].HID;
                            resultMap["value2"] = ClinicDetail.rows[i];//存的是号源的所有属性
                            menus.push(resultMap);
                        }
                        //控制器中绑定数据：
                        $scope.pickerItems = menus;
                        $scope.title = CLINIC_DATE;
                        //调用显示
                        showPicker();
                    } else {
                        //不需要选择号源
                        if($scope.showTerm){
                            showPrompt(1);
                        }
                    }
                }else{
                    //KYEEAPPC-6612 获取号源为空，则将排班ISTIME置为0
                    if((resultData.resultCode=='0020702'||resultData.resultCode=='0020701')&&resultData.data.ISTIME=='0'){
                        if(durationType==1){
                            $scope.morningScheduleArray[index].ISTIME=0;
                            $scope.morningScheduleArray[index].showShedule="约满";
                        }else{
                            $scope.afternoonScheduleArray[index].ISTIME=0;
                            $scope.afternoonScheduleArray[index].showShedule="约满";
                        }
                    }else{
                        KyeeMessageService.broadcast({
                            content: resultData.message,
                            duration: 5000
                        });
                    }
                }

            });
        }
        //挂号
        function regist (schedule,index,durationType) {
            businessType = '1';
            var doctor =  AppointmentDoctorDetailService.doctorInfo;
            var CLINIC_DATE = KyeeUtilsService.DateUtils.formatFromDate(new Date(schedule.CLINIC_DATE), 'YYYY/MM/DD');
            var params = {
                "hospitalID": doctor.HOSPITAL_ID,
                "deptCode": doctor.DEPT_CODE,
                "doctorCode": doctor.DOCTOR_CODE,
                "hbTime": schedule.CLINIC_DURATION,//---参数传入错误
                "clinicDate": CLINIC_DATE,
                "hisScheduleId" : schedule.HIS_SCHEDULE_ID,
                "IS_REFERRAL":$scope.IS_REFERRAL
            };
            $scope.showTerm = true;
            RegistConfirmService.queryClinicData(params, function (resultData) {
                //KYEEAPPC-6612 获取号源为空，则将排班ISTIME置为0
                if(resultData.success){
                    var clinicData = resultData.data;
                    AppointmentDoctorDetailService.selSchedule = schedule;
                    AppointmentDoctorDetailService.CLINIC_DETAIL = clinicData;
                    AppointmentDoctorDetailService.ARCHIVE_FEE = clinicData.ARCHIVE_FEE;
                    if (clinicData.rows.length == 0) {
                        KyeeMessageService.broadcast({
                            content:  KyeeI18nService.get("doctor_info.fileclinic","获取号源失败！"),
                            duration: 3000
                        });
                        //begin 前端校验阻塞后发送请求 By 高玉楼 KYEEAPPC-2896
                        RegistConfirmService.registerGetHisFailure();
                        //end 前端校验阻塞后发送请求 By 高玉楼
                        return;
                    }
                    AppointmentDoctorDetailService.timePeriodShow = clinicData.timePeriodShow;
                    if (clinicData.timePeriodShow) {
                        var menus = [];
                        for (var i = 0; i < clinicData.rows.length; i++) {
                            var resultMap = {};
                            //KYEEAPPC-4795 号源格式优化(apk)   wangwan  2016年1月4日18:11:34
                            var hbType="";
                            //如果号源类型为空，则显示号源费用和类型  wangwan 2015年12月31日11:30:10
                            if(clinicData.rows[i].HB_TYPE){
                                if(clinicData.rows[i].REGISTERED_FEE){
                                    var hbType=clinicData.rows[i].HB_TYPE+" "+"¥"+clinicData.rows[i].REGISTERED_FEE;
                                }else{
                                    var hbType=clinicData.rows[i].HB_TYPE;
                                }
                            }
                            //如果没有剩余号源数量，则不显示
                            var remainCount=clinicData.rows[i].REMAIN_COUNT;
                            if(remainCount==undefined||remainCount==""||remainCount==null){
                                remainCount="";
                            }
                            resultMap["text"] = clinicData.rows[i].HB_TIME+" "+clinicData.rows[i].HB_NO+" "+ hbType+" "+remainCount;
                            resultMap["value"] = clinicData.rows[i].HID;
                            resultMap["value2"] = clinicData.rows[i];//存的是号源的所有属性
                            menus.push(resultMap);
                        }
                        //控制器中绑定数据：
                        $scope.pickerItems = menus;
                        $scope.title = CLINIC_DATE;
                        //调用显示
                        showPicker();
                    } else {
                        //默认给定第一个号源
                        if($scope.showTerm){
                            AppointmentDoctorDetailService.CLINIC_SOURCE = clinicData.rows[0];
                            showPrompt(2);
                        }
                    }
                }else{
                    //KYEEAPPC-6612 获取号源为空，则将排班ISTIME置为0
                    if(resultData.resultCode=='0020702'&&resultData.data.ISTIME=='0'){
                        //上午
                        if(durationType==1){
                            $scope.morningScheduleArray[index].ISTIME=0;
                            $scope.morningScheduleArray[index].showShedule="约满";
                        }else{
                            //下午
                            $scope.afternoonScheduleArray[index].ISTIME=0;
                            $scope.afternoonScheduleArray[index].showShedule="约满";
                        }
                    }else{
                        KyeeMessageService.broadcast({
                            content: resultData.message,
                            duration: 5000
                        });
                    }
                }

            });
        };

        /**
         * 预约或挂号
         * @param schedule
         */
        $scope.appiontMent = function(schedule, index, durationType) {
            if(schedule.ISTIME=='2' || schedule.ISTIME=='3')
            {
                KyeeMessageService.broadcast({
                    content:  schedule.TIPS_MSG,
                    duration: 3000
                });
                return ;
            }
            if(schedule.ISTIME!=='1'&&schedule.ISTIME!=='3')
            {
                return ;
            }
            if (schedule.BUSSINESS_TYPE == '0') {
                //预约
                appoint(schedule,index,durationType);
            } else if (schedule.BUSSINESS_TYPE == '1') {
                //挂号
                regist(schedule,index,durationType);
            }
        };

        $scope.showNotification=function() {
            //edit by wangwan 任务号：KYEEAPPC-3903  预约挂号条款都显示，不显示网络医院的挂号条款
            if (selDoctor.APPOINT_NOTIFICATION ||selDoctor.REGISTER_NOTIFICATION||selDoctor.NETWORK_REGIST_NOTIFICATION) {
                //预约条款不为空显示
                if(selDoctor.APPOINT_NOTIFICATION){
                    $scope.appointRule= KyeeI18nService.get("doctor_info.appointRule","预约条款");
                    $scope.APPOINT_NOTIFICATION_SHOW=selDoctor.APPOINT_NOTIFICATION;
                    $scope.appointNotificationShow=true;
                }
                //如果是网络科室，展示网络医院挂号条款
                if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE=='1'){
                    if(selDoctor.NETWORK_REGIST_NOTIFICATION ){
                        $scope.registRule=KyeeI18nService.get("doctor_info.registRule","挂号条款");
                        $scope.REGIST_NOTIFICATION_SHOW=selDoctor.NETWORK_REGIST_NOTIFICATION;
                        $scope.registNotificationShow=true;//展示网络科室挂号条款
                        $scope.appointNotificationShow=false;//不展示预约条款
                    }
                }else{
                    //如果是非网络科室展示非网络挂号条款
                    //挂号条款不为空显示
                    if(selDoctor.REGISTER_NOTIFICATION){
                        $scope.registRule=KyeeI18nService.get("doctor_info.registRule","挂号条款");
                        $scope.REGIST_NOTIFICATION_SHOW=selDoctor.REGISTER_NOTIFICATION;
                        $scope.registNotificationShow=true;
                    }
                }
                var notificationDialog = KyeeMessageService.dialog({
                    template: "modules/business/appointment/views/appointment_doctor_detail/appointRegistNotification.html",
                    scope: $scope,
                    title:  KyeeI18nService.get("doctor_info.appointRegistRule","预约挂号条款"),
                    buttons: [{
                        style: "button button-block button-size-l",
                        text:  KyeeI18nService.get("doctor_info.isOk","确定"),
                        click: function () {
                            notificationDialog.close();
                        }
                    }]
                });
                $scope.id="notification.notificationId";
                footerClick($scope.id);
            }
        };
        //查看条款内容高度是否超过屏幕高度，是则显示点击加载更多
        function footerClick(id){
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
        }
        //点击加载更多后，展示更多条款
        $scope.getMoreNotification = function(resizeId){
            $scope.showMore=!$scope.showMore;
            /* document.getElementById($scope.id).style.cssText="height:"+($scope.element)+"px";*/
            if(resizeId==1){
                $ionicScrollDelegate.$getByHandle("appoint_notification").resize();
            }
            if(resizeId==2){
                $ionicScrollDelegate.$getByHandle("appoint_regist_notification").resize();
            }
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
                KyeeMessageService.loading({
                    mask: false
                });
                //解决弹出条款，又弹出添加添加就诊者会导致APP界面锁死的问题。wangwan  2016年1月26日16:24:24
                timer = KyeeUtilsService.interval({
                    time: 500,
                    action: function () {
                        KyeeMessageService.hideLoading();
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
        }
        //弹出预约挂号条款
        function showPrompt (status) {
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
                    } else if(status == 2) {//普通挂号
                        goToAppointment("regist_confirm");
                    } else if(status == 3){//网络挂号(视频问诊)
                        $scope.toVisitDoctor('VIDEO');
                    } else if(status == 4){//网络挂号（购药开单）
                        $scope.toVisitDoctor('PURCHASE');
                    }
                }
            }];
            //status 1表示预约，2表示普通挂号 ，3和4 表示网络挂号
            if (status == 1) {//预约
                if (!selDoctor.APPOINT_NOTIFICATION) {
                    //如果预约条款为空，则不弹出条款
                    goToAppointment("appoint_confirm");
                    return;
                }
                //条款内容为预约条款，不显示网络医院挂号条款
                $scope.APPOINT_NOTIFICATION_SHOW=selDoctor.APPOINT_NOTIFICATION;
                $scope.appointNotificationShow=true;
                $scope.registNotificationShow=false;
                // $scope.NOTIFICATION =selDoctor.APPOINT_NOTIFICATION;
                $scope.dialog = KyeeMessageService.dialog({
                    template: "modules/business/appointment/views/appointment_doctor_detail/appointNotification.html",
                    scope: $scope,
                    title:  KyeeI18nService.get("doctor_info.appointRegistRule","预约挂号条款"),
                    buttons: buttons
                });
                $scope.id="notification.appointId";
                //footerClick($scope.id);
            } else if(status == 2){//普通挂号
                //如果是网络科室，则弹出网络医院挂号条款
                if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE=='1'){
                    if(!$scope.pageData.NETWORK_REGIST_NOTIFICATION){
                        //如果挂号条款为空，则不弹出条款
                        goToAppointment("regist_confirm");
                        return;
                    }
                    //条款内容显示网络医院挂号条款
                    $scope.REGIST_NOTIFICATION_SHOW=$scope.pageData.NETWORK_REGIST_NOTIFICATION;
                    $scope.registNotificationShow=true;
                    $scope.appointNotificationShow=false;
                }else{
                    if (!selDoctor.REGISTER_NOTIFICATION) {
                        //如果挂号条款为空，则不弹出条款
                        goToAppointment("regist_confirm");
                        return;
                    }
                    //条款内容为挂号条款,不显示网络医院挂号条款
                    $scope.REGIST_NOTIFICATION_SHOW=selDoctor.REGISTER_NOTIFICATION;
                    $scope.registNotificationShow=true;
                    $scope.appointNotificationShow=false;
                    //$scope.NOTIFICATION = selDoctor.REGISTER_NOTIFICATION;
                }
                $scope.dialog = KyeeMessageService.dialog({
                    template: "modules/business/appointment/views/appointment_doctor_detail/appointNotification.html",
                    scope: $scope,
                    title:  KyeeI18nService.get("doctor_info.appointRegistRule","预约挂号条款"),
                    buttons: buttons
                });
                $scope.id="notificationId.registId";
            }else if(status == 3 || status == 4){//网络挂号
                //如果开通了网络门诊，且网络挂号条款不为空，则显示
                if($scope.NETWORK_CLINIC == '1' && $scope.pageData.NETWORK_REGIST_NOTIFICATION){
                    //条款内容显示网络医院挂号条款
                    $scope.REGIST_NOTIFICATION_SHOW=$scope.pageData.NETWORK_REGIST_NOTIFICATION;
                    $scope.registNotificationShow=true;
                    $scope.appointNotificationShow=false;
                }else{
                    //如果挂号条款为空，则不弹出条款
                    if(status == 3){//网络挂号(视频问诊)
                        $scope.toVisitDoctor('VIDEO');
                    } else if(status == 4){//网络挂号（购药开单）
                        $scope.toVisitDoctor('PURCHASE');
                    }
                    return;
                }
                //条款内容为网络医院挂号条款
                $scope.REGIST_NOTIFICATION_SHOW=selDoctor.NETWORK_REGIST_NOTIFICATION;
                $scope.registNotificationShow=true;
                $scope.appointNotificationShow=false;

                $scope.dialog = KyeeMessageService.dialog({
                    template: "modules/business/appointment/views/appointment_doctor_detail/appointNotification.html",
                    scope: $scope,
                    title:  KyeeI18nService.get("doctor_info.appointRegistRule","预约挂号条款"),
                    buttons: buttons
                });
                $scope.id="notificationId.registId";
            }
        }
        //判断是命名‘预约条款’还是‘挂号条款’
        function showIsNotNotification(){
            //默认不显示
            $scope.appointRulerShow=false;
            //start by wangwan  任务号：KYEEAPPC-3903 网络医院和常规医院的预约挂号条款修改
            //如果网络科室，命名为挂号条款
            if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE=='1'){
                if(selDoctor.NETWORK_REGIST_NOTIFICATION){
                    $scope.appointRuler=KyeeI18nService.get("doctor_info.registRule","挂号条款");
                    $scope.appointRulerShow=true;
                }
            }else{
                //如果非网络科室
                if(selDoctor.APPOINT_NOTIFICATION&&selDoctor.REGISTER_NOTIFICATION){
                    //预约挂号条款都不为空，则命名预约条款
                    $scope.appointRuler=KyeeI18nService.get("doctor_info.appointRule","预约条款");
                    $scope.appointRulerShow=true;
                }else if(selDoctor.APPOINT_NOTIFICATION){
                    //如果只有预约条款不为空，则命名为‘预约条款’
                    $scope.appointRuler=KyeeI18nService.get("doctor_info.appointRule","预约条款");
                    $scope.appointRulerShow=true;
                }else if(selDoctor.REGISTER_NOTIFICATION){
                    //如果只有挂号条款不为空，则显示挂号条款
                    $scope.appointRuler=KyeeI18nService.get("doctor_info.registRule","挂号条款");
                    $scope.appointRulerShow=true;
                }
            }
        }
        //end by wangwan  任务号：KYEEAPPC-3903 网络医院和常规医院的预约挂号条款修改

        $scope.backToDoctorList = function () {
            if((AppointmentDoctorDetailService.doctorInfo.ROOT_NAME&&AppointmentDoctorDetailService.doctorInfo.ROOT_NAME=='doctor_patient_relation')
            || StatusBarPushService.webJump){//外部通知跳转进来,返回到首页
                StatusBarPushService.webJump = undefined;
                $state.go("home->MAIN_TAB");
            }else{
                if(WaitChattingService.isFromWaitChattingPage){
                    WaitChattingService.isFromWaitChattingPage = false;
                    $scope.showTerm=false;
                    $state.go("consultation_order");
                }else {
                    $scope.showTerm=false;
                    $ionicHistory.goBack(-1);
                }
            }
        };
        //KYEEAPPC-5358   预约挂号页面改版  wangwan 2016年3月9日19:47:51
        $scope.gotoNotice = function(){
            AppointmentDoctorDetailService.APPOINTMENT_NOTICE= selDoctor;
            $state.go("appointment_notice");
        };
        $scope.goToAddClinic =function(type){
            ////TODO 不交费验证先注掉
            //if(type==1 && $scope.pageData.APPOINT_PAY_WAY!='0'){
            //    return;
            //}
            //if(type==1&&$scope.pageData.CHOOSE_TYPE_LOWT =='1'){
            //    return;
            //}
            if(type==1&&$scope.showRush =='0'){
                return;
            }

            var loginFlag = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN);
            var currentCustomPatient = currentCustomPatientExit();
            if(loginFlag && currentCustomPatient){
                var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userId = currentUser.USER_ID;
                AddClinicManagementService.getUserRushNumber(userId, type, function (result) {

                    var AUTHENTICATION_SUCCESS = result.AUTHENTICATION_SUCCESS;
                    var FLAG = result.FLAG;

                    var MESSAGE_AUTHENTICATION =  result.AUTHENTICATION_MESSAGE;
                    var IS_EXIT = result.IS_EXIT;
                    var MESSAGE = result.MESSAGE;

                    if (!AUTHENTICATION_SUCCESS) {
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
                    } else if (IS_EXIT) {
                        KyeeMessageService.broadcast({
                            content: MESSAGE,
                            duration: 3000
                        });
                    } else {
                        var hospitalInfo = {
                            HOSPITAL_NAME: storageCache.get('hospitalInfo').name,
                            HOSPITAL_ID: storageCache.get('hospitalInfo').id
                        };
                        AddClinicManagementService.DOCTOR_INFO = AppointmentDoctorDetailService.doctorInfo;
                        AddClinicManagementService.DOCTOR_INFO.ADD_CLINIC_TYPE = type;
                        AddClinicManagementService.DOCTOR_INFO.HOSPITAL_NAME=storageCache.get('hospitalInfo').name;
                        AddClinicManagementService.DOCTOR_INFO.HOSPITAL_ID=storageCache.get('hospitalInfo').id;
                        //AddClinicManagementService.DOCTOR_INFO.RUSH_ID = null;
                        //AddClinicManagementService.HOSPITAL_INFO = hospitalInfo;
                        AddClinicManagementService.ROUTER = "doctor_info";
                        $state.go("add_clinic_management_new");
                    }

                })

                return;
            }

            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
                token: "appointment_doctor_detail",
                onFinash: function () {
                    $state.go('doctor_info');
                }
            });

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

        }
        function currentCustomPatientExit() {
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
            return Boolean(currentCustomPatient && currentCustomPatient.USER_VS_ID);
        }
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

        }
        //打开模态窗口
        $scope.openModalDoctorInfo = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
        //获取当前星星的样式：空星、半星、满星
        $scope.getStarStyle = function(score, idx){
            var cls = "";
            var x = score - idx;
            if(x >= 0){
                //满星
                cls = "icon-favorite2";
            }else if(x >= -0.5){
                //半星
                cls = "icon-favorite1";
            }
            return cls;
        };

        //预约挂号/视频问诊页签切换
        $scope.switchTab = function(tabFlag){
            $scope.activeTab = tabFlag;//界面判断选项卡显示状态
        };

        // 获取方便门诊的医生号源
        $scope.getDoctorSource=function(model){
            //网页版不能视频问诊
            if(model=="VIDEO"&&(typeof(device) == "undefined" || !(device.platform == "Android"||device.platform == "iOS"))){
                KyeeMessageService.broadcast({
                    content: "暂不支持，请使用趣医院APP申请视频问诊"
                });
                return;
            }
            var netWorkSchedule=(model=="VIDEO"?$scope.videoNetworkSchedule: $scope.purchaseNetworkSchedule);
            var params = {
                "hospitalId": AppointmentDoctorDetailService.doctorInfo.HOSPITAL_ID,
                "deptCode": netWorkSchedule[0].DEPT_CODE,
                "doctorCode":netWorkSchedule[0].DOCTOR_CODE,
                "hbTime": netWorkSchedule[0].DOCTOR_SCHEDULE_LIST[0].CLINIC_DURATION,
                "clinicDate": netWorkSchedule[0].DOCTOR_SCHEDULE_LIST[0].CLINIC_DATE,
                "hisScheduleId" : netWorkSchedule[0].DOCTOR_SCHEDULE_LIST[0].HIS_SCHEDULE_ID,
                "IS_ONLINE":'1'
            };
            //判断是预约还是挂号
            if (netWorkSchedule[0].DOCTOR_SCHEDULE_LIST[0].BUSSINESS_TYPE == '0') {  //0：预约  1：挂号
                AppointmentDoctorService.queryAppointSource(params, function (resultData) {
                    //获取号源为空，则将排班ISTIME置为0
                    if(resultData.success){
                        var sourceDetail = resultData.data;
                        if(sourceDetail.rows.length >0) {
                            if(model=="VIDEO"){
                                $scope.videoSourceDetail = sourceDetail;
                            }else{
                                $scope.purchaseSourceDetail = sourceDetail;
                            }
                            $scope.toVisitDoctor(model);
                        }else{
                            KyeeMessageService.broadcast({
                                content:"暂无号源",
                                duration: 5000
                            });
                        }
                    }else{
                        KyeeMessageService.broadcast({
                            content: resultData.message,
                            duration: 5000
                        });
                    }
                });
            }else{
                params.hospitalID =AppointmentDoctorDetailService.doctorInfo.HOSPITAL_ID;
                $scope.showNetworkTerm = true;//NETWORK_REGIST_TERM
                RegistConfirmService.queryClinicData(params, function (resultData) {
                    if(resultData.success){
                        var sourceDetail = resultData.data;
                        if(sourceDetail.rows.length >0) {
                            if($scope.showNetworkTerm && model=="VIDEO"){
                                $scope.videoSourceDetail = sourceDetail;
                                showPrompt(3);
                            }else if($scope.showNetworkTerm && model!="VIDEO"){
                                $scope.purchaseSourceDetail = sourceDetail;
                                showPrompt(4);
                            }else if(model=="VIDEO"){
                                $scope.videoSourceDetail = sourceDetail;
                                $scope.toVisitDoctor(model);
                            }else {
                                $scope.purchaseSourceDetail = sourceDetail;
                                $scope.toVisitDoctor(model);
                            }
                        }else{
                            KyeeMessageService.broadcast({
                                content:"暂无号源",
                                duration: 5000
                            });
                        }
                    }else{
                        //前端校验阻塞后发送请求
                        RegistConfirmService.registerGetHisFailure();
                        KyeeMessageService.broadcast({
                            content: resultData.message,
                            duration: 5000
                        });
                    }
                });
            }
        };

        //跳转到视频问诊或者远程购药/开单页面
        $scope.toVisitDoctor=function (model){
            if($scope.toDetailFlag==1){
                model =  $scope.onlineBusinessType==0?'VIDEO':'PURCHASE';
            }
            if(model == 'VIDEO'){ //视频问诊
                //视频问诊页面
                VideoInterrogationService.clinicDetail=$scope.videoSourceDetail;
                VideoInterrogationService.netWorkShedule=$scope.videoNetworkSchedule;
                VideoInterrogationService.REG_ID=$scope.regId;
                VideoInterrogationService.ROUTER = "doctor_info";
                $state.go("video_interrogation");
            }else{
                PurchaseMedinceService.clinicSource=$scope.purchaseSourceDetail;
                PurchaseMedinceService.netWorkShedule=$scope.purchaseNetworkSchedule;
                PurchaseMedinceService.REG_ID = $scope.regId;
                PurchaseMedinceService.ROUTER = "doctor_info";
                $state.go("purchase_medince");
            }
        };

        //点击“视频问诊”或“购药开单”，拦截或跳转
        $scope.visitDoctor=function(model){
            if($scope.toDetailFlag==1){
                KyeeMessageService.confirm({
                    title: "温馨提示",
                    content: "您当前有未完成的网络订单，查看订单详情？",
                    okText:"是",
                    cancelText: "否",
                    onSelect: function (res) {
                        if (res) {
                            $scope.toVisitDoctor(model);
                        }
                    }
                });
            }else{
                var statusData = {};
                if(model=="VIDEO"){
                    statusData = $scope.videoStatusData;
                }else{
                    statusData = $scope.purchaseStatusData;
                }
                if(statusData.flag){
                    $scope.getDoctorSource(model);
                    return;
                }else{
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("appointment_info.noNetWorkShedule",statusData.message)
                    });
                }
            }
        };

        //by jiangpin 查询是否是复诊患者
        function initSubsequentVisit(){
            var curUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            var curPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var currentCardInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
            var doctorInfo = AppointmentDoctorDetailService.doctorInfo;
            var patientId = '';
            if (currentCardInfo && currentCardInfo.PATIENT_ID != null) {
                patientId = currentCardInfo.PATIENT_ID;
            }
            AddInformationService.patientId = patientId;
            if(curUser && curPatient){
                var param = {
                    userId: curUser.USER_ID,
                    userVsId: curPatient.USER_VS_ID,
                    hospitalId: CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                    patientName: curPatient.OFTEN_NAME,
                    idCardNo: curPatient.ID_NO,
                    phone: curPatient.PHONE,
                    deptCode: doctorInfo.DEPT_CODE,
                    doctorCode: doctorInfo.DOCTOR_CODE,
                    patientId: patientId
                };

                AppointmentDoctorService.queryIsSecondVisit(param, function (data) {
                    if(data!= null && data.isSecondVisit){
                        isSecondVisitPatient = true;
                        /* 处理 咨询医生 数据 start-----*/
                        var isConsulted = 1,
                            consultDoctor = $scope.CONSULT_DOCTOR,
                            conData = $scope.consultation;
                        conData.isConsulted = isConsulted === 1;  //诊前诊后标识
                        conData.loadConsultFlag = true;     //是否加载过诊前诊后数据标识
                        // “咨询医生”开关打开 并且就诊过(诊后) 并且已经加载完付费咨询数据
                        if (consultDoctor === 1 && isConsulted === 1 && conData.loadConsultationFlag){
                            setConsultationConsulted(conData);
                        }
                        /* 处理 咨询医生 数据 end-----*/
                    }
                });
            }
        }
        /**
         * 加载付费咨询的数据
         */
        function loadConsultationData(param){
            DoctorConsultationService.getDoctorConsultationData(param, function(response){
                if(response.success){
                    handlerConsultationData(response.data);
                } else {

                }
            }, function(error){

            });
        }

        /**
         * 处理成功获取付费咨询的数据
         * @param data
         */
        function handlerConsultationData(data){
            var doctorVo = data.doctorVo;
            if(doctorVo && typeof doctorVo === 'object'){
                var con = $scope.consultation;
                angular.extend(con, doctorVo);
                //by jiangpin
                imState = con.imState;
                phoneState = con.phoneState;
                videoState = con.videoState;
                imFree = con.imIsFree;
                phoneFree = con.phoneIsFree;
                videoFree = con.videoIsFree;

                setConsultationLang(con);
                if (con.loadConsultFlag && con.isConsulted){    //已经加载过诊前诊后数据 并且是诊后
                    setConsultationConsulted(con);
                } else {
                    setConsultationUnConsulted(con);
                }
                con.loadConsultationFlag = true;  //是否加载完成付费咨询数据标识
                if ($scope.pageData && !$scope.pageData.DOCTOR_DESC) {  //医生介绍为空
                    $scope.pageData.DOCTOR_DESC = doctorVo.doctorDic;
                }
            }
        }

        /**
         * 设置付费咨询数据的国际化语言
         */
        function setConsultationLang(consultation){
            var i18nService = KyeeI18nService,
                lang = consultation.lang = {};
            lang.unit1 = i18nService.get("doctor_info.unit1", "元/次");
            lang.unit2 = i18nService.get("doctor_info.unit2", "元");
            lang.unit3 = i18nService.get("doctor_info.unit2", "元(");
            lang.unit4 = i18nService.get("doctor_info.unit2", "小时)");
            lang.oriPrice = i18nService.get("doctor_info.oriPrice", "原价：");
            lang.notOpen = i18nService.get("doctor_info.notOpen", "暂未开通");
            lang.isFull = i18nService.get("doctor_info.ifFull", "已约满");
            lang.freeConsult =  i18nService.get("doctor_info.freeConsult", "免费义诊");
            lang.pauseConsult = i18nService.get("doctor_info.pauseConsult", "暂停咨询");
            lang.noSchedule = i18nService.get("doctor_info.noSchedule", "暂无排班");
            lang.paySchedule = i18nService.get("doctor_info.paySchedule", "咨询时段");
            lang.notOnSchedule = i18nService.get("doctor_info.notOnSchedule", "暂未开诊");
        }

	    /**
         * 将咨询医生的数据 根据诊后价格设置
	     */
	    function setConsultationConsulted(con){
            var lang = con.lang;
            if (con.imState === 2){  //图文咨询
                con.imRealPrice = lang.pauseConsult;
            } else if (con.imState === 1 || con.imState === 5){
                con.isShowImOriPrice = true;
                con.priceIm = lang.oriPrice + (con.imPrice || 0) + lang.unit2;  //展示在页面的原价位置的内容
                if (con.imPrice === 0 || con.imPrice == con.imPreferentialPrice) { //当原价为0 或者是原价折后价一样的时候 只显示一行文字 即诊后的价格文字
                    con.isShowImOriPrice = false;
                }
                if (imFree === 1 || parseFloat(con.imPreferentialPrice) === 0){   //是否免费
                    con.imRealPrice = lang.freeConsult;
                    $scope.consultation.imIsFree = 1;
                } else {
                    $scope.consultation.imIsFree = 0;
                    if(con.imAutoFinishTime > 0){
                        con.imRealPrice = con.imPreferentialPrice + lang.unit3 + con.imAutoFinishTime/3600 +lang.unit4;
                    }else{
                        con.imRealPrice = con.imPreferentialPrice + lang.unit1;
                    }
                    //con.imRealPrice = con.imPreferentialPrice + lang.unit1;
                }
                con.imIsFull ? (con.imRealPrice = lang.isFull) : angular.noop();
            } else { //con.imState 为0或者其他
                con.imRealPrice = lang.notOpen;
            }

            switch(con.phoneState){
                case 1:
                case 5:
                    con.isShowPhoneOriPrice = true;  //是否展示原价
                    con.pricePhone = lang.oriPrice + (con.phonePrice || 0) + lang.unit2;   //原价
                    if (con.phonePrice === 0 || con.phonePrice == con.phonePreferentialPrice) { //当原价为0 或者是原价折后价一样的时候 只显示一行文字 即诊后的价格文字
                        con.isShowPhoneOriPrice = false;
                    }
                    if (phoneFree === 1 || parseFloat(con.phonePreferentialPrice) === 0){  //免费标识，诊后价格为0也是免费
                        con.phoneRealPrice = lang.freeConsult;
                        $scope.consultation.phoneIsFree = 1;
                    } else {
                        $scope.consultation.phoneIsFree = 0;
                        con.phoneRealPrice = con.phonePreferentialPrice + lang.unit1;
                    }
                    con.phoneIsFull ? (con.phoneRealPrice = lang.isFull) : angular.noop();
                    
                    break;
                case 2:
                    con.phoneRealPrice = lang.pauseConsult;//价格的位置展示"暂未开诊"
                    break;
                case 3:
                    con.phoneRealPrice = lang.notOnSchedule;
                    con.pricePhone = lang.paySchedule;
                    con.isShowPhoneOriPrice = true;
                    break;
                case 4:
                    con.phoneRealPrice = lang.notOnSchedule;
                    break;
                default:  
                    con.phoneRealPrice = lang.notOpen;
            }

            switch(con.videoState){
                case 1:
                case 5:
                    con.isShowVideoOriPrice = true;
                    con.priceVideo = lang.oriPrice + (con.videoPrice || 0) + lang.unit2;
                    if (con.videoPrice === 0 || con.videoPrice == con.videoPreferentialPrice) { //当原价为0 或者是原价折后价一样的时候 只显示一行文字 即诊后的价格文字
                        con.isShowVideoOriPrice = false;
                    }
                    if (videoFree === 1 || parseFloat(con.videoPreferentialPrice) === 0) {
                        con.videoRealPrice = lang.freeConsult;
                        $scope.consultation.videoIsFree = 1;
                    } else {
                        $scope.consultation.videoIsFree = 0;
                        con.videoRealPrice = con.videoPreferentialPrice + lang.unit1;
                    }
                    con.videoIsFull ? (con.phoneRealPrice = lang.isFull) : angular.noop();
                    break;
                case 2:
                    con.videoRealPrice = lang.pauseConsult;
                    break;
                case 3:
                    con.videoRealPrice = lang.notOnSchedule;
                    con.priceVideo = lang.paySchedule;
                    con.isShowVideoOriPrice = true;
                    break;
                case 4:
                    con.videoRealPrice = lang.notOnSchedule;
                    break;
                default:  //con.videoState 为0或者其他
                    con.videoRealPrice = lang.notOpen;
            }
        }
        function isWeiXin(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                return true;
            }else{
                return false;
            }
        }
	    /**
         * 将咨询医生功能价格按照诊前价格设置
	     * @param con
	     */
	    function setConsultationUnConsulted(con){
            var lang = con.lang;
            if (con.imState === 2){  //图文咨询
                con.imRealPrice = lang.pauseConsult;
            } else if (con.imState === 1 || con.imState === 5){
                if(con.imPrice === 0){
                    con.imIsFree = 1;
                }
                //判断医生是否设置在线咨询时长并对应显示
                if(con.imAutoFinishTime > 0){
                    con.imRealPrice = con.imIsFree === 1 ? lang.freeConsult : con.imPrice + lang.unit3 + con.imAutoFinishTime/3600 +lang.unit4;
                }else{
                    con.imRealPrice = con.imIsFree === 1 ? lang.freeConsult : con.imPrice + lang.unit1;
                }
                /*con.imRealPrice = con.imIsFree === 1 ? lang.freeConsult : con.imPrice + lang.unit1;*/
                con.imIsFull ? (con.imRealPrice = lang.isFull) : angular.noop();
            } else { //con.imState 为0或者其他
                con.imRealPrice = lang.notOpen;
            }

            switch(con.phoneState){
                case 1:
                case 5:
                    if(con.phonePrice === 0){
                        con.phoneIsFree = 1;
                    }
                    con.phoneRealPrice = con.phoneIsFree === 1 ? lang.freeConsult : con.phonePrice + lang.unit1;
                    con.phoneIsFull ? (con.phoneRealPrice = lang.isFull) : angular.noop();
                    break;
                case 2:
                    con.phoneRealPrice = lang.pauseConsult;
                    break;
                case 3:
                    con.phoneRealPrice = lang.notOnSchedule;
                    con.pricePhone = lang.paySchedule;
                    con.isShowPhoneOriPrice = true;
                    break;
                case 4:
                    con.phoneRealPrice = lang.notOnSchedule;
                    break;
                default: //con.phoneState 为0或者其他
                    con.phoneRealPrice = lang.notOpen;
            }

            switch(con.videoState){  //视频咨询
                case 1:
                case 5:
                    if(con.videoPrice === 0){
                        con.videoIsFree = 1;
                    }
                    con.videoRealPrice = con.videoIsFree === 1 ? lang.freeConsult : con.videoPrice + lang.unit1;
                    con.videoIsFull ? (con.videoRealPrice = lang.isFull) : angular.noop();
                    break;
                case 2:
                    con.videoRealPrice = lang.pauseConsult;
                    break;
                case 3:
                    con.videoRealPrice = lang.notOnSchedule;
                    con.priceVideo = lang.paySchedule;
                    con.isShowVideoOriPrice = true;
                    break;
                case 4:
                    con.videoRealPrice = lang.notOnSchedule;
                    break;
                default: //con.phoneState 为0或者其他
                    con.videoRealPrice = lang.notOpen;
            }
        }

        /**
         * 描述：根据咨询类型选择需要跳转的页面
         * 作者：侯蕊
         * @param consultType
         */
        function goConsult(consultType) {
            var con = $scope.consultation,
                free;
            switch(consultType){
                case 1 :
                    //if(con.imState === 1 && !con.imIsFull){
                    if((con.imState === 1 || con.imState === 5) && !con.imIsFull){
                        con.choosedItem = consultType;
                        con.payAmount = con.imIsFree === 1 ? 0 : (con.isConsulted ? con.imPreferentialPrice : con.imPrice);
                        free = con.imIsFree === 1;
                        goToAddInformation(consultType, con.payAmount, free, con.imPrice, con.imPreferentialPrice);

                    }
                    break;
                case 2 :
                    //if(con.phoneState === 1 && !con.phoneIsFull){
                    if((con.phoneState === 1 || con.phoneState === 5) && !con.phoneIsFull){
                        con.choosedItem = consultType;
                        con.payAmount = con.phoneIsFree === 1 ? 0 : (con.isConsulted ? con.phonePreferentialPrice : con.phonePrice);
                        free = con.phoneIsFree === 1;
                        goToAddInformation(consultType, con.payAmount, free, con.phonePrice, con.phonePreferentialPrice);
                    } else if (con.phoneState === 3){
                        $scope.openPaySchedule(consultType);
                    }
                    break;
                case 3 :
                    //if(con.videoState === 1 && !con.videoIsFull){
                    if((con.videoState === 1 || con.videoState === 5) && !con.videoIsFull){
                        if(window.device && (window.device.platform == "iOS"||window.device.platform == "Android")){
                            con.choosedItem = consultType;
                            con.payAmount = con.videoIsFree === 1 ? 0 : (con.isConsulted ? con.videoPreferentialPrice : con.videoPrice);
                            free = con.videoIsFree === 1;
                            goToAddInformation(consultType, con.payAmount, free, con.videoPrice, con.videoPreferentialPrice);
                        }else {
                            KyeeMessageService.message({
                                tapBgToClose : true,
                                title: "温馨提示",
                                okText: "我知道了",
                                content: '您的版本暂不支持视频咨询功能，下载最新版趣医院APP给您更优质的服务。'
                            });
                        }
                    } else if (con.videoState === 3){
                        $scope.openPaySchedule(consultType);
                    }
                    break;
            }
        }
	    /**
         * 点击 咨询医生 下面的任意一个功能
         * consultType: 1-图文咨询; 2-电话咨询; 3-视频咨询
	     * @param consultType
	     */
        $scope.chooseConsultItem = function(consultType){

            FilterChainInvoker.invokeChain({
                id: "USER_LOGIN_FILTER",
                token: "img_text_detail",
                onFinash: function () {
                    $state.go("doctor_info");
                }
            });
            if(!loginFalg){
                return;
            }
            if(consultType == '3' && !(window.device && (window.device.platform == "iOS"||window.device.platform == "Android"))){
                KyeeMessageService.message({
                    tapBgToClose : true,
                    title: "温馨提示",
                    okText: "我知道了",
                    content: '您的版本暂不支持视频咨询功能，下载最新版趣医院APP给您更优质的服务。'
                });
                return;
            }
            if(consultType == '1'){
                judgeAndLoginRl();
                localStorage.setItem("noMatch","false");
                var getClickDoc = localStorage.getItem("noMatch");
                var dbError = localStorage.getItem("dbError");
                if(getClickDoc == "false" && dbError == "false"){
                    if(isWeiXin()){
                        KyeeMessageService.confirm({
                            title: "温馨提示",
                            content: "当前微信版本可能会造成收发消息不稳定，请下载最新版的趣医院APP。",
                            okText:"确定",
                            cancelText: "继续咨询",
                            onSelect: function (res) {
                                if (res) {

                                    window.location.href="https://app.quyiyuan.com/APP/mobileweb/mobiledownload.html";
                                }else{
                                    if(imState == 1){
                                        goConsult(consultType);
                                    }else if(imState == 5){
                                        if(isSecondVisitPatient){
                                            goConsult(consultType);
                                        }else{
                                            KyeeMessageService.message({
                                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                okText: KyeeI18nService.get("commonText.iknowMsg", "确定"),
                                                content: "医生仅对复诊患者提供咨询服务。"
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    }else{
                        KyeeMessageService.confirm({
                            title: "温馨提示",
                            content: "当前版本可能会造成收发消息不稳定，请下载最新版的趣医院APP。",
                            okText:"确定",
                            cancelText: "继续咨询",
                            onSelect: function (res) {
                                if (res) {

                                    window.location.href="https://app.quyiyuan.com/APP/mobileweb/mobiledownload.html";
                                }else{
                                    if(imState == 1){
                                        goConsult(consultType);
                                    }else if(imState == 5){
                                        if(isSecondVisitPatient){
                                            goConsult(consultType);
                                        }else{
                                            KyeeMessageService.message({
                                                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                                                okText: KyeeI18nService.get("commonText.iknowMsg", "确定"),
                                                content: "医生仅对复诊患者提供咨询服务。",
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    }

                }else if(imState == 1){
                    //如果医院配置了咨询条款那么点击模块即弹框，确认之后跳转
                    if($scope.consultTips != undefined && $scope.consultTips != null) {
                        $scope.dialog = KyeeMessageService.dialog({
                            tapBgToClose : true,
                            template: "modules/business/appointment/views/appointment_doctor_detail/consult_tips.html",
                            scope: $scope,
                            title: KyeeI18nService.get("consult_tips.title","咨询医生小贴士"),
                            buttons: [{
                                style:'button-size-l',
                                text: KyeeI18nService.get("apply_cash.back","确认"),
                                click: function () {
                                    $scope.dialog.close();
                                    goConsult(consultType);
                                }
                            }]
                        });
                    }else{
                        goConsult(consultType);
                    }
                }else if(imState == 5){
                    if(isSecondVisitPatient){
                        //goConsult(consultType);
                        //如果医院配置了咨询条款那么点击模块即弹框，确认之后跳转
                        if($scope.consultTips != undefined && $scope.consultTips != null) {
                            $scope.dialog = KyeeMessageService.dialog({
                                tapBgToClose : true,
                                template: "modules/business/appointment/views/appointment_doctor_detail/consult_tips.html",
                                scope: $scope,
                                title: KyeeI18nService.get("consult_tips.title","咨询医生小贴士"),
                                buttons: [{
                                    style:'button-size-l',
                                    text: KyeeI18nService.get("apply_cash.back","确认"),
                                    click: function () {
                                        $scope.dialog.close();
                                        goConsult(consultType);
                                    }
                                }]
                            });
                        }else{
                            goConsult(consultType);
                        }
                    }else{
                        KyeeMessageService.message({
                            title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                            okText: KyeeI18nService.get("commonText.iknowMsg", "确定"),
                            content: "医生仅对复诊患者提供咨询服务。"
                        });
                    }
                }
            }else if((consultType == 2 && phoneState == 5) || (consultType == 3 && videoState == 5)) {
                if(isSecondVisitPatient){
                    //goConsult(consultType);
                    //如果医院配置了咨询条款那么点击模块即弹框，确认之后跳转
                    if($scope.consultTips != undefined && $scope.consultTips != null) {
                        $scope.dialog = KyeeMessageService.dialog({
                            tapBgToClose : true,
                            template: "modules/business/appointment/views/appointment_doctor_detail/consult_tips.html",
                            scope: $scope,
                            title: KyeeI18nService.get("consult_tips.title","咨询医生小贴士"),
                            buttons: [{
                                style:'button-size-l',
                                text: KyeeI18nService.get("apply_cash.back","确认"),
                                click: function () {
                                    $scope.dialog.close();
                                    goConsult(consultType);
                                }
                            }]
                        });
                    }else{
                        goConsult(consultType);
                    }
                }else{
                    KyeeMessageService.message({
                        title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                        okText: KyeeI18nService.get("commonText.iknowMsg", "确定"),
                        content: "医生仅对复诊患者提供咨询服务。"
                    });
                }
            }else{
                //如果医院配置了咨询条款那么点击模块即弹框，确认之后跳转
                if($scope.consultTips != undefined && $scope.consultTips != null) {
                    $scope.dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/appointment/views/appointment_doctor_detail/consult_tips.html",
                        scope: $scope,
                        title: KyeeI18nService.get("consult_tips.title","咨询医生小贴士"),
                        buttons: [{
                            style:'button-size-l',
                            text: KyeeI18nService.get("apply_cash.back","确认"),
                            click: function () {
                                $scope.dialog.close();
                                goConsult(consultType);
                            }
                        }]
                    });
                }else {
                    goConsult(consultType);
                }
            }
        };

        /**
         * [goToAddInfo 跳转至添加信息页面辅助方法]
         * by jiangpin
         * @param  {[number]}  consultType [付费咨询类型]
         * @param  {[number]}  payAmount   [需支付的金额]
         * @param  {[boolean]} free        [是否免费]
         * @param  {[number]} beforeAmount [诊前价格]
         * @param  {[number]} afterAmount  [诊后价格]
         */
        function goToAddInfo(consultType, payAmount, free, beforeAmount, afterAmount, doctorInfo, con, contentReminder){
            AddInformationService.consultParam = {
                free: free,                           //是否免费 [Boolean]
                beforeConsultAmount: beforeAmount,    //诊前价格 [Number]
                afterConsultAmount: afterAmount,      //诊后价格 [Number]
                payAmount: payAmount,                 //需支付金额 [Number]
                hospitalId: doctorInfo.HOSPITAL_ID,   //医院id [Number]
                deptCode: doctorInfo.DEPT_CODE,       //医生科室code [String]
                doctorCode: doctorInfo.DOCTOR_CODE,   //医生code [String]
                consultType: consultType,             //付费咨询类型 [Number]
                isRegular: con.isConsulted,           //是否就诊过 [Boolean]
                doctorName: doctorInfo.DOCTOR_NAME,   //医生姓名 [String]
                isOnline: $scope.NETWORK_CLINIC == '1' ? "1" : undefined,  //补充信息页面 切换就诊者会使用到
                reminder: contentReminder,
                isOpenShare: con.isOpenShare ,//是否支持抢单
                deptName : doctorInfo.DEPT_NAME,
                shareReminder:con.shareReminder//抢单提示语
            };
            $state.go("add_information");
        }
        /**
         * [goToAddInformation 跳转至添加信息页面]
         * @param  {[number]}  consultType [付费咨询类型]
         * @param  {[number]}  payAmount   [需支付的金额]
         * @param  {[boolean]} free        [是否免费]
         * @param  {[number]} beforeAmount [诊前价格]
         * @param  {[number]} afterAmount  [诊后价格]
         */
        function goToAddInformation(consultType, payAmount, free, beforeAmount, afterAmount){
		    var doctorInfo = $scope.pageData,
                con = $scope.consultation;
		    //by jiangpin 任务号：KYEEAPPC-11834 在线咨询提示语获取
            var contentReminder = '';
            var param = doctorInfo.HOSPITAL_ID;
            switch(consultType){
                case 1 :
                    //获取后台图文咨询资料填写提示语
                    AddInformationService.chooseImReminder(param, function(response){
                        if(response.success && response.data){
                            contentReminder = response.data.reminder;
                        }else{
                            contentReminder = '详细描述病情以便医生接诊，咨询期间不限交流次数。';
                        }
                        goToAddInfo(consultType, payAmount, free, beforeAmount, afterAmount, doctorInfo, con, contentReminder);
                        // judgeAndLoginRl(); //判断一次是否登录了荣联
                    });
                    break;
                case 2 :
                    //获取后台电话咨询资料填写提示语
                    AddInformationService.choosePhoneReminder(param, function(response){
                        if(response.success && response.data){
                            contentReminder = response.data.reminder;
                        }else{
                            contentReminder = '请详细描述病情，方便医生接诊与指导。';
                        }
                        goToAddInfo(consultType, payAmount, free, beforeAmount, afterAmount, doctorInfo, con, contentReminder);
                    });
                    break;
                case 3 :
                    //获取后台视频咨询资料填写提示语
                    AddInformationService.chooseVideoReminder(param, function(response){
                        if(response.success && response.data){
                            contentReminder = response.data.reminder;
                        }else{
                            contentReminder = '请详细描述病情，方便医生接诊与指导。';
                        }
                        goToAddInfo(consultType, payAmount, free, beforeAmount, afterAmount, doctorInfo, con, contentReminder);
                    });
                    break;
            }
        }

        /**
         * [openPaySchedule 展示电话或视频排班]
         * @param  {[type]} consultType [description]
         * @return {[type]}             [description]
         */
        $scope.openPaySchedule = function(consultType){
            var doctorInfo = $scope.pageData,
                param = {
                    hospitalId: doctorInfo.HOSPITAL_ID,
                    doctorCode: doctorInfo.DOCTOR_CODE,
                    deptCode: doctorInfo.DEPT_CODE,
                    consultType: consultType
                };
            DoctorConsultationService.getPhoneOrVideoSchedule(param, function(response){
                if(response.success){
                    $scope.paySchedule = response.data.durationList;
                    $scope.isShowSchedule = true;
                    $scope.phoneVideoClass = "enter_in";
                    $timeout(function(){
                        document.getElementById("paySchedule-header").scrollIntoView();
                    }, 200);
                }
            });
            
        };

        /**
         * 隐藏排班
         */
        $scope.cancelPaySchedule = function(){
            $scope.phoneVideoClass = "leave";
            $timeout(function(){
                $scope.isShowSchedule = false;
            }, 500);
        };

        /**
         * 判断用户有没有登录荣联，若是没有登录，则调登录方法登录
         */
        function judgeAndLoginRl(){
            var yxLoginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
            //容联连接状态异常,若没有登录容联参数，调用病友圈服务器获取参数 add by wyn 20160813
            if(!yxLoginInfo){
                LoginService.getIMLoginInfo();
            }
        }

    })
    .build();

