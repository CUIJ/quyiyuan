/**
 * 产品名称：quyiyuan
 * 创建者：李聪
 * 创建时间：2016年6月22日
 * 创建原因：病历提醒控制层
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.medical_record_reminder.controller")
    .require(["kyee.quyiyuan.patients_group.reminder.service"])
    .type("controller")
    .name("MedicalRecordReminderController")
    .params(["$scope", "$ionicScrollDelegate", "ReminderService", "KyeeUtilsService", "StatusBarPushService","KyeeListenerRegister","$state","$ionicHistory"])
    .action(function($scope, $ionicScrollDelegate, ReminderService, KyeeUtilsService, StatusBarPushService,KyeeListenerRegister,$state,$ionicHistory) {

        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };

        //edit by wangsannv  KYEEAPPC-10247
        if(ReminderService.isMedicalRecordFromWeiXin){
            ReminderService.loadData(ReminderService.messageId,function(result){
                $scope.data =JSON.parse(result.URL_DATA);
                ReminderService.medicalRecordData=JSON.parse(result.URL_DATA);
                initData();
            });
        }else{
            $scope.data = ReminderService.medicalRecordData;
            initData();
        }

        function initData(){
            // 温馨提示字符串转为数组
            $scope.messageList = [];
            var remindMessage = $scope.data.REMIND_MESSAGE ? $scope.data.REMIND_MESSAGE.split("\n") : [];
            for(var i=0; i<remindMessage.length; i++ ){
                $scope.messageList.push(remindMessage[i]);
            }
            // 页面直接显示的病历长度
            $scope.maxShowLength = 70;
            $scope.nowRecord = ReminderService.medicalRecordData.NOW_MEDICAL_HISTORY;
            $scope.agoRecord = ReminderService.medicalRecordData.AGO_MEDICAL_HISTORY;
            $scope.hideNow = false;
            $scope.hideAgo = false;

            // 病历概述包括现病史(NOW_MEDICAL_HISTORY)和既往史(AGO_MEDICAL_HISTORY)
            if($scope.nowRecord && $scope.nowRecord.length > $scope.maxShowLength) {
                $scope.hideNow = true;
            }
            if($scope.agoRecord && !$scope.hideNow) {
                if($scope.nowRecord){
                    $scope.hideAgo = (($scope.nowRecord.length+$scope.agoRecord.length) > $scope.maxShowLength);
                } else {
                    $scope.hideAgo = ($scope.agoRecord.length > $scope.maxShowLength);
                }
            }

            $scope.showAllReport = !($scope.hideNow || $scope.hideAgo);
            $scope.recordDescShow = $scope.hideNow || $scope.hideAgo;

            // 展示病历概述全部内容
            $scope.showRecordDesc = function () {
                $scope.recordDescShow = !$scope.recordDescShow;
                $ionicScrollDelegate.scrollTop();
            };

            // 格式化入院时间
            $scope.formatAdmissionTime = function(datetime){
                if(datetime && datetime != "") {
                    var admissionTime = KyeeUtilsService.DateUtils.formatFromString(datetime, "YYYY-MM-DD HH:mm:ss", "YYYY/MM/DD HH:mm");
                    return admissionTime.slice(0, 11) + (admissionTime.slice(11, 13) > 12 ? "下午" : "上午");
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
            focus: "medical_record_reminder",
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