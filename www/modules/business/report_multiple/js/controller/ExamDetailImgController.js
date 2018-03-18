/**
 * 产品名称 quyiyuan.
 * 创建用户: zhangming
 * 日期: 2015年11月15日09:05:22
 * 创建原因：检查单图片控制器
 * 任务号：KYEEAPPC-4047
 */
new KyeeModule()
    .group("kyee.quyiyuan.report.examDetailImg.controller")
    .require(["kyee.quyiyuan.report_multiple.service"])
    .type("controller")
    .name("ExamDetailImgController")
    .params(["$scope","ReportMultipleService","KyeeViewService","KyeeListenerRegister"])
    .action(function ($scope,ReportMultipleService,KyeeViewService,KyeeListenerRegister) {
        $scope.selectImg = ReportMultipleService.imgData;
        //监听物理返回
        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.removeImgModal();
            }
        });
        //点击大图页面消失
        $scope.removeImgModal = function(){
            KyeeViewService.removeModal({
                scope : $scope
            });
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);//离开此页面的时候将一次性事件卸载掉
        };
    })
    .build();