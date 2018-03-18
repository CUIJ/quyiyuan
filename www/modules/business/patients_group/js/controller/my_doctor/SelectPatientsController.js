/**
 * 选择就诊者
 * Created by liwenjuan on 2016/11/25.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor.select_patients.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.framework.service.message",
        "kyee.framework.device.message",
        "kyee.quyiyuan.patients_group.my_doctor.select_patients.service",
        "kyee.quyiyuan.patients_group.my_doctor_details.service"
    ])
    .type("controller")
    .name("SelectPatientsController")
    .params([
        "$scope",
        "$state",
        "KyeeMessageService",
        "KyeeI18nService",
        "SelectPatientsService",
        "MyDoctorDetailsService"
    ])
    .action(function($scope,$state,KyeeMessageService,KyeeI18nService,
                     SelectPatientsService,MyDoctorDetailsService){

        $scope.selectedObj = null; //选中的就诊者信息

        /**
         * 更新就诊者当前信息显示提示
         * addBy liwenjuan 2016/11/30
         */
        var updatePatientsMsg = function(){
            var msg = KyeeI18nService.get("hello_message","医生您好，我是" + $scope.selectedObj.OFTEN_NAME);
            $scope.selectedMessage = msg;
        };

        /**
         * 初始化就诊者数据
         * addBy liwenjuan 2016/11/28
         */
        var initView = function(){
            if(0 < SelectPatientsService.customsPatientsList.length){
                $scope.patientsList = SelectPatientsService.customsPatientsList;
                $scope.selectedObj = SelectPatientsService.customsPatientsList[0];//默认选中第一个就诊者
            }
            if(SelectPatientsService.curDoctorInfo){
                $scope.doctorInfo = SelectPatientsService.curDoctorInfo;
            }
            updatePatientsMsg();
        };
        initView();

        /**
         * 选择就诊者
         * addBy liwenjuan 2016/12/01
         * @param patient
         */
        $scope.selectPatient = function(patient){
            if(patient == $scope.selectedObj){
                return;
            }
            $scope.selectedObj = patient; //记住选中就诊者
            updatePatientsMsg();
        };

        /**
         * 提交选中的就诊者信息并跳转到医生详情
         */
        $scope.submit = function(){
            if(!$scope.selectedObj){ //未选中任何就诊者
                KyeeMessageService.message({
                    title: KyeeI18nService.get("commonText.tipMsg","提示"),
                    content: "您还未选择任何就诊者不能提交"
                });
                return;
            }
            var patientInfo = angular.copy($scope.selectedObj);
            patientInfo.friendDesc = $scope.selectedMessage;
            SelectPatientsService.addDoctorRequest($scope.doctorInfo,patientInfo,function(res){
                MyDoctorDetailsService.doctorInfo = $scope.doctorInfo;
                $state.go("my_doctor_details");
            });

        };
    })
    .build();