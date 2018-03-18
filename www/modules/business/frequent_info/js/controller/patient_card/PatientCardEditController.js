/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息--就诊卡管理--编辑就诊卡
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card_edit.controller")
    .require(["kyee.quyiyuan.frequent_info.patient_card_city.controller",
              "kyee.quyiyuan.frequent_info.patient_card_hospital.controller",
              "kyee.quyiyuan.frequent_info.patient_card_type.controller"])
    .type("controller")
    .name("PatientCardEditController")
    .params(["$scope", "KyeeListenerRegister", "CacheServiceBus", "$ionicHistory","PatientCardService","KyeeMessageService"])
    .action(function ($scope, KyeeListenerRegister, CacheServiceBus, $ionicHistory, PatientCardService,KyeeMessageService) {

        $scope.card = PatientCardService.editCard;

        $scope.newCard = {CARD_NO:$scope.card.CARD_NO};

        PatientCardService.editCard = undefined;

        if($scope.card.CARD_STATUS == '3' &&　$scope.card.CARD_TYPE != '-100'){
            KyeeMessageService.broadcast({content: "请修改您的就诊卡号"});
        }

        //卡有效时只能删除,不能编辑卡号
        //卡验证失败时只能删除,不能编辑卡号
        $scope.isReadonly = function(){
            if($scope.card.CARD_STATUS==1 || $scope.card.CARD_STATUS==3){
                return true;
            }

            return false;
        };

        //提交
        $scope.updateCard = function(){

            PatientCardService.updateCard($scope.card, $scope.newCard.CARD_NO, function(data){
                if(data.success){
                    PatientCardService.showMessage(data.message);
                    $ionicHistory.goBack(-1);
                }
                else{
                    PatientCardService.showMessage(data.message);
                }
                $ionicHistory.goBack(-1);
            });
        };

        //提交
        $scope.deleteCard = function(){

            KyeeMessageService.confirm({
                title: '温馨提示',
                content: '删除之后，将无法再次通过手机端查到此就诊卡，请确认是否删除？',
                onSelect: function (ok) {
                    if (ok) {
                        PatientCardService.deleteCard($scope.card.SYS_PATIENT_ID, "false", function(data){
                            if(data.success){
                                PatientCardService.showMessage(data.message);
                            }
                            else{
                                PatientCardService.showMessage(data.message);
                            }

                            $ionicHistory.goBack(-1);
                        });
                    }
                }
            });
        };

    })
    .build();
