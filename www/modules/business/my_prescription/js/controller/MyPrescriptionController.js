/**
 * Created by lizhihu on 2017/10/25.
 */
new KyeeModule()
    .group("kyee.quyiyuan.my.prescription.controller")
    .require([
        "kyee.quyiyuan.myprescription.service"
    ])
    .type("controller")
    .name("MyPrescriptionController")
    .params(["$scope","$state","KyeeMessageService","KyeeListenerRegister","KyeeI18nService","MyPrescriptionsService", "KyeeUtilsService","CacheServiceBus"])
    .action(function ($scope,$state,KyeeMessageService,KyeeListenerRegister,KyeeI18nService,MyPrescriptionsService,KyeeUtilsService,CacheServiceBus) {
        /**
         * 监听进入当前页面
         */
          //用户信息缓存
        KyeeListenerRegister.regist({
            focus: "my_prescription",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function(params){
                initView();
            }
        });
        $scope.presitionData=[];
        $scope.hasPresition = true;
        function initView(){
             //console.log("cache",CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT));
            var userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            MyPrescriptionsService.queryCustomPatient(userId,function(data){
                if(data.success){
                    if(data.data.length==0){
                        KyeeMessageService.confirm({
                            title: KyeeI18nService.get("commonText.warmTipMsg","温馨提示"),
                            content: KyeeI18nService.get("commonText.selectPatientMsg","该项业务需要您先添加就诊者信息"),
                            okText: KyeeI18nService.get("commonText.selectOk","前往添加"),
                            cancelText: KyeeI18nService.get("commonText.selectCancel","以后再说"),
                            onSelect: function (res) {
                                if (res) {
                                    $state.go("custom_patient");
                                }
                            }
                        });
                    }else{
                        var userInformation = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT)
                        var phoneNum = userInformation.PHONE;
                        var patientName = userInformation.OFTEN_NAME;
                        var params = {
                            phoneNum: phoneNum,
                            patientName:patientName
                        };
                        MyPrescriptionsService.getPrescriptionList(params,function(data){
                            if(data.list.length!=0){
                                $scope.presitionData = data.list;
                                for(var i in $scope.presitionData){
                                    if($scope.presitionData[i].GENDER==1){
                                        $scope.presitionData[i].GENDER = "男"
                                    }else{
                                        $scope.presitionData[i].GENDER = "女"
                                    }
                                    if($scope.presitionData[i].PRESCRIPTION_DATE){
                                        $scope.presitionData[i].PRESCRIPTION_DATE = $scope.presitionData[i].PRESCRIPTION_DATE.split('-').join('/');
                                    }

                                }
                            }else{
                                $scope.hasPresition = false;
                            }
                        })
                    }
                }

            })

        }
        $scope.closePopDetail = function(){
            $scope.hideOverlay();
        }
        $scope.checkDetailPres = function(status,prescriptionNo,hospitalId,proto){
            if(status==1){
                var screenSize = KyeeUtilsService.getInnerSize();
                $scope.datePanelStyle = screenSize.height-20;
                $scope.dataPaneWidth = screenSize.width-20;

                MyPrescriptionsService.getPresitionDetail(prescriptionNo,hospitalId,function(data){

                    var patientChufangName = data.PRESCRIPTION_TYPE;
                    if(patientChufangName == "0" ){
                        patientChufangName = "西成药处方笺";
                    }else if(patientChufangName == "1"){
                        patientChufangName = "中草药处方笺";
                    }
                    $scope.patientHospitalName = data.HOSPITAL_NAME;
                    var patientName = data.PATIENT_NAME;
                    var patientSex = data.GENDER=="1" ? "男":"女"
                    var patientAge = data.AGE;
                    var patientWeight = data.WEIGHT;
                    var patientPhoneNum = data.PHONE_NUMBER;
                    var patientAddress = data.ADDRESS;
                    var patientDiang = data.DIAGNOSIS;
                    var patientKaiDate = data.PRESCRIPTION_DATE;

                    var patientDetail = data.DETAILS_OBJ;

                    var patientVerify = data.VERIFY;
                    var patientAssign = data.ASSIGN;
                    var patientMonery = data.TOTAL_PRICE;
                    var patientDoctor = data.DOCTOR_NAME;
                    var patientDoctorSigin = data.DOCTOR_SIGN_PATH;
                    //过敏病史
                    var patientllergyA= data.PAST_HISTORY;
                    var chufangName = data.RECIPE_FLAG;

                    $scope.isSign = false;
                    $scope.pecipe = 1;
                    if(chufangName == "J"){
                        chufangName = '急诊处方';
                        $scope.pecipe = 3;
                    }else if(chufangName == "E"){
                        chufangName = '儿科处方';
                        $scope.pecipe = 2;
                    }else{
                        chufangName = '普通处方';
                        $scope.pecipe = 1;
                    }
                    if(patientDoctorSigin){
                        $scope.isSign = true;
                    }else{
                        $scope.isSign = false;
                    }
                    $scope.overlayData={
                        PatientName:patientName,
                        PatientWeight:patientWeight,
                        PatientSex:patientSex,
                        PatientAge:patientAge,
                        PatientPhone:patientPhoneNum,
                        PatientAddress:patientAddress,
                        PatientDiang:patientDiang,
                        PatientKaiDate:patientKaiDate,
                        PatientDetail:patientDetail,
                        //审核
                        PatientVERIFY:patientVerify,
                        PatientASSIGN:patientAssign,
                        PatientMonery:patientMonery,
                        PatientDoctor:patientDoctor,
                        //过敏
                        PatientllergyA:patientllergyA,
                        //签名
                        PatientDoctorSigin:patientDoctorSigin,
                        PatientChufang:chufangName,
                        PatientPecipe:$scope.pecipe,
                        PatientisSign:$scope.isSign,
                        PatientChufangName:patientChufangName,
                        PatientHospitalName:$scope.patientHospitalName

                    };
                    $scope.$apply();
                    $scope.showOverlay();
                });

            }else{
                KyeeMessageService.message({
                    title:"温馨提示",
                    content: proto,
                    okText: KyeeI18nService.get('commonText.iknowMsg', '我知道了', null)
                });
                return false;
            }
        }
        //判断设备是否为ios
        if(window.device != undefined && ionic.Platform.platform() == "ios"){

            $scope.deviceTop= 34;
        }else{
            $scope.deviceTop=14;
        }
        /**
         * 绑定弹出图片层参数传递
         * @param params
         */
        $scope.binds = function (params) {
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
              closePopDetail:$scope.closePopDetail
            });
        };

    })
    .build();
