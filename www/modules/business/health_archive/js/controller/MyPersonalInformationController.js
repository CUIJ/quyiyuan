/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：亳州平台健康档案
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.my.personal.information.controller")
    .require([
        "kyee.quyiyuan.health.archive.my.personal.information.service"
    ])
    .type("controller")
    .name("MyPersonalInformationController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister","MyPersonalInformationService","$ionicScrollDelegate","ClinicHospitalDetailService","CacheServiceBus"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,MyPersonalInformationService,$ionicScrollDelegate,ClinicHospitalDetailService,CacheServiceBus) {

        $scope.showResidenceInf = function(title,message){
            $scope.userMessage =message;
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:title,
                buttons: [
                    {
                        text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
        };
        $scope.initPersonalPage = function(){
            ClinicHospitalDetailService.isInhospital = null;
            $scope.personalInfo = null;
            var idCardNo = "";
            var name = "";
            var phoneNumber = "";
            if(CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL)&& CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).state=="my_health_archive"){
                idCardNo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).idCard;
                name = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).name;
                phoneNumber = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).phoneNumber;
            }
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var currentUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            if(currentUser&&currentPatient&&currentUser.USER_ID&&currentUser.USER_ID&&currentPatient.USER_VS_ID){
                var param = {
                    idCardNo: idCardNo,
                    name: name,
                    phoneNumber: phoneNumber
                };
                MyPersonalInformationService.getPersonalInfo(param,function(result){

                    $scope.personalInfo = result;
                    //身份证号加密
                    $scope.personalInfo.ID_NO = getHideIdNo($scope.personalInfo.ID_NO);
                    //手机号加密
                    $scope.personalInfo.PHONE = getHidePhoneNum($scope.personalInfo.PHONE);
                })
            }else{
                var userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源
                if(userSource=='3'&&(idCardNo==undefined||idCardNo==''||idCardNo==null||name==undefined||name==''||name==null)){
                    //如果是我家亳州，点击健康档案会进两次这个页面，第一次拿不到缓存中信息，因此后台报错。则在此判断下，如果不为空则给后台发请求。
                    $scope.personalInfo.SHEN_FEN ="空";
                }else{
                    var param = {
                        idCardNo: idCardNo,
                        name: name,
                        phoneNumber: phoneNumber
                    };
                    MyPersonalInformationService.getPersonalInfo(param,function(result){

                        $scope.personalInfo = result;
                        //身份证号加密
                        $scope.personalInfo.ID_NO = getHideIdNo($scope.personalInfo.ID_NO);
                        //手机号加密
                        $scope.personalInfo.PHONE = getHidePhoneNum($scope.personalInfo.PHONE);
                    })
                }
            }



        };
        $scope.initPersonalPage();
        $scope.isNotEmpty = function(data){
            if(data!=null&&data!=undefined&&data!=""){
                return true;
            }else{
                return false;
            }
        };
        //将身份证号转换为****
        var getHideIdNo = function (idNo) {
            if (idNo == null || idNo == undefined || idNo == '') {
                return;
            }
            else {
                var len = idNo.length;
                var head = idNo.substr(0, 3);
                var idNoS = head;
                var tail = idNo.substr(len - 4, 4);//substr(len - 6, 6);
                for (var i = 3; i < idNo.length - 4; i++) {
                    idNoS = idNoS + '*';
                }
                idNoS = idNoS + tail;
                return idNoS;
            }
        };
        //将手机号转换为****
        var getHidePhoneNum = function (phoneNum) {
            if (phoneNum == null || phoneNum == undefined || phoneNum == '') {
                return;
            }
            else {
                var len = phoneNum.length;
                var head = phoneNum.substr(0, 3);
                var phoneS = head;
                var tail = phoneNum.substr(len - 4, 4);
                for (var i = 3; i < phoneNum.length - 4; i++) {
                    phoneS = phoneS + '*';
                }
                phoneS = phoneS + tail;
                return phoneS;
            }
        };

    })
    .build();

