new KyeeModule()
    .group("kyee.quyiyuan.hospital.controller")
    .require([
        "kyee.quyiyuan.hospital.hospital_selector.controller",
        "kyee.quyiyuan.hospital.service",
        "kyee.quyiyuan.hospital.hospital_detail.controller",
        "kyee.quyiyuan.hospital.hospital_detail.service",
        "kyee.quyiyuan.hospital.hospital_selector.service",
        "kyee.quyiyuan.hospitalNavigation.service",
        "kyee.quyiyuan.notice.service",
        "kyee.quyiyuan.hospitalNavigation.controller",
        "kyee.quyiyuan.hospital.hospital_introduce.controller",
        "kyee.quyiyuan.outNavigation.service",
        "kyee.quyiyuan.operation_monitor.service",
        "kyee.quyiyuan.hospital.HospitalIsRefferService.service",
        "kyee.quyiyuan.tiered_medical.controller",
        "kyee.quyiyuan.one_quick_claim.controller",
        "kyee.quyiyuan.hospital.clinic_introduce.controller",
        "kyee.quyiyuan.patients_group.group_details.service"



    ])
    .type("controller")
    .name("HospitalController")
    .params(["$state", "$scope", "KyeeViewService", "NoticeService","$timeout",
        "HospitalService", "KyeeMessageService", "KyeeMessagerService",
        "CacheServiceBus", "HttpServiceBus", "$ionicPopup", "OutNavigationService",
        "HospitalSelectorService", "KyeeUtilsService", "KyeeListenerRegister",
        "FilterChainInvoker", "$ionicScrollDelegate", "HospitalNavigationService",
        "KyeeI18nService","OperationMonitor","HospitalIsRefferService","TieredMedicalService",
        "AppointmentDeptGroupService","HomeService","PatientsGroupMessageService","$rootScope",
        "ClinicPaymentReviseService","QueueClinicService","AppointmentRegistDetilService",
        "NoticeCenterService","$interval","$location","MultipleQueryService","ClinicPaymentService",
        "ReportMultipleService","ClinicPaidMessageService","HealthService","$sce","$ionicHistory","KyeeScanService","MultipleQueryCityService","GroupDetailsService"])
    .action(function ($state, $scope, KyeeViewService, NoticeService, $timeout,
                      HospitalService, KyeeMessageService, KyeeMessagerService,
                      CacheServiceBus, HttpServiceBus, $ionicPopup, OutNavigationService,
                      HospitalSelectorService, KyeeUtilsService, KyeeListenerRegister,
                      FilterChainInvoker, $ionicScrollDelegate, HospitalNavigationService,
                      KyeeI18nService,OperationMonitor,HospitalIsRefferService,TieredMedicalService,
                      AppointmentDeptGroupService,HomeService,PatientsGroupMessageService,$rootScope,
                      ClinicPaymentReviseService,QueueClinicService,AppointmentRegistDetilService,
                      NoticeCenterService,$interval,$location,MultipleQueryService,ClinicPaymentService,
                      ReportMultipleService,ClinicPaidMessageService,HealthService,$sce,$ionicHistory,KyeeScanService,MultipleQueryCityService,GroupDetailsService) {
        //计算广告图片高度
        var imgHeightNum = 0;
        $scope.pressed1 = false;
        $scope.pressed = false;
        //初始化 hospital 缓存数据
        HomeService.init();
        $scope.notices = [];
        //注册、注销、切换就诊者回调显示提醒
        var timer = undefined;
        //分级诊疗控制
        $scope.controllerPage = {
            CAN_REFERRAL : false
        };
        //是否自动滚动
        var autoScroll = true;
        //图片宽高比 498/1242  最大适配到6puls
        if (window.innerWidth < 414) {
            imgHeightNum = window.innerWidth * (498 / 1242);
        } else {
            imgHeightNum = 414 * (498 / 1242);
        }
        //医院功能列表容器高度
        //$scope.scrollHeight = window.innerHeight - $scope.imgHeight - 220 + 'px';
        $scope.scrollHeight = window.innerHeight - 52 + 'px';
        $scope.imgHeight = imgHeightNum + 'px';
        var screenSize = KyeeUtilsService.getInnerSize();
        $scope.imgWidth = screenSize.width;
        $scope.backgrundHeight = imgHeightNum-window.innerWidth*(90/720)+1;//imgHeightNum-44;

        HospitalService.filterChainInvoker = FilterChainInvoker;
        //是否可选医院
        $scope.canBeSelect = !HospitalService.isHospitalSelecterBtnDisabled;
        //传递 $scope 引用
        HospitalService.ctrlScope = $scope;

        $scope.listScrollOnly = 'none';

        //分支版本号
        $scope.branchVerCode=DeploymentConfig.BRANCH_VER_CODE;

        //医院信息
        var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        if(CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_TYPE)){
            var  hospitalType = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_TYPE).type;
            if(hospitalType ==="0"){
                var  oldHospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.OLD_HOSPITAL_INFO);
                var oldHomeData = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.OLD_HOME_DATA);
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO,oldHospitalInfo);
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA,oldHomeData);
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_TYPE,{type:"1"});
                hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.OLD_HOSPITAL_INFO);

            }
        }

        $scope.hospitalInfo = {
            //医院首页模块国际化改造  by  杜巍巍  KYEEAPPC-3811
            name: hospitalInfo != null && hospitalInfo.name != "" ? hospitalInfo.name : KyeeI18nService.get("home->MAIN_TAB.pleaseSelectHospital", "请选择医院"),
            address: hospitalInfo != null && hospitalInfo.address != "" ? hospitalInfo.address : KyeeI18nService.get("home->MAIN_TAB.clickSelectHospital", "点击这里选择一家您要使用的医院"),
            level: hospitalInfo != null && hospitalInfo.level != "" ? hospitalInfo.level : KyeeI18nService.get("home->MAIN_TAB.pleaseSelectHospital", "请选择一家医院进行就诊"),
            changeHospitalButton: hospitalInfo != null && hospitalInfo.name != "" ? KyeeI18nService.get("home->MAIN_TAB.select_hospital", "切换医院") : KyeeI18nService.get("home->MAIN_TAB.select_hospital_next", "选择医院"),
            showMapIcon: hospitalInfo != null && hospitalInfo.name != "" ? true : false
        };

        // 院内导航图标显示flag
        $scope.showNavigation = true;

        KyeeListenerRegister.regist({
            focus: "home->MAIN_TAB",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                //从周边医院跳转的话显示返回按钮
                $scope.surroundingGoBack = HospitalSelectorService.surroundingGoBack;
                //重置消息数量
                $rootScope.noticeNum = 0;
                $rootScope.unreadMessageCount = 0;
                $scope.listScrollOnly = 'none';
                //搜索框数据初始化
                $scope.showPage = {
                    isShowSearchBox: true,  //是否展示顶部搜索框
                    isIos:false  //是否是ios设备
                };
                if(($location.$$absUrl.indexOf("file:///") != -1 ||$location.$$absUrl.indexOf("localhost:8080/var") != -1)&& navigator.userAgent.toLowerCase().indexOf("iphone")!=-1){
                    $scope.showPage.isIos = true;
                }
                //一键呼救位置初始化
                var storage = CacheServiceBus.getStorageCache();
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
                //是否展示一键呼救
                HomeService.getUserLocationInfo(function(data){
                    MultipleQueryCityService.queryShowHelp(data.CITY_CODE, data.PLACE_CODE, function (data) {
                        $scope.showHelpAtOnce = data.ShowHelp;
                        setTimeout(function(){
                            $scope.$digest();
                        },100);
                    })
                });
                //小铃铛位置初始化
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
                //更新页面元素
                HospitalService.updateUI();
                //判断是否显示可转诊医院通道放在获取医院参数中处理
                // //判断是否显示可转诊医院通道
                // var userVsInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                // if(hospitalInfo && userVsInfo && hospitalInfo.id && userVsInfo.USER_VS_ID){
                //     HospitalIsRefferService.isHasRefferHospital(hospitalInfo.id,userVsInfo.USER_VS_ID,function(result){
                //         $scope.controllerPage.CAN_REFERRAL = result.CAN_REFERRAL;
                //         AppointmentDeptGroupService.REFERRAL_REG_ID = result.REG_ID;
                //         AppointmentDeptGroupService.HOSPITAL_ID_HISTORY = hospitalInfo.id;
                //     });
                // }
                $scope.noHospital = true;
                //如果没有医院，则默认功能开通
                if(!(hospitalInfo&&hospitalInfo.id)){
                  $scope.noHospital = false;
                }
                initHospitalParams(hospitalInfo);

            }
        });
        var initHospitalParams = function(hospitalInfo){
            if (hospitalInfo != null && hospitalInfo.id != null && hospitalInfo.id != "" && !HomeService.isSyncHospitalData||hospitalType=="0") {
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
            if(HospitalSelectorService.canReferral != undefined && HospitalSelectorService.regId != undefined){
                $scope.controllerPage.CAN_REFERRAL = HospitalSelectorService.canReferral;
                AppointmentDeptGroupService.REFERRAL_REG_ID = HospitalSelectorService.regId;
                AppointmentDeptGroupService.HOSPITAL_ID_HISTORY = hospitalInfo.id;
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
                if(PATIENTS_GROUP_SWITCH =='1'){
                    HospitalService.hosQueryNum = true;
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
                HealthService.HEALTH_URL = HEALTH_URL;
                var url = HealthService.HEALTH_URL+"appInsetHealthInfo/";
                $scope.openUrl = $sce.trustAsResourceUrl(url);//加载健康新闻部分
                CacheServiceBus.getStorageCache().set(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_SWITCH, $scope.patientsGroupIsOpen);

            });
            //更新医院数据同步标志
            //注意：此同步操作仅同步一次，无论之前是否选择医院，因此需要在此处更新标志
            HomeService.isSyncHospitalData = true;
        };

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

        //加载广告图片
        $scope.slideboxData = HospitalService.loadAdvData();


        //加载九宫格初始数据
        $scope.sudokuData = HospitalService.loadSudokuData();
        $scope.sudokuDataList = [];
        for (var i = 0; i < $scope.sudokuData.length; i++) {
            if (i > 3) {
                $scope.sudokuDataList.push($scope.sudokuData[i]);
            }
        }

        $timeout(function(){
            $ionicScrollDelegate.$getByHandle('businessList').scrollTop();
            autoScroll = true;
        }, 200);

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

        /**
         * 查看医院详情
         */
        $scope.viewHospitalDetail = function (params) {
            OperationMonitor.record('viewHospitalDetail');
            if (hospitalInfo != null && hospitalInfo.id != "") {

                //记录此广告的 id
                if (params.item) {
                    HospitalService.clickedAdvId = params.item.id;
                } else if (params.length > 0) {
                    HospitalService.clickedAdvId = params[0].id;
                }

                $state.go("hospital_detail");
            }
        };

        //跳转到一键呼救页面
        $scope.goForHelp = function () {
            $state.go('callAmbulance');
        };
        $scope.press1 = function () {
            $scope.pressed1 = true;
        };
        $scope.drag1 = function (event) {
            if ($scope.pressed1) {
                //实时定位铃铛位置,18为高度的一半
                $scope.bellTop1 = event.gesture.touches[0].clientY - 20;
                //20为宽度的一半
                $scope.bellLeft1 = event.gesture.touches[0].clientX - 68;
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
        /**
         * 打开主菜单
         */
        $scope.openModule = HospitalService.openModule;

        /**
         * 选择医院
         */
        $scope.selectHospital = function () {
            if (HospitalService.isHospitalSelecterBtnDisabled) {
                return;//禁用选择医院
            }
            $state.go("hospital_selector");
        };

        /**
         * 跳转院内导航
         */
        $scope.goNavigation = function () {
            // KYEEAPPC-3461 新版本院内导航路由 by 杜巍巍   begin
            HospitalNavigationService.lastClassName = "home->MAIN_TAB";
            $state.go("hospital_navigation");
            // KYEEAPPC-3461 新版本院内导航路由 by 杜巍巍   end
        };

        /**
         * 判断院外导航图标是否显示
         */
        var showNavigationFlag = function () {
            $scope.showToMap = false;
            if (hospitalInfo && hospitalInfo.id) {
                $scope.showToMap = true;
            }
        };

        showNavigationFlag();

        //点击“停诊通知”
        $scope.go2Notice = function () {
            NoticeService.getAllNotices(function (resp) {
                //返回false(“暂不支持此功能”等)时不能进入页面
                if (!resp.success) {
                    KyeeMessageService.broadcast({
                        content: resp.message
                    });
                    return;
                }
                NoticeService.noticeData = resp;
                $state.go("clinicStopNotice");
            });
        };
        $scope.go2AppointDoctor = function () {
            HospitalService.toAppointDoctorPage();
        };

        $scope.onScrollComplete = function(){
            setSearchBox();
            $scope.$apply();
            $scope.$broadcast('kyee.slideboxImageBegin');
        };

        $scope.onDragDown = function(){
            setSearchBox();
            $scope.$broadcast('kyee.slideboxImageStop');
        };

        //监听滚动事件
        $scope.scrollListen = function () {
            if(!autoScroll){
                if ($ionicScrollDelegate.getScrollPosition().top > imgHeightNum+59) {
                    $scope.listScrollOnly = 'block';
                } else {
                    $scope.listScrollOnly = 'none';
                }
                $scope.$apply();
            }
            else {
                autoScroll = false;
            }
        };

        //院外导航
        $scope.toMap = function (event) {
            OutNavigationService.openNavigationOut();
            event.stopPropagation();
        };
        //鼠标按下时
        $scope.press = function () {
            $scope.pressed = true;
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
        // 显示消息列表by xike 2015年10月12日 18:46:20 KYEEAPPC-3434
        $scope.showNotice = function () {
            NoticeCenterService.loadNotice(true);
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
                        ClinicPaymentReviseService.isMedicalInsurance(2,function (route) {
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
        /**
         * 跳转到搜索主页
         */
        $scope.goToMultipleQuery = function () {
            MultipleQueryService.keyWords.keyWordsValue = '';
            var objParams = {};
            objParams.skipRoute = 'multiple_query';
            var memoryCache = CacheServiceBus.getMemoryCache();
            var userInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            if(userInfo){
                objParams.USER_ID = userInfo.USER_ID;
            }else{
                objParams.USER_ID = '-1';
            }
            if(hospitalInfo){
                objParams.hospitalID=hospitalInfo.id;
            }
            HospitalService.addRecord(objParams);
            $state.go('multiple_query');
        };
        /**
         * 返回到我家亳州APP页面
         */
        $scope.backToBoZhou=function(){
            javascript:myObject.goBack();
        };

        $scope.goToSat=function(){
            $state.go('sms_quick_evaluate');
        };
        function setSearchBox() {
            var top = $ionicScrollDelegate.getScrollPosition().top,
                showPage = $scope.showPage;
            if (top >= 0) {
                showPage.isShowSearchBox = true;
            } else {
                showPage.isShowSearchBox = false;
            }
        }
        //返回周边医院
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
        function isWeiXin(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                return true;
            }else{
                return false;
            }
        };
        $scope.goScan = function(){
            GroupDetailsService.groupId = "";
            GroupDetailsService.isScan = "";
            // GroupDetailsService.isScan = "InitScan";
            // HospitalService.tid = "296428347";
            // HospitalService.owner = "qydr7mdb6k9fq9d9959j7v784qc9f";
            // HospitalService.yxUser = "qypa10918310";
            // $state.go("group_details");
           // return;
            if(isWeiXin()) {
                var url = $location.$$absUrl;
                url.substring(0,url.indexOf("#"));
                HospitalService.scanCode(url.substring(0,url.indexOf("#")),function(result){

                    splitData(result);
                });
            }else if(window.device && window.device.platform&&(window.device.platform == "Android"||window.device.platform == "iOS")){
                KyeeScanService.scan(
                    function (code) {
                        splitData(code);
                    }
                    // ,
                    // function () {
                    //     KyeeMessageService.broadcast({
                    //         content: KyeeI18nService.get("regist.failScaner","扫描二维码失败!")
                    //     });
                    // }
                );
            }


        };
        var splitData = function(result){
            if(!result.split("&")[1]){
                result = JSON.parse(result);
                //扫码加群
                if(result.type == "JOIN_GROUP"){
                    FilterChainInvoker.invokeChain({
                        id: "USER_LOGIN_FILTER",
                        token: "hospital_home",
                        onFinash: function () {
                            //alert(2)
                            var yxUserLoad =CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO).yxUser;
                            HospitalService.tid = result.tid;
                            //HospitalService.owner = result.owner;
                            HospitalService.yxUser = yxUserLoad;
                            GroupDetailsService.isScan = "InitScan";
                            $state.go("group_details");
                        }
                    });

                }else{
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("regist.failScaner","安全起见，不支持第三方链接!")
                    });
                }
            }else{
                FilterChainInvoker.invokeChain({
                    id: "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
                    token: "hospital_home",
                    onFinash: function () {
                        $state.go('home->MAIN_TAB');
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
                        }else{

                            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            var parientName = currentPatient.OFTEN_NAME;
                            var phoneNum = currentPatient.PHONE;

                            var dragStoreCode = result.split("&")[0];
                            var codeName = dragStoreCode.split("=")[1];
                            var dragFlag = result.split("&")[1]
                            if(dragFlag == "flag=drugstore" && codeName){
                                var param = {
                                    patientName:parientName,
                                    phoneNum:phoneNum
                                }
                                HospitalService.getScanInfo(param,function(data){
                                    $state.go("my_prescription");
                                })

                            }else{
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("regist.failScaner","安全起见，不支持第三方链接!")
                                });
                            }
                        }
                    }
                });


            }


        };
    })
    .build();