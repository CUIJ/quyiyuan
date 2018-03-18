new KyeeModule()
    .group("kyee.quyiyuan.hospital.hospital_detail.controller")
    .require(["kyee.framework.filter.common"
        , "kyee.quyiyuan.hospital.hospitalWeb.controller"])
    .type("controller")
    .name("HospitalDetailController")
    .params(["$state", "$scope", "$rootScope", "CacheServiceBus", "HospitalDetailService", "HospitalService", "KyeeListenerRegister", "KyeeUtilsService"])
    .action(function ($state, $scope, $rootScope, CacheServiceBus, HospitalDetailService, HospitalService, KyeeListenerRegister, KyeeUtilsService) {

        KyeeListenerRegister.regist({
            focus: "hospital_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            action: function (params) {

                var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                var advId = HospitalService.clickedAdvId;

                if (advId != null && advId != "") {

                    HospitalDetailService.loadHospitalDetail("", advId, function (data) {
                        $scope.hospitalDetailData = data;
                        //电话号码可点击后直接拨号功能实现
                        $scope.hospitalDetailData.ADV_HOSPITAL_INTRO=$scope.hospitalDetailData.ADV_HOSPITAL_INTRO.replace(/—/g,"-");
                        $scope.hospitalDetailData.ADV_HOSPITAL_INTRO=$scope.hospitalDetailData.ADV_HOSPITAL_INTRO.replace(/－/g,"-");
                        var telNums=$scope.hospitalDetailData.ADV_HOSPITAL_INTRO.match(/((((13[0-9])|(15[^4])|(18[0,1,2,3,5-9])|(17[0-8])|(147))\d{8})|((\d3,4|\d{3,4}\s*-\s*|\s)?\d{7,14}))?/g);
                        for(var i = 0 ;i<telNums.length;i++)
                        {
                            if(telNums[i] == "" || typeof(telNums[i]) == "undefined")
                            {
                                telNums.splice(i,1);
                                i= i-1;
                            }
                        }
                        var telIconHtml="<i class=\"icon-telephone \" style=\"margin-right: 5px;\"></i>";
                        for(var i = 0 ;i<telNums.length;i++){
                            if(telNums[i].length<12||telNums[i].indexOf("-")>0){  //确保是座机或者手机号
                                var ifTelHave=false;  //判断这个电话号码之前是否渲染过，如果渲染过，则该号码可能为邮箱号，则不需要渲染
                                for(var j=i-1;j>=0;j--){
                                    if(telNums[j].indexOf(telNums[i])>=0){
                                        ifTelHave=true;
                                        break;
                                    }
                                }
                                if(!ifTelHave){
                                    $scope.hospitalDetailData.ADV_HOSPITAL_INTRO=$scope.hospitalDetailData.ADV_HOSPITAL_INTRO.replace(telNums[i],telIconHtml+"<a class=\"qy-blue\" href=\"tel:"+telNums[i].replace("-","")+"\">"+telNums[i]+"</a>");
                                }
                            }
                        }


                        //begin by gyl 体验医院或广告链接地址为默认链接，则不显示 KYEEAPPC-4358
                        $scope.ADV_LOCAL = undefined;
                        if (1001 != hospitalId && 'http://www.quyiyuan.com/' != data.ADV_LOCAL&&((data.ADV_LOCAL.indexOf('https'))>-1)) {
                            $scope.ADV_LOCAL = data.ADV_LOCAL;
                        }
                        //end by gyl KYEEAPPC-4358
                         HospitalService.hospitalWebUrl = data.ADV_LOCAL;
                    });
                }
            }
        });

        //跳转到网页
        $scope.goBrowser = function () {
            //APPCOMMERCIALBUG-2438 判断若是网页访问，则挑转至对应web界面 add by wyn 20160517
            if(window.device && window.device.platform){
                window.open($scope.ADV_LOCAL, '_blank', 'location=yes');
            } else {
                $state.go("hospital_web");
            }
        }
    })
    .build();