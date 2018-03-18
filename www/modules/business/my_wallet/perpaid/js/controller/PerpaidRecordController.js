/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016年6月8日16:09:11
 * 创建原因：住院预缴记录控制
 * 任务号：KYEEAPPC-6601
 * 修改者：张婧
 * 修改时间：2016年7月27日14:53:10
 * 修改原因：添加单击钮统计
 * 任务号：KYEEAPPC-6641
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.perpaidRecord.controller")
    .require(["kyee.quyiyuan.myWallet.perpaidRecord.service"])
    .type("controller")
    .name("PerpaidRecordController")
    .params(["$scope","PerpaidRecordService","KyeeUtilsService","CacheServiceBus","KyeeI18nService",
        "MyRefundDetailNewService","$state","$ionicHistory","KyeeListenerRegister",
        "PerpaidService","KyeeMessageService","$ionicListDelegate","PerpaidPayInfoService","OperationMonitor"])
    .action(function ($scope,PerpaidRecordService,KyeeUtilsService,CacheServiceBus,KyeeI18nService,
                      MyRefundDetailNewService,$state,$ionicHistory,KyeeListenerRegister,
                      PerpaidService,KyeeMessageService,$ionicListDelegate,PerpaidPayInfoService,OperationMonitor) {
        $scope.isEmpty = false;
        $scope.emptyText = undefined;
        var currentPage = 1;//当前是第1页
        var rows = 10; //每页显示数据为10条
        $scope.noLoad = true;//初始化加载状态
        $scope.perpaidRecords = [];//历史记录
        //外部通知跳转进来，显示返回键
        if(PerpaidRecordService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }
        //初始化住院预交记录
        $scope.loadPerpaidMore = function(){
            PerpaidRecordService.loadData(false,currentPage,rows,function(success,data){
                init(success,data);
            });
        };

        $scope.loadPerpaidMore();

        //初始化数据
        var init = function(success,data){
            if(success){
                if(data){
                    loadData(data);
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.noLoad = false;//已加载完成
                $scope.emptyText = data;
            }
            $scope.$broadcast('scroll.refreshComplete');
        };

        //加载更多页面方法
        var loadData = function(data){
            $scope.isViewCode = false;
            var total = data.total;//记录总数
            $scope.isEmpty = false;
            var arr = data.rows;
            //校验数据是否加载完
            //var currentNum =  $scope.perpaidRecords.length + arr.length;
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
            //追加加载数据
            //for(var i=0;i<arr.length;i++){
                //$scope.perpaidRecords.push(arr[i]);
                //$scope.perpaidRecords = arr[i];
            //}
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        //下拉刷新
        $scope.doRefresh = function(hiddenLoading){
            currentPage = 1;
            PerpaidRecordService.loadData(hiddenLoading,currentPage,rows,function(success,data){
                $scope.perpaidRecords = [];//重置数据
                $scope.noLoad = true;//重置加载状态
                init(success,data);
            });
        };

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

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
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

        //判断本月
        $scope.isCurrentMonth = function(date){
            var time = date.YEAR_OF_DATE +'/'+date.MONTH_OF_NUMBER;
            var cur = KyeeUtilsService.DateUtils.formatFromDate(new Date(),'YYYY/MM');
            return cur==time;
        };

        //返回按钮事件
        $scope.goBack = function(){
            if(PerpaidRecordService.webJump){
                //外部通知跳转进来,返回到首页
                PerpaidRecordService.webJump = undefined;
                $state.go('home->MAIN_TAB');
            }else if(PerpaidPayInfoService.inpatientEntrance){
                //入口:inpatient_payment_record(无已结算权限)
                if(PerpaidPayInfoService.inpatientToPerpaidRecord){
                    //PerpaidPayInfoService.inpatientToPerpaidRecord = false;//已结算未开通，inpatient_payment_record跳转预缴记录标记
                    $ionicHistory.goBack();
                }
                //入口perpaid(从医院首页来只有预缴权限)
                else if(PerpaidPayInfoService.fromInpatient){
                    //支付完成后
                    if(PerpaidRecordService.fromPayOrder){
                        PerpaidRecordService.fromPayOrder = false;
                        PerpaidPayInfoService.inpatientEntrance = false;//清空跳预缴标记
                        $state.go('home->MAIN_TAB');
                    }
                    else{
                        PerpaidPayInfoService.fromInpatient = false;
                        $ionicHistory.goBack();
                    }
                }
                else{
                    PerpaidPayInfoService.inpatientEntrance = false;//清空跳预缴标记
                    $state.go('home->MAIN_TAB');
                }
            }
            else if(PerpaidRecordService.fromMyquyiRecord){
                PerpaidRecordService.fromMyquyiRecord = false;
                $ionicHistory.goBack();
            }
            else{
                $state.go('perpaid');
            }
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "perpaid_record",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        //住院充值记录的删除
        $scope.delete = function ($index,record) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.msgTitle","消息"),
                content: KyeeI18nService.get("perpaid_record.delTip","请确认是否删除该条记录？"),
                onSelect: function (flag) {
                    if (flag) {
                        OperationMonitor.record("deleteRecord","perpaid_record");//添加按钮统计
                        var id = record.PRED_ID;
                        PerpaidRecordService.deleteRecord(function(){
                            $scope.perpaidRecords.splice($index, 1);
                            $scope.doRefresh(false);
                        },id);
                    }
                }
            });
        };

        //点击空白处
        $scope.click = function(){
            $ionicListDelegate.$getByHandle('perpaid_record_list').closeOptionButtons();
        };

    })
    .build();