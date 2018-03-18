/**
 * 产品名称 quyiyuan.
 * 创建用户: yangmingsi
 * 日期: 2017年2月21日09:40:54
 * 创建原因：KYEEAPPC-10018 亳州就医记录controller
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicalRecordController.controller")
    .require(["kyee.quyiyuan.medical.service",
        "kyee.quyiyuan.medicalDetail.controller",
        "kyee.quyiyuan.medicalStatement.controller",
        "kyee.quyiyuan.medicalRecordController.clinic_hos_record.controller",
        "kyee.quyiyuan.evaluateController.controller",
        "kyee.quyiyuan.center.medicalRecord.service",
        "kyee.quyiyuan.sat.add_sat_extend_patient_info.controller",
        "kyee.quyiyuan.sms_quick_evaluate.controller"
    ])
    .type("controller")
    .name("MedicalRecordController")
    .params(["CommPatientDetailService","$scope","$ionicHistory","MedicalService","KyeeViewService","CacheServiceBus","$state","KyeeUtilsService","$ionicScrollDelegate","MedicalRecordService","KyeeMessageService","KyeeListenerRegister"])
    .action(function(CommPatientDetailService,$scope,$ionicHistory,MedicalService,KyeeViewService,CacheServiceBus,$state,KyeeUtilsService,$ionicScrollDelegate,MedicalRecordService,KyeeMessageService,KyeeListenerRegister){
        $scope.isEmpty = false;
        var date = new Date();
        var name = "";
        var idNo = "";
        var phoneNumer = "";
        $scope.yearRange = (date.getFullYear() - 18) + '->' + (date.getFullYear());
        var year = date.getFullYear();
        var month=date.getMonth()+1;
        month =(month<10 ? "0"+month:month);
        var day = date.getDate();
        day =(day<10 ? "0"+day:day);
        var pastDate= getPastHalfYear();
        var pastMonth=pastDate.getMonth()+1;
        pastMonth =(pastMonth<10 ? "0"+pastMonth:pastMonth);
        $scope.startTime = pastDate.getFullYear() + '-' + pastMonth + '-' + '01';
        $scope.endTime = year + '-' + month + '-' + day;
        $scope.sat={};
        $scope.isAddExtendInfo = false;
        $scope.loadData = function(){
            var sTime = $scope.startTime;
            var eTime = $scope.endTime;
            MedicalRecordService.loadData(name,idNo,phoneNumer,sTime,eTime,function(data){
                if(data&&data.success){
                    if(data.data&&data.data.length==0){
                        $scope.isEmpty = true;
                    }else{
                        $scope.medicalData = data.data;
                        $scope.isEmpty = false;
                    }
                    if(data.TREATMENT_CARD_NO){
                        $scope.isAddExtendInfo = true;
                        $scope.sat.TREATMENT_CARD_NO=data.TREATMENT_CARD_NO;
                        $scope.sat.OFTEN_NAME = name;
                    }else{
                        $scope.sat.TREATMENT_CARD_NO="";
                    }

                    if(data.PHONE_NUMBER){
                        $scope.isAddExtendInfo = true;
                        $scope.sat.PHONE_NUMBER = data.PHONE_NUMBER;
                        $scope.sat.OFTEN_NAME = name;
                    }else{
                        $scope.sat.PHONE_NUMBER="";
                    }
                    if(!data.PHONE_NUMBER&&!data.TREATMENT_CARD_NO){
                        $scope.isAddExtendInfo = false;
                    }
                }else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
                $scope.$broadcast('scroll.refreshComplete');
            });

        };
        
        $scope.goToRecordDetail = function (Item) {
            MedicalRecordService.medicalRecordItem = Item;
            $state.go("sp_clinic_hos_record");
        };

        /**
         * 日期
         */
        var startOrend;
        $scope.selectTime = function (type) {
           if(type==0){
               startOrend=0;
           }else{
               startOrend=1;
           }

            $scope.show();
        };

        /**
         * 绑定日期组件方法
         * @param params
         */
        $scope.bind = function (params) {
            $scope.show = params.show;
        };


        /**
         * 选择日期完成
         * @param params
         * @returns {boolean}
         */
        $scope.onFinash = function (params) {
            if(startOrend==0){
                $scope.startTime = params[0].value + "-" + params[1].value + "-" + params[2].value;
                $scope.startTime = formatTime($scope.startTime);
            }else{
                $scope.endTime = params[0].value + "-" + params[1].value + "-" + params[2].value;
                $scope.endTime = formatTime($scope.endTime);

            }
            if($scope.startTime > $scope.endTime){
                KyeeMessageService.broadcast({
                    content:  "开始时间必须小于结束时间，请重新选择时间！"
                });
            }else if($scope.startTime<getPastYear()){
                KyeeMessageService.broadcast({
                    content:  "查询间隔不能超过一年，请重新选择时间！"
                });
            }else{
                $scope.loadData();
            }
            return true;
        };

        function formatTime(date){
            var result = date;
            if(date){
                var array = date.trim().split("-");
                array[1] =(array[1]<10 ? "0"+array[1]:array[1]);
                array[2] =(array[2]<10 ? "0"+array[2]:array[2]);
                result = array[0]+"-"+array[1]+"-"+array[2];
            }
            return result;
        }


        //获取半年前时间
        function getPastHalfYear() {
            // 先获取当前时间
            var curDate = (new Date()).getTime();
            // 将半年的时间单位换算成毫秒
            var halfYear = 365 / 2 * 24 * 3600 * 1000;
            var pastResult = curDate - halfYear;  // 半年前的时间（毫秒单位）

            // 日期函数，定义起点为半年前
            var pastDate = new Date(pastResult)

            return pastDate;
        };
        //获取结束时间的一年前时间
        function getPastYear() {
            // 将一年的时间单位换算成毫秒
            var pastYear = 366 * 24 * 3600 * 1000;
            var pastResult = new Date($scope.endTime).getTime() - pastYear;  // 一年前的时间（毫秒单位）
            var pasD = new Date(pastResult)
            var pastM=pasD.getMonth()+1;
            pastM =(pastM<10 ? "0"+pastM:pastM);
            var pDay = pasD.getDate();
            pDay =(pDay<10 ? "0"+pDay:pDay);
            var pasTime = pasD.getFullYear() + '-' + pastM + '-' + pDay;

            return pasTime;
        };

        var loadQuickData = function(){
            MedicalRecordService.quickSugSearchRecord($scope.messageId,$scope.phoneNumber,function(data){
                if(data&&data.success){
                    if(data.data && data.data.length==0){
                        $scope.isEmpty = true;
                    }else{
                        $scope.medicalData = data.data;
                        $scope.isEmpty = false;
                    }

                }else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        };

        KyeeListenerRegister.regist({
            focus: "sp_medical_record",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.isEmpty = false;
                if(MedicalRecordService.isQuickEvaluate){
                    $scope.medicalData="";
                    $scope.messageId = MedicalRecordService.messageId;
                    $scope.phoneNumber = MedicalRecordService.phoneNumber;
                    loadQuickData();
                    $scope.isNeedExtendInfo = false;
                }else{
                    if(CommPatientDetailService.item){
                        if(CommPatientDetailService.item.ID_NO&&CommPatientDetailService.item.OFTEN_NAME){
                            idNo = CommPatientDetailService.item.ID_NO;
                            name = CommPatientDetailService.item.OFTEN_NAME;
                            phoneNumer =CommPatientDetailService.item.PHONE;
                        }
                    }
                    if(CacheServiceBus.getMemoryCache().get('currentCustomPatient')){
                        var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                        idNo = currentCustomPatient.ID_NO;
                        name = currentCustomPatient.OFTEN_NAME;
                        phoneNumer =currentCustomPatient.PHONE;
                    }
                    $scope.isNeedExtendInfo = true;//是否需要显示添加扩展信息
                    $scope.loadData();
                }

            }
        });

        $scope.doRefresh = function(){
            if(MedicalRecordService.isQuickEvaluate){
                loadQuickData();
            }else{
                $scope.loadData();
            }
            $scope.$broadcast('scroll.refreshComplete');
        }



        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "sp_medical_record",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $ionicHistory.goBack();
            }
        });
        $scope.back = function(){
            $ionicHistory.goBack();
        };
        $scope.addExtendPatientInfo = function(){
            MedicalRecordService.satInfo={};
           $state.go("add_sat_extend_patient_info");
        };
        $scope.editExtendPatientInfo = function(){
            MedicalRecordService.satInfo=$scope.sat;
            $state.go("add_sat_extend_patient_info");
        }
        $scope.goToQuickEvaluate = function(){
            $state.go("sms_quick_evaluate");
        }
    })
    .build();