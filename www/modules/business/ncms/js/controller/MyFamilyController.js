/**
 * Created by zxy on 15-5-27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.controller.my_family")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.ncms.myfamily.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.ncms.familymembers.service"])
    .type("controller")
    .name("MyFamilyController")
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
        "myFamilyService",
        "FamilyMembersService",
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
        myFamilyService,
        FamilyMembersService,
        KyeeI18nService){
        //初始化一些字段
        $scope.userInfo = {
            township : "",
            name : "",
            population : "",
            idNo: "",
            participatingProperties:"",
            accountCategory:"",
            familyPrepaidAmount:"",
            noShow:false,
            isNot:false,
            text:KyeeI18nService.get("ncms.sorry","对不起，你绑定的身份证无效，不能使用该功能!")
        };
        //查询请求
        $scope.getUserInfo = function(){
            myFamilyService.FAMILY_CODE = undefined;
            myFamilyService.FAMILY_DATA = undefined;
            myFamilyService.FAMILY_YEAR = undefined;
            myFamilyService.FAMILY_FALSE_FLAG = undefined;
            var CURRENT_USER_RECORD = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            if(CURRENT_USER_RECORD){
            if(CURRENT_USER_RECORD.NAME!=undefined
                && CURRENT_USER_RECORD.NAME!= null
                && CURRENT_USER_RECORD.NAME!=""
                && CURRENT_USER_RECORD.ID_NO!=undefined
                && CURRENT_USER_RECORD.ID_NO!=null
                && CURRENT_USER_RECORD.ID_NO!=""){
                $scope.ID_NO = CURRENT_USER_RECORD.ID_NO;
                $scope.NAME = CURRENT_USER_RECORD.NAME;
            myFamilyService.getUserInfo(
                $scope.ID_NO,
                $scope.NAME,
                function(data){
                    if(data.success){
                        if(!data.data.info.rows.length>0){
                            $scope.userInfo.isNot = true;
                        }else{
                            $scope.userInfo.noShow = true;
                        $scope.userInfo.township = data.data.info.rows[0].TOWN;
                        $scope.userInfo.name = data.data.info.rows[0].HOUSEHOLDER_NAME;
                        $scope.userInfo.population = data.data.info.rows[0].POPULATION;
                        $scope.userInfo.idNo = data.data.info.rows[0].HOUSEHOLDER_ID_NO;
                        $scope.userInfo.ID_NO_PASS1 = $scope.userInfo.idNo.substring(0, 10);
                        $scope.userInfo.ID_NO_PASS2 = $scope.userInfo.idNo.substring(14);
                        $scope.userInfo.ID_NO_PASS = $scope.userInfo.ID_NO_PASS1+"****"+$scope.userInfo.ID_NO_PASS2;
                        $scope.userInfo.participatingProperties = data.data.info.rows[0].PROPERTY;
                        $scope.userInfo.accountCategory = data.data.info.rows[0].REGISTER_TYPE;
                        $scope.userInfo.familyPrepaidAmount = data.data.info.rows[0].FAMILY_PAYMENT;
                        myFamilyService.FAMILY_CODE = data.data.info.rows[0].FAMILY_CODE;
                        myFamilyService.FAMILY_YEAR = data.data.year;
                        $scope.getFamilyMembers();
                        }
                    }else if(data.message == "远程请求失败"){
                            $scope.userInfo.noShow = false;
                            $scope.userInfo.isNot = true;
                            $scope.userInfo.text = KyeeI18nService.get("ncms.goOnFalse","连接新农合服务器失败。");
                            myFamilyService.FAMILY_FALSE_FLAG = true;
                    }else{
                        $scope.userInfo.noShow = false;
                        $scope.userInfo.isNot = true;
                    }
                }
            );
            }else{
                $scope.userInfo.noShow = false;
                $scope.userInfo.isNot = true;
            }
            }else{
                $scope.userInfo.noShow = false;
                $scope.userInfo.isNot = true;
            }
        };
        //查询请求
        $scope.getFamilyMembers = function(){
            if(myFamilyService.FAMILY_CODE){
                $scope.FAMILY_CODE = myFamilyService.FAMILY_CODE;
                FamilyMembersService.getFamilyMembers(
                    $scope.FAMILY_CODE,
                    function(data){
                        if(data.success){
                            myFamilyService.FAMILY_DATA = data.data.rows;
                        }else{
                            myFamilyService.FAMILY_DATA = "";
                        }
                    }
                );
            }else{
                myFamilyService.FAMILY_DATA = "";
            }
        };
        $scope.getUserInfo();
    })
    .build();