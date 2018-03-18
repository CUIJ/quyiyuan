/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年9月13日21:40:22
 * 创建原因：已缴费用控制器
 * 任务号：KYEEAPPC-3276
 * 修改者：程铄闵
 * 修改时间：2015年9月26日16:43:08
 * 修改原因：2.0.70版本需求修改
 * 任务号：KYEEAPPC-3468
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:10:53
 * 修改原因：门诊费用增加切换医院的功能（2.1.10）
 * 任务号：KYEEAPPC-4451
 * 修改者：张婧
 * 修改时间：2016年5月18日11:58:24
 * 修改原因：门诊已缴费业务新版整改（APK）
 * 任务号：KYEEAPPC-6169
 * 逻辑描述：
 * 1.门诊待缴费均为非跨院
 * 2.门诊已缴费：除就医记录有跨院，其余均为非跨院
 * （2.1）我的/医院->待缴费非跨院（默认医院数据）->已缴费非跨院（默认医院数据）
 * （2.2）就医记录（上+下）->待缴费非跨院（所选医院数据）->已缴费跨院（按医院时：优先展示默认医院数据）
 * （2.3）就医记录（下）->已缴费非跨院（所选医院数据）
 * （2.4）小铃铛->待缴费非跨院（所选医院数据）->已缴费非跨院（所选医院数据）
 * （2.5）小铃铛/小信封->已缴费详情（通过订单号获取，不展示保险数据，收费单号一行逗号分隔展示）
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.clinicPaid.controller")
    .require(["kyee.quyiyuan.myWallet.clinicPaid.service",
        "kyee.quyiyuan.myWallet.paidRecord.controller",
        "ngSanitize",
        "kyee.quyiyuan.myWallet.clinicPaidQueryController.controller",
        "kyee.quyiyuan.myWallet.clinicPaidMessage.controller"])
    .type("controller")
    .name("ClinicPaidController")
    .params(["$scope", "$rootScope", "$state", "$ionicHistory", "ClinicPaidService", "KyeeListenerRegister",
        "AppointmentRegistDetilService", "KyeeMessageService","$ionicScrollDelegate","KyeeI18nService",
        "HospitalSelectorService","$compile","CacheServiceBus","$timeout","AuthenticationService",
        "KyeeViewService","ClinicPaymentService","$ionicListDelegate","CommPatientDetailService","KyeeUtilsService",
        "ClinicPaymentReviseService","PatientCardService","PaidRecordService"])
    .action(function ($scope, $rootScope, $state, $ionicHistory, ClinicPaidService, KyeeListenerRegister,
                      AppointmentRegistDetilService, KyeeMessageService,$ionicScrollDelegate,KyeeI18nService,
                      HospitalSelectorService,$compile,CacheServiceBus,$timeout,AuthenticationService,
                      KyeeViewService,ClinicPaymentService,$ionicListDelegate,CommPatientDetailService,KyeeUtilsService,
                      ClinicPaymentReviseService,PatientCardService,PaidRecordService) {
        $scope.isAllHospital = ClinicPaidService.fromMedicalGuide;//载入是否跨院标记
        $scope.sortRule = ClinicPaidService.sortRule;//门诊已缴费排序规则 1-按时间（默认） 2-按医院
        $scope.shouldShowDelete = false;
        $scope.shouldShowReorder = false;
        $scope.listCanSwipe = true;
        $scope.isEmpty = true;
        $scope.isDeleteEmpty = false;
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
        $scope.detailIndex = 0;//初始化展开详情标记
        $scope.tips = undefined;
        var lastHeight = 0;
        ClinicPaidService.firstIndex = 0;//默认展开
        $scope.payChannel0 = KyeeI18nService.get("clinicPaid.payChannel0","APP支付");
        $scope.payChannel1 = KyeeI18nService.get("clinicPaid.payChannel1","非APP支付");
        $scope.isPermission = true;//是否开通 true-开通
        // 是否可以切换医院
        $scope.canBeSelect = ($rootScope.ROLE_CODE!="5");

        KyeeListenerRegister.regist({
            focus: "clinicPaid",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: 'both',
            action: function (params) {
                //定位非跨院所选医院名(就医记录下方记录进入)
                if(ClinicPaidService.hospitalIdTreeName){
                    $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(ClinicPaidService.hospitalIdTree);
                    $scope.hospitalName = ClinicPaidService.hospitalIdTreeName;//就医记录所选医院名
                }else if(ClinicPaidService.fromMsgHospitalId){
                    //小铃铛、小信封入口
                    $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(ClinicPaidService.fromMsgHospitalId);
                    $scope.hospitalName = ClinicPaidService.fromMsgHospitalName;//小铃铛所选医院名
                }else{
                    $scope.hospitalLogo = ClinicPaymentReviseService.getHospitalLogo(CacheServiceBus.getStorageCache().get('hospitalInfo').id);
                    $scope.hospitalName = CacheServiceBus.getStorageCache().get('hospitalInfo').name;//默认医院名
                }
            }
        });

        //页面监听事件 程铄闵
        //门诊已结算点击账单详情进入详情页面以后，退出详情页面，不刷新页面  by 杜巍巍  KYEEAPPTEST-3248
        KyeeListenerRegister.regist({
            focus: "clinicPaid",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: 'both',
            action: function (params) {
                var sortRule = ClinicPaidService.sortRule;
                //从支付页面跳转过来延时1秒 //KYEEAPPC-5700 程铄闵 门诊费用支付完成后跳转至已缴费页面
                if($ionicHistory.backView()){
                    var lastPage = $ionicHistory.backView().stateId;
                    if(lastPage && lastPage == "payOrder" && !ClinicPaidService.recordBack){
                        KyeeMessageService.loading({
                            mask: true
                        });//增加遮罩
                        $timeout(
                            function () {
                                $scope.doRefresh(sortRule,true);
                            },
                            1000
                        );
                    }
                    else{
                        if(ClinicPaidService.recordBack){
                            ClinicPaidService.recordBack = false;
                        }
                        else{
                            $scope.doRefresh(sortRule,true);
                        }
                    }
                }
                else{
                    if(ClinicPaidService.recordBack) {
                        ClinicPaidService.recordBack = false;
                    }
                    else{
                        $scope.doRefresh(sortRule,true);
                    }
                }
                //初始化组件；判断设备是否为ios
                if(window.device != undefined && ionic.Platform.platform() == "ios"){
                    var screenSize = KyeeUtilsService.getInnerSize();
                    $scope.deviceTop= 64+50;
                }else{
                    $scope.deviceTop=44+50;
                }
            }
        });

        //获取医院列表 程铄闵 KYEEAPPC-6170
        var getHospitalList = function(){
            ClinicPaidService.loadData('2',ClinicPaymentService.fromHospitalView,function (success,data,message) {
                if(success){
                    init(data,message);
                    //显示医院遮罩页
                    var rec = angular.copy(data);
                    initHospitalList(rec);
                    $scope.showOverlay();
                }
                else{
                    KyeeMessageService.broadcast({
                        content: message
                    });
                }
            }, true);
        };

        //加载医院列表页面 程铄闵 KYEEAPPC-6170
        var initHospitalList = function(rec){
            var list = angular.copy(rec);
            var a = {};
            for(var i=0;i<rec.length;i++){
                var name = rec[i].HOSPITAL_NAME;
                if (typeof(a[name]) == 'undefined'){
                    a[name] = 1;
                }
            }
            rec.length=0;
            for (var i in a){
                rec[rec.length] = i;
            }
            for(var i=0;i<rec.length;i++){
                for(var j=0;j<list.length;j++){
                    if(rec[i]==list[j].HOSPITAL_NAME){
                        rec[i] = {};
                        rec[i].HOSPITAL_ID = list[j].HOSPITAL_ID;
                        rec[i].HOSPITAL_NAME = list[j].HOSPITAL_NAME;
                        break;
                    }
                }
            }
            $scope.hospitalData = rec;//医院列表
            if(rec.length == 0){
                rec.hospitalListHeight = 108+'px';
            }else if(rec.length == 1){
                rec.hospitalListHeight = 158+'px';
            }
            else if(rec.length == 2){
                rec.hospitalListHeight = 208+'px';
            }else{
                rec.hospitalListHeight = 258+'px';
            }
        };

        //处理成功数据
        var init = function(data,message){
            $scope.detailIndex = 0;//详情
            $scope.paidData = data;
            $scope.queryHospital = message.QUERY_HOSPITAL;//请求数据的医院
            $scope.queryPayResType = message.QUERY_PAY_RES_TYPE;//就诊卡/就诊卡+姓名，提示语
            $scope.NoMsg = message.NO_MSG;//就诊卡/就诊卡+姓名，提示语(非跨院)
            $scope.changeQueryType = message.CHANGE_QUERY_TYPE;//就诊卡/就诊卡+姓名，提示语(非跨院)
            if($scope.paidData.length == 0){
                $timeout(
                    function () {
                        var element = angular.element(document.getElementById("clinicPaidEmptyId"));
                        element.html($scope.emptyText);
                        $compile(element.contents())($scope);
                    },
                    1000
                );
                $scope.isEmpty = true;
                $scope.emptyText = message.RETURN_MSG;
                //判提示语对应图标
                if(message.RETURN_MSG.indexOf('未开通')>-1){
                    $scope.isPermission = false;
                }
                else{
                    $scope.isPermission = true;
                }
            }else{
                $scope.isEmpty = false;
            }
            $ionicScrollDelegate.scrollTop();
        };

        //刷新
        $scope.doRefresh = function (sortRule,showLoading,isHospitalClick) {
            $scope.sortRule = sortRule;
            ClinicPaidService.sortRule = sortRule;
            $scope.queryHospital =undefined;
            $scope.queryPayResType = undefined;
            $scope.NoMsg = undefined;
            $scope.changeQueryType = undefined;
            if(showLoading){
                $scope.paidData = [];
            }
            //点按医院且非下拉刷新
            if(sortRule==2 && showLoading && isHospitalClick) {
                ClinicPaidService.popupHospitalId = undefined;//清除选择的弹出医院
                getHospitalList();
            }
            else{
                $scope.hideOverlay();
                if(sortRule!=2){
                    ClinicPaidService.popupHospitalId = undefined;//清除选择的弹出医院 程铄闵 KYEEAPPC-6170
                }
                $scope.detailIndex = -1;//详情
                ClinicPaidService.loadData(sortRule,ClinicPaymentService.fromHospitalView,function (success,data,message) {//KYEEAPPC-5128 程铄闵 从医院首页进入
                    KyeeMessageService.hideLoading();//取消遮罩
                    if(success){
                        init(data,message);
                    }
                    else{
                        $scope.isPermission = true;
                        $scope.isEmpty = true;
                        $scope.emptyText = message;
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                }, showLoading);
            }
        };

        //判断本月
        $scope.isCurrentMonth = function(date){
            var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM');
            var dateNew = KyeeUtilsService.DateUtils.formatFromDate(date,'YYYY/MM');
            return cur==dateNew;
        };

        //跳转入门诊费用
        $scope.toClinicPayment = function () {
            $state.go('clinicPayment');
        };
        //跳转到详情页
        $scope.showRecord = function (paidInfo) {
            ClinicPaidService.fromClinicPaid = true;//从已缴费记录中跳到详情标记 by 程铄闵 KYEEAPPC-3868
            //详情增加多笔记录 程铄闵 KYEEAPPC-7609 KYEEAPPTEST-3818
            if(!paidInfo.DEPT_NAME&&paidInfo.IS_ADD != '1'){
                paidInfo.EXTRA_KEY = undefined;//无附加费则传此字段为空
            }
            var params = {
                PLACE:'0',
                REC_MASTER_ID:paidInfo.REC_MASTER_ID,
                EXTRA_KEY:paidInfo.EXTRA_KEY
            };
            PaidRecordService.params = params;
            $state.go('paid_record');
        };
        //跳转到预约挂号详情
        $scope.goDetail = function (paidDetail) {
            AppointmentRegistDetilService.RECORD = {
                HOSPITAL_ID: paidDetail.HOSPITAL_ID,
                REG_ID: paidDetail.REG_ID
            };
            AppointmentRegistDetilService.ROUTE_STATE = "clinicPaid";
            $state.go('appointment_regist_detil');
        };
        //支付状态
        $scope.payStatus = function (ACCOUNT_FLAG) {
            switch (ACCOUNT_FLAG) {
                case '0':
                    return KyeeI18nService.get("clinicPaid.accountFlag0","正在处理");
                case '1':
                    return KyeeI18nService.get("clinicPaid.accountFlag1","支付成功");
                case '2':
                    return KyeeI18nService.get("clinicPaid.accountFlag2","支付失败");
                case '3':
                    return KyeeI18nService.get("clinicPaid.accountFlag3","已退费");
                case '4':
                    return KyeeI18nService.get("clinicPaid.accountFlag4","退费中");
                case '5':
                    return KyeeI18nService.get("clinicPaid.accountFlag5","退费失败");
            }
        };
        //点击展示详情
        $scope.showInfo = function(index){
            //如果展开按钮隐藏则点击不触发展开事件  KYEEAPPC-5024
            if(index == $scope.medical_hidden_index){
                return ;
            }
            $ionicListDelegate.$getByHandle('clinic_paid').closeOptionButtons();
            $scope.medical_hidden_index = -1;
            var scroll = $ionicScrollDelegate.$getByHandle("paid_scroll");
            //原滚动条高度
            var scrollValues = scroll.getScrollView().getValues();
            //已展开则收起
            if ($scope.detailIndex == index) {
                $scope.detailIndex = -1;
                ClinicPaidService.firstIndex = -1;
                scroll.scrollTo(scrollValues.left, lastHeight, false);
            } else {
                if (document.getElementById('paidDetail') != undefined) {
                    //如果详情已展示，还原滚动条
                    //详情高度
                    var diseaseDetailHeight = document.getElementById('paidDetail').offsetHeight;
                    //还原滚动条
                    if ($scope.detailIndex < index) {
                        //点击项在当前选中项的下方
                        scroll.scrollTo(scrollValues.left, scrollValues.top - diseaseDetailHeight, false);
                    } else {
                        //点击项在当前选中项的上方
                        scroll.scrollTo(scrollValues.left, lastHeight, false);
                    }
                }
                $scope.detailIndex = index;
                ClinicPaidService.firstIndex = index;
                //点开后滚动条的高度
            }
            //记住这次点击的滚动条高度
            lastHeight = scrollValues.top;
            //滚动条重置
            scroll.resize();
        };
        //四舍五入的方法 v-待转换的值 e-位数
        var rounding = function (v, e) {
            v = parseFloat(v);
            if (!isNaN(v)) {
                var t = 1;
                for (; e > 0; t *= 10, e--);
                for (; e < 0; t /= 10, e++);
                v = Math.round(v * t) / t;
                return v;
            }
        };
        //转换金额  KYEEAPPC-8485 程铄闵 金额统一四舍五入
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = rounding(v,2);
                return data.toFixed(2);
            }
        };

        //跳转到切换医院
        $scope.goToHospitalView = function(){
            HospitalSelectorService.isFromClinicPaid = true;
            $state.go('hospital_selector');
        };

        //更改配置
        $scope.goToQueryView = function(){
            $state.go('clinic_paid_query');
        };

        //跳转到实名认证 程铄闵 KYEEAPPC-4806
        $scope.goToAuthentication = function(){
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            AuthenticationService.HOSPITAL_SM = {
                OFTEN_NAME: currentCustomPatient.OFTEN_NAME,
                ID_NO: currentCustomPatient.ID_NO,
                PHONE: currentCustomPatient.PHONE,
                USER_VS_ID: currentCustomPatient.USER_VS_ID,
                FLAG: currentCustomPatient.FLAG
            };
            //认证类型： 0：实名认证，1：实名追述
            AuthenticationService.AUTH_TYPE = 0;
            //0：就诊者，1：用户
            AuthenticationService.AUTH_SOURCE = 0;

            ClinicPaidService.authFlag = true;

            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });
        };

        //滑动监听  by 杜巍巍
        $scope.dragPhysicalData = function(index){
            //当删除按钮划开时，隐藏展开按钮
            var medicalItemContentTrans = document.getElementById('medical_item_'+index).firstChild.style["-webkit-transform"];
            var transLeft = '0px';
            if(medicalItemContentTrans){
                transLeft = medicalItemContentTrans.substring(12,medicalItemContentTrans.indexOf('px'));
                if(parseFloat(transLeft)<=-26){
                    //如果当前项目已经展开，则先收缩当前项
                    if($scope.detailIndex == index){
                        $scope.detailIndex = -1;
                    }
                    if($scope.medical_hidden_index == index){
                        $scope.medical_hidden_index = -1;
                    }
                    else{
                        $scope.medical_hidden_index = index;
                    }
                }
                else{
                    $scope.medical_hidden_index = -1;
                }
            }
            else{
                $scope.medical_hidden_index = -1;
            }
        };

        //点击空白处--已废弃
        $scope.click = function(){
            $ionicListDelegate.$getByHandle('clinic_paid').closeOptionButtons();
            $scope.medical_hidden_index = -1;
        };

        //关闭底部黑框 程铄闵 KYEEAPPC-5599 已废弃
        $scope.closeTip = function(){
            $scope.ionScrollHeight=(window.innerHeight-53) +'px';
            $ionicScrollDelegate.$getByHandle('paid_scroll').resize();
            $scope.hiddenBar = true;
        };

        //返回 //KYEEAPPC-5700 程铄闵 门诊费用支付完成后跳转至已缴费页面
        $scope.back = function () {
            ClinicPaidService.sortRule = 1;//默认展示按时间
            ClinicPaidService.popupHospitalId = undefined;
            $scope.hideOverlay();
            ClinicPaidService.fromMedicalGuide = false;//清除是否跨院标记 默认false-非跨院 （就医记录跨院）
            ClinicPaidService.hospitalIdTree = undefined;//清除就医记录标示 有值-就医记录直接跳转的 （就医记录下方->已缴费）
            ClinicPaidService.hospitalIdTreeName = undefined;//有值-就医记录直接跳转的（就医记录下方->已缴费）
            ClinicPaidService.fromMsgHospitalId = undefined;//有值-小铃铛待缴费所选医院 （小铃铛待缴费->已缴费）
            ClinicPaidService.fromMsgHospitalName = undefined;//小铃铛待缴费所选医院名（小铃铛待缴费->已缴费）
            if($ionicHistory.backView().stateId=='payOrder'){
                $ionicHistory.goBack(-2);
            }
            else if($ionicHistory.backView().stateId=='webPay'){
                $ionicHistory.goBack(-3);
            }
            else{
                $ionicHistory.goBack();
            }
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "clinicPaid",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });

        //修改个人信息跳转
        $scope.goPatientDetail = function(){
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
            CommPatientDetailService.editPatient(current);
        };

        //初始化组件 KYEEAPPC-6170 程铄闵
        $scope.binds = function (params) {
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                selectHospital:$scope.selectHospital,
                selectOtherHospital:$scope.selectOtherHospital
            });
        };

        //选择单个医院 KYEEAPPC-6170 程铄闵
        $scope.selectHospital = function(hospitalId){
            ClinicPaidService.popupHospitalId = hospitalId;
            $scope.hideOverlay();
            $scope.doRefresh(2,true);
        };

        //选择其它医院 KYEEAPPC-6170 程铄闵
        $scope.selectOtherHospital = function(){
            PatientCardService.fromOtherRoute = 'clinicPaid';
            var stgCache = CacheServiceBus.getStorageCache();
            var hospInfo = stgCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            PatientCardService.scopeAdd = {};
            PatientCardService.scopeAdd.area = {};
            PatientCardService.scopeAdd.area.PROVINCE_CODE = hospInfo.provinceCode;
            PatientCardService.scopeAdd.area.PROVINCE_NAME = hospInfo.provinceName;
            PatientCardService.scopeAdd.area.CITY_CODE = hospInfo.cityCode;
            PatientCardService.scopeAdd.area.CITY_NAME = hospInfo.cityName;
            $scope.hideOverlay();
            $state.go('patient_card_hospital');
        };
    })
    .build();