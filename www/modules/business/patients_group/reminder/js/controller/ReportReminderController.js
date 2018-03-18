/**
 * 产品名称：quyiyuan
 * 创建者：李聪
 * 创建时间：2016年6月22日
 * 创建原因：检查检验单提醒控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.report_reminder.controller")
    .require(["kyee.quyiyuan.report_multiple.exam_detail.controller",
        "kyee.quyiyuan.report_multiple.lab_detail.controller",
        "kyee.quyiyuan.report_multiple.service",
        "kyee.quyiyuan.report.examDetailImg.controller",
        "kyee.quyiyuan.patients_group.reminder.service"
    ])
    .type("controller")
    .name("ReportReminderController")
    .params(["$scope", "$state", "KyeeUtilsService", "KyeeMessageService", "KyeeI18nService", "ReportMultipleService", "ReminderService", "StatusBarPushService","KyeeListenerRegister", "$state", "$ionicHistory"])
    .action(function($scope, $state, KyeeUtilsService, KyeeMessageService, KyeeI18nService, ReportMultipleService, ReminderService, StatusBarPushService, KyeeListenerRegister, $state, $ionicHistory) {

        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };
        //edit by wangsannv  KYEEAPPC-10247
        if(ReminderService.isReportFromWeiXin){
            ReminderService.loadData(ReminderService.messageId, function (result) {
                $scope.data =JSON.parse(result.URL_DATA);;
                ReminderService.reportData = JSON.parse(result.URL_DATA);
                initData();
            });
        }else{
            $scope.data = ReminderService.reportData;
            initData();
        }

        //edit by wangsannv
         function initData(){

             // 温馨提示字符串转为数组
             $scope.messageList = [];
             var remindMessage = $scope.data.REMIND_MESSAGE ? $scope.data.REMIND_MESSAGE.split("\n") : [];
             for(var i=0; i<remindMessage.length; i++ ){
                 $scope.messageList.push(remindMessage[i]);
             }

             // 格式化入院时间
             $scope.formatAdmissionTime = function(datetime){
                 if(datetime && datetime != "") {
                     var admissionTime = KyeeUtilsService.DateUtils.formatFromString(datetime, "YYYY-MM-DD HH:mm:ss", "YYYY/MM/DD HH:mm");
                     return admissionTime.slice(0, 11) + (admissionTime.slice(11, 13) > 12 ? "下午" : "上午");
                 }
             };

             //格式化检验单日期
             $scope.formatDate = function (date) {
                 if (date && date != "") {
                     return KyeeUtilsService.DateUtils.formatFromDate(date, 'YYYY/MM/DD HH:mm');
                 }
             };

             // 跳转至检查检验单详情
             $scope.clickItem = function () {
                 if ($scope.data.C_REPORT_LAB_TEST_MASTER_EXT) {
                     // 检验
                     var itemData = $scope.data.C_REPORT_LAB_TEST_MASTER_EXT;
                     ReportMultipleService.LAB_ID = itemData.LAB_ID;
                     ReportMultipleService.LAB_ITEM = itemData.ITEM_NAME;
                     ReportMultipleService.LAB_TEST_NO = itemData.TEST_NO;
                     ReportMultipleService.PHOTO_URL = itemData.PHOTO_URL;
                     ReportMultipleService.REPORT_DATE = itemData.RECORDING_TIME;
                     ReportMultipleService.PATIENT_ID = itemData.PATIENT_ID;
                     ReportMultipleService.TEST_NO = itemData.TEST_NO;
                     ReportMultipleService.REPORT_TIME = itemData.REPORT_DATE;
                     ReportMultipleService.LAB_SOURCE = itemData.LAB_SOURCE;
                     ReportMultipleService.PICTURE_STATUS = itemData.PICTURE_STATUS;
                     ReportMultipleService.PICTURE_SOURCE = itemData.PICTURE_SOURCE;
                     $state.go('lab_detail');
                 } else if ($scope.data.C_REPORT_EXAM_MASTER_EXT) {
                     // 检查
                     ReportMultipleService.examDetailData = $scope.data.C_REPORT_EXAM_MASTER_EXT;
                     $state.go('exam_detail');
                 }
             };

             //页面显示的医院名称长度
             if($scope.data.HOSPITAL_NAME.length>15){
                 $scope.data.HOSPITAL_NAME = $scope.data.HOSPITAL_NAME.substring(0,15)+"...";
             }
         };
        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "report_reminder",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();        //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        $scope.goBack = function(){
            if(StatusBarPushService.webJump){
                StatusBarPushService.webJump = undefined;
                $state.go("home->MAIN_TAB");
            }else{
                $ionicHistory.goBack();
            }
        };

    })
    .build();