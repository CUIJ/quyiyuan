/**
 * 产品名称：quyiyuan.
 * 创建用户：程铄闵
 * 日期：2016年6月6日18:37:55
 * 创建原因：住院预缴确认状态控制
 * 任务号：KYEEAPPC-6601
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.perpaidPayInfo.controller")
    .require([
        "kyee.quyiyuan.myWallet.perpaidPayInfo.service"
    ])
    .type("controller")
    .name("PerpaidPayInfoController")
    .params(["$scope", "$state", "$ionicHistory", "PerpaidPayInfoService",
        "KyeeViewService", "PayOrderService", "KyeeListenerRegister","KyeeUtilsService",
        "InpatientPaymentService","KyeeI18nService","CacheServiceBus","PerpaidService","KyeeMessageService",
        "$stateParams","HospitalSelectorService","$ionicScrollDelegate"])
    .action(function ($scope, $state, $ionicHistory,PerpaidPayInfoService,
                      KyeeViewService, PayOrderService, KyeeListenerRegister,KyeeUtilsService,
                      InpatientPaymentService,KyeeI18nService,CacheServiceBus,PerpaidService,KyeeMessageService,
                      $stateParams,HospitalSelectorService,$ionicScrollDelegate) {

        //初始化变量
        var initVar = function(){
            $scope.isEmpty = true;
            $scope.emptyText = undefined;
            $scope.status = false;//查询状态
            $scope.placeholder = {
                pHInHospitalNo:KyeeI18nService.get("perpaid_pay_info.pHInHospitalNo","请输入住院号")
            };
            $scope.placeholder = {
                pHCharge:KyeeI18nService.get("perpaid_pay_info.pHCharge","请输入充值金额")
            };
        };

        //初始化住院费用入口数据
        var initInpatientEntrance = function(){
            $scope.isFromInpat = false;
            //从住院费用过来
            if(PerpaidPayInfoService.inpatientEntrance){
                $scope.isFromInpat = true;//从住院费用来
            }
        };

        //初始化切换医院
        var initChangeHospital = function(){
            var storageCache = CacheServiceBus.getStorageCache();
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            $scope.hospitalName = hospitalInfo.name;
            $scope.hospitalLogo = PerpaidService.getHospitalLogo(hospitalInfo.id);
        };

        //初始化同预缴页个人信息
        var initPerpaidInfo = function(){
            $scope.pagedata = {
                name:"",
                idNo:"",
                inHospitalNo:undefined
            };
            var memoryCache = CacheServiceBus.getMemoryCache();
            var patientInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            $scope.pagedata.name = patientInfo.OFTEN_NAME;
            $scope.pagedata.idNo = PerpaidService.convertIdNo(patientInfo.ID_NO);
            $scope.placeholder = {
                pHInHospitalNo:KyeeI18nService.get("perpaid_pay_info.pHInHospitalNo","请输入住院号")
            };
        };

        //页面监听
        KyeeListenerRegister.regist({
            focus : "perpaid_pay_info",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction : "both",
            action : function(params){
                var forward = $ionicHistory.forwardView();
                //perpaid_pay_info到切换就诊者或医院返回只更新就诊者
                if(forward && (forward.stateId == "custom_patient")){
                    initPerpaidInfo();
                }
                //点击下一步到此页面
                else if(PerpaidPayInfoService.perpaidNext){
                    init();
                    PerpaidPayInfoService.perpaidNext = false;
                }
                //进切换医院页面直接返回
                else if(forward && forward.stateId == "hospital_selector" && HospitalSelectorService.isFromPerpaidPayInfo){
                    HospitalSelectorService.isFromPerpaidPayInfo = false;
                    init();
                }
                else{
                    if($ionicHistory.forwardView()){
                        var lastPage = $ionicHistory.forwardView().stateId;
                        //支付订单未支付直接返回
                        if(lastPage == 'payOrder'){
                            return;
                        }
                        else{
                            $scope.doRefresh(false);
                        }
                    }
                    else{
                        $scope.doRefresh(false);
                    }
                }
            }
        });

        //初始化页面数据
        var init = function(){
            initVar();
            initInpatientEntrance();
            var data = PerpaidPayInfoService.payData;
            if(data.success){
                $scope.isEmpty = false;
                $scope.payInfo = data;
                $scope.isfromPerpaid = PerpaidPayInfoService.inpatientEntrance;
                //查询中
                if(data.QUERY_PROGRESS == 'QUERYING'){
                    $scope.status = 'querying';
                }
                //验证成功
                else if(data.QUERY_PROGRESS == 'DONE' && data.TOTAL>0 && !PerpaidPayInfoService.perpaidNext){
                    initChangeHospital();
                    $scope.status = 'querySuccess';
                }
                //验证失败
                else if(data.QUERY_PROGRESS == 'DONE' && data.TOTAL==0){
                    $scope.status = 'queryFail';
                    initChangeHospital();
                    initPerpaidInfo();
                }
                //直接查询到数据
                else if(data.QUERY_PROGRESS == 'DONE' && data.TOTAL>0 && PerpaidPayInfoService.perpaidNext){
                    initChangeHospital();
                    $scope.status = 'existed';
                }
                else{
                    $scope.isEmpty = true;
                    $scope.emptyText = data;
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.emptyText = data.message;
            }
        };

        //初始化刷新页面
        $scope.doRefresh = function(hiddenLoading){
            PerpaidPayInfoService.loadData(hiddenLoading,function(){
                if(PerpaidPayInfoService.isFromQRCode){
                    PerpaidService.loadPermission(function (route) {
                        init();
                    })
                }else{
                    init();
                }
            });
        };

        //手动下拉刷新
        $scope.onRefresh = function(hiddenLoading){
            if($scope.status == 'querying'||$scope.isEmpty){
                PerpaidPayInfoService.loadData(hiddenLoading,function(){
                    init();
                });
            }
            else{
                $ionicScrollDelegate.$getByHandle("perpaidPay").resize();
                return;
            }
            $scope.$broadcast('scroll.refreshComplete');
        };

        //切换就诊者
        $scope.goCustomPatient = function(){
            $state.go('custom_patient');
        };

        //返回按钮
        $scope.back = function(){
            //中间态页面直接跳出去
            if($scope.status=='querying'||$scope.status=='queryFail'){
                if(PerpaidPayInfoService.inpatientEntrance){
                    $state.go('home->MAIN_TAB');
                    PerpaidPayInfoService.inpatientEntrance = false;//清空跳预缴标记
                }
                else if(PerpaidPayInfoService.isFromQRCode){
                    PerpaidPayInfoService.isFromQRCode = false;
                    $state.go('perpaid');
                }
                else{
                    $state.go('center->MAIN_TAB');
                }
            }
            else if($scope.status=='querySuccess'){
                if(PerpaidPayInfoService.inpatientEntrance){
                    $state.go('inpatient_payment_record');
                }
                else{
                    $state.go('perpaid');
                }
            }
            else if($scope.status =='existed' && PerpaidPayInfoService.isFromQRCode){
                $state.go('home->MAIN_TAB');
                PerpaidPayInfoService.isFromQRCode = false;
            }
            else{
                if ($ionicHistory.backView().stateName == "qrcode_skip_controller"
                    ||$ionicHistory.backView().stateName == "doctor_patient_relation"){
                    $state.go('home->MAIN_TAB');
                }else{
                    $ionicHistory.goBack();
                }
            }
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "perpaid_pay_info",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

        //取消验证
        $scope.cancel = function(){
            PerpaidPayInfoService.cancelCheck(function(){
                var perm = InpatientPaymentService.permissionData;
                //每日清单开通
                if(PerpaidPayInfoService.inpatientEntrance && perm && perm.INHOSPITAL_PERMISSION ==1){
                    InpatientPaymentService.paymentData.PRE_INP_NO = '';//清除每日清单中住院预缴默认住院号
                    $state.go('inpatient_payment_record');
                }
                else{
                    $state.go('perpaid');
                }
            });
        };

        //点击支付按钮后的跳转
        var afterPaySubmit = function (payInfo) {
            payInfo.ROUTER = "perpaid_record";
            PayOrderService.payData = payInfo;
            $state.go("payOrder");
        };

        //支付
        $scope.paySubmit = function () {
            var obj = {
                prePayedMoney:$scope.payInfo.prePayedMoney,
                INPATIENT_NO:$scope.payInfo.DATA.INPATIENT_NO
            };
            PerpaidPayInfoService.paySubmit(obj, afterPaySubmit);
        };

        //验证失败--下一步按钮
        $scope.goRecharge = function(){
            if($scope.payInfo.QUERY_TYPE==1&&!$scope.pagedata.inHospitalNo){
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get("perpaid_pay_info.warnInHospitalMsg","请输入住院号")
                });
                return;
            }
            PerpaidPayInfoService.perpaidNext = true;
            PerpaidPayInfoService.loadData(false,function(data){
                if(data){
                    init();
                }
            },$scope.pagedata.inHospitalNo);
        };

        //转换金额为大写
/*        $scope.changeToUppercase = function(){
            $scope.payInfo.uppercaseAmount = KyeeUtilsService.convertMoneyToChinese($scope.payInfo.prePayedMoney);
        };*/

        //点击充值记录事件
        $scope.goPerpaidRecord = function () {
            $state.go('perpaid_record');
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return '¥ ' + data;
            }
        };

        //点击切换医院
        $scope.changeHospital = function () {
            HospitalSelectorService.isFromPerpaidPayInfo = true;
            $state.go("hospital_selector");
        };
    })
    .build();