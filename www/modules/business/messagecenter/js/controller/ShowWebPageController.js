/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年8月7日14:22:29
 * 创建原因：显示网页控制器
 * 任务号：KYEEAPPC-2965
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.show_web_page.controller")
    .require(["kyee.quyiyuan.messagecenter.show_web_page.service"])
    .type("controller")
    .name("ShowWebPageController")
    .params(["$scope", "$state", "$sce", "ShowWebPageService"])
    .action(function ($scope, $state, $sce, ShowWebPageService) {
        $scope.openUrl = $sce.trustAsResourceUrl(ShowWebPageService.url);
        //页面标题
        $scope.title = ShowWebPageService.title;
        $scope.buttoText = ShowWebPageService.buttoText;
        $scope.jumpRouter = ShowWebPageService.jumpRouter;
        //跳转到对应的路由
        $scope.jump = function(router){
            if(router!=''&&router !=undefined){
                $state.go(router);
            }
        }
    })
    .build();
