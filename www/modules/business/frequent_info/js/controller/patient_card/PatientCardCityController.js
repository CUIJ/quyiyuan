/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息--就诊卡管理--地区选择
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card_city.controller")
    .require(["kyee.quyiyuan.frequent_info.patient_card.service",
              "ionic"])
    .type("controller")
    .name("PatientCardCityController")
    .params(["$timeout","$scope", "$state", "KyeeListenerRegister", "HttpServiceBus", "CacheServiceBus", "$ionicScrollDelegate", "$ionicHistory", "PatientCardService", "$ionicScrollDelegate"])
    .action(function($timeout,$scope, $state, KyeeListenerRegister, HttpServiceBus, CacheServiceBus, $ionicScrollDelegate, $ionicHistory, PatientCardService, $ionicScrollDelegate){

        $scope.focusPos = 0;

        //获取城市列表
        $scope.loadCityList = function(provinceId, provinceCode){

            //城市列表自动滚动到顶部
            $ionicScrollDelegate.$getByHandle('cityListScrollContainer').scrollTop();

            PatientCardService.loadCityList(provinceId, provinceCode, function(data){
                //处理就诊卡管理虚拟医院显示问题 KYEEAPPC-9248 yangmingsi
                if(data){
                    for(var i = 0 ;i< data.length;i++){
                        if(data[i].CITY_CODE == 222222 ){
                            data.splice(i,1);
                            i=i-1;
                        }
                    }
                    $scope.citys = data;
                }
            });
        };

        //获取所有省份
        PatientCardService.loadProvinceList(function(data){
            //处理就诊卡管理虚拟医院显示问题 KYEEAPPC-9248 yangmingsi
            if(data){
                for(var i = 0 ;i< data.length;i++){
                    if(data[i].PROVINCE_CODE == 111111 ){
                        data.splice(i,1);
                        i=i-1;
                    }
                }
                $scope.provinces = data;
            }
            var idx = 0;
            var prov = data[0]; //页面默认第一个
            var provName = PatientCardService.getArea().PROVINCE_NAME;

            if(provName != ""){

                //地区已选,页面默认所选
                for(idx = 0; idx < data.length; idx++){

                    if(data[idx].PROVINCE_NAME == provName){

                        prov = data[idx];
                        break;
                    }
                }
            }

            $scope.focusPos = idx;

            $timeout(function () {
                $ionicScrollDelegate.$getByHandle('multipleProvinceList').scrollTo(0, 40 * idx, true);
            }, 200);

            $timeout(function () {
                $ionicScrollDelegate.$getByHandle('cityListScrollContainer').scrollTop();
            }, 200);

            $scope.loadCityList(prov.PROVINCE_ID, prov.PROVINCE_CODE);
        });

        //选择省
        $scope.provinceSelected = function(focusPos, provinceId, provinceCode){
            $scope.focusPos = focusPos;

            $scope.loadCityList(provinceId, provinceCode);

            $ionicScrollDelegate.$getByHandle('cityList').scrollTop();
        };

        //选择市
        $scope.citySelected = function(city){

            //从门诊到医院选择再选择城市操作   KYEEAPPTEST-3636 程铄闵
            if(PatientCardService.fromOtherRoute){
                PatientCardService.scopeAdd = {};
                PatientCardService.scopeAdd.area = {};
                PatientCardService.scopeAdd.area.PROVINCE_CODE = city.PROVINCE_CODE;
                PatientCardService.scopeAdd.area.PROVINCE_NAME = city.PROVINCE_NAME;
                PatientCardService.scopeAdd.area.CITY_CODE = city.CITY_CODE;
                PatientCardService.scopeAdd.area.CITY_NAME = city.CITY_NAME;
            }
            else{
                if(PatientCardService.setCity(city.CITY_CODE, city.CITY_NAME, city.PROVINCE_NAME, city.PROVINCE_CODE)){

                    //如果选择的城市改变了,医院和卡类型都要重置
                    PatientCardService.setHospital("", "");

                    PatientCardService.setCardType("", "");
                }
            }

            $ionicHistory.goBack(-1);
        };

        KyeeListenerRegister.regist({
            focus: "patient_card_city",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction: "forward",
            action: function (params) {

                $ionicScrollDelegate.$getByHandle('provinceList').scrollTo(0, 40 * $scope.focusPos, false);
            }
        });

    })
    .build();