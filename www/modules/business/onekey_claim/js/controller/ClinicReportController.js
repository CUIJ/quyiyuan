/**
 * Created by 付添 on 2016/10/10.
 描述：门诊报告单处理页面
 */
/**
 * 产品名称：quyiyuan
 * 创建者：付添
 * 创建时间： 2015/11/30
 * 创建原因：账号实名信息
 * 任务号：KYEEAPPC-4398
 * 修改人：付添
 * 任务号：KYEEAPPC-4506
 */
new KyeeModule()
    .group("kyee.quyiyuan.quick_clinic_report.controller")
    .require([
        "kyee.quyiyuan.quick_report.service",
        "kyee.quyiyuan.in_hospital_report.controller"
    ])
    .type("controller")
    .name("ClinicReportController")
    .params([
        "KyeeListenerRegister","ClaimInpatientGeneralService","$ionicScrollDelegate","ReportMultipleService","QuickReportService","$scope", "$state", "KyeeViewService","KyeeI18nService", "CacheServiceBus","$ionicHistory", "KyeeMessageService"])
    .action(function (KyeeListenerRegister,ClaimInpatientGeneralService,$ionicScrollDelegate,ReportMultipleService,QuickReportService,$scope, $state, KyeeViewService, KyeeI18nService, CacheServiceBus, $ionicHistory,KyeeMessageService) {
        $scope.noLoad = true;//默认未加载完成
        $scope.isShow=false;//控制是否显示分页的图片
        //页面初始化 刷新 查门诊报告单数据
        var currentPage = 0;//当前页数
        var rows = 20;//一页加载20条
        var total = 0;//记录总数

        KyeeListenerRegister.regist({
            focus: "clinic_report",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "forward",
            action: function (params) {
                //记录选择的门诊检查检验单数量
                $scope.selectedTotal=ClaimInpatientGeneralService.selectedTotal;
                $scope.doRefresh();
            }
        });
        $scope.doRefresh = function () {
            QuickReportService.getReportData("0",$scope,function (success,data) {
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
                    $scope.isChooseFir = true;
                    $scope.noLoad = false;
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
                $ionicScrollDelegate.$getByHandle('clinic_report').resize();
                return;
            }else{
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
         * 下一步
         */
        $scope.goInhospitalReport = function () {
            var flag = false;//是否选择任何一项标记
            var sum = 0;
            if(!$scope.isChooseFir){
                if($scope.reportData){
                    for(var i=0;i<$scope.reportData.length;i++){
                        if($scope.reportData[i].checked){
                            flag = true;
                            sum++;
                        }
                    }
                }
            }else{
                flag = true;
            }
            QuickReportService.selectReportNumbers=sum;
            if(!flag){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinic_report.checkNull","请选择门诊检查检验单")

                });
                return;
            }
            $state.go("in_hospital_report");
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
    })
    .build();
