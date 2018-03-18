/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息--就诊卡管理--添加就诊卡--卡片类型选择
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card_type.controller")
    .require(["kyee.quyiyuan.frequent_info.patient_card.service",
        "ionic"])
    .type("controller")
    .name("PatientCardTypeController")
    .params(["$scope", "$state", "HttpServiceBus", "CacheServiceBus", "$ionicScrollDelegate", "$ionicHistory", "PatientCardService"])
    .action(function($scope, $state, HttpServiceBus, CacheServiceBus, $ionicScrollDelegate, $ionicHistory, PatientCardService){
        $scope.hospitalDataLoaded = false;
        $scope.noType = undefined;
        $scope.curType = PatientCardService.getCard().TYPE;
        //获取医院支持的卡类型
        PatientCardService.loadTypeList(PatientCardService.getHospital().ID, function(data){

            $scope.types = data;
            if(data.length == 0){
                $scope.noType = true;
            }
            else{
                $scope.noType = false;
            }
        });

        //选了类型
        $scope.typeSelected = function(type, name, url){
            $scope.curType == type;

            var card = PatientCardService.setCardType(type, name, url);
            PatientCardService.scopeAdd.card = card;

            $state.go("patient_card_add");
        };

        $scope.isSelected = function(type){
            if($scope.curType == type){
                return 'ion-android-radio-button-on';
            }else{
                return 'ion-android-radio-button-off';
            }
        };


    })
    .build();