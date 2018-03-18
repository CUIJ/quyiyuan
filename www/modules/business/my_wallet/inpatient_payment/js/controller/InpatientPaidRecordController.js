/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/9/14
 * 创建原因：住院已结算主记录控制
 * 任务号：KYEEAPPC-3523
 * 修改者：程铄闵
 * 修改时间：2015年12月13日21:27:16
 * 修改原因：住院费用优化（2.1.10）
 * 任务号：KYEEAPPC-4453
 * 修改者：程铄闵
 * 修改时间：2016年6月17日10:22:51
 * 修改原因：2.2.40版住院已结算（医院首页入口）
 * 任务号：KYEEAPPC-6605
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientPaidRecord.controller")
    .require(["kyee.quyiyuan.myWallet.inpatientDetailRecord.controller",
        "kyee.quyiyuan.myWallet.inpatientPaid.service",
        "ngSanitize"])
    .type("controller")
    .name("InpatientPaidRecordController")
    .params(["$scope","$state","HospitalSelectorService","InpatientPaidService","KyeeListenerRegister",
    "KyeeMessageService","$ionicHistory","KyeeUtilsService","KyeeI18nService","PerpaidRecordService",
        "InpatientPaymentService","AuthenticationService","KyeeViewService","CacheServiceBus","$ionicScrollDelegate",
        "CommPatientDetailService","$timeout","$compile","MyRefundDetailNewService"])
    .action(function ($scope,$state,HospitalSelectorService,InpatientPaidService,KyeeListenerRegister,
                      KyeeMessageService,$ionicHistory,KyeeUtilsService,KyeeI18nService,PerpaidRecordService,
                      InpatientPaymentService,AuthenticationService,KyeeViewService,CacheServiceBus,$ionicScrollDelegate,
                      CommPatientDetailService,$timeout,$compile,MyRefundDetailNewService) {

        $scope.isEmpty = true;
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵
        $scope.showView = 'perpaid_record';//默认显示左边页面
        $scope.isPaid = 0;//当前页是否是住院历史 0-否；1-是
        //预缴分页变量初始化
        var currentPage = 1;//当前是第1页
        var rows = 10; //每页显示数据为10条
        $scope.noLoad = true;//初始化加载状态
        $scope.perpaidRecords = [];//历史记录

        //重置页面滚动
        var resizeView = function(){
            $timeout(
                function () {
                    if($ionicScrollDelegate.$getByHandle("inpatient_paid_record")){
                        $ionicScrollDelegate.$getByHandle("inpatient_paid_record").resize();
                    }
                },
                500
            );
        };

        //初始化点击事件
        var initClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("inpatient_paid_query_id"));
                    var element1=angular.element(document.getElementById("inpatient_paid_id"));
                    if($scope.paidData){
                        element.html($scope.paidData.TOP_TIP);
                    }
                    element1.html($scope.emptyText);
                    $compile(element.contents())($scope);
                    $compile(element1.contents())($scope);
                },
                1000
            );
        };

        //初始化权限
        var initPermission = function(){
            $scope.permission = InpatientPaymentService.permissionData;
            //预缴未开通直接初始化历史数据
            if($scope.permission.PRECHARGE_PERMISSION!=1){
                initPaidData();
            }
            else{
                $scope.loadPerpaidMore(false);
            }
        };

        /***初始化住院历史***/
        //初始化查询页数据
        var initQueryData = function(){
            $scope.isEmpty = false;
            $scope.placeholder = {
                pHInvoice:KyeeI18nService.get("inpatient_paid_record.pHInvoice","请输入发票号"),
                pHHospitalCode:KyeeI18nService.get("inpatient_paid_record.pHHospitalCode","请输入住院号")
            };
            $scope.queryObj = {
                hospitalCode : "",
                invoiceNo:""
            };
        };

        //初始化住院历史数据
        var initPaidData = function(){
            initClick();
            $scope.isPaid = 1;
            var data = InpatientPaidService.paidData;
            //$scope.emptyText = undefined;//重置空数据标记
            //$scope.isEmpty = true;
            if(data && data.success){
                $scope.paidData = data;
                $scope.isEmpty = false;
                //有数据
                if(data.TOTAL>0){
                    $scope.showView = 'paid_record';
                    resizeView();
                }
                else{
                    //直连无数据&住院号|发票号
                    if(data.SHOW_INPUT_VIEW==1){
                        $scope.showView = 'paid_query';
                        initQueryData();
                        resizeView();
                    }
                    else{
                        $scope.isEmpty = true;
                        $scope.emptyText = data.RESULT_TIP;
                        $scope.showView = 'paid_record';
                        resizeView();
                    }
                }
                $scope.$broadcast('scroll.refreshComplete');
            }
            else{
                $scope.isEmpty = true;
                $scope.showView = 'paid_record';
                $scope.emptyText = InpatientPaidService.emptyText;
            }
        };

        /***初始化住院预缴***/
        //初始化预缴数据
        var initPerpaidData = function(success,data){
            if(success){
                if(data){
                    loadPerpaidData(data);
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.noLoad = false;//已加载完成
                $scope.emptyText = data;
            }
            $scope.$broadcast('scroll.refreshComplete');
        };

        //加载更多预缴数据
        var loadPerpaidData = function(data){
            $scope.isViewCode = false;
            var total = data.total;//记录总数
            $scope.isEmpty = false;
            var arr = data.rows;
            currentPage++;
            $scope.perpaidRecords = arr;
            for(var i=0;i<arr.length;i++){
                for(j=0;j<arr[i].PAYMENT_INFO.length;j++){
                    if(arr[i].PAYMENT_INFO[j].HIS_STATUS==1 &&arr[i].PAYMENT_INFO[j].EXTRACT_CODE ){
                        $scope.isViewCode=true;//只要预交明细中含有缴费成功的就会提示文字描述
                        break;
                    }
                }
            }

            if(data.loadedAll){
                $scope.noLoad = false;//已加载完成
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        //加载住院历史
        $scope.loadPaid = function(hiddenLoading,queryObj){
            //$scope.isPaid = 1;
            //初始化数据
            InpatientPaidService.loadRecordData(function(){
                $scope.isPaid = 1;
                initPaidData();
            },queryObj,hiddenLoading);
        };

        //加载更多预缴历史
        $scope.loadPerpaidMore = function(hiddenLoading){
            if($scope.permission && $scope.permission.PRECHARGE_PERMISSION==1 && $scope.isPaid==0) {
                initQueryData();
                $scope.showView = 'perpaid_record';
                resizeView();
                $scope.isPaid = 0;
                //初始化数据
                PerpaidRecordService.loadData(hiddenLoading, currentPage, rows, function (success, data) {
                    initPerpaidData(success, data);
                });
            }
            else{
                return;
            }
        };

        /***公共调用***/

        //页面监听
        KyeeListenerRegister.regist({
            focus: "inpatient_paid_record",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //删除后返回
                if(InpatientPaidService.afterDelete){
                    InpatientPaidService.afterDelete = false;
                    $scope.loadPaid();
                    $scope.isPaid = 1;
                }
                else if(InpatientPaidService.fromMyquyiRecord){
                    $scope.loadPaid();
                }
                else{
                    //初始化
                    initPermission();
                }
            }
        });

        //刷新
        $scope.doRefresh = function(isPaid,hiddenLoading){
            resizeView();
            if(isPaid==1){
                if($scope.showView == 'paid_query'){
                    $scope.isPaid = 1;
                    var paid = {};
                    paid.TOP_TIP = $scope.paidData.TOP_TIP;
                    paid.SHOW_INP = $scope.paidData.SHOW_INP;
                    paid.SHOW_INVOICE = $scope.paidData.SHOW_INVOICE;
                    $scope.paidData = [];
                    $scope.paidData = paid;
                    return;
                }
                else{
                    $scope.paidData = [];
                    $scope.loadPaid(hiddenLoading,$scope.queryObj);
                }
            }
            else{
                $scope.isPaid = 0;
                currentPage = 1;//当前是第1页
                $scope.noLoad = true;//初始化加载状态
                $scope.perpaidRecords = [];//历史记录
                $scope.loadPerpaidMore(hiddenLoading);
            }
        };


        /***住院历史***/

        //已结算详情
        $scope.showDetail = function(v){
            InpatientPaidService.paidDetail = v;
            InpatientPaidService.afterDelete = true;
            $state.go('inpatient_paid_detail');
        };

        //判断本月
        $scope.isCurrentMonth = function(date){
            var time = date.YEAR_OF_DATE +'/'+date.MONTH_OF_NUMBER;
            var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM');
            return cur==time;
        };

        //修改查询条件
        $scope.modifyMode = function(){
            InpatientPaidService.isModifyMode = 1;
            //跳转至个人信息页
            if($scope.paidData.SHOW_PERSION){
                var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var current = angular.copy(currentPatient);
                CommPatientDetailService.editPatient(current);
            }
            else{
                resizeView();
                initQueryData();
                $scope.showView = 'paid_query';
            }
        };

        //查看更多
        $scope.changeMore = function(){
            InpatientPaidService.isModifyMode = undefined;
            //跳转至个人信息页
            if($scope.paidData.SHOW_PERSION){
                var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var current = angular.copy(currentPatient);
                CommPatientDetailService.editPatient(current);
            }
            else{
                resizeView();
                initQueryData();
                $scope.showView = 'paid_query';
            }
        };

        //住院历史下一步按钮
        $scope.nextStep = function(){
            var hospitalCode = $scope.queryObj.hospitalCode.trim();
            var invoiceNo = $scope.queryObj.invoiceNo.trim();
            //住院号校验
            if($scope.paidData.SHOW_INP){
                if(hospitalCode==undefined||hospitalCode==''){
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("inpatient_paid_record.checkHospitalCode","请输入住院号")
                    });
                    return;
                }
            }
            //发票号校验
            else if($scope.paidData.SHOW_INVOICE){
                if(invoiceNo==undefined||invoiceNo==''){
                    KyeeMessageService.broadcast({
                        content:KyeeI18nService.get("inpatient_paid_record.checkInvoice","请输入发票号")
                    });
                    return;
                }
            }
            var queryObj = {
                hospitalCode : hospitalCode,
                invoiceNo : invoiceNo
            };
            InpatientPaidService.loadRecordData(function(){
                initPaidData();
            },queryObj,false);
        };

        //清空住院号
        $scope.clearNo = function(){
            $scope.queryObj.hospitalCode = "";
            $scope.queryObj.invoiceNo = "";
        };


        /***住院预缴***/

        //转换缴费状态
        $scope.convertStatus = function(v){
            //0:正在处理，1成功 2 失败 3已退费
            if(v == 0){
                return KyeeI18nService.get("perpaid_record.hisStatus0","缴费处理中");
            }
            else if(v == 1){
                return KyeeI18nService.get("perpaid_record.hisStatus1","预缴成功");
            }
            else if(v == 2){
                return KyeeI18nService.get("perpaid_record.hisStatus2","预缴失败");
            }
            else if(v == 3){
                return KyeeI18nService.get("perpaid_record.hisStatus3","已退费");
            }
            else if(v == 4){
                return "退费处理中";
            }
        };

        //查看详情
        $scope.goDetail = function(item){
            //已退费
            if(item.HIS_STATUS == 3){
                MyRefundDetailNewService.OUT_TRADE_NO=item.OUT_TRADE_NO;
                $state.go('refund_detail_new');
            }
        };

        //预缴记录的删除
        $scope.delete = function ($index,record) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.msgTitle","消息"),
                content: KyeeI18nService.get("inpatient_paid_record.delTip","请确认是否删除该条记录？"),
                onSelect: function (flag) {
                    if (flag) {
                        var id = record.PRED_ID;
                        PerpaidRecordService.deleteRecord(function(){
                            $scope.perpaidRecords.splice($index, 1);
                            $scope.doRefresh(0);
                        },id);
                    }
                }
            });
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //日期格式转换
        $scope.convertDate = function(v){
            if(v){
                return KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
            }
        };

        //跳转到实名认证 程铄闵 KYEEAPPC-4806 (已废弃)
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

            InpatientPaidService.authFlag = true;

            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });
        };

    })
    .build();