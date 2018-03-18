/*
 * 产品名称：quyiyuan
 * 创建人: 吴伟刚
 * 创建日期:2015年12月9日11:17:36
 * 创建原因：住院预交页面优化
 * 任务号：KYEEAPPC-4454
 * 修改者：程铄闵
 * 修改时间：2015年12月15日18:39:55
 * 修改原因：住院预缴优化
 * 任务号：KYEEAPPTEST-3181
 * 修改者：程铄闵
 * 修改时间：2016年6月8日16:09:11
 * 修改原因：住院预缴优化
 * 任务号：KYEEAPPC-6601
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.perpaid.controller")
    .require([
        "kyee.quyiyuan.myWallet.perpaid.service",
        "kyee.quyiyuan.myWallet.perpaidRecord.controller"
    ])
    .type("controller")
    .name("PerpaidController")
    .params(["$scope", "$state","CacheServiceBus","PerpaidService","KyeeListenerRegister",
        "KyeeI18nService","KyeeMessageService","InpatientPaymentService","$ionicHistory","PerpaidPayInfoService",
        "HospitalSelectorService","InpatientPaidService"])
    .action(function($scope,$state,CacheServiceBus,PerpaidService,KyeeListenerRegister,
                     KyeeI18nService,KyeeMessageService,InpatientPaymentService,$ionicHistory,PerpaidPayInfoService,
                     HospitalSelectorService,InpatientPaidService){

        //初始化住院费用入口数据
        var initInpatientEntrance = function(){
            $scope.showInpaitentPaid = false;
            $scope.fromInpatient = false;
            $scope.isFromQRCode = false;
            var perm = InpatientPaymentService.permissionData;
            //从住院费用过来且开通住院已结算功能
            if(PerpaidPayInfoService.inpatientEntrance){
                //$scope.perpaidData = {};
                $scope.perpaidData.HOSPITAL_TIP = perm.HOSPITAL_TIP;
                $scope.perpaidData.QUERY_TYPE = perm.PRECHARGE_QUERYTYPE;
                $scope.fromInpatient = true;//从住院费用来
                PerpaidPayInfoService.fromInpatient = true;
                if(perm&&perm.INHOSPITALHISTORY_PERMISSION==1){
                    $scope.showInpaitentPaid = true;
                }
            }
            //从扫描二维码进来
            if(PerpaidService.isFromQRCode){
                $scope.fromInpatient = true;
                $scope.isFromQRCode = true;
            }
        };

        //初始化数据
        var initData = function(){
            $scope.placeholder = {
                pHInHospitalNo:KyeeI18nService.get("perpaid.pHInHospitalNo","请输入住院号")
            };
            $scope.pagedata = {
                name:"",
                idNo:"",
                inHospitalNo:undefined
            };
            var storageCache = CacheServiceBus.getStorageCache();
            var memoryCache = CacheServiceBus.getMemoryCache();
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var patientInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            $scope.hospitalName = hospitalInfo.name;
            $scope.hospitalLogo = PerpaidService.getHospitalLogo(hospitalInfo.id);
            $scope.pagedata.name = patientInfo.OFTEN_NAME;
            $scope.pagedata.idNo = PerpaidService.convertIdNo(patientInfo.ID_NO);
            var data = PerpaidService.permissionData;
            $scope.perpaidData = data;
            if(data.INP_NO){
                $scope.pagedata.inHospitalNo = data.INP_NO;
            }
            //未开通
            if(data.PERMISSION != 1){
                $scope.isEmpty = true;
            }
            else{
                $scope.isEmpty = false;
            }
            initInpatientEntrance();
        };

        initData();

        //点击下一步
        $scope.goRecharge = function(){
            if(!$scope.pagedata.name){
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get("perpaid.warnMsg","请输入姓名")
                });
                return;
            }
            if($scope.perpaidData.QUERY_TYPE==1&&!$scope.pagedata.inHospitalNo){
                KyeeMessageService.broadcast({
                    content:KyeeI18nService.get("perpaid.warnInHospitalMsg","请输入住院号")
                });
                return;
            }
            PerpaidPayInfoService.perpaidNext = true;
            PerpaidPayInfoService.loadData(false,function(data){
                if(data){
                    $state.go('perpaid_pay_info');
                }
            },$scope.pagedata.inHospitalNo);
        };

        //查看充值记录
        $scope.goHistoryRecord = function(){
            $state.go('perpaid_record');
        };

        //点击切换医院
        $scope.changeHospital = function () {
            HospitalSelectorService.isFromPerpaid = true;
            $state.go("hospital_selector");
        };

        //切换就诊者
        $scope.goCustomPatient = function(){
            $state.go('custom_patient');
        };

        //清空住院号
        $scope.clearNo = function(){
            $scope.pagedata.inHospitalNo = "";
        };

        //返回按钮
        $scope.back = function(){
            if(PerpaidPayInfoService.inpatientEntrance){
                PerpaidPayInfoService.inpatientEntrance = false;
                $state.go('home->MAIN_TAB');
            }
            else if(PerpaidService.isFromQRCode){
                //从扫描二维码进来
                PerpaidService.isFromQRCode = false;
                $scope.isFromQRCode = false;
                $state.go('home->MAIN_TAB');
            }
            else{
                $state.go('center->MAIN_TAB');
            }
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "perpaid",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

        //跳转到住院费用历史页面
        $scope.goPaidRecord = function(){
            InpatientPaidService.loadRecordData(function(){
                $state.go('inpatient_paid_record');
            });
        };
    })
    .build();