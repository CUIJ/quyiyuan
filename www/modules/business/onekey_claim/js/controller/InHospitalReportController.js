/**
 * Created by 付添 on 2016/10/10.
 * 住院报告单处理页面
 */
new KyeeModule()
    .group("kyee.quyiyuan.in_hospital_report.controller")
    .require([
        "kyee.quyiyuan.quick_report.service",
        "kyee.quyiyuan.claim_complete.controller"
    ])
    .type("controller")
    .name("InHospitalReportController")
    .params([
       "KyeeListenerRegister","$timeout", "ReportMultipleService","$ionicScrollDelegate","QuickReportService","$scope", "$state",
       "KyeeViewService","KyeeI18nService", "CacheServiceBus","$ionicHistory", "KyeeMessageService","OneQuickClaimService"])
    .action(function (KyeeListenerRegister,$timeout,ReportMultipleService,$ionicScrollDelegate,QuickReportService,$scope,
                      $state, KyeeViewService, KyeeI18nService, CacheServiceBus, $ionicHistory,KyeeMessageService,OneQuickClaimService) {{
        $scope.noLoad = true;//默认未加载完成
        $scope.isShow=false;//控制是否显示分页的图片
        //页面初始化 刷新 查门诊报告单数据
        var currentPage = 0;//当前页数
        var rows = 20;//一页加载20条
        var total = 0;//记录总数

        KyeeListenerRegister.regist({
            focus: "in_hospital_report",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "forward",
            action: function (params) {
                //记录选择的门诊检查检验单数量
                $scope.selectReportNumbers=QuickReportService.selectReportNumbers;
                $scope.doRefresh();
            }
        });
        $scope.doRefresh = function () {
            QuickReportService.getReportData("1",$scope,function (success,data) {
                if(success){
                    $scope.isChooseFir = false;
                    $scope.reportALLData = data.rows;
                    total =  parseInt(data.total);//记录总数
                    if(total<=0){
                        $scope.isChooseFir = true;
                        $scope.noLoad = false;
                    }else if(total>0 && total <= rows){ //总数小于20
                        $scope.reportData = data.rows;
                        $scope.noLoad = false;
                    }else{
                        $scope.reportData = data.rows.slice(0,rows);
                        $scope.isShow=true;
                    }
                }else{
                    $scope.noLoad = false;
                    $scope.isChooseFir = true;
                }
            });
        };
        $scope.doRefresh();
        //加载更多
        $scope.loadMore = function(){
            var data = $scope.reportData;
            if(total>0 && (total <= rows || data.length >= total)){
                $scope.noLoad = false;//已加载完成
                $scope.isShow=false;
                $ionicScrollDelegate.$getByHandle('in_hospital_report').resize();
                return;
            }
            else{
                $scope.isShow=true;
                currentPage++;
                var arr = $scope.reportALLData.slice(currentPage*rows,(currentPage+1)*rows);
                $scope.reportData = data.concat(arr);
                if( $scope.reportData.length==total){
                    $scope.isShow=false;//已加载完成
                }
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
        /**
         * 完成
         */
        $scope.complete = function () {
            var flag = false;//是否选择任何一项标记
            if(!$scope.isChooseFir){
                if($scope.reportData){
                    for(var i=0;i<$scope.reportData.length;i++){
                        if($scope.reportData[i].checked){
                            flag = true;
                            break;
                        }
                    }
                }
            }else{
                flag = true;
            }
            if(!flag){
                KyeeMessageService.broadcast({
                    content:  KyeeI18nService.get("in_hospital_report.checkNull",  "请选择住院检查检验单")
                });
                return;
            }
            //如果医院体验医院，流程不变，
             var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                KyeeMessageService.broadcast({
                    content:  KyeeI18nService.get("in_hospital_report.tip",  "理赔信息提交中..."),
                    duration: 2000
                });
                $timeout(
                    function () {
                        OneQuickClaimService.isFrom = true;
                        $state.go('claim_complete');
                    },
                    2000
                );
        };
        /**
         * 选项控制
         * @param type
         * @param paid
         */
        $scope.chooseItem = function(type,paid){
            if(type=='1'){
                if($scope.isChooseFir){
                    $scope.isChooseFir = false;
                }else{
                    $scope.isChooseFir = true;
                    for(var i=0;i<$scope.reportData.length;i++){
                        $scope.reportData[i].checked = false;
                    }
                }
            }else{
                $scope.isChooseFir = false;
                if(paid.checked){
                    paid.checked = false;
                }else{
                    paid.checked = true;
                }
            }
        };
        /**
         * 跳转到详情
         * @param itemData
         */
        $scope.clickItem = function (itemData) {
            if (itemData.REPORT_FLAG == 'LAB') {
                ReportMultipleService.LAB_ID = itemData.EXAM_ID;
                ReportMultipleService.LAB_ITEM = itemData.EXAM_SUB_CLASS;
                ReportMultipleService.LAB_TEST_NO = itemData.LAB_TEST_NO;
                ReportMultipleService.PHOTO_URL = itemData.PHOTO_URL;
                ReportMultipleService.REPORT_DATE = itemData.REPORT_DATE;
                ReportMultipleService.PATIENT_ID = itemData.PATIENT_ID;
                ReportMultipleService.TEST_NO = itemData.LAB_TEST_NO;
                ReportMultipleService.REPORT_TIME = itemData.REPORT_DATE;
                ReportMultipleService.LAB_SOURCE = itemData.EXAM_SOURCE;
                ReportMultipleService.PICTURE_STATUS = itemData.PICTURE_STATUS;
                ReportMultipleService.PICTURE_SOURCE = itemData.PICTURE_SOURCE;
                $state.go('lab_detail');
            } else {
                ReportMultipleService.examDetailData = itemData;
                $state.go('exam_detail');
            }
        };
    }
    })
    .build();