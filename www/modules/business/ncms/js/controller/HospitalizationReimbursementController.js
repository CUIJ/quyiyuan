/**
 * Created by zxy on 15-5-27.
 */
new KyeeModule()
    .group("kyee.quyiyuan.ncms.controller.hospitalization_reimbursement")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.ncms.hospitalizationreimbursement.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.ncms.familymembers.service"])
    .type("controller")
    .name("HospitalizationReimbursementController")
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
        "HospitalizationReimbursementService",
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
        HospitalizationReimbursementService,
        $ionicScrollDelegate,
        myFamilyService,
        KyeeI18nService){
        //初始化一些字段
        $scope.userInfo = {
            text : KyeeI18nService.get("ncms.sorry","对不起，你绑定的身份证无效，不能使用该功能!")
        };

        if(myFamilyService.FAMILY_YEAR!=undefined && myFamilyService.FAMILY_YEAR!=null && myFamilyService.FAMILY_YEAR!=""){
            $scope.year = myFamilyService.FAMILY_YEAR.substring(0, 4);
        }else{
            $scope.year = "";
        }

        $scope.isNot = false;
        $scope.noShow = false;

        $scope.HOSPITALIZED_DATE = "";

        $scope.all = myFamilyService.FAMILY_DATA;

        if($scope.all!=undefined && $scope.all.length>0){
            $scope.patientName = $scope.names = $scope.all[0].NAME;
            $scope.ID_NO = myFamilyService.FAMILY_DATA[0].ID_NO;
            $scope.isNot = false;
            $scope.noShow = true;
        }else{
            $scope.isNot = true;
            $scope.noShow = false;
        }
        //绑定选择事件
        $scope.bind = function(params){
            $scope.showPicker = params.show;
        };
        //选择年月日
        $scope.selectItem = function(params){
            var type = params.item.type;
            switch(type){
                case 0:
                    $scope.year = params.item.value;
                    break;
                case 1:
                    $scope.month = params.item.value;
                    break;
                case 2:
                    $scope.day = params.item.value;
                    break;
            }
        };
        //初始化年月日
        $scope.month = "--";
        $scope.day = "--";
        $scope.currentYear = $scope.year;
        //选择日期 0：年，1：月；2：日
        $scope.selectDate = function(type){
            switch(type){
                case 0:
                    $scope.pickerItems = $scope.creatPickerItems(2010, $scope.currentYear, type);
                    $scope.title=KyeeI18nService.get("ncms.selectYear","请选年份");
                    $scope.showPicker();
                    break;
                case 1:
                    $scope.pickerItems = $scope.creatPickerItems(1, 12, type);
                    $scope.title=KyeeI18nService.get("ncms.selectMonth","请选月份");
                    $scope.showPicker();
                    break;
                case 2:
                    if($scope.month !== '--'){
                        var date = new Date($scope.year, $scope.month, 0);
                        var days = date.getDate();
                        $scope.pickerItems = $scope.creatPickerItems(1, days, type);
                        $scope.title=KyeeI18nService.get("ncms.selectDate","请选日期");
                        //调用显示
                        $scope.showPicker();
                    }
                    break;
            }
        };

        $scope.creatPickerItems = function(start, end ,type){
            var items = [];
            for(var i = start; i <= end; i++){
                var item = {};
                var key = i < 10 ? '0' + i : i;
                var text = '';
                item['value'] = key;
                switch(type){
                    case 0 :
                        text = i + KyeeI18nService.get("ncms.year","年");
                        break;
                    case 1 :
                        text = i + KyeeI18nService.get("ncms.month","月");
                        break;
                    case 2 :
                        text = i + KyeeI18nService.get("ncms.date","日");
                        break;
                }
                item['text'] = text;
                item['type'] = type;
                items.push(item);
            }
            return items;
        };
        $scope.query = function(){
            $scope.getHospitalReimbursement();
        }
        $scope.clickUpload = function() {
            var Buttons = new Array();
            for (var i = 0; i < $scope.all.length; i++) {
                var item = {text : $scope.all[i].NAME};
                Buttons.push(item);
            }
            KyeeMessageService.actionsheet({
//                title : "请选择姓名",
                buttons :Buttons,
                onClick : function(index){
                    if(index != -1){
                    $scope.selectName = $scope.all[index].NAME;
                    $scope.selectIdNo = $scope.all[index].ID_NO;
                    $scope.patientName = $scope.all[index].NAME;
                    }
                },
                cancelButton : true
            });
        };
        //查询请求
        $scope.getHospitalReimbursement = function(){
            //检查日期
            if($scope.month != '--' && $scope.day == '--'){
                var msgJson = {
                    title: KyeeI18nService.get("ncms.duang","提示"),
                    content: KyeeI18nService.get("ncms.pleassDoDate","请完善就诊日期!"),
                    okText: KyeeI18nService.get("ncms.ok","知道了")
                };
                KyeeMessageService.message(msgJson);
                return;
            }

            if(myFamilyService.FAMILY_FALSE_FLAG != true){
            if(myFamilyService.FAMILY_CODE){
                $scope.FAMILY_CODE = myFamilyService.FAMILY_CODE;
                $scope.all = myFamilyService.FAMILY_DATA;
                $scope.ID_NO = $scope.selectIdNo;
                if($scope.month != "--" && $scope.month !=undefined && $scope.month!=null && $scope.month !="" &&
                    $scope.day != "--" && $scope.day !=undefined && $scope.day!=null && $scope.day !="" ){
                    $scope.HOSPITALIZED_DATE = $scope.year+"-"+$scope.month+"-"+$scope.day;
                }
                HospitalizationReimbursementService.getHospitalReimbursement(
                    $scope.FAMILY_CODE,
                    $scope.year,
                    $scope.ID_NO,
                    $scope.HOSPITALIZED_DATE,
                    function(data){
                        if(data.success){
                            $scope.userInfo = data.data.rows;
                            if($scope.all!=undefined && $scope.all.length>0){
                                $scope.patientName = $scope.names = $scope.all[0].NAME;
                            }else{
                                $scope.township = KyeeI18nService.get("ncms.all","全部");
                            }
                            if(!data.data.rows.length>0){
                                KyeeMessageService.message({
                                    title : KyeeI18nService.get("ncms.duang","提示"),
                                    content : KyeeI18nService.get("ncms.dontCheckYou","没有查到您的住院报销信息！"),
                                    okText : KyeeI18nService.get("ncms.ok","知道了")
                                });
                            }
                        }else{
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

        //初始化
        $scope.query();
    })
    .build();