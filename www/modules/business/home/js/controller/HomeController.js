new KyeeModule()
    .group("kyee.quyiyuan.home.controller")
    .require([
        "kyee.quyiyuan.home.user.service",
        "kyee.quyiyuan.multiplequery.multiplequery.controller",
        "kyee.quyiyuan.multiplequery.multiplequerycity.controller",
        "kyee.quyiyuan.appointment.controller",
        "kyee.quyiyuan.callforhelp.callAmbulance.controller",
        "kyee.quyiyuan.callforhelp.callAmbulance.service",
        "kyee.quyiyuan.home.service",
        "kyee.quyiyuan.home.noticeCenter.service",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.queue.clinic.service",
        "kyee.quyiyuan.myWallet.clinicPayment.service",
        "kyee.quyiyuan.report_multiple.service",
        // KYEEAPPC-3461 现版本院内导航接口 by 杜巍巍  begin
        "kyee.quyiyuan.hospitalNavigation.service",
        // KYEEAPPC-3461 新版本院内导航接口 by 杜巍巍   end
        "kyee.quyiyuan.navigationOut.service",
        "kyee.quyiyuan.nearbyHospital.controller",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.notice.controller",
        "kyee.quyiyuan.messagecenter.multiplequery.service",
        "kyee.quyiyuan.myWallet.clinicPaid.service",
        "kyee.quyiyuan.home.selectDate.controller",
        "kyee.quyiyuan.home.homeWebNoTitleController.controller",
        //广告web链接页面
        "kyee.quyiyuan.home.homeWeb.controller",
        //广告html页面
        "kyee.quyiyuan.home.homeHtml.controller",
        "kyee.quyiyuan.operation_monitor.service",
        "kyee.quyiyuan.center.service",
        "kyee.quyiyuan.patients_group.message.controller",
        "kyee.quyiyuan.medicalRecordController.controller",
        "kyee.quyiyuan.center.medicalRecord.service",
        "kyee.quyiyuan.myWallet.clinicPaymentReviseHos.controller",
        "kyee.quyiyuan.home.service_satisfaction.controller"
    ])
    .type("controller")
    .name("HomeController")
    .params(["$rootScope", "CenterService","$interval", "$scope", "$state", "$timeout","ReportMultipleService", "HospitalSelectorService", "UserFilterDef", "CacheServiceBus", "FilterChainInvoker",
        "HomeUserService", "MultipleQueryCityService", "KyeeMessageService", "$ionicPopover", "HomeService",
        "KyeeListenerRegister", "NoticeCenterService", "PayOrderService", "HospitalService",
        "AppointmentRegistDetilService", "QueueClinicService", "ClinicPaymentService",  "HospitalNavigationService",
        "HttpServiceBus", "KyeeActionHolderDelegate", "NavigationOutService", "MessageCenterService", "AppointmentDeptGroupService", "KyeeUtilsService",
        "MultipleQueryService", "KyeeI18nService","ClinicPaidMessageService","OperationMonitor","$ionicScrollDelegate","ClinicPaymentReviseService",
        "PatientsGroupMessageService","CustomPatientService","CallAmbulanceService","MedicalRecordService","HealthService"])
    .action(function ($rootScope,CenterService, $interval, $scope, $state, $timeout,ReportMultipleService, HospitalSelectorService, UserFilterDef, CacheServiceBus, FilterChainInvoker,
                      HomeUserService, MultipleQueryCityService, KyeeMessageService, $ionicPopover, HomeService,
                      KyeeListenerRegister, NoticeCenterService, PayOrderService, HospitalService,
                      AppointmentRegistDetilService, QueueClinicService, ClinicPaymentService, HospitalNavigationService,
                      HttpServiceBus, KyeeActionHolderDelegate, NavigationOutService, MessageCenterService, AppointmentDeptGroupService, KyeeUtilsService,
                      MultipleQueryService, KyeeI18nService,ClinicPaidMessageService,OperationMonitor,$ionicScrollDelegate,ClinicPaymentReviseService,
                      PatientsGroupMessageService,CustomPatientService,CallAmbulanceService,MedicalRecordService,HealthService) {

        KyeeListenerRegister.regist({
            focus: "home->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            direction: "both",
            action: function (params) {
                //离开页面时停止播放医院广告
                if ($scope.stopSlideboxImage != undefined) {
                    $scope.stopSlideboxImage();
                }
            }
        });
        //是否开启亳州就医记录
        $scope.bzMediacalRecord = false;
        //默认关闭就医陪诊
        $scope.withDiagnosis = false;
        



        //图片宽高比 498/1242  最大适配到6puls
        if(window.innerWidth<414){
            $scope.imgHeight = window.innerWidth*(498/1242) + 'px';
        }else{
            $scope.imgHeight = 414*(498/1242) + 'px';
        }
        var isIOS = window.ionic.Platform.isIOS();
        var tmpHeight = (window.innerHeight - 44 -52 - parseInt($scope.imgHeight))/4;
        if(isIOS){
            tmpHeight = (window.innerHeight - 44 - 20 -52 - parseInt($scope.imgHeight))/4;
        }
        $scope.moduleHeight = tmpHeight < 80 ? 80 : tmpHeight; //内容高度四个模块自适应满屏处理
        //分支版本号
        $scope.branchVerCode=DeploymentConfig.BRANCH_VER_CODE;
        //内容是否加载完成
        $scope.isContented = false;
        //是否被按下
        $scope.pressed = false;
        $scope.pressed1 = false;
        //默认禁用网络医院
        $scope.netHospital = 'disabled';

        //默认开启护士咨询
        $scope.cusService=true;
        //默认趣护总开关开启
        $scope.quhuIsopen=true;
        //是否可选医院
        $scope.canBeSelect = !HospitalService.isHospitalSelecterBtnDisabled;
        //是否开启病友圈
        $scope.patientsGroupIsOpen = true;
        CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH, $scope.patientsGroupIsOpen);
        //缓存
        var storage = CacheServiceBus.getStorageCache();
        if (storage.get('bellPosition')) {
            var position = storage.get('bellPosition');
            //取缓存中小铃铛位置
            $scope.bellLeft = position.left;
            //取缓存中小铃铛位置
            $scope.bellTop = position.top;
            //设置弹出页面方向
            if ($scope.bellLeft == 0) {
                $scope.msgDirection = 'left';
            } else {
                $scope.msgDirection = 'right';
            }
        } else {
            //默认位置
            $scope.bellLeft = 0;
            //默认位置
            $scope.bellTop = 430;
            //默认向左弹出
            $scope.msgDirection = 'left';
        }
        if (storage.get('bellPosition1')) {
            var position1 = storage.get('bellPosition1');
            //取缓存中小铃铛位置
            $scope.bellLeft1 = position1.left;
            //取缓存中小铃铛位置
            $scope.bellTop1 = position1.top;
        } else {
            //默认位置
            $scope.bellLeft1 = window.innerWidth - 136;
            //默认位置
            $scope.bellTop1 = 300;

        }
        //初始化首页广告
        var homeAdv = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOME_ADV);
        if(homeAdv){
            $scope.slideboxData = homeAdv;
        }else{
            HomeService.loadHomeAdv(function(data){
                $scope.slideboxData = data;
            });
        }

        /**
         * 医院广告方法绑定
         *
         * @param params
         */
        $scope.bindSlideboxImageActions = function (params) {
            $scope.updateSlideboxImage = params.update;
            $scope.playSlideboxImage = params.play;
            $scope.stopSlideboxImage = params.stop;
        };
        //跳转广告页面
        $scope.viewHospitalDetail = function (params) {
            if(DeploymentConfig.BRANCH_VER_CODE!='00'){return;}
            homePageAdvCount(params);

           if(params.item.adv_class == 2){
                // 保险广告
                HomeService.openInsurancePage();
            } else if(params.item.web_url){
               HomeService.ADV_DATA = {
                   ADV_LOCAL: params.item.web_url,
                   ADV_NAME: params.item.adv_name,
                   ADV_SHARE: params.item.adv_share
               };
               if(params.item.adv_share){
                   HomeService.ADV_DATA.ADV_SHARE_TITLE = params.item.adv_share_title;
                   HomeService.ADV_DATA.ADV_SHARE_DESC = params.item.adv_share_desc;
               }

               $state.go('homeWeb');
            }else{
               HomeService.ADV_DATA = {
                   ADV_NAME: params.item.adv_name,
                   ADV_ID: params.item.id
               };
                $state.go('homeHtml');
            }
        };

        //跳转陪诊页面
        $scope.withTheDiagnosis = function(){
            if(DeploymentConfig.BRANCH_VER_CODE=='54'){//健康马鞍山
                KyeeMessageService.broadcast({
                    content: "此功能暂未开放"
                });
                return;
            }
            var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
            if(loginFalg){
                HomeService.withTheDiagnosis = 1;
                $state.go('homeWeb');
            }else{
                $state.go("login");
            }
        };

        //跳转在线咨询页面
        $scope.withTheCusService = function(){
            var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
            if(loginFalg){
                HomeService.withTheDiagnosis = 2;
                $state.go('homeWeb');
            }else{
                $state.go("login");
            }
        };

        /**
         * yangmingsi KYEEAPPC-5252
         * 任务描述：C端首页图片点击统计
         * 时间：2016年3月1日11:30:00
         */
        var homePageAdvCount = function (params) {
            if(params && params.item && params.item.url){
                var strArr = params.item.url.split("/");
                var strUrl = strArr[strArr.length - 1];
                var imgUrl = strUrl.split(".")[0];
                OperationMonitor.record(imgUrl,"home->MAIN_TAB");
            }
            OperationMonitor.record("viewHospitalDetail","home->MAIN_TAB");
        };
        //初始化 hospital 缓存数据
        HomeService.init();

        $scope.notices = [];
        //注册、注销、切换就诊者回调显示提醒
        var timer = undefined;
        //挂号日期
        $scope.selDateStr = '';
        var calendarSelect = undefined;
        /**
         * 日历选择方法绑定
         * @param params
         */
        $scope.bindCalendar = function (params) {
            calendarSelect = params;
        };
        //显示日历控件
        $scope.showDate = function () {
            var selectDate = KyeeUtilsService.DateUtils.parse($scope.selDateStr, 'YYYY/MM/DD');
            calendarSelect.show({
                year: selectDate.getFullYear(),
                month: selectDate.getMonth() + 1,
                day: selectDate.getDate()
            });
        };

        /**
         * 清空C端首页所选时间
         */
        $scope.clearDate = function () {
            $scope.selDateStr = "";
            HomeService.selDateStr = "";
        };

        //日历控件选择
        $scope.selectDate = function (param) {
            var month = param.month, day = param.day, selDateStr = '';
            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            selDateStr = param.year + '/' + month + '/' + day;
            if (selDateStr < KyeeUtilsService.DateUtils.getDate('YYYY/MM/DD')) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('home->MAIN_TAB.onlySupportAfterToday', '只支持今天及以后的日期', null)
                });
                return;
            }
            $scope.selDateStr = selDateStr;
            HomeService.selDateStr = selDateStr;
            return true;
        };
        //预约挂号时间重置为当前时间段
        $scope.selCurrentDate = function () {
            $scope.selDateStr = KyeeUtilsService.DateUtils.getTime('YYYY/MM/DD');
            HomeService.selDateStr = $scope.selDateStr;
        };
        NoticeCenterService.loadNoticeSucess = function (data, flag) {
            $interval.cancel(timer);
            var maxTime = 0;
            $scope.notices = [];
            if (data.rows.length > 0) {
                for (var i = 0; i < data.rows.length; i++) {
                    var msg = data.rows[i];
                    //格式化时间
                    msg.CREATE_DATE = KyeeUtilsService.DateUtils.formatFromString(
                        msg.CREATE_DATE, 'YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD HH:mm:ss');

                    //获取COUNT_DOWN的最大值
                    if (msg.MESSAGE_ID != '0') {
                        if (msg.COUNTDOWN_FLAG == '1' && msg.COUNT_DOWN > 0) {
                            maxTime = msg.COUNT_DOWN > maxTime ? msg.COUNT_DOWN : maxTime;
                            //首次初始化
                            var minute = Math.floor(msg.COUNT_DOWN / (60)) % 60;//分钟
                            var second = Math.floor(msg.COUNT_DOWN) % 60;//秒
                            var divStr = '<div>' + msg.MESSAGE_DESCRIPTION + '</div>';
                            var div = angular.element(divStr);
                            var spans = div.find("span");
                            var span = spans.length > 0 ? spans[0] : null;
                            if (span != null) {
                                if (second < 10) {
                                    second = '0' + second;
                                }
                                span.innerHTML = minute + ':' + second;
                            }
                            msg.MESSAGE_DESCRIPTION = div[0].innerHTML;
                        }
                    }
                    $scope.notices.push(msg);
                }
            }
            if (maxTime > 0) {
                timer = $interval(function () {
                        maxTime -= 1;
                        setTime();
                    },
                    1000);
            } else {
                $interval.cancel(timer);
            }
            //点击小铃铛则打开消息页面
            if (flag) {
                //注册物理返回键事件
                KyeeListenerRegister.once({
                    when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
                    action: function (params) {
                        params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                        $scope.hideOverlay();
                    }
                });
                angular.element(document.getElementById("tabbar")).css("display", "none");
                $scope.showOverlay();
            }

            $scope.$broadcast('scroll.refreshComplete');
        };
        //设置时钟更新页面
        var setTime = function () {
            for (var i = 0; i < $scope.notices.length; i++) {
                var count_down_flag = $scope.notices[i].COUNTDOWN_FLAG;
                var count_down = $scope.notices[i].COUNT_DOWN;
                if (count_down_flag == '1') {
                    count_down -= 1;
                    $scope.notices[i].COUNT_DOWN = count_down;
                    var minute = Math.floor(count_down / (60)) % 60;//分钟
                    var second = Math.floor(count_down) % 60;//秒
                    if ($state.current.name == 'home->MAIN_TAB') {
                        var divStr = '<div>' + $scope.notices[i].MESSAGE_DESCRIPTION + '</div>';
                        var div = angular.element(divStr);
                        var spans = div.find("span");
                        var span = spans.length > 0 ? spans[0] : null;
                        if (span != null) {
                            if (count_down > 0) {
                                if (second < 10) {
                                    second = '0' + second;
                                }
                                span.innerHTML = minute + ':' + second;
                            } else {
                                span.innerHTML = '00:00';
                            }
                        }
                        $scope.notices[i].MESSAGE_DESCRIPTION = div[0].innerHTML;
                    }
                }
            }
        };
        //离开页面销毁timer
        KyeeListenerRegister.regist({
            focus: "home->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.LEAVE,
            action: function (params) {
                $interval.cancel(timer);
            }
        });

        //根据id删除公告，移除scope绑定的信息
        $scope.delNotice = function (msgId) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get('commonText.confirmTitle', '温馨提示', null),
                content: KyeeI18nService.get('home->MAIN_TAB.sureDelete', '您确认要删除？', null),
                onSelect: function (ok) {
                    if (ok) {
                        var param = {};
                        param.msgId = msgId;
                        NoticeCenterService.delNotice(param, function () {
                            for (var i = 0; i < $scope.notices.length; i++) {
                                if ($scope.notices[i].MESSAGE_ID == msgId) {
                                    $scope.notices.splice(i, 1);
                                    break;
                                }
                            }
                            //如果最后一条提醒删除，则请求数据
                            if ($scope.notices.length == 0) {
                                NoticeCenterService.loadNotice();
                            }
                        });
                    }
                }
            });
        };
        //跳转提醒的查看详情
        $scope.noticeLookMore = function (msgId, urlFlag) {
            $scope.hideOverlay();
            //urlFlag 为了适应点击div查看详情
            if (urlFlag == 1) {
                var msg;
                for (var i = 0; i < $scope.notices.length; i++) {
                    if ($scope.notices[i].MESSAGE_ID == msgId) {
                        msg = $scope.notices[i];
                        break;
                    }
                }
                var params = JSON.parse(msg.URL_PARAMETER);
                var RECORD = {};
                switch (msg.MESSAGE_TYPE) {
                    case '1'://预约缴费提醒
                        RECORD.HOSPITAL_ID = params.HOSPITAL_ID;
                        RECORD.REG_ID = params.REG_ID;
                        AppointmentRegistDetilService.RECORD = RECORD;
                        $state.go('appointment_regist_detil');
                        break;
                    case '2' ://排队叫号
                        QueueClinicService.doSetQueueClinicParams(params);
                        HomeService.goQueueView($state);
                        //$state.go('queue_clinic');
                        break;
                    case '3'://门诊待缴费
                        //程铄闵 KYEEAPPC-6170 门诊缴费记录(2.2.20)
                        ClinicPaymentReviseService.isMedicalInsurance('1',function (route) {
                            if(route == 'clinicPayment'){
                                ClinicPaymentService.HOSPITALID_TREE = params.HOSPITAL_ID;
                            }
                            else{
                                ClinicPaymentReviseService.HOSPITALID_TREE = params.HOSPITAL_ID;
                                ClinicPaymentReviseService.fromRecordHospitalId = params.HOSPITAL_ID;
                            }
                            $state.go(route);
                        });
                        break;
                    case '4'://报告单已出提醒
                        //报告单跨院，页面不区分检查检验单，路由跳往一个页面。KYEEAPPC-4047  修改：张明   2015.11.25
                        if (msg.URL == 'KYMH.view.report.LabInfo') {
                            ReportMultipleService.IS_TAP_TAB = "REC";
                            $state.go('report_multiple');
                        } else if (msg.URL == 'KYMH.view.report.ExamInfo') {
                            ReportMultipleService.IS_TAP_TAB = "REC";
                            $state.go('report_multiple');
                        }
                        break;
                    case '5'://就诊提醒
                        RECORD.HOSPITAL_ID = params.HOSPITAL_ID;
                        RECORD.REG_ID = params.REG_ID;
                        AppointmentRegistDetilService.RECORD = RECORD;
                        $state.go('appointment_regist_detil');
                        break;
                    case '7'://缴费成功提醒 by 程铄闵 KYEEAPPC-3868
                        //详情增加多笔记录 程铄闵 KYEEAPPC-7609
                        var inParams = {
                            PLACE:'1',
                            ORDER_NO:params.ORDER_NO,
                            HOSPITAL_ID:params.HOSPITAL_ID
                        };
                        ClinicPaidMessageService.getPaidList($state,inParams);
                        break;
                }
            }
        };

        KyeeListenerRegister.regist({
            focus: "home->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                var userSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                $scope.userSource=userSource;
                var publicServiceType = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);

                KyeeUtilsService.conditionInterval({
                    time : 100,
                    conditionFunc : KyeeI18nService.getCurrLangName,
                    doFunc : function () {
                         //00:核心版本；01:114家；02:福建12320；03：我家亳州；04：健康河北；05：乐健康；
                        if(DeploymentConfig.BRANCH_VER_CODE == '00'){
                            //区分趣医APP用户和个性化APP用户
                            if (userSource == '0'&&(publicServiceType=='1001' || publicServiceType == '0' ||　publicServiceType == '')) {
                                $scope.appName = KyeeI18nService.get('home->MAIN_TAB.qyApp', '趣医院', null);
                            }
                            else {
                                $scope.appName = KyeeI18nService.get('home->MAIN_TAB.notQyApp', '掌上医院', null);
                            }
                        }else if(DeploymentConfig.BRANCH_VER_CODE == '03'){
                            $scope.bzMediacalRecord = true;
                            $scope.withDiagnosis = false;
                            $scope.appName = KyeeI18nService.get('home->MAIN_TAB.notQyApp', '看病挂号', null);
                        }else if(DeploymentConfig.BRANCH_VER_CODE == '54'){
                            $scope.appName = KyeeI18nService.get('home->MAIN_TAB.notQyApp', '健康马鞍山', null);
                        }else{
                            $scope.appName = KyeeI18nService.get('home->MAIN_TAB.notQyApp', '掌上医院', null);
                        }
                    }
                });

                setTimeout(function () {
                    $ionicScrollDelegate.$getByHandle().scrollTop();
                }, 100);
                if($scope.playSlideboxImage!=undefined){
                    $scope.playSlideboxImage();
                }
                //重置消息数量
                $rootScope.noticeNum = 0;
                $rootScope.unreadMessageCount = 0;

                //是否展示一键呼救
                HomeService.getUserLocationInfo(function(data){
                    MultipleQueryCityService.queryShowHelp(data.CITY_CODE, data.PLACE_CODE, function (data) {
                        $scope.showHelpAtOnce = data.ShowHelp;
                        $scope.$digest();
                    })
                });

                //首次同步医院相关数据
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if (hospitalInfo != null && hospitalInfo.id != null && hospitalInfo.id != "" && !HomeService.isSyncHospitalData) {
                    if(!hospitalInfo.level || (hospitalInfo.mainPageFlag===undefined || hospitalInfo.mainPageFlag === '')){
                        //老版缓存中没有医院等级
                        HomeService.getHospitalLevel(hospitalInfo.id, function(data){
                            hospitalInfo.level = data.HOSPITAL_LEVEL;
                            hospitalInfo.mainPageFlag = data.C_MAINPAGEFLAG;

                            HospitalSelectorService.selectHospitalAction(
                                hospitalInfo.id,
                                hospitalInfo.name,
                                hospitalInfo.address,
                                hospitalInfo.provinceCode,
                                hospitalInfo.provinceName,
                                hospitalInfo.cityCode,
                                hospitalInfo.cityName,
                                undefined,
                                function () {
                                },
                                hospitalInfo,
                                false,
                                true
                            );

                        });
                    }else{
                        HospitalSelectorService.selectHospitalAction(
                            hospitalInfo.id,
                            hospitalInfo.name,
                            hospitalInfo.address,
                            hospitalInfo.provinceCode,
                            hospitalInfo.provinceName,
                            hospitalInfo.cityCode,
                            hospitalInfo.cityName,
                            undefined,
                            function () {
                            },
                            hospitalInfo,
                            false,
                            true
                        );
                    }
                }

                var deptInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO);
                if (deptInfo) {
                    AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptInfo;
                    $scope.deptName = deptInfo.DEPT_NAME;
                }
                else {
                    $scope.deptName = '';
                }

                // 是否需要加载app,病友群未读消息数
                var loadPatientsGroupMessageNum = false;

                //加载公告提醒（首次进入首页不加载，在自动登录时加载）
                //此处需要延迟 1s 执行，因为某些个性化版本不予显示关于趣医模块
                if (HomeService.isSyncHospitalData) {
                    //查询消息需要登录
                    if (CacheServiceBus.getMemoryCache().get('currentCustomPatient')) {
                        if (AppConfig.BRANCH_VERSION == "00") {
                            if($rootScope.IS_SHELL_LOAD) {
                                // 加载app,病友群未读消息数
                                loadPatientsGroupMessageNum = true;
                            } else {
                                HomeService.loadMessageNum();
                            }
                        } else {
                            $timeout(function () {
                                HomeService.loadMessageNum();
                            }, 2000);
                        }
                    }
                }
                //初始化APP时获取系统参数
                HomeService.getNetParams(function (NETWORK_SWITCH,DIAGNOSIS_SWITCH,DIAGNOSIS_URL,DIAGNOSIS_URL_WEIXIN,CUS_SERVICE_URL,SECURE_KEY,CUS_SERVICE_SWITCH,PATIENTS_GROUP_SWITCH,MYINSURANCE_SWITCH,MYINSURANCE_URL,MYINSURANCE_URL_WEIXIN,HEALTH_URL) {
                    HealthService.HEALTH_URL = HEALTH_URL;
                    if (NETWORK_SWITCH == '1') {
                        $scope.netHospital = 'show';
                    } else {
                        $scope.netHospital = 'hidden';
                    }
                    if (DIAGNOSIS_SWITCH == '1'&& DIAGNOSIS_URL && DIAGNOSIS_URL_WEIXIN) {
                        $scope.withDiagnosis = true;
                    } else {
                        $scope.withDiagnosis = false;
                    }
                    if(userSource=='4001'||$scope.bzMediacalRecord){
                        $scope.withDiagnosis = false;
                    }
                    if(CUS_SERVICE_SWITCH=='1'&&CUS_SERVICE_URL&&CUS_SERVICE_URL!=""&&CUS_SERVICE_URL!=undefined&&CUS_SERVICE_URL!="NULL"&&CUS_SERVICE_URL!="null"&&SECURE_KEY&&SECURE_KEY!=""&&SECURE_KEY!=undefined&&SECURE_KEY!="NULL"&&SECURE_KEY!="null"){
                        $scope.cusService=true;
                    }else{
                        $scope.cusService=false;
                    }
                    if($scope.withDiagnosis==false&&$scope.cusService==false){
                        $scope.quhuIsopen=false;
                    }else{
                        $scope.quhuIsopen=true;
                    }
                    if(PATIENTS_GROUP_SWITCH =='1'){
                        $scope.patientsGroupIsOpen = true;
                        if(loadPatientsGroupMessageNum) {
                            PatientsGroupMessageService.loadUnreadMessageNum();
                        }
                    }else{
                        $scope.patientsGroupIsOpen = false;
                        if(loadPatientsGroupMessageNum) {
                            HomeService.loadMessageNum();
                        }
                    }

                    CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH, $scope.patientsGroupIsOpen);

                });
                //更新医院数据同步标志
                //注意：此同步操作仅同步一次，无论之前是否选择医院，因此需要在此处更新标志
                HomeService.isSyncHospitalData = true;
            }
        });

        /**
         * 选择城市
         */
        $scope.selectCity = function () {
            $state.go("multiple_query_city");
        };

        /**
         * 获取医院名称
         */
        $scope.getHospitalName = function () {
            return HomeUserService.getCurrentHospitalName();
        };

        /**
         * 新版预约挂号入口
         */
        $scope.goToAppointment = function () {
            //转诊标识2转诊  0不转诊
            AppointmentDeptGroupService.IS_REFERRAL = 0;
            //KYEEAPPTEST-3439  wangwan 首页选时间，对首页的预约挂号有影响，因此在此处对首页时间赋null处理。
            HomeService.selDateStr=null;
            if($scope.canBeSelect){
                HomeService.goToAppointment();
            }else{
                $state.go("appointment");
            }
        };

        $scope.onScrollComplete = function(){
            $scope.$broadcast('kyee.slideboxImageBegin');
        }

        $scope.onDragDown = function(){
            $scope.$broadcast('kyee.slideboxImageStop');
        }
        /**
         * 下拉刷新
         */
        $scope.doRefresh = function () {
            var userRecord = memoryCache.get('currentUserRecord');
            if(userRecord && userRecord.USER_ID) {
                if($rootScope.IS_SHELL_LOAD && $scope.patientsGroupIsOpen) {
                    PatientsGroupMessageService.loadUnreadMessageNum();
                } else {
                    HomeService.loadMessageNum();
                }
            }

            $scope.$broadcast('scroll.refreshComplete');
        };

        //添加用户点击附近医院的点击事件，并判断是否取到用户当前的经纬度
        $scope.goNearbyHospital = function () {
            if(AppConfig.BRANCH_VERSION!="00" && AppConfig.BRANCH_VERSION!="54"){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('home->MAIN_TAB.uselessInfo','此功能暂未开放')
                });
                return;
            }
            $state.go("nearby_hospital");
        };

        //注册方法 by xike  2015年10月12日 18:46:20 KYEEAPPC-3434
        $scope.bind = function (params) {
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                showNotice: $scope.showNotice,
                delNotice: $scope.delNotice,
                noticeLookMore: $scope.noticeLookMore
            });
        };
        $scope.onHide = function () {
            //隐藏时卸载物理返回事件  By  章剑飞
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
            angular.element(document.getElementById("tabbar")).css("display", "block");
        };
        // 显示消息列表by xike 2015年10月12日 18:46:20 KYEEAPPC-3434
        $scope.showNotice = function () {
            NoticeCenterService.loadNotice(true);
        };
        //鼠标按下时
        $scope.press = function () {
            $scope.pressed = true;
        };
        $scope.press1 = function () {
            $scope.pressed1 = true;
        };
        //鼠标移动时
        $scope.drag = function (event) {
            if ($scope.pressed) {
                //实时定位铃铛位置,18为高度的一半
                $scope.bellTop = event.gesture.touches[0].clientY - 18;
                //20为宽度的一半
                $scope.bellLeft = event.gesture.touches[0].clientX - 20;
            }
        };
        $scope.drag1 = function (event) {
            if ($scope.pressed1) {
                //实时定位铃铛位置,18为高度的一半
                $scope.bellTop1 = event.gesture.touches[0].clientY - 20;
                //20为宽度的一半
                $scope.bellLeft1 = event.gesture.touches[0].clientX - 68;
            }
        };
        //鼠标放开时
        $scope.leave = function (event) {
            $scope.pressed = false;
            if ($scope.bellTop < 44) {
                $scope.bellTop = 44;
            } else if ($scope.bellTop > window.innerHeight - 90) {
                //90为底边栏50px + 铃铛高度40px
                $scope.bellTop = window.innerHeight - 90;
            }
            if ($scope.bellLeft > window.innerWidth / 2) {
                //40为小铃铛宽度
                $scope.bellLeft = window.innerWidth - 40;
            } else {
                $scope.bellLeft = 0;
            }
            //将当前位置存入缓存
            var bellPosition = {
                top: $scope.bellTop,
                left: $scope.bellLeft
            };
            storage.set('bellPosition', bellPosition);
            //设置弹出页面方向
            if ($scope.bellLeft == 0) {
                $scope.msgDirection = 'left';
            } else {
                $scope.msgDirection = 'right';
            }
        };
        $scope.leave1 = function (event) {
            $scope.pressed1 = false;
            if ($scope.bellTop1 < 44) {
                $scope.bellTop1 = 44;
            } else if ($scope.bellTop1 > window.innerHeight - 90) {
                //90为底边栏50px + 铃铛高度40px
                $scope.bellTop1 = window.innerHeight - 90;
            }

                $scope.bellLeft1 = window.innerWidth - 136;

            //将当前位置存入缓存
            var bellPosition1 = {
                top: $scope.bellTop1,
                left: $scope.bellLeft1
            };
            storage.set('bellPosition1', bellPosition1);

        };
        //跳转到体检单
        $scope.goMedical = function () {
            //检查权限
            if (!HomeService.checkRight('MEDICAL')) {
                //未开通此模块
                return;
            }
            $state.go('medical');
        };
        //跳转到检查检验单
        $scope.goReport = function () {
            //检查权限
            if (!HomeService.checkRight('EXAM')) {
                //未开通此模块
                return;
            }
            $state.go('report');
        };
        //跳转到一键呼救页面
        $scope.goForHelp = function () {
            $state.go('callAmbulance');
        };

        /**
         * 跳转到城市选择列表
         */
            //begin 高玉楼  KYEEAPPC-3629  首页选择城市列表后跳转到首页
        $scope.goToMultipleCityList = function () {
            MultipleQueryCityService.goState = "home->MAIN_TAB";
            $state.go('multiple_city_list');
        };

        /**
         * 跳转到搜索主页
         */
        $scope.goToMultipleQuery = function () {
            MultipleQueryService.keyWords.keyWordsValue = '';
            $state.go('multiple_query');
        };

        //end 高玉楼  KYEEAPPC-3629

        /**
         * 跳转到预约挂号日期选择页面
         */
        $scope.goToSelectAppointDate = function () {
            $state.go("seletAppointDate");
        };

        /**
         * 返回到我家亳州APP页面
         */
        $scope.backToBoZhou=function(){
            javascript:myObject.goBack();
        };


        $scope.goToSpMedicalRecord_= function(){
            MedicalRecordService.isQuickEvaluate = false;
            $state.go("sp_medical_record");
        };
    })
    .build();