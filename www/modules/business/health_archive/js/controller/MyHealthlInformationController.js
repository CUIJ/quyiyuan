/*
 * 产品名称：健康档案—个人健康信息
 * 创建人: 高萌
 * 创建日期:2016年11月17日14:18:46
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.my.health.information.controller")
    .require([
        "kyee.quyiyuan.health.archive.my.health.information.service"
    ])
    .type("controller")
    .name("MyHealthInformationController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister","MyPersonalInformationService",
        "MyHealthInformationService","CacheServiceBus","ClinicHospitalDetailService"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,MyPersonalInformationService,
                      MyHealthInformationService,CacheServiceBus,ClinicHospitalDetailService) {
        $scope.showHealthInfoData = false;
        $scope.initHealthPage = function(){
            ClinicHospitalDetailService.isInhospital = null;
            $scope.healthData = null;
            var idCardNo = "";
            var name = "";
            var phoneNumber = "";
            var idNo = "";
            var patientName = "";
            if(CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL)&& CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).state=="my_health_archive"){
                idCardNo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).idCard;
                name = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).name;
                phoneNumber = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).phoneNumber;
            }else{
                var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                idNo = currentCustomPatient.ID_NO;
                patientName = currentCustomPatient.OFTEN_NAME;
            }
             var param = {
                ID_NO:idNo,
                PATIENT_NAME:patientName,
                idCardNo: idCardNo,
                name: name,
                phoneNumber: phoneNumber
            };
            MyHealthInformationService.getMyHealthInfo(param,function(result){
                $scope.HealthInfo = result;
                $scope.showHealthInfoData = true;
            })
        };
        //获取健康信息
        $scope.initHealthPage();

        $scope.isNotEmptyData = function(data){
            if($scope.showHealthInfoData == true){
                return true;
            }
        };
        $scope.isNotEmpty = function(data){
            if(data == null || data == undefined || data == ""){
                return;
            }else{
                return data;
            }
        };
      //显示疾病史详情
        $scope.showHistoryOfDiseaseInf = function(){
            $scope.userMessage = $scope.isNotEmpty($scope.HealthInfo.DIS_NAMES);
            if($scope.userMessage == "" || $scope.userMessage == null || $scope.userMessage == undefined){
              return;
            }
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"疾病史",
                tapBgToClose:"true",
                buttons: [
                    {
                        text:  KyeeI18nService.get("my_health_information.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("showHistoryOfDiseaseInf", "my_health_information");
        };
       //显示家族史详情
        $scope.showHistoryOfFamilyInf = function(){
            $scope.userMessage =$scope.isNotEmpty($scope.HealthInfo.FW);
            if($scope.userMessage == "" || $scope.userMessage == null || $scope.userMessage == undefined){
                return;
            }
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"家族史",
                tapBgToClose:"true",
                buttons: [
                    {
                        text:  KyeeI18nService.get("my_health_information.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("showHistoryOfFamilyInf", "my_health_information");
        };
        //显示手术史详情
        $scope.showHistoryOfOperationInf = function(){
            $scope.userMessage =$scope.isNotEmpty($scope.HealthInfo.IS_OPS);
            if($scope.userMessage == "" || $scope.userMessage == null || $scope.userMessage == undefined){
                return;
            }
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"手术史",
                tapBgToClose:"true",
                buttons: [
                    {
                        text:  KyeeI18nService.get("my_health_information.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("showHistoryOfOperationInf", "my_health_information");
        };
        //显示输血史详情
        $scope.showHistoryOfBloodTransfusionInfo = function(){
            $scope.userMessage =$scope.isNotEmpty($scope.HealthInfo.IS_BLOOD);
            if($scope.userMessage == "" || $scope.userMessage == null || $scope.userMessage == undefined){
                return;
            }
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"输血史",
                tapBgToClose:"true",
                buttons: [
                    {
                        text:  KyeeI18nService.get("my_health_information.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("showHistoryOfBloodTransfusionInfo", "my_health_information");
        };
        //显示暴露史详情
        $scope.showHistoryOfExposeInfo = function(){
            $scope.userMessage =$scope.isNotEmpty($scope.HealthInfo.EXPOSED_DES);
            if($scope.userMessage == "" || $scope.userMessage == null || $scope.userMessage == undefined){
                return;
            }
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"暴露史",
                tapBgToClose:"true",
                buttons: [
                    {
                        text:  KyeeI18nService.get("my_health_information.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("showHistoryOfExposeInfo", "my_health_information");
        };
        //显示过敏史详情
        $scope.showHistoryOfAllergyInfo = function(){
            $scope.userMessage =$scope.isNotEmpty($scope.HealthInfo.ALLERGY_DES);
            if($scope.userMessage == "" || $scope.userMessage == null || $scope.userMessage == undefined){
                return;
            }
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:"过敏史",
                tapBgToClose:"true",
                buttons: [
                    {
                        text:  KyeeI18nService.get("my_health_information.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("showHistoryOfAllergyInfo", "my_health_information");
        };

    })
    .build();

