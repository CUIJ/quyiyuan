/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：我的趣医门诊业务控制层
 */
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.medical_guide.controller")
    .require([
        "kyee.quyiyuan.myquyi.medical_guide.service",
        "kyee.quyiyuan.myquyi.my_care_doctors.controller"])
    .type("controller")
    .name("MedicalGuideController")
    .params(["$scope", "$timeout", "MedicalGuideService", "$state", "KyeeListenerRegister", "MyquyiService", "$ionicScrollDelegate", "HomeService"])
    .action(function ($scope, $timeout, MedicalGuideService, $state, KyeeListenerRegister, MyquyiService, $ionicScrollDelegate, HomeService) {
        //默认显示第一条记录
        $scope.showIndex = 0;
        /**
         * 页面初始化刷新
         * @param showLoading 是否显示读取遮罩
         */
        $scope.refresh = function (showLoading) {
            //解决重置滚动条报警告的问题
            $timeout(function () {
                $ionicScrollDelegate.$getByHandle("medical_guide_content").resize();
            }, 200);
            //数据初始化
            $scope.result = {};
            MyquyiService.scope = $scope;
            //begin by gyl 如果缓存中门诊业务，则直接从缓存中获取 KYEEAPPC-3962
            if(MedicalGuideService.resultData){
                $scope.result = MedicalGuideService.resultData;
                return ;
            }
            //end by gyl KYEEAPPC-3962

            //读取页面数据
            MedicalGuideService.loadStore(
                function (result) {
                    $scope.result = result;
                },
                showLoading//是否显示读取遮罩
            );
        };

        $scope.refresh(true);

        //下拉刷新
        $scope.doMedicalGuideRefresh = function () {
            MedicalGuideService.loadStore(
                function (result) {
                    $scope.result = result;
                    $scope.$broadcast('scroll.refreshComplete');
                },
                false//是否显示读取遮罩
            );
        };

        //预约挂号记录
        $scope.appointMent = function () {
            $state.go('appointment_regist_list');
        };
        //缴费记录
        $scope.payMent = function () {
            $state.go('clinicPaid');
        };
        //检验检查单
        $scope.report = function () {
            //KYEEAPPC-4047  2.1.0报告单跨院修改 张明  2015.11.25
            $state.go('report_multiple');
        };
        //满意度记录
        $scope.satisfication = function () {
            $state.go('satisfaction_clinic');
        };


        //预约挂号list点击
        $scope.onAppointListTap = function (record) {
            MedicalGuideService.onAppointListTap(record);
        };
        //缴费list点击
        $scope.onPaymentListTap = function (hospitalId) {
            MedicalGuideService.onPaymentListTap(hospitalId);
        };
        //报告单list点击
        $scope.onReportListTap = function (record) {
            MedicalGuideService.onReportListTap(record);
        };
        //显示某医院记录
        $scope.showRecords = function (index) {
            if ($scope.showIndex != index) {
                //切换医院则重置滚动条
                $ionicScrollDelegate.$getByHandle("medical_guide_content").resize();
            }
            $scope.showIndex = index;
        }

    })
    .build();
