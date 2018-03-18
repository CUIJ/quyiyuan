/**
 * 产品名称 KYMH
 * 创建用户: 高萌
 * 日期: 2016年6月15日
 * 时间: 14:16:01
 * 创建原因：调用上海停诊险购买页面，无标题
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.riskweburl.controller")
    .require(["kyee.quyiyuan.aboutquyi.service"])
    .type("controller")
    .name("RiskWebUrlController")
    .params(["$ionicLoading","$scope", "$sce", "AboutQuyiService","KyeeMessageService"])
    .action(function($ionicLoading,$scope, $sce, AboutQuyiService,KyeeMessageService){
       //显示loading圈
        var loading = function(){
            KyeeMessageService.loading({
                content: undefined,
                duration: 30000,
                mask: false
            });
        };
        loading();//进入页面显示

        var url = AboutQuyiService.webUrl;
        $scope.openUrl = $sce.trustAsResourceUrl(url);
        if($scope.openUrl == null || $scope.openUrl == "" || $scope.openUrl == undefined){
            KyeeMessageService.broadcast({
                content: KyeeI18nService.get("commonText.httpErrTips", "加载失败，似乎网络出问题了！"),
                duration: 3000
            });
        }
        $scope.name = AboutQuyiService.name;

      //隐藏loading圈
        window.hideLoadByHomeWebNoTitle = function(){
            $ionicLoading.hide();
        };
    })
    .build();
