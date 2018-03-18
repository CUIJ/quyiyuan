/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/5/27.
 * 创建原因：亳州新农合主页面控制器
 * 修改： By
 * 修改： By
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.Main.controller")
    .require(["kyee.quyiyuan.ncms.paymentRecord.controller"
            ,"kyee.quyiyuan.ncms.outReim.controller"
            ,"kyee.quyiyuan.ncms.controller.my_family"
            ,"kyee.quyiyuan.ncms.controller.family_members"
            ,"kyee.quyiyuan.ncms.controller.hospitalization_reimbursement"
            ,"kyee.quyiyuan.ncms.myfamily.service"])
    .type("controller")
    .name("NcmsMainController")
    .params(["$scope", "$state", "myFamilyService"])
    .action(function($scope, $state , myFamilyService) {
        $scope.acitiveTabIndex = 1;
        $scope.tabClick = function(idx){
            $scope.acitiveTabIndex = idx;
        };

        myFamilyService.FAMILY_YEAR = undefined;
        myFamilyService.FAMILY_CODE = undefined;
        myFamilyService.FAMILY_DATA = undefined;
    })
    .build();

