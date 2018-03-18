/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/30
 * 时间: 14:46
 * 创建原因：关于趣医 - 帮助页面的控制器
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.help.controller")
    .require(["kyee.quyiyuan.aboutquyi.service","kyee.quyiyuan.aboutquyi.newFeedback.controller"])
    .type("controller")
    .name("HelpController")
    .params(["$timeout","KyeeMessageService","KyeeI18nService","KyeePhoneService","$scope","$state","$ionicScrollDelegate","AboutQuyiService"])
    .action(function($timeout,KyeeMessageService,KyeeI18nService,KyeePhoneService,$scope,$state,$ionicScrollDelegate,AboutQuyiService){
        //初始化 展开项
        $scope.problemData = AboutQuyiService.getProblemItems();
        $scope.customerNumbers = '';

        $scope.showAnswer=function(index){
            $scope.dex=index;
            $timeout(function(){
                $ionicScrollDelegate.$getByHandle("answer_detail").resize();
            }, 100);
        };
        //获取系统参数
        AboutQuyiService.getNetParams(function (CUSTOMER_NUMBERS) {
            if (CUSTOMER_NUMBERS) {
                $scope.customerNumbers = CUSTOMER_NUMBERS;
            }else if(AboutQuyiService.customerNumbers){
                $scope.customerNumbers = AboutQuyiService.customerNumbers;
            } else {
                $scope.customerNumbers = '4000801010';
            }
        });
        /**
         * 拨打客服电话
         */
        $scope.callCustomerService = function () {
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("login.hint", "拨打客服电话"),
                content:  KyeeI18nService.get("regist.isCall","联系客服，请点击确定拨打电话。"),
                onSelect: function (flag) {
                    if (flag) {
                        //拨打客服电话
                        KyeePhoneService.callOnly($scope.customerNumbers);
                    }
                }
            });
        };
    })
    .build();