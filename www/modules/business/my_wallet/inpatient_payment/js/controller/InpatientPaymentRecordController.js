/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/9/2
 * 创建原因：我的钱包--住院业务待缴记录控制
 * 任务号：KYEEAPPC-3277
 * 修改者：程铄闵
 * 修改时间：2015年11月4日17:34:25
 * 修改原因：去掉住院记录展示
 * 任务号：KYEEAPPC-3870
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:27:16
 * 修改原因：住院费用优化（2.1.10）
 * 任务号：KYEEAPPC-4453
 * 修改者：程铄闵
 * 修改时间：2016年6月17日10:22:51
 * 修改原因：2.2.40版住院费用（医院首页入口）
 * 任务号：KYEEAPPC-6603
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientPaymentRecord.controller")
    .require(["kyee.quyiyuan.myWallet.inpatientPaymentDetail.controller",
        "kyee.quyiyuan.myWallet.inpatientPayment.service",
        "kyee.quyiyuan.myWallet.perpaidPayInfo.controller",
        "kyee.quyiyuan.myWallet.inpatientPaidRecord.controller",
        "kyee.quyiyuan.myWallet.inpatientPaid.service",
        "ngSanitize",
        "kyee.quyiyuan.myWallet.inpatientPaymentQueryController.controller",//程铄闵 删除冗余代码 KYEEAPPC-5641
        "kyee.quyiyuan.myWallet.inpatientPaymentDetail.service"

    ])
    .type("controller")
    .name("InpatientPaymentRecordController")
    .params(["$scope","$state","InpatientPaymentService","$ionicHistory","KyeeListenerRegister",
        "KyeeUtilsService","CacheServiceBus","InpatientPaidService","KyeeMessageService","KyeeI18nService",
        "HospitalSelectorService","$compile","$timeout","KyeeViewService","AuthenticationService",
        "$ionicScrollDelegate","InpatientPaymentDetailService","PerpaidService","PerpaidPayInfoService",
        "CommPatientDetailService"])
    .action(function ($scope,$state,InpatientPaymentService,$ionicHistory,KyeeListenerRegister,
                      KyeeUtilsService,CacheServiceBus,InpatientPaidService,KyeeMessageService,KyeeI18nService,
                      HospitalSelectorService,$compile,$timeout,KyeeViewService,AuthenticationService,
                      $ionicScrollDelegate,InpatientPaymentDetailService,PerpaidService,PerpaidPayInfoService,
                      CommPatientDetailService) {
        $scope.IS_SHOW_BALANCE = true;//住院每日清单是否屏蔽当前账户余额 （默认显示）
        //初始化权限
        var initPermission = function(){
            var permissionTemp = InpatientPaymentService.permissionData;
            if (!permissionTemp) {	//满足条件表示不是从APP点击登录的，而是诸如点击短信中链接的方式
                InpatientPaymentService.loadPermission(function(route){
                    $scope.permission = InpatientPaymentService.permissionData;
                    var data = InpatientPaymentService.paymentData;
                    $scope.isEmpty = true;
                    $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
                    if(data.success){
                        $scope.isEmpty = false;
                        //住院每日清单是否屏蔽当前账户余额
                        if(data.IS_SHOW_BALANCE && data.IS_SHOW_BALANCE == 1){
                            $scope.IS_SHOW_BALANCE = true;
                        }else{
                            $scope.IS_SHOW_BALANCE = false;
                        }
                        //有数据
                        if(data.TOTAL>0){
                            $scope.inPaymentData = data.INFO;
                            $scope.inPaymentData.INHOSPITA_QUERYTYPE = data.INHOSPITA_QUERYTYPE;
                            $scope.inPaymentData.QUERY_PROGRESS = data.QUERY_PROGRESS;
                            $scope.inPaymentData.TOTAL = data.TOTAL;
                            $scope.inPaymentData.SHOW_INPUT_VIEW = data.SHOW_INPUT_VIEW;
                            $scope.inPaymentData.PRECHARGE_QUERYTYPE = data.PRECHARGE_QUERYTYPE;
                            $scope.inPaymentData.NO_PERMISSION = data.NO_PERMISSION;//预缴未开通-提示语
                        }
                        else{
                            //预缴未开通--背景提示
                            if($scope.permission.PRECHARGE_PERMISSION!=1){
                                $scope.isEmpty = true;
                                $scope.inPaymentData = data;
                                if(data.QUERY_PROGRESS == "DONE"){
                                    $scope.emptyText = data.RESULT_TIP;
                                }
                                else{
                                    $scope.emptyText = data.KIND_TIP;
                                }
                            }
                            else{
                                initPatientInfo();
                                $scope.inPaymentData = data;
                            }
                        }
                    }
                    else{
                        $scope.isEmpty = true;
                        $scope.emptyText = InpatientPaymentService.emptyText;
                        $scope.inPaymentData = InpatientPaymentService.inPaymentData;//第一层数据
                    }
                });
            }
            KyeeMessageService.hideLoading();//取消遮罩
            $scope.permission = InpatientPaymentService.permissionData;
        };

        //初始化个人信息
        var initPatientInfo = function(){
            $scope.placeholder = {
                pHInHospitalNo:KyeeI18nService.get("inpatient_payment_record.pHInHospitalNo","请输入住院号")
            };
            $scope.pagedata = {
                name:"",
                idNo:"",
                inHospitalNo:undefined
            };
            var data = InpatientPaymentService.paymentData;
            if(data && data.PRE_INP_NO){
                $scope.pagedata.inHospitalNo = data.PRE_INP_NO;
            }
            var patientInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            $scope.pagedata.name = patientInfo.OFTEN_NAME;
            $scope.pagedata.idNo = PerpaidService.convertIdNo(patientInfo.ID_NO);
        };

        //有数据时初始化赋值
        var initData = function(){
            initPermission();
            initClick();
            var data = InpatientPaymentService.paymentData;
            $scope.isEmpty = true;
            $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
            if(data.success){
                //住院每日清单是否屏蔽当前账户余额
                if(data.IS_SHOW_BALANCE && data.IS_SHOW_BALANCE == 1){
                    $scope.IS_SHOW_BALANCE = true;
                }else{
                    $scope.IS_SHOW_BALANCE = false;
                }
                $scope.isEmpty = false;
                //有数据
                if(data.TOTAL>0){
                    $scope.inPaymentData = data.INFO;
                    $scope.inPaymentData.INHOSPITA_QUERYTYPE = data.INHOSPITA_QUERYTYPE;
                    $scope.inPaymentData.QUERY_PROGRESS = data.QUERY_PROGRESS;
                    $scope.inPaymentData.TOTAL = data.TOTAL;
                    $scope.inPaymentData.SHOW_INPUT_VIEW = data.SHOW_INPUT_VIEW;
                    $scope.inPaymentData.PRECHARGE_QUERYTYPE = data.PRECHARGE_QUERYTYPE;
                    $scope.inPaymentData.NO_PERMISSION = data.NO_PERMISSION;//预缴未开通-提示语
                }
                else{
                    //预缴未开通--背景提示
                    if($scope.permission.PRECHARGE_PERMISSION!=1){
                        $scope.isEmpty = true;
                        $scope.inPaymentData = data;
                        if(data.QUERY_PROGRESS == "DONE"){
                            $scope.emptyText = data.RESULT_TIP;
                        }
                        else{
                            $scope.emptyText = data.KIND_TIP;
                        }
                    }
                    else{
                        initPatientInfo();
                        $scope.inPaymentData = data;
                    }
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.emptyText = InpatientPaymentService.emptyText;
                $scope.inPaymentData = InpatientPaymentService.inPaymentData;//第一层数据
            }
        };

        //初始化点击事件
        var initClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("inpatient_pay_tip_id"));
                    var element1=angular.element(document.getElementById("inpatient_pay_bg_tip_id"));
                    element.html($scope.inPaymentData.RESULT_TIP);
                    element1.html($scope.emptyText);
                    $compile(element.contents())($scope);
                    $compile(element1.contents())($scope);
                },
                1000
            );
        };

        KyeeListenerRegister.regist({
            focus: "inpatient_payment_record",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.isfromPerpaid = false;
                initData();
                var forwardView = $ionicHistory.forwardView();
                if(PerpaidPayInfoService.inpatientEntrance && !PerpaidPayInfoService.inpatientToPerpaidRecord){
                    //去掉无数据的头部状态
                    $scope.isfromPerpaid = true;
                    PerpaidPayInfoService.inpatientEntrance = false;//清空跳预缴标记
                }
                PerpaidPayInfoService.inpatientToPerpaidRecord = false;//已结算未开通，inpatient_payment_record跳转预缴记录标记
                if(forwardView&&forwardView.stateId=='custom_patient'){
                    initPatientInfo();
                    $scope.pagedata.inHospitalNo = InpatientPaymentService.PerInpNo;
                }
            }
        });

        //下拉刷新
        $scope.doRefresh = function(hiddenLoading){
            var data = $scope.inPaymentData;
            //结果无数据or从预缴返回 不可以下拉刷新
            if((data.TOTAL==0&&data.QUERY_PROGRESS=='DONE')||$scope.isfromPerpaid){
                $ionicScrollDelegate.$getByHandle("inpatient_payment_record").resize();
                return;
            }
            else{
                var obj = InpatientPaymentService.queryObj;
                var queryObj;
                //如果有数据下拉刷新带住院号
                if(data.TOTAL>0 && obj){
                    queryObj = obj;
                }
                InpatientPaymentService.loadRecordData(hiddenLoading,function(){
                    initData();
                    $scope.$broadcast('scroll.refreshComplete');
                },queryObj);
            }
        };

        var loadPerpaid = function(obj,homeInpNo){
            PerpaidPayInfoService.inpatientEntrance = true;
            PerpaidPayInfoService.perpaidNext = true;
            PerpaidPayInfoService.loadData(false,function(data){
                if(data){
                    $state.go('perpaid_pay_info');
                }
            },obj,homeInpNo);
        };

        //预缴点击下一步
        $scope.nextStep = function(){
            var data = $scope.inPaymentData;
            if(data.PRECHARGE_QUERYTYPE==1 && !$scope.pagedata.inHospitalNo){
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get("inpatient_payment_record.warnInHospitalMsg","请输入住院号")
                });
                return;
            }
            if(data.PRECHARGE_QUERYTYPE==1 && data.PRE_INP_NO && $scope.pagedata.inHospitalNo != data.PRE_INP_NO){
                $scope.pagedata.inHospitalNo = data.PRE_INP_NO;//用默认已存在的住院号
                KyeeMessageService.broadcast({
                    content:data.ALERT_MSG
                });
            }
            loadPerpaid($scope.pagedata.inHospitalNo);
        };

        //底部住院预缴按钮
        $scope.goPerpaid = function(){
            if($scope.permission.PRECHARGE_PERMISSION==1){
                var data = $scope.inPaymentData;
                var obj = '';
                //住院号方式&&无正在预缴中间态数据 传住院号
                if(data.SHOW_INPUT_VIEW=='0'&& data.PRECHARGE_QUERYTYPE==1){
                    obj = data.INP_NO;
                }
                loadPerpaid(obj,data.INP_NO);
            }
        };

        //查看每条费用详情
        $scope.goDetailRecord = function(item){
            InpatientPaymentDetailService.detailItem = item;
            $state.go('inpatient_payment_detail');
        };

        //修改查询条件
        $scope.modifyMode = function(){
            if($scope.inPaymentData.SHOW_INP){
                InpatientPaymentService.fromModifyMode = true;//从切换查询条件切换到查住院号
                $state.go('inpatient_payment_query');
            }
            else if($scope.inPaymentData.SHOW_PERSION) {
                //跳转至个人信息页
                var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var current = angular.copy(currentPatient);
                CommPatientDetailService.editPatient(current);
            }
        };

        //切换就诊者
        $scope.goCustomPatient = function(){
            InpatientPaymentService.paymentData.PRE_INP_NO = '';//清除每日清单中住院预缴默认住院号
            $state.go('custom_patient');
        };

        //跳转到住院费用历史页面
        $scope.goPaidRecord = function(){
            //预缴开通
            if($scope.permission.PRECHARGE_PERMISSION == 1){
                $state.go('inpatient_paid_record');
            }
            else{
                InpatientPaidService.loadRecordData(function(){
                    $state.go('inpatient_paid_record');
                });
            }
        };

        //点击住院预缴记录事件
        $scope.goPerpaidRecord = function () {
            PerpaidPayInfoService.inpatientEntrance = true;
            PerpaidPayInfoService.inpatientToPerpaidRecord = true;//已结算未开通，跳转预缴记录标记
            $state.go('perpaid_record');
        };

        //返回按钮
        $scope.back = function(){
            var data = $scope.inPaymentData;
            //查询中
            var objParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
            var  msg_source_flag = false; //短信标识
            if(objParams!=null&& objParams!=undefined && objParams.msgSourceFlag){
                msg_source_flag = objParams.msgSourceFlag;
            }
            if(data.QUERY_PROGRESS=='QUERYING'){
                $state.go('home->MAIN_TAB');
            }else if(msg_source_flag){
                $state.go('home->MAIN_TAB');
            }
            else{
                $ionicHistory.goBack();
            }
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "inpatient_payment_record",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

        //清空住院号
        $scope.clearNo = function(){
            $scope.pagedata.inHospitalNo = "";
        };

        //日期格式转换
        $scope.convertDate = function(v){
            if(v){
                return KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
            }
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //跳转到实名认证 程铄闵 KYEEAPPC-4806  已废弃（暂保留）
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
            //是否重实名认证跳转来
            InpatientPaymentService.authFlag = true;

            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });
        };

        //跳转到切换医院 --- 废弃
        $scope.goToHospitalView = function(){
            HospitalSelectorService.isFromInpatientPay = true;
            $state.go('hospital_selector');
        };
    })
    .build();