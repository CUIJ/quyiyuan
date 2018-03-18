/*
 * 产品名称：quyiyuan
 * 创建人: hemeng
 * 创建日期:2016年6月21日11:01:30
 * 创建原因：缴费返现活动说明页面
 * 任务号：KYEEAPPC-6712
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.cashback.controller")
    .require([
        "kyee.quyiyuan.myWallet.cashback.service"
    ])
    .type("controller")
    .name("CashbackController")
    .params(["$scope", "$rootScope", "$state","CacheServiceBus","CashbackService","$ionicHistory",
        "KyeeI18nService","KyeeMessageService"])
    .action(function($scope,$rootScope,$state,CacheServiceBus,CashbackService,$ionicHistory,
                     KyeeI18nService,KyeeMessageService){

        CashbackService.loadData(function(data){
            $scope.cashbackUrl = data.rules;
        });

        $scope.back = function(){
            $ionicHistory.goBack();
        };
    })
    .build();