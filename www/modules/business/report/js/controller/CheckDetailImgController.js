/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2015/7/13
 * 创建原因：检查单详情图片控制
 * 任务号：KYEEAPPC-2640
 */
new KyeeModule()
    .group("kyee.quyiyuan.report.checkDetailImg.controller")
    .require(["kyee.quyiyuan.checkDetail.service"])
    .type("controller")
    .name("CheckDetailImgController")
    .params(["$scope","CheckDetailService","KyeeViewService","KyeeListenerRegister"])
    .action(function ($scope,CheckDetailService,KyeeViewService,KyeeListenerRegister) {
        $scope.selectImg = CheckDetailService.imgData;
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