/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年8月25日14:48:19
 * 创建原因：优惠抵用页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.coupons.controller")
    .require(["kyee.quyiyuan.myWallet.coupons.service"])
    .type("controller")
    .name("CouponsController")
    .params(["$scope", "$state", "CouponsService",
        "KyeeMessageService", "KyeeUtilsService","KyeeI18nService"])
    .action(function ($scope, $state, CouponsService,
                      KyeeMessageService, KyeeUtilsService,KyeeI18nService) {
        $scope.placetxt=KyeeI18nService.get('coupons.inputPlaceHolder','请输入抵用券号码',null);
        //计算活动规则的最大宽度
        $scope.activityRuleWidth = window.innerWidth - 50 + 'px';
        /**
         * 抵用券兑换点击按钮函数
         * @param coupons
         */
        $scope.exchangeCoupons = function (coupons) {

            if($scope.data.couponsOpen == 0){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('coupons.unOpenMsg','抵用券兑换活动暂未开放',null)
                });
                return;
            }

            // 判空操作
            if(coupons == undefined || coupons.trim() == ""){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('coupons.inputTicketFirst','请先输入抵用券号！',null)
                });
                return;
            }

            // 兑换抵用券操作
            CouponsService.exchangeCoupons(coupons.trim(), function (data) {
                if(data.success){
                    KyeeMessageService.broadcast({
                        content: data.message
                    });
                    queryCouponsExchangeRecord();
                } else {
                    if(data !=null && data.resultCode=='0045102'){
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    } else {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get('commonText.networkErrorMsg','网络异常，请稍后重试！',null)
                        });
                    }

                }
            });
        };

        /**
         * 查询抵用券兑换记录
         */
        var queryCouponsExchangeRecord = function () {
            CouponsService.queryCouponsExchangeRecord(function (data) {

                if(data.LIST){
                    for(var i = 0;i < data.LIST.length;i++){
                        if(data.LIST[i].START_DATE){
                            data.LIST[i].START_DATE = KyeeUtilsService.DateUtils.formatFromString(
                                data.LIST[i].START_DATE, 'YYYY-MM-DD', 'YYYY/MM/DD');
                        }

                        if(data.LIST[i].END_DATE){
                            data.LIST[i].END_DATE = KyeeUtilsService.DateUtils.formatFromString(
                                data.LIST[i].END_DATE, 'YYYY-MM-DD', 'YYYY/MM/DD');
                        }
                    }

                    if(data.LIST && data.LIST.length > 0){
                        $scope.showEmpty = false;
                    } else {
                        $scope.showEmpty = true;
                    }
                };

                $scope.data = data;
            });
        };

        queryCouponsExchangeRecord();

        /**
         * 展示可提现金额
         * @param data
         */
        $scope.showActRule = function (data) {
            KyeeMessageService.message({
                content: KyeeI18nService.get('coupons.canGetMoney','可提现金额：',null) + data
            });
        };

        /**
         * 显示隐藏免挂号费说明
         */
        $scope.showFundExplain = function () {

            if($scope.showRule){
                $scope.showRule = false;
            } else {
                $scope.showRule = true;
            }
        }

    })
    .build();
