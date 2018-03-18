/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/6/4.
 * 创建原因：缴费记录控制器
 * 修改： By
 * 修改： By
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.paymentRecord.controller")
    .require(["kyee.quyiyuan.ncms.paymentRecord.service"]
            ,"kyee.quyiyuan.ncms.myfamily.service")
    .type("controller")
    .name("PaymentRecordController")
    .params(["$scope", "$state","KyeeListenerRegister","PaymentRecordService","myFamilyService","KyeeI18nService"])
    .action(function($scope, $state, KyeeListenerRegister,PaymentRecordService,myFamilyService,KyeeI18nService) {

        $scope.dataEmpty = {
            emptyText : '',
            emptyType : 0 //0: 代表正常，提示不显示；1：代表绑定身份证不对，提示显示 2：查询无数据，提示显示；3：亳州远程连接失败
        };

        //获取参数
        var dateStr = myFamilyService.FAMILY_YEAR;
        var familyCode = myFamilyService.FAMILY_CODE;
        //亳州服务器远程连接失败显示内容
        var boZhouServiceFlag = myFamilyService.FAMILY_FALSE_FLAG;//默认为undefined，当连接失败为true

        if(boZhouServiceFlag){
            $scope.dataEmpty.emptyText = KyeeI18nService.get("ncms.goOnFalse","连接新农合服务器失败。");
            $scope.dataEmpty.emptyType = 3;
            return;
        }

        if(!familyCode && !dateStr){
            $scope.dataEmpty.emptyText = KyeeI18nService.get("ncms.sorry","对不起，你绑定的身份证无效，不能使用该功能!");
            $scope.dataEmpty.emptyType = 1;
            return;
        }

        $scope.years = [];
        var cYear = new Date(dateStr).getFullYear();
        for(var i = cYear; i >= 2010; i--){
            $scope.years.push(i);
        }
        //默认为当前年
        $scope.activeYear = cYear;
        //请求返回数据
        $scope.data = [];
        $scope.loadData = function(){
            $scope.data = [];
            PaymentRecordService.loadPaymentRecord(familyCode, $scope.activeYear, function(rows){
                if(rows.length <= 0){
                    $scope.dataEmpty.emptyText = KyeeI18nService.get("ncms.noKnow","暂无数据");
                    $scope.dataEmpty.emptyType = 2;
                }else{
                    $scope.data = rows;
                    $scope.dataEmpty.emptyText = "";
                    $scope.dataEmpty.emptyType = 0;
                }
            });
        };
        //默认加载数据
        $scope.loadData();
        //点击scroll的年份
        $scope.yearClick = function(year){
            $scope.activeYear = year;
            $scope.loadData();
        };
    })
    .build();