/**
 * Created by zxy on 15-5-27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.controller.family_members")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.ncms.familymembers.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.ncms.myfamily.service"])
    .type("controller")
    .name("FamilyMembersController")
    .params([
        "$scope",
        "$state",
        "KyeeMessageService",
        "KyeeViewService",
        "CacheServiceBus",
        "HospitalSelectorService",
        "LoginService",
        "AuthenticationService",
        "RsaUtilService",
        "KyeeUtilsService",
        "KyeeDeviceInfoService",
        "KyeeCameraService",
        "FamilyMembersService",
        "$ionicScrollDelegate",
        "myFamilyService",
        "KyeeI18nService"
    ])
    .action(function(
        $scope,
        $state,
        KyeeMessageService,
        KyeeViewService,
        CacheServiceBus,
        HospitalSelectorService,
        LoginService,
        AuthenticationService,
        RsaUtilService,
        KyeeUtilsService,
        KyeeDeviceInfoService,
        KyeeCameraService,
        FamilyMembersService,
        $ionicScrollDelegate,
        myFamilyService,
        KyeeI18nService){
        //初始化一些字段
        $scope.noShow = true;
        $scope.isNot = false;
        $scope.userInfo = {
            text : KyeeI18nService.get("ncms.sorry","对不起，你绑定的身份证无效，不能使用该功能!")
        };
        $scope.clickUpload = function() {
            var Buttons = new Array();
            for (var i = 0; i < $scope.userInfo.length; i++) {
                var item = {text : $scope.userInfo[i].NAME};
                Buttons.push(item);
            }
            KyeeMessageService.actionsheet({
//                title : "请选择姓名",
                buttons :Buttons,
                onClick : function(index){
                    if(index != -1){
                    $scope.names = $scope.userInfo[index].NAME;
                    angular.forEach( $scope.userInfo, function (item, index, items) {
                    if(item.NAME == $scope.names){
                        $scope.township = $scope.names;
                        $ionicScrollDelegate.$getByHandle('aaa').scrollTo(0, 365*index, true);
                    }
                    });
                    }
                },
                cancelButton : true
            });
        };
        //查询请求
        $scope.getUserInfo = function(){
            if(myFamilyService.FAMILY_FALSE_FLAG != true){
            if(myFamilyService.FAMILY_CODE){
                $scope.FAMILY_CODE = myFamilyService.FAMILY_CODE;
                FamilyMembersService.getFamilyMembers(
                        $scope.FAMILY_CODE,
                        function(data){
                            if(data.success){
                                $scope.userInfo = data.data.rows;
                                for(var i = 0; i < $scope.userInfo.length; i++){
                                    $scope.userInfo[i].ATTEND_TIME = $scope.userInfo[i].FIRST_ATTEND_TIME.substring(0, 10);
                                    $scope.userInfo[i].ID_NO_PASS1 = $scope.userInfo[i].ID_NO.substring(0, 10);
                                    $scope.userInfo[i].ID_NO_PASS2 = $scope.userInfo[i].ID_NO.substring(14);
                                    $scope.userInfo[i].ID_NO_PASS = $scope.userInfo[i].ID_NO_PASS1+"****"+$scope.userInfo[i].ID_NO_PASS2;
                                }
                                if($scope.userInfo!=undefined && $scope.userInfo.length>0){
                                    $scope.township = $scope.names = $scope.userInfo[0].NAME;
                                }else{
                                    $scope.township = KyeeI18nService.get("ncms.all","全部");
                                }
                                if(!data.data.rows.length>0){
                                    $scope.noShow = false;
                                    $scope.isNot = true;
                                }
                            }else{
                                $scope.noShow = false;
                                $scope.isNot = true;
                            }
                        }
                    );
            }else{
                $scope.noShow = false;
                $scope.isNot = true;
            }
            }else{
                $scope.noShow = false;
                $scope.isNot = true;
                $scope.userInfo.text = KyeeI18nService.get("ncms.goOnFalse","连接新农合服务器失败。");
            }
        };
        $scope.getUserInfo();
    })
    .build();