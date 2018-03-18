new KyeeModule()
    .group("kyee.quyiyuan.sms_quick_evaluate.controller")
    .require([])
    .type("controller")
    .name("SmsQuickEvaluateController")
    .params(["CenterUtilService","KyeeMessageService","MedicalRecordService","$ionicHistory","$state","$scope","CacheServiceBus","KyeeListenerRegister"])
    .action(function (CenterUtilService,KyeeMessageService,MedicalRecordService,$ionicHistory,$state,$scope,CacheServiceBus,KyeeListenerRegister) {
        $scope.sat={};
        //是否首页页面进入
        $scope.isHomeEntry=false;
        if($ionicHistory.backView()){
            $scope.isHomeEntry = ($ionicHistory.backView().stateName == "home->MAIN_TAB");
        }
        $scope.satHosList=[]; //满意度医院排名列表
        $scope.satDocList=[]; //满意度医生排名列表


        var loadData = function(){
            MedicalRecordService.loadSatHosList(3,function(data){
                if(data&&data.success){
                    if(data.data&&data.data.length==0){
                        return;
                    }else{
                        $scope.satHosList = data.data;
                    }
                }else {
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
            MedicalRecordService.loadSatDocList(6,function(data){
                if(data&&data.success){
                    if(data.data&&data.data.length==0){
                        return;
                    }else{
                        $scope.satDocList = data.data;
                    }
                }else {
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        };

        var quickSugCodeAuth = function(phoneNumber,checkCode){
            var idNo = '';
            var oftenName = '';
            var messageId = '';
            MedicalRecordService.quickSugCodeAuth(phoneNumber,checkCode,function(data){
                if(data && data.success){
                    if(data.data){
                        idNo = data.data.idNo;
                        oftenName = data.data.oftenName;
                        MedicalRecordService.messageId = data.data.messageId;
                        MedicalRecordService.phoneNumber = data.data.phoneNo;
                        var noLoginAndPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.NO_LOGIN_AND_PATIENT);
                        MedicalRecordService.isQuickEvaluate = true;
                        if(noLoginAndPatient||$scope.isHomeEntry){
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.NO_LOGIN_AND_PATIENT,1);
                            $state.go("sp_medical_record");
                        }else{
                            $ionicHistory.goBack();
                        }
                    }
                }else{
                    KyeeMessageService.broadcast({
                        content: '验证失败，请重新输入验证码！'
                    });
                }
            })

        };

        $scope.submit = function(){
            var phoneNumber = $scope.sat.phoneNumber;
            var checkCode = $scope.sat.checkCode;
            if(phoneNumber && !CenterUtilService.validateMobil(phoneNumber)){
                return;
            }
            if(phoneNumber && checkCode){
                quickSugCodeAuth(phoneNumber,checkCode);
            }else{
                KyeeMessageService.broadcast({
                    content:"请输入手机号和验证码！",
                    duration: 500
                });
                return;
            }
        };
        KyeeListenerRegister.regist({
            focus: "sms_quick_evaluate",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                loadData();
            }
        });



    })
    .build();