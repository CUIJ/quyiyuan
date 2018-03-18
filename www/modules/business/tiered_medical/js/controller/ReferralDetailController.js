new KyeeModule()
    .group("kyee.quyiyuan.referral_detail.controller")
    .require([
        "kyee.quyiyuan.referral_detail.service",
        "kyee.quyiyuan.navigationOut.service",
        "kyee.quyiyuan.hospitalNavigation.service"
    ])
    .type("controller")
    .name("ReferralDetailController")
    .params(["$scope", "$state","CacheServiceBus","$ionicHistory","KyeeListenerRegister",
        "OutNavigationService","HospitalNavigationService","KyeePhoneService",
        "ReferralDetailService"])
    .action(function ($scope, $state,CacheServiceBus,$ionicHistory,KyeeListenerRegister,
        OutNavigationService,HospitalNavigationService,KyeePhoneService,
        ReferralDetailService) {

        //监听
        KyeeListenerRegister.regist({
            focus: "referral_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction: "both",
            action: function (params) {
                //getFormattedData($scope.referralData.data);
            }
        });
        //对象声明
        $scope.referralData = {
            formattedData:getFormattedData(ReferralDetailService.referralData)
        };
        //对外函数
        $scope.getStateClass = getStateClass;
        $scope.getDespClass = getDespClass;
        $scope.goToHospitalLocat = goToHospitalLocat;
        $scope.goToDeptLocat = goToDeptLocat;
        $scope.goTel = goTel;
        $scope.getPadding = getPadding;

        //私有函数
        function getPadding(){
            return $scope.referralData.formattedData.referralPlanProcess.length == 2?"mar-lr-60":"mar-lr-14";
        }
        function getStateClass(index,array,state){
            var numIndex = ["one","two","three","four","five","six"];

            var currentState = state;

            var state = array[index];

            if(state.operateStatus == '0'){

                return " qy-grey4 icon-flow-"+numIndex[index];

            }else{
                if(state.operateOrder < currentState){

                    return " qy-green icon-radiobox_1";

                }else if(state.operateOrder == currentState){
                    if(currentState == array.length){
                        return (state.operateResult == "agree"? "qy-green qy-green icon-radiobox_1":"state-red"
                            + " icon-current-flow-" + numIndex[index]);
                    }
                    return (state.operateResult == "agree"? "qy-green":"state-red")
                        + " icon-current-flow-" + numIndex[index];

                }
            }
        }
        function getDespClass(index){
            var currentState = $scope.referralData.formattedData.currentState;
            var state = $scope.referralData.formattedData.referralPlanProcess[index];
            var interfaceState = index + 1;
            if(currentState > interfaceState){
                return "qy-green";
            }else if(currentState < interfaceState){
                return "qy-grey4";
            }else{
                return state.operateResult == "agree"? "qy-green":"state-red";
            }
        }
        //跳转到医院外导航
        function goToHospitalLocat() {
            OutNavigationService.hospitalId = $scope.referralData.formattedData.inHospitalId;
            OutNavigationService.openNavigationOut();
        }
        //跳转到科室导航（院内导航）
        function goToDeptLocat() {
            //HospitalNavigationService.ROUTE_STATE = "appointment_regist_detil";
            //HospitalNavigationService.lastClassName = "appointment_regist_detil";
            HospitalNavigationService.fixedPositionInfro = {
                HOSPITAL_ID: $scope.referralData.formattedData.inHospitalId,
                DEPT_NAME: $scope.referralData.formattedData.inDeptName
            };
            $state.go("hospital_navigation");
        }
        function goTel(tel){
            KyeePhoneService.callOnly(tel);
        }
        function getFormattedData(data){
            var circleFlag = true;
            var formattedData = angular.copy(data);
            formattedData.currentState = formattedData.referralPlanProcess.length;
            angular.forEach(formattedData.referralPlanProcess,function(item,index,array){
                if(item.operateStatus == '0' && circleFlag){
                    formattedData.currentState = index;
                    circleFlag = false;
                }
            });
            angular.forEach(formattedData.referralPlanProcess,function(item,index,array){
                dynamicAddDom(item,index,array,formattedData.currentState);
            });
            return formattedData;
        }
        function dynamicAddDom(item,index,array,currentState){
            var iconStyle = getStateClass(index,array,currentState);
            var barStyle = currentState < (index + 2)?"qy-bg-grey4":"qy-bg-green";
            var template1 = '<i class="icon ' + iconStyle + '"></i>';
            var template2 = '<span class="'+barStyle+'"></span>';
            var dom1 = angular.element(template1);
            var dom2 = angular.element(template1+template2);
            if(index == array.length-1){
                angular.element(document.getElementById("progress-bar-state")).append(dom1);
            }else{
                angular.element(document.getElementById("progress-bar-state")).append(dom2);
            }


        }

    })
    .build();