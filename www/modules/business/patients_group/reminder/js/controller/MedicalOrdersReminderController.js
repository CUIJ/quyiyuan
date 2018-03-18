/**
 * 产品名称：quyiyuan
 * 创建者：李聪
 * 创建时间：2016年6月22日
 * 创建原因：医嘱提醒控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.medical_orders_reminder.controller")
    .require(["kyee.quyiyuan.patients_group.reminder.service"])
    .type("controller")
    .name("MedicalOrdersReminderController")
    .params(["$scope", "$ionicScrollDelegate", "KyeeUtilsService", "ReminderService", "StatusBarPushService", "KyeeListenerRegister", "$state", "$ionicHistory"])
    .action(function($scope, $ionicScrollDelegate, KyeeUtilsService, ReminderService, StatusBarPushService, KyeeListenerRegister, $state, $ionicHistory){

        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };
        //edit by wangsannv  KYEEAPPC-10247
        if(ReminderService.isDoctorOrderFromWeiXin) {
            ReminderService.loadData(ReminderService.messageId, function (result) {
                $scope.data = JSON.parse(result.URL_DATA);
                ReminderService.doctorOrdersData = JSON.parse(result.URL_DATA);;
                initData();
            });
        }else{
            $scope.data = ReminderService.doctorOrdersData;
            initData();
        }

        function initData(){
            // 温馨提示字符串转为数组
            $scope.messageList = [];
            var remindMessage = $scope.data.REMIND_MESSAGE ? $scope.data.REMIND_MESSAGE.split("\n") : [];
            for(var i=0; i<remindMessage.length; i++ ){
                $scope.messageList.push(remindMessage[i]);
            }

            var orderLength = $scope.data.ILLNESS_SUIT ? $scope.data.ILLNESS_SUIT.length : 0;
            // 页面直接显示的病历长度
            $scope.maxShowLength = 70;
            $scope.showAll = (orderLength <= $scope.maxShowLength);
            $scope.orderShow = !$scope.showAll;

            // 显示所有病情主诉内容
            $scope.showOrder = function () {
                $scope.orderShow = !$scope.orderShow;
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
            focus: "medical_orders_reminder",
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