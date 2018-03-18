/**
 * 产品名称 quyiyuan.
 * 创建用户: yangmingsi
 * 日期: 2017年2月21日09:40:54
 * 创建原因：KYEEAPPC-10018 亳州门诊、住院记录controller
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicalRecordController.clinic_hos_record.controller")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.account_authentication.service",
        "kyee.quyiyuan.center.updateuser.service",
        "kyee.quyiyuan.aboutquyi.service",
        "kyee.quyiyuan.center.controller.administrator_login",
        "kyee.quyiyuan.center.administrator_login",
        "kyee.quyiyuan.evaluateController.controller"
    ])
    .type("controller")
    .name("ClinicHosRecordController")
    .params([
        "$scope",
        "$state",
       "MedicalRecordService",
        "KyeeMessageService",
        "KyeeListenerRegister",
        "$ionicHistory"
    ])
    .action(function($scope, $state,MedicalRecordService,KyeeMessageService,KyeeListenerRegister,$ionicHistory){
        $scope.isEmpty = false;
        if(MedicalRecordService.medicalRecordItem){
            $scope.medicalRecordItem= MedicalRecordService.medicalRecordItem;
            $scope.HOSPITAL_NAME = MedicalRecordService.medicalRecordItem.hospitalName;//医院名称
            $scope.DEPT_NAME = MedicalRecordService.medicalRecordItem.deptName;//科室名称
            var hospitalId = MedicalRecordService.medicalRecordItem.hospitalId;//医院ID
            var serialNo = MedicalRecordService.medicalRecordItem.serialNo; //流水号
            var inHospitalFlag = MedicalRecordService.medicalRecordItem.type;//住院、门诊
        }
        var loadData = function(){
            MedicalRecordService.loadClinicHosRecord(hospitalId,serialNo,inHospitalFlag,function(data){
                if(data&&data.success){
                    if(data.data&&data.data.length==0){
                        $scope.isEmpty = true;
                    }else{
                        $scope.isEmpty = false;
                        $scope.medicalDatas = data.data;
                        for(var i=0;i<$scope.medicalDatas.length;i++){
                            if(i%3==0){
                                $scope.medicalDatas[i].color =1;
                            }else if(i%3==1){
                                $scope.medicalDatas[i].color =2;
                            }else{
                                $scope.medicalDatas[i].color =3;
                            }
                        }
                    }
                }else {
                    $scope.isEmpty = true;
                    KyeeMessageService.broadcast({
                        content:  "查询失败，请稍后重试！"
                    });
                }
            });
        };

        $scope.goToEvaluate = function (content,type) {
            MedicalRecordService.medicalContent = content;
            MedicalRecordService.queryType=type;
            $state.go("sp_evaluate");
        };
          $scope.getColor= function (circle,type) {
            var cls = "";
            if(circle==1){
                if(type ==1){
                    cls = "big_circle1_color1";
                }else if(type ==2){
                    cls = "big_circle1_color2";
                }else if(type ==3){
                    cls = "big_circle1_color3";
                }
                return cls;
            }
            if(circle==2){
                if(type ==1){
                    cls = "little_circle_color1";
                }else if(type ==2){
                    cls = "little_circle_color2";
                }else if(type ==3){
                    cls = "little_circle_color3";
                }
                return cls;
            }
            if(circle==3){
                if(type ==1){
                    cls = "item_circle_color1";
                }else if(type ==2){
                    cls = "item_circle_color2";
                }else if(type ==3){
                    cls = "item_circle_color3";
                }
                return cls;
            }

        };
        //获取当前星星的样式：空星、半星、满星
        $scope.getXingCls = function(score, idx){
            var cls = "";
            var x = score - idx;
            if(x >= 0){
                //满星
                cls = "icon-favorite2";
            }else if(x >= -0.5){
                //半星
                cls = "icon-favorite1";
            }else if(x < -0.5){
                //空星
                cls = "icon-favorite2 empty_star";
            }
            return cls;
        };


        KyeeListenerRegister.regist({
            focus: "sp_clinic_hos_record",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                loadData();
            }
        });
        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "sp_clinic_hos_record",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        $scope.back = function(){
            $ionicHistory.goBack(-1);
        }
    })
    .build();

