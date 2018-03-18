/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016年6月24日14:17:30
 * 创建原因：2.2.40版住院费用（就医记录入口）控制
 * 任务号：KYEEAPPC-6607
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.inpatientGeneral.controller")
    .require(["kyee.quyiyuan.myWallet.inpatientDetailRecord.controller",
        "kyee.quyiyuan.myWallet.inpatientGeneral.service",
        "kyee.quyiyuan.myWallet.inpatientGeneralQuery.controller",
        "ngSanitize"])
    .type("controller")
    .name("InpatientGeneralController")
    .params(["$scope","$state","HospitalSelectorService","InpatientGeneralService","KyeeListenerRegister",
    "KyeeMessageService","$ionicHistory","KyeeUtilsService","KyeeI18nService","PerpaidRecordService",
        "InpatientPaymentService","AuthenticationService","KyeeViewService","CacheServiceBus","$ionicScrollDelegate",
        "CommPatientDetailService","$timeout","$compile","InpatientPaidService","InpatientPaymentDetailService"])
    .action(function ($scope,$state,HospitalSelectorService,InpatientGeneralService,KyeeListenerRegister,
                      KyeeMessageService,$ionicHistory,KyeeUtilsService,KyeeI18nService,PerpaidRecordService,
                      InpatientPaymentService,AuthenticationService,KyeeViewService,CacheServiceBus,$ionicScrollDelegate,
                      CommPatientDetailService,$timeout,$compile,InpatientPaidService,InpatientPaymentDetailService) {

        $scope.isEmpty = true;
        $scope.emptyText = undefined;//KYEEAPPTEST-3190 程铄闵


        //初始化点击事件
        var initClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("inpatient_general_id"));
                    element.html($scope.emptyText);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };

        //初始化住院数据
        var initData = function(success,data){
           if(success){
               $scope.isEmpty = false;
               var msg = data.message;
               if(msg){
                   msg = JSON.parse(msg);
                   $scope.buttonText = msg.CHANGE_QUERY_TYPE;
                   $scope.bottomTip = msg.NO_MSG;
               }
               else{
                   $scope.buttonText = undefined;
                   $scope.bottomTip = undefined;
               }
               $scope.allData = data.data.rows;
           }
           else{
               initClick();
               $scope.buttonText = undefined;
               $scope.bottomTip = undefined;
               $scope.isEmpty = true;
               $scope.emptyText = data.message;
           }
            $ionicScrollDelegate.$getByHandle("inpatient_general").resize();
            $scope.$broadcast('scroll.refreshComplete');
        };

        //刷新
        $scope.doRefresh = function(hiddenLoading){
            //初始化数据
            InpatientGeneralService.loadData(function(success,data){
                initData(success,data);
            },hiddenLoading);
        };

        KyeeListenerRegister.regist({
            focus: "inpatient_general",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                //删除后返回
                if(InpatientGeneralService.afterDelete){
                    InpatientGeneralService.afterDelete = false;
                    InpatientGeneralService.fromDetail = false;
                    $scope.doRefresh(false);
                }
                //从下一步到此页面
                else if(InpatientGeneralService.nextStepFlag){
                    InpatientGeneralService.nextStepFlag = false;
                    var rec = InpatientGeneralService.generalData;
                    initData(rec.success,rec);
                }
                //明细返回不刷新
                else if(InpatientGeneralService.fromDetail){
                    InpatientGeneralService.fromDetail = false;
                }
                else{
                    $scope.doRefresh(false);
                }
            }
        });

        //切换医院
        $scope.changeHospital = function(){
            InpatientGeneralService.setHospitalValue();
            $state.go('patient_card_hospital');
        };

        //查看更多
        $scope.changeMore = function(){
            InpatientGeneralService.setHospitalValue();
            $state.go('patient_card_hospital');
        };

        //查看每日清单明细
        $scope.goDetailRecord = function(item){
            InpatientPaymentDetailService.detailItem = item;
            InpatientGeneralService.fromDetail = true;
            $state.go('inpatient_payment_detail');
        };

        //已结算详情
        $scope.showDetail = function(v){
            InpatientPaidService.paidDetail = v;
            InpatientGeneralService.fromDetail = true;
            $state.go('inpatient_paid_detail');
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //日期格式转换
        $scope.convertDate = function(v){
            if(v){
                return KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
            }
        };

        //返回按钮
        $scope.back = function(){
            InpatientGeneralService.changeHospitalId = undefined;//清除医院
            InpatientGeneralService.generalData = undefined;//清除下一步请求的数据
            InpatientGeneralService.nextStepFlag = false;//清除下一步请求标记
            $state.go('myquyi->MAIN_TAB.medicalGuide');
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "inpatient_general",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

    })
    .build();