
new KyeeModule()
    .group("kyee.quyiyuan.home.service_satisfaction.controller")
    .require(["kyee.quyiyuan.home.service"])
    .type("controller")
    .name("ServiceSatisfactionController")
    .params(["$ionicLoading","CenterService","$ionicHistory","KyeeMessageService","$scope","HomeService","$sce","KyeeListenerRegister","$ionicHistory","KyeeI18nService","IMUtilService"])
    .action(function($ionicLoading,CenterService,$ionicHistory,KyeeMessageService,$scope,HomeService,$sce,KyeeListenerRegister,$ionicHistory,KyeeI18nService,IMUtilService){

        $scope.topTip='为了进一步改善医疗服务，国家卫计委开展医院满意度第三方调查工作。';
        $scope.bottomTip='请您使用微信扫描二维码，关注“国家医管中心”微信公众号，对本院服务进行评价，谢谢合作。';
        $scope.photo='resource/images/hospital/commissionYC.png';

        /*$scope.goBack = function() {
            $ionicHistory.goBack();
        };*/
        $scope.saveImg = function () {
            if(IMUtilService.isDeviceAvailable()){
                KyeeMessageService.actionsheet({
                    title: "",
                    buttons: [
                        {
                            text: KyeeI18nService.get("patientsGroup.savePhotosToLocal", "保存图片")
                        }
                    ],
                    onClick: function (index) {
                        if (0 == index) {
                            IMDispatch.saveImgToGallery($scope.photo,function () {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("patientsGroup.savePhotoSuccess","保存成功")
                                });
                            },function () {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("patientsGroup.savePhotoFailed","保存失败，请重试！")
                                });
                            });
                        }
                    },
                    cancelButton: true
                });
            }

        }

    })
    .build();