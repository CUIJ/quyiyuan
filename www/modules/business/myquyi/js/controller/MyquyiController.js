/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年12月3日22:01:26
 * 任务号：KYEEAPPC-4374
 * 创建原因：就医记录主页面控制器
 * 修改日期：2016年3月2日19:12:53
 * 修改任务号：KYEEAPPC-5391
 * 修改原因:就医记录增加体检单查询
 */
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.controller")
    .require([
        "kyee.quyiyuan.myquyi.service",
        "kyee.quyiyuan.myquyi.my_care_doctors.controller",
        "kyee.quyiyuan.myquyi.inpatientBusiness.controller",
        "kyee.quyiyuan.myquyi.medical_guide.controller",
        "kyee.quyiyuan.changeSetting.controller",
        "kyee.quyiyuan.changeSetting.service",
        "kyee.quyiyuan.myWallet.inpatientGeneral.controller",
        "kyee.quyiyuan.myWallet.myquyiInpatientPayment.controller"
    ])
    .type("controller")
    .name("MyquyiController")
    .params(["OperationMonitor","$scope", "$state", "CacheServiceBus", "MyquyiService", "KyeeMessageService", "KyeeListenerRegister", "HospitalSelectorService",
        "CustomPatientService", "AuthenticationService", "CommPatientDetailService", "UpdateUserService", "LoginService", "$ionicScrollDelegate",
        "$ionicHistory", "KyeeViewService", "AddCustomPatientService", "MedicalGuideService", "inpatientBusinessService", "KyeeDeviceInfoService",
        "ReportMultipleService", "KyeeI18nService", "CenterService", "KyeeUtilsService", "InpatientPaymentService", "InpatientPaidService",
        "AppointmentRegistDetilService","$timeout","MedicalService","ClinicPaidMessageService","ClinicPaymentReviseService","PerpaidRecordService",
        "VideoInterrogationService","PurchaseMedinceService"])
    .action(function (OperationMonitor,$scope, $state, CacheServiceBus, MyquyiService, KyeeMessageService, KyeeListenerRegister, HospitalSelectorService,
                      CustomPatientService, AuthenticationService, CommPatientDetailService, UpdateUserService, LoginService, $ionicScrollDelegate,
                      $ionicHistory, KyeeViewService, AddCustomPatientService, MedicalGuideService, inpatientBusinessService, KyeeDeviceInfoService,
                      ReportMultipleService, KyeeI18nService, CenterService, KyeeUtilsService, InpatientPaymentService, InpatientPaidService,
                      AppointmentRegistDetilService,$timeout,MedicalService,ClinicPaidMessageService,ClinicPaymentReviseService,PerpaidRecordService,
                      VideoInterrogationService,PurchaseMedinceService) {
        //是否自动滚动
        var autoScroll = true;
        $scope.listScrollOnly = 'none';
        $scope.isHaveData = undefined; //判断从端上是否有数据的标识
        $scope.havePeople = true;
        $scope.isShowPatient = undefined;
        $scope.refreshTime = undefined;
        $scope.refreshTimeHide = undefined;
        if(MyquyiService.dateTime){
            $scope.refreshTimeHide = MyquyiService.dateTime;
        }
        //是否显示刷新提示框，初次进入关于趣医界面时，不显示
        $scope.share_container_class = ["share_container_hide"];
        $scope.deivce = '240';
        if (window.device && window.device.platform == "iOS") {
            $scope.deivce = '250';
        }
        //begin 切换就诊者实名认证处理 gyl KYEEAPPTEST-3106
        CustomPatientService.scope = $scope;
        //表示实名认证来源于就医记录
        AddCustomPatientService.Mark = ' ';
        //end by gyl
        $scope.inputBothCard = {};
        var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        var inputCardInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO);
        if (inputCardInfo && inputCardInfo[hospitalInfo.id]) {
            $scope.inputBothCard.PATIENT_CARDNO = inputCardInfo[hospitalInfo.id].PATIENT_CARD_NO;
            $scope.inputBothCard.HOSPITAL_CARDNO = inputCardInfo[hospitalInfo.id].HOSPITAL_CARD_NO;
            $scope.inputBothCard.BILL_CARDNO = inputCardInfo[hospitalInfo.id].BILL_CARD_NO;
        } else {
            $scope.inputBothCard = {
                PATIENT_CARDNO: "",
                HOSPITAL_CARDNO: "",
                BILL_CARDNO: ""
            };
        }

        //将用户输入的信息存入缓存。
        $scope.setCachCardNoInfo = function () {
            var storageCache = CacheServiceBus.getStorageCache();
            var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var cardInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO);
            if (cardInfo == undefined) {
                cardInfo = {};
            }
            cardInfo[hospitalId] = {
                PATIENT_CARD_NO: $scope.inputBothCard.PATIENT_CARDNO,
                HOSPITAL_CARD_NO: $scope.inputBothCard.HOSPITAL_CARDNO,
                BILL_CARD_NO: $scope.inputBothCard.BILL_CARDNO
            };
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO, cardInfo);
        };
        $scope.submit = function () {
            //点击提交按钮，先将用户输入的信息存入缓存。
            $scope.setCachCardNoInfo();
            MyquyiService.isFromChangeSetting = true;
            //$ionicHistory.goBack();
        };

        //用户首次进来会从云上查当前就诊者的就医记录信息
        $scope.getAppointmentRecord = function () {
            var userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //$scope.hospitalName = hospitalInfo.name;
            var hospitalId = '';
            if (hospitalInfo) {
                hospitalId = hospitalInfo.id;
            }
            //判断是否有选中就诊者
            if (MyquyiService.isSelectPatient) {
                MyquyiService.queryAppointmentData(function (data) {
                    if (data.success) {
                        $scope.allCloudData = data.data.cloudData;
                        if($scope.allCloudData.length == 0){
                            // 动态获取div盒子的高度 KYEEAPPC-8535
                            $scope.divHeight = window.innerHeight-document.getElementById("contentTop").offsetHeight ;
                            // 50: 空白提示语div的高度，50：菜单栏的高度；
                            $scope.emptyPadTop = ($scope.divHeight - 50 - 50)/2 ;
                        }
                        $scope.isShowTip = data;
                        //将云上返回的弹框类型存起来，去changeSetting页面展示用
                        MyquyiService.isShowTipType = data;
                        //判断用户有没有选择医院
                        if (hospitalInfo && hospitalId) {
                            $scope.hospitalName = hospitalInfo.name;
                        }
                        $ionicScrollDelegate.$getByHandle("myquyi_scroll_handle").resize();
                    }
                },userId, userVsId, hospitalId);
            }
        };


        //查询选中就诊者
         $scope.queryCustomPatient = function () {
            var currentUserRecord = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);//用户缓存
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            CenterService.getSelectCustomInfo(currentUserRecord, CacheServiceBus.getStorageCache(), function (havePeople, image, data) {
                $scope.havePeople = havePeople;
                $scope.IMAGE_PATH = image;
                if (havePeople) {
                    $scope.currentCustomPatient = data;
                    MyquyiService.isSelectPatient = true;
                    $scope.isTimeNotPatient = true;
                    $scope.isShowPatient = true;
                } else {
                    MyquyiService.isSelectPatient = false;
                }
                //判断页面是如果是从就医记录则去云上查当前就诊者就医记录信息，如果从更改设置过来则去端上查当前医院的就诊者的就医记录信息
                if (MyquyiService.isFromChangeSetting) {
                    queryNewAppointmentDataFromT();
                } else {
                    $scope.getAppointmentRecord();
                }

            });
        };


        //查询该用户下的就诊者
        $scope.queryCustomPatient();

        //增加就诊者
        $scope.addPatient = function () {
            OperationMonitor.record("addPatient", "myquyi->MAIN_TAB.medicalGuide");
            //用户信息缓存
            var userInformation = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            AddCustomPatientService.Mark = 3;
            AddCustomPatientService.Restart = $scope;
            openModal('modules/business/center/views/add_patient_info/add_custom_patient.html');
        };

        //点击头像编辑当前就诊者
        $scope.editCurrentPatient = function () {
            //防止就医记录编辑就诊者操作内存  By 杜巍巍   KYEEAPPC-3719
            var patient = angular.copy($scope.currentCustomPatient);
            //begin 修改默认就诊者信息后与注册用户信息不同步的问题   By  张家豪 KYEEAPPC-3199
            patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
            patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
            patient.loginNum = "";         //短信验证码制空
            CommPatientDetailService.item = patient;
            CommPatientDetailService.F_L_A_G = "CommPatientDetail";//【首页】点击图像进入就诊者信息界面，修改就诊者成功后页面跳转错误  By  张家豪  KYEEAPPTEST-2849
            $state.go("comm_patient_detail");
            //end 修改默认就诊者信息后与注册用户信息不同步的问题  By  张家豪  KYEEAPPC-3199
        };
        //预约记录
        $scope.appointRecord = function () {
            $state.go('appointment_regist_list');
        };
        //门诊费用 KYEEAPPC-6170 程铄闵
        $scope.outpatientPayment = function () {
            var routerfrom = 0;//病史页
            ClinicPaymentReviseService.isMedicalInsurance(routerfrom,function (route) {
                $state.go(route);
            });
        };
        //住院费用 KYEEAPPC-6607 程铄闵
        $scope.goInpaitentDetail = function () {
            $state.go('inpatient_general');
        };
        //检验检查 、点击TYPE==8时的检验检查跳转
        $scope.report = function () {
            //KYEEAPPC-4047  2.1.0报告单跨院修改 张明  2015.11.25
            ReportMultipleService.IS_TAP_TAB = 'REC';
            $state.go('report_multiple');
        };

        //去医院看看
        $scope.doRefresh = function () {
            //点击刷新时判断提示框是否显示，如果显示则关掉。
            if ($scope.share_container_class[0] == "share_container_in") {
                $scope.closeTip();
            }
            var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            if (!MyquyiService.isSelectPatient) {
                 KyeeMessageService.broadcast({
                     content: KyeeI18nService.get("myquyi->MAIN_TAB.medicalGuide.addPatientTip","请选择就诊者后再操作！"),
                     duration: 2000
                 });
            }else{
                //判断用户是否已经选了默认医院
                if (!hospitalInfo || !hospitalInfo.id || hospitalInfo.id=="") {
                    //如果用户没选择医院则去云上查询数据
                    $scope.getAppointmentRecord();
                } else {
                    $scope.hospitalName = hospitalInfo.name;

                    //判断用户第一次点击刷新时的缓存信息里面无有数据，没有弹出提示框，已经输入过的话直接去查
                    var inputCardInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO);
                    if (inputCardInfo && inputCardInfo[hospitalInfo.id]) {
                        queryNewAppointmentDataFromT();
                    } else {
                        if (!$scope.isShowTip.resultCode) {
                            queryNewAppointmentDataFromT();
                        }
                        else {
                            var resultCodeArray = $scope.isShowTip.resultCode.split("");
                            //需要实名认证。
                            if ('1' == resultCodeArray[3]) {
                                $scope.isHaveData = 4;
                                $scope.share_container_class = ["share_container_in"];
                            }
                            //用户实名认证正在审核中。
                            else if ('2' == resultCodeArray[3]) {
                                $scope.isHaveData = 5;
                                $scope.share_container_class = ["share_container_in"];
                            }
                            //需要就诊卡但云上无卡或需住院号但云上无住院号记录或需要发票号但云上午发票号记录
                            else if (('0' == resultCodeArray[4] && '1' == resultCodeArray[0]) || ('0' == resultCodeArray[5] && '1' == resultCodeArray[1]) || ('0' == resultCodeArray[6] && '1' == resultCodeArray[2])) {
                                //$state.go('change_setting');
                                $scope.submit();

                            } else {
                                queryNewAppointmentDataFromT();
                            }
                        }

                    }
                }
            }
            $scope.$broadcast('scroll.refreshComplete');
        };

        //点击刷新后输入就诊卡号或住院号后去从端上查用户最新的就医记录数据
        var queryNewAppointmentDataFromT = function () {
            var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            $scope.hospitalName = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).name;
            var inputCardInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO);
            //判断用户在该家医院是否有输过号，如果有按照输入的号去端上查，如果没有置为“”去端上查
            var patientCardNo = "";
            var hospitalCardNo = "";
            var billCardNo = "";
            if (inputCardInfo && inputCardInfo[hospitalInfo.id]) {
                 patientCardNo = inputCardInfo[hospitalInfo.id].PATIENT_CARD_NO;
                 hospitalCardNo = inputCardInfo[hospitalInfo.id].HOSPITAL_CARD_NO;
                 billCardNo = inputCardInfo[hospitalInfo.id].BILL_CARD_NO;
            }
            MyquyiService.queryNewAppointmentData(function (data) {
                    $scope.isHaveData = 1;
                    $scope.allCloudData = data.data.cloudData;
                    if($scope.allCloudData.length == 0 ){
                        $scope.divHeight = window.innerHeight-document.getElementById("contentTop").offsetHeight ;
                        // 50: 空白提示语div的高度，50：菜单栏的高度；
                        $scope.emptyPadTop = ($scope.divHeight - 50 - 50)/2 ;
                    }
                    //更新完数据后弹出提示框
                    $scope.share_container_class = ["share_container_in"];
                    $ionicScrollDelegate.$getByHandle("myquyi_scroll_handle").resize();
                    $scope.refreshTime = getCurrentTime();
                    MyquyiService.dateTime = getCurrentTime();
                }, userId, userVsId, hospitalId, patientCardNo, hospitalCardNo, billCardNo);
            MyquyiService.isFromChangeSetting = undefined;
        };
        //关闭刷新的提示框
        $scope.closeTip = function () {
            $scope.share_container_class = ["share_container_hide"];
        };
        //点击添加医院跳转到选医院界面
        $scope.addHospital = function () {
            $state.go('hospital_selector');
        };
        //更改设置
        $scope.changeSetting = function () {
            $scope.closeTip();
            $state.go('change_setting');
        };

        //点击TYPE==1时的预约记录跳转
        $scope.goAppointRecord = function (item) {
            //wangwan 就医记录，视频问诊、购药、跳转到相应的详情页
            if(item.ONLINE_BUSINESS_TYPE=='0'){
                VideoInterrogationService.REG_ID=item.REG_ID;
                VideoInterrogationService.ROUTER = "myquyi->MAIN_TAB.medicalGuide";
                $state.go("video_interrogation");
            }else if(item.ONLINE_BUSINESS_TYPE=='1'){
                PurchaseMedinceService.REG_ID=item.REG_ID;
                PurchaseMedinceService.ROUTER = "myquyi->MAIN_TAB.medicalGuide";
                $state.go("purchase_medince");
            }else{
                //跳转预约挂号详情页面的参数
                AppointmentRegistDetilService.RECORD = {
                    HOSPITAL_ID: item.HOSPITAL_ID,
                    REG_ID: item.REG_ID,
                    USER_ID: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID
                };
                AppointmentRegistDetilService.ROUTE_STATE = "myquyi->MAIN_TAB.medicalGuide";
                $state.go('appointment_regist_detil');
            }
        };
        //点击TYPE==2时的数据跳转门诊待缴费跳转  KYEEAPPC-6170 程铄闵
        $scope.goOutpatientNoPay = function (item) {
            ClinicPaymentReviseService.isMedicalInsurance(2,function (route) {
                if(route=='clinic_payment_revise'){
                    ClinicPaymentReviseService.HOSPITALID_TREE = item.HOSPITAL_ID;
                    ClinicPaymentReviseService.fromGuideRecordHosName = item.HOSPITAL_NAME;
                }
                $state.go(route);
            });
        };
        //点击TYPE==3时的数据跳转门诊已缴费
        $scope.goOutpatientPay = function (item) {
/*            ClinicPaidService.fromMedicalGuide = false;//是否跨院标示 true-跨院
            ClinicPaidService.hospitalIdTree = item.HOSPITAL_ID;
            ClinicPaidService.hospitalIdTreeName = item.HOSPITAL_NAME;
            $state.go('clinicPaid');*/
            //详情增加多笔记录 程铄闵 KYEEAPPC-7609
            var payTime = item.REG_DATE_YEAR + '/' + item.REG_DATE;
            var params = {
                PLACE:'2',
                REC_MASTER_ID:item.UNION_ID,
                HOSPITAL_ID:item.HOSPITAL_ID,
                PAY_TIME:payTime
            };
            ClinicPaidMessageService.getPaidList($state,params);
        };
        //点击TYPE==5时的数据跳转每日清单 KYEEAPPC-6607 程铄闵
        $scope.goDayList = function () {
            $state.go('myquyi_inpatient_payment');
        };
        //点击TYPE==6时的数据跳转住院历史记录 KYEEAPPC-6607 程铄闵
        $scope.goHospitalHistoryRecord = function (item) {
            InpatientPaidService.fromMyquyiRecord = true;
            InpatientPaidService.myquyiHospitalId = item.HOSPITAL_ID;
            $state.go('inpatient_paid_record');
        };
        //点击TYPE==7时的数据跳转住院预交金充值
        $scope.goHospitalAcceptPay = function () {
            PerpaidRecordService.fromMyquyiRecord = true;
            $state.go('perpaid_record');
        };

        /**
         * 将用户输入的就诊卡号和住院号存到缓存里面
         */
        $scope.setCachCardNoInfo = function () {
            var storageCache = CacheServiceBus.getStorageCache();
            var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var cardInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO);
            if (cardInfo == undefined) {
                cardInfo = {};
            }
            cardInfo[hospitalId] = {
                PATIENT_CARD_NO: $scope.inputBothCard.PATIENT_CARDNO,
                HOSPITAL_CARD_NO: $scope.inputBothCard.HOSPITAL_CARDNO,
                BILL_CARD_NO: $scope.inputBothCard.BILL_CARDNO
            };
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.INPUT_CARD_INFO, cardInfo);
        };

        //实名认证的调用
        $scope.goAuthentication = function () {
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            AuthenticationService.HOSPITAL_SM = {
                OFTEN_NAME: currentCustomPatient.OFTEN_NAME,
                ID_NO: currentCustomPatient.ID_NO,
                PHONE: currentCustomPatient.PHONE,
                USER_VS_ID: currentCustomPatient.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                FLAG: currentCustomPatient.FLAG
            };
            MyquyiService.scope = $scope;
            AuthenticationService.lastClass = "MyQuYi";
            openModal('modules/business/center/views/authentication/authentication.html');
        };

        //打开实名认证模态窗口
        function openModal(template) {
            KyeeViewService.openModalFromUrl({
                url: template,
                scope: $scope
            });
        }
        $timeout(function(){
            $ionicScrollDelegate.$getByHandle('businessList').scrollTop();
            autoScroll = true;
        }, 200);
        //监听滚动事件
        $scope.scrollListen = function () {
            if(!autoScroll){
                if ($ionicScrollDelegate.getScrollPosition().top > 174) {
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

        //跳转到体检单列表
        $scope.goPhysicalInfo = function(record){
            MedicalService.recordId = record.REG_ID;
            $state.go('my_medical');
        };

        //begin by gyl KYEEAPPC-5024
        /**
         * 删除就医记录
         * @param record 待删除的记录
         * @param index 记录所在数组的下标
         */
        $scope.deleteRecord = function(record,index){
            if(record.DELETE_ABLE){
                $scope.DEL_FLAG_EXTEND = "0";
                //获取當前年月日
                $scope.datet = new Date();
                $scope.dated = KyeeUtilsService.DateUtils.formatFromDate( $scope.datet, 'YYYY/MM/DD');
                //获取當前時間點
                $scope.hourn = KyeeUtilsService.DateUtils.formatFromDate( $scope.datet, 'HH:mm');
                if(record.CLINIC_DURATION){
                    //获取就診時間點
                    $scope.hours = (record.CLINIC_DURATION).substring(record.CLINIC_DURATION.lastIndexOf("/")+3,record.CLINIC_DURATION.length);
                    if( $scope.hours.substring(0,1).indexOf(" ")!=-1){
                        $scope.hours=$scope.hours.substring(1);
                    }
                    if($scope.hours.length<5){
                        $scope.hourt = KyeeUtilsService.DateUtils.formatFromString($scope.hours,"h:m","hh:mm'");
                    }
                    else {
                        $scope.hourt=$scope.hours;
                    }
                }

                if((record.APPOINT_TYPE==1 ||record.APPOINT_TYPE==5 ||record.REGIST_TYPE==1)
                    &&  record.VISIT_STATUS==0)
                {
                    if(Date.parse(record.REG_DATE_YEAR+"/"+record.REG_DATE)>Date.parse($scope.dated))
                    {
                        $scope.DEL_FLAG_EXTEND = "1";
                    }
                    else if(Date.parse(record.REG_DATE_YEAR+"/"+record.REG_DATE)==Date.parse($scope.dated))
                    {
                        if( $scope.hourt!=null &&  $scope.hourt> $scope.hourn)
                        {
                            $scope.DEL_FLAG_EXTEND = "1";
                        }
                    }
                }if($scope.DEL_FLAG_EXTEND=="1")
                {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("myquyi->MAIN_TAB.disdeleteTips","未过期的记录暂不支持删除 ，您可在就诊日期之后再操作")
                    });
                    return;
                }
                else {
                MyquyiService.deleteRecord(function(){
                    $scope.allCloudData.splice(index,1);
                },record);}
            }

        };
       
        //end by gyl KYEEAPPC-5024
		 /**
         * 获取当前时间
         * @returns HH时mm分 格式的时分
         */
        function getCurrentTime(){
          return KyeeUtilsService.DateUtils.getTime('HH时mm分');
        };
    })
    .build();
