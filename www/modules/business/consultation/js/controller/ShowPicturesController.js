/**
 * 产品名称：quyiyuan
 * 创建用户：张毅
 * 日期：2017年5月8日
 * 创建原因：显示大图页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.show_pictures.controller")
    .require(["kyee.quyiyuan.consultation.show_pictures.service"])
    .type("controller")
    .name("ShowPicturesController")
    .params(["$scope", "$ionicSlideBoxDelegate", "ShowPicturesService",
        "KyeeUtilsService", "KyeeListenerRegister", "KyeeViewService"
    ])
    .action(function ($scope, $ionicSlideBoxDelegate, ShowPicturesService,
                      KyeeUtilsService, KyeeListenerRegister, KyeeViewService) {
        var screenSize = KyeeUtilsService.getInnerSize(); //屏幕尺寸
        $scope.windowHeight = screenSize.height; //窗口高度
        $scope.windowWidth = screenSize.width; //窗口宽度
        $scope.imageWidth = parseInt((window.innerWidth - 14 * 2 - 10 * 3) / 4); //动态计算每一张图的宽度(按照放四张的比例)
        $scope.IMGLIST = ShowPicturesService.IMGLIST; //初始化图片列表
        $scope.ACTIVESLIDE = ShowPicturesService.ACTIVESLIDE; //定义页面初始展示第几张图
        $scope.INDEX = ShowPicturesService.ACTIVESLIDE + 1;
        $scope.TOTAL = $scope.IMGLIST.length;

        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.REMOVEPICTUREMODEL();
            }
        });

        /**
         * 模态窗口返回事件
         */
        $scope.REMOVEPICTUREMODEL = function () {
            KyeeViewService.removeModal({
                scope: $scope
            });
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);
        };

        /**
         * swipe切换图片事件
         */
        $scope.CHANGEPICTURE = function () {
            var index = $ionicSlideBoxDelegate.$getByHandle('show-picture-slide').currentIndex();
            $scope.INDEX = index + 1;
        };

    })
    .build();