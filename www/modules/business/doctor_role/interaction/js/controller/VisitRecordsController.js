/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年7月2日10:18:01
 * 创建原因：就诊记录
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.visitRecords.controller")
    .require(["kyee.quyiyuan.doctorRole.visitRecords.service", "kyee.quyiyuan.report.service"])
    .type("controller")
    .name("visitRecordsController")
    .params(["$scope", "$state", "visitRecordsService", "ReportService", "CacheServiceBus", "MessageBoardService","KyeeI18nService"])
    .action(function ($scope, $state, visitRecordsService, ReportService, CacheServiceBus, MessageBoardService,KyeeI18nService) {
        //页数
        var page = 0;
        var showLoading = false;
        var total = 0;
        //不显示无数据提示语
        $scope.showEmpty = false;
        //无数据提示语
        //$scope.emptyText = '暂无就诊记录';
        $scope.emptyText = KyeeI18nService.get("patientInfo.visitRecords.noMedicalRecords", "暂无就诊记录");
        //是否显示预约挂号记录列表
        $scope.showAppointReg = [];
        //是否显示检查单列表
        $scope.showLab = [];
        //是否显示检验单列表
        $scope.showExam = [];
        //是否显示检验单详情
        $scope.isExamDisplay = -1;
        $scope.refresh = function () {
            showLoading = false;
            //查询数据
            visitRecordsService.loadData(function (data) {
                total = data.total;
                if (total == 0) {
                    $scope.showEmpty = true;
                } else {
                    $scope.showEmpty = false;
                }
                $scope.visitRecords = data.rows;
                $scope.$broadcast('scroll.refreshComplete');
            }, showLoading, page);
        };
        //加载数据
        $scope.loadMore = function () {
            page++;
            showLoading = false;
            if (page == 1) {
                showLoading = true;
            }
            //查询数据
            visitRecordsService.loadData(function (data) {
                total = data.total;
                if (total == 0) {
                    $scope.showEmpty = true;
                } else {
                    $scope.showEmpty = false;
                }
                $scope.visitRecords = data.rows;
            }, showLoading, page);
        };
        //是否已加载所有数据
        $scope.moreDataCanBeLoaded = function () {
            if ($scope.visitRecords == undefined || total >= $scope.visitRecords.length) {
                return true;
            } else {
                return false;
            }
        };
        //检验单详情
        $scope.goLabRecordDetail = function (labRecordDetail) {
            labRecordDetail.LABDETAIL = labRecordDetail.LABDETAIL.substr(1,labRecordDetail.LABDETAIL.length-2);
            ReportService.INSPECTION_DETAIL = labRecordDetail;
            $state.go('inspectiondetail');
        };
        //是否显示预约挂号列表
        $scope.showAppointRegList = function(index){
            if($scope.showAppointReg[index] == undefined){
                $scope.showAppointReg[index] = true;
            }else{
                $scope.showAppointReg[index] = !$scope.showAppointReg[index];
            }
        };
        //是否显示检验单列表
        $scope.showLabRecord = function(index){
            if($scope.showLab[index] == undefined){
                $scope.showLab[index] = true;
            }else{
                $scope.showLab[index] = !$scope.showLab[index];
            }
        };
        //显示检验单列表
        $scope.showExamRecord = function(index){
            if($scope.showExam[index] == undefined){
                $scope.showExam[index] = true;
            }else{
                $scope.showExam[index] = !$scope.showExam[index];
            }
        };
        //显示检验单详情
        $scope.showExamDetail = function(index){
            $scope.isExamDisplay = index;
        }
    })
    .build();
