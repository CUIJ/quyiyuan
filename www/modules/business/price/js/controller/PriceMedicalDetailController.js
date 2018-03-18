/*
 * 产品名称：quyiyuan
 * 创建人: 张家豪、付添
 * 创建日期:2015年9月25日10:18:09
 * 创建原因：医院-价格公示-药品价格
 */
new KyeeModule()
    .group("kyee.quyiyuan.price.medicaldetail.controller")
    .require([
        "kyee.quyiyuan.price.service",
        "kyee.quyiyuan.price.medicaldetail.service"
    ])
    .type("controller")
    .name("PriceMedicalDetailController")
    .params(["$scope", "$state", "CacheServiceBus", "PriceService","$ionicScrollDelegate","KyeeI18nService"])
    .action(function ($scope, $state, CacheServiceBus, PriceService,$ionicScrollDelegate,KyeeI18nService) {
        $scope.openBotten = [];               //弹开按钮用数组控制

        //页面的名字
        if (PriceService.fromPage == 0) {
            // $scope.detail = "药品详情";
            $scope.detail = KyeeI18nService.get("price_medical_detail.mediclDetail","药品详情");
            $scope.state = 0;
        } else {
           // $scope.detail = "项目详情";
            $scope.detail = KyeeI18nService.get("price_medical_detail.projectDetail","项目详情")
            $scope.state = 1;
        }

        //接收上一个页面传过来的值
        if (PriceService.data) {

            //对价格不存在时候的显示
            for (var i = 0; i < PriceService.data.NAME_LIST.length; i++) {
                if (!PriceService.data.NAME_LIST[i].ITEM_MEASURE_UNIT) {
                    PriceService.data.NAME_LIST[i].ITEM_MEASURE_UNIT = "";
                }
            }

            //将数据绑定到页面
            $scope.all = PriceService.data.NAME_LIST;
        }

        //将所有弹开的按钮置为未点击
        if ($scope.all) {
            $scope.openBotten.push(true);
            for (var i = 1; i < $scope.all.length; i++) {
                $scope.openBotten.push(false);
            }
        }


        //弹开按钮的绑定事件
        $scope.open = function (index) {
            $scope.openBotten[index] = !$scope.openBotten[index];
            $ionicScrollDelegate.$getByHandle("mainScroll").resize()
        }

    })
    .build();