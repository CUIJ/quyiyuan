/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：选择银行支行页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.rebateBankBranch.controller")
    .require([
        "kyee.quyiyuan.rebate.rebateBankBranch.service"
    ])
    .type("controller")
    .name("RebateBankBranchController")
    .params(["$scope","RebateBankBranchService",'KyeeI18nService'])
    .action(function($scope,RebateBankBranchService,KyeeI18nService){
        $scope.palceHolderText = KyeeI18nService.get('rebateBankBranch.searchBranchMsg','搜索支行',null);
        //页面初始化
        RebateBankBranchService.initView(function(result){
            $scope.result = result;
        });
        $scope.changeEmptyText = function (data, text) {
            //if(!data || data.length == 0 || result.success == false || result.data == null){
            if(!(result instanceof Array)){
                $scope.showEmpty = true;
                $scope.emptyText = text;
            } else {
                $scope.showEmpty = false;
            }
        };
        //点击事件
        $scope.onBranchListTap = function(record){
            RebateBankBranchService.onBranchListTap(record);
        }
    })
    .build();
