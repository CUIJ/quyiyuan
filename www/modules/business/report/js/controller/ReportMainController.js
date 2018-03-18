/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月6日09:05:22
 * 创建原因：KYEEAPPC-1957 报告单-主界面controller
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 */
new KyeeModule()
    .group("kyee.quyiyuan.reportmain.controller")
    .require(["kyee.quyiyuan.report.service",
        "kyee.quyiyuan.report.check.controller",
        "kyee.quyiyuan.report.inspeciton.controller",
        "kyee.quyiyuan.center.controller.query_his_card",
        "kyee.quyiyuan.center.authentication.controller",
        "kyee.quyiyuan.myquyi.service",
        "kyee.quyiyuan.myquyi.inpatientBusiness.service"
    ])
    .type("controller")
    .name("ReportMainController")
    .params(["$scope","$state","ReportService","KyeeUtilsService","MyquyiService","inpatientBusinessService","$ionicHistory","KyeeListenerRegister"])
    .action(function($scope,$state,ReportService,KyeeUtilsService,MyquyiService,inpatientBusinessService,$ionicHistory,KyeeListenerRegister){
        //监听物理返回
        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.backView();
            }
        });

        //初始化默认选中第几项
        if(ReportService.isOtherView){
            $scope.isTabActive = ReportService.tabIndex;
            ReportService.isOtherView = false;
        }else{
            $scope.isTabActive ='0';
        }
        var height = KyeeUtilsService.getInnerSize().height-111;
        $scope.ionContentHeight = height+'px';

        $scope.backView=function(){
            if(inpatientBusinessService.inpatientBusiness_to_report){
                //返回前设置激活标签至住院业务,其中：1为门诊业务，2为住院业务，3为我的关注
                //MyquyiService.setBackTabIndex(2);
                inpatientBusinessService.inpatientBusiness_to_report = false;
            }
            $ionicHistory.goBack();
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);//离开此页面的时候将一次性事件卸载掉
        }
    })
    .build();