/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年8月25日10:10:07
 * 创建原因：就诊卡余额查询控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.card_balance.controller")
    .require([
        "kyee.quyiyuan.card_balance.service",
        "kyee.framework.directive.i18n.service"
    ])
    .type("controller")
    .name("CardBalanceController")
    .params(["$scope", "CardBalanceService", "CacheServiceBus", "KyeeMessageService","KyeeI18nService"])
    .action(function ($scope, CardBalanceService, CacheServiceBus, KyeeMessageService,KyeeI18nService) {
        $scope.isShowResult = false;//是否显示结果
        var memoryCache = CacheServiceBus.getMemoryCache();
        var cardNo = undefined;
        var patientName = '';
        var cardInfo = memoryCache.get('currentCardInfo');
        if (cardInfo) {
            //过滤虚拟卡（趣医） 程铄闵 KYEEAPPTEST-3747
            if (!(cardInfo && cardInfo.CARD_TYPE && cardInfo.CARD_TYPE == 0 && cardInfo.CARD_NO != undefined && cardInfo.CARD_NO.substring(0, 1) == "Q")) {
                cardNo = cardInfo.CARD_NO;
            }
            patientName = memoryCache.get('currentCardInfo').PATIENT_NAME;
        }
        //卡信息
        $scope.cardInfo = {
            cardNo: cardNo,
            patientName: patientName
        };
        $scope.placeCardNum = KyeeI18nService.get("card_balance.inputCardNum","请输入要查询的就诊卡号");
        $scope.placeCardName = KyeeI18nService.get("card_balance.inputCardName","请输入就诊卡绑定的就诊人姓名");
        //查询卡余额
        $scope.queryCardBalance = function () {
            if (!$scope.cardInfo.cardNo) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("card_balance.inputNum","请输入卡号")
                });
                return;
            }
            if (!$scope.cardInfo.patientName) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("card_balance.inputName","请输入姓名")
                });
                return;
            }
            //查询就诊卡余额
            CardBalanceService.queryCardBalance(function (data) {
                if (data) {
                    $scope.isShowResult = true;
                    $scope.cardNo = data.CARD_NO;
                    //如果后台传过来的金额为空，则置为0
                    if (!data.TOTAL_FEE) {
                        data.TOTAL_FEE = 0;
                    }
                    $scope.balance = '¥' + data.TOTAL_FEE;
                    $scope.date = data.QUERY_TIME.substr(0, 19);
                } else {
                    $scope.isShowResult = false;
                    $scope.cardNo = '';
                    $scope.balance = '';
                    $scope.date = '';
                }
            }, $scope.cardInfo);
        };
        //有卡号则查询，否则初始化不查询
        if(cardNo){
            //初始化查询
            $scope.queryCardBalance();
        }
    })
    .build();
