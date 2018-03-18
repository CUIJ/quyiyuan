/**
 * 产品名称: quyiyuan
 * 创建者: dangliming
 * 创建时间: 2017年2月14日15:15:41
 * 创建原因: 用药提醒推送
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.medication_push.controller")
    .require([
        "kyee.quyiyuan.patients_group.patients_group_message.controller",
        "kyee.quyiyuan.appointment.purchase_medince.service",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.login.service"
    ])
    .type("controller")
    .name("MedicationPushController")
    .params(["$rootScope", "$scope", "$state", "$ionicHistory", "KyeeMessageService", "CacheServiceBus", "KyeeI18nService",
        "KyeeListenerRegister", "MedicationPushService" ,"$ionicScrollDelegate","PurchaseMedinceService","PersonalChatService","LoginService"])
    .action(function ($rootScope, $scope, $state, $ionicHistory, KyeeMessageService, CacheServiceBus, KyeeI18nService,
                      KyeeListenerRegister, MedicationPushService,$ionicScrollDelegate,PurchaseMedinceService,PersonalChatService,LoginService) {


        //外部通知跳转进来，显示返回键
        if(MedicationPushService.isFromOuterPush){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };
        /**
         * 监听页面进入事件
         */
        KyeeListenerRegister.regist({
            focus: "medication_push",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                if (MedicationPushService.isFromOuterPush || MedicationPushService.isFromWeChat) {
                    MedicationPushService.loadData(MedicationPushService.messageId, function (result) {
                        MedicationPushService.medicationData = result.URL_DATA;
                        initView();
                        MedicationPushService.isFromWeChat = false;
                        MedicationPushService.messageId = undefined;
                    });
                } else {
                    initView();
                }
            }
        });

        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "medication_push",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();        //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        /**
         * 进入页面时的初始化方法
         */
        function initView() {
            $scope.data = MedicationPushService.medicationData;
            if (typeof $scope.data == "string") {
                $scope.data = JSON.parse($scope.data);
            }

            var width = window.innerWidth - 150;
            var diagnosis =  $scope.data.diagnosis;
            if(diagnosis && diagnosis != "null" && diagnosis.length * 14 > width){
                $scope.displayMoreDiagnosis = 0;
            }
            MedicationPushService.updateReadFlag(JSON.stringify($scope.data.medicineList));
        }

        $scope.goBack = function () {
            if (MedicationPushService.isFromOuterPush) {
                MedicationPushService.isFromOuterPush = false;
                $state.go("message->MAIN_TAB", {}, {reload: true});
            } else {
                $ionicHistory.goBack(-1);
            }
        };

        /**
         * 疾病诊断点击更多或收起
         * @param displayMoreDiagnosis
         */
        $scope.extendDiagnosis = function (displayMoreDiagnosis) {
            // var diagnosis_span = document.getElementById("diagnosis_span");
            if(displayMoreDiagnosis==0){
                $scope.displayMoreDiagnosis=1;
                // diagnosis_span.style.white_space = 'none';
                // diagnosis_span.style.position = 'none';
            }else{
                $scope.displayMoreDiagnosis=0;
                // diagnosis_span.style.white_space = 'nowrap';
                // diagnosis_span.style.position = 'absolute';
                // $ionicScrollDelegate.$getByHandle("medication_push_content").scrollTop();
            }
            // $ionicScrollDelegate.$getByHandle("medication_push_content").resize();
        };

		//咨询医生
        $scope.consultDoctor=function(data){
            var pharmacist=data.pharmacist;
            var patientKey=data.patientKey;
        }


        /**
         * 显示模态框菜单
         * 取消用药提醒功能暂未开放
         */
        /*$scope.showMenu = function(){
         KyeeMessageService.actionsheet({
         buttons: [
         {
         text: KyeeI18nService.get("medicationPush.notReceive", "不再接收用药提醒")
         }
         ],
         onClick: function (index) {
         if (index == 0) {
         console.log("index0");
         }
         },
         cancelButton: true
         });
         };*/

        /**
         * 联系医生
         */
        $scope.chatWithDoctor = function (doctorName) {
            var param={
                doctorName:doctorName,
                type:3
            };
            PurchaseMedinceService.queryDoctorDetail(param,function(data){
                var userInf=LoginService.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
                if(!userInf) {
                    LoginService.getIMLoginInfo();
                }
                PersonalChatService.receiverInfo = { //接收者医生信息
                    yxUser: data.yxUser,               
                    userRole: 2,
                    userPetname: doctorName, //医生姓名
                    userPhoto: data.doctorPhoto,
                    sex: data.doctorSex,
                    scUserId:userInf.scUserId
                    /*visitName: $scope.petientName //就诊者真是姓名*/
                };
                PersonalChatService.goPersonalChat();
            });
        };
    })
    .build();