/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年8月25日14:48:19
 * 创建原因：免挂号费页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.registerFree.controller")
    .require(["kyee.quyiyuan.myWallet.registerFree.service"])
    .type("controller")
    .name("RegisterFreeController")
    .params(["$scope", "$state", "RegisterFreeService", "KyeeUtilsService"])
    .action(function ($scope, $state, RegisterFreeService, KyeeUtilsService) {

        RegisterFreeService.getRegisterFreeRecords(function (data) {

            if(data.LIST){
                for(var i = 0;i < data.LIST.length;i++){
                    data.LIST[i].OPERATE_TIME = KyeeUtilsService.DateUtils.formatFromString(
                        data.LIST[i].OPERATE_TIME, 'YYYY-MM-DD', 'YYYY/MM/DD');
                    data.LIST[i].AMOUNT=data.LIST[i].AMOUNT.toFixed(2);
                }

                if(data.LIST.length > 0){
                    $scope.showEmpty = false;
                }else {
                    $scope.showEmpty = true;
                }
            }

            $scope.data = data;
        });

        /**
         * 同步点击
         */
        $scope.onGetNjRecordBtn = function(){
            RegisterFreeService.onGetNjRecordBtn($scope);
        };

        /**
         * 显示隐藏免挂号费说明
         */
        $scope.showFundExplain = function () {

            if($scope.showRule){
                $scope.showRule = false;
            } else {
                $scope.showRule = true;
            }
        }

    })
    .build();
