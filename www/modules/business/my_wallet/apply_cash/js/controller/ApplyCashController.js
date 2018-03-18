/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年8月25日14:48:19
 * 创建原因：申请提现页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.applyCash.controller")
    .require(["kyee.quyiyuan.myWallet.applyCash.service","kyee.quyiyuan.myWallet.phoneFeeRecharge.service",
        "kyee.quyiyuan.rebate.rebateBank.controller", 'kyee.quyiyuan.myWallet.phoneFeeRecharge.controller'])
    .type("controller")
    .name("ApplyCashController")
    .params(["$scope", "$state", "CacheServiceBus", "ApplyCashService", "KyeeMessageService", "KyeeListenerRegister", 'KyeeI18nService', "AccountAuthenticationService", "PhoneFeeRechargeService","KyeePhoneService","OperationMonitor","$timeout","$compile"])

    .action(function ($scope, $state, CacheServiceBus, ApplyCashService, KyeeMessageService, KyeeListenerRegister, KyeeI18nService, AccountAuthenticationService, PhoneFeeRechargeService,KyeePhoneService,OperationMonitor,$timeout,$compile) {
        //判断页面是否显示提现小提示
        $scope.isShowapplyTips = undefined;
        KyeeListenerRegister.regist({
            focus: "apply_cash",
            direction: 'both',
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                /**
                 * 获取记录数据
                 */
                $scope.doRefresh(true);
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                //判断用户是否已经选择了医院，如果选择了医院出现提现小提示，没选则隐藏掉  By 杜巍巍 KYEEAPPTEST-3218
                if (hospitalInfo && hospitalInfo.id) {
                    $scope.isShowapplyTips = true;
                } else {
                    $scope.isShowapplyTips = false;
                }
            }
        });
        //刷新页面
        $scope.doRefresh = function (flag) {
            $scope.showCashDetail = false;
            ApplyCashService.getRecord(function (result) {
                if(result.SHOW_CASH_DETAIL!=null&&result.SHOW_CASH_DETAIL!=null&&result.SHOW_CASH_DETAIL!=''){
                    $scope.showCashDetail = result.SHOW_CASH_DETAIL;
                }else{
                    $scope.showCashDetail = false;
                }
                if (result !== false) {

                    $scope.records = result;
                    if (result.DETAIL_RECORD.length == 0) {
                        $scope.showEmpty = true;
                    } else {
                        $scope.showEmpty = false;
                    }
                }
                $scope.$broadcast('scroll.refreshComplete');
            }, flag, 
                function(response){
                if(response == "未选择医院"){
                    KyeeMessageService.broadcast({
                        content: "未选择医院",
                        duration: 3000
                    });
                    return;
                }else{
                    KyeeMessageService.broadcast({
                        content: response.message
                    });
                }
            });
        };

        //显示手机充值
        $scope.isSupportPhoneFeeCharge = function (applyCashType) {
            if (applyCashType != undefined && applyCashType.indexOf('2') != -1) {
                return true;
            }
            return false;
        };

        //显示银行卡提现
        $scope.isSupportRebateBank = function (applyCashType) {
            if (applyCashType != undefined && applyCashType.indexOf('1') != -1) {
                return true;
            }
            return false;
        };

        //显示失败原因
        $scope.showDetail = function (record) {
            if (record.SHOW_DETAIL_ICON) {
                KyeeMessageService.message({
                    title: KyeeI18nService.get('apply_cash.failDetail', '失败原因', null),
                    content: record.DETAIL_INFO
                });
            }
        };
        //显示免挂号费提示
        $scope.showTips = function () {
            KyeeMessageService.message({
                content: $scope.records.fundExplain
            });
            OperationMonitor.record("countApplyTips", "apply_cash");
        };

        //点击跳转到话费充值页面
        $scope.forwardPhoneFeeCharge = function () {
            if(checkMsg()){
                //查询用户是否是黑名单，如果是的话阻止用户进入话费充值页面  任务号：KYEEAPPC-4663
                ApplyCashService.checkBlackList(function (resp) {
                    if(resp.success){
                        PhoneFeeRechargeService.AMOUNT = $scope.records.CURRENT_BALANCE;
                        $state.go("phone_fee_charging");
                    }else if('0020612' == resp.resultCode){
                        $scope.blackListProcess(resp);
                    }else{
                        KyeeMessageService.broadcast(resp.message);
                    }

                });
            }
            OperationMonitor.record("countApplyByRecharge", "apply_cash");
        };
        //黑名单时的操作  任务号:KYEEAPPC-5133
        $scope.blackListProcess = function(resp){
            if(resp.message.indexOf('意见反馈')>-1){
                resp.message = resp.message.replace('意见反馈', '<span class="qy-blue text_decoration" ng-click="gofeedback()">意见反馈</span>');
            }
            //弹出对话框
            $scope.blacklistDetail = resp.message;
            $scope.footerClick();
            $scope.dialog = KyeeMessageService.dialog({
                tapBgToClose : true,
                template: "modules/business/regist/views/delay_views/blacklist_detail.html",
                scope: $scope,
                title: KyeeI18nService.get("apply_cash.userError","账号操作异常"),
                buttons: [{
                    text: KyeeI18nService.get("apply_cash.back","返回"),
                    click: function () {
                        $scope.dialog.close();
                    }
                }, {
                    text: KyeeI18nService.get("apply_cash.callPhone","拨打电话"),
                    style: "button button-block button-size-l",
                    click: function () {
                        KyeePhoneService.callOnly("4000801010");
                    }
                }]
            });
        };
        //跳到意见反馈页面 任务号:KYEEAPPC-5133
        $scope.gofeedback = function () {
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("aboutquyi_feedback");
            //统计意见反馈各入口点击数量  by 高萌  KYEEAPPC-5534
            OperationMonitor.record("aboutquyi_feedback", "blackListApplyCash");
        };

        //将html绑定的ng-click事件重新编译 任务号:KYEEAPPC-5133
        $scope.footerClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("blacklistDetail"));
                    element.html($scope.blacklistDetail);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };
        //点击银行卡提现
        $scope.forwardRebateBank = function () {
            if(checkMsg()){
                //查询用户是否是黑名单，如果是的话阻止用户进入银行卡提现页面  任务号：KYEEAPPC-4663
                ApplyCashService.checkBlackList(function (resp) {
                    if(resp.success){
                        $state.go("rebateBank");
                    }else if('0020612' == resp.resultCode){
                        $scope.blackListProcess(resp);
                    }else{
                        KyeeMessageService.broadcast(resp.message);
                    }
                });
            }
            OperationMonitor.record("countApplyByBank", "apply_cash");
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

        /**
         * 同步点击
         */
        $scope.onGetNjRecordBtn = function () {
            ApplyCashService.onGetNjRecordBtn($state);
            OperationMonitor.record("countOnGetNjRecordBtn", "apply_cash");
        };
    })
    .build();
