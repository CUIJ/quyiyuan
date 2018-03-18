/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年8月7日14:46:15
 * 创建原因：显示html标签控制器
 * 任务号：KYEEAPPC-2965
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.show_html.controller")
    .require(["kyee.quyiyuan.messagecenter.show_html.service"])
    .type("controller")
    .name("ShowHtmlController")
    .params(["$scope", "$state", "ShowHtmlService"])
    .action(function($scope, $state, ShowHtmlService){
        $scope.messageHtml = ShowHtmlService.messageHtml;
        //页面标题
        $scope.title = ShowHtmlService.title;
        $scope.buttoText = ShowHtmlService.buttoText;
        $scope.jumpRouter = ShowHtmlService.jumpRouter;
        //跳转到对应路由
        $scope.jump = function(router){
            if(router!=''&&router !=undefined){
                $state.go(router);
            }
        }
    })
    .build();
