/*
 * 产品名称：quyiyuan
 * 创建人: 程铄闵
 * 创建日期:2016年6月26日20:19:40
 * 创建原因：就医记录底部记录到每日清单页面
 * 任务号：KYEEAPPC-6607
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.myquyiInpatientPayment.controller")
    .require(["kyee.quyiyuan.myWallet.inpatientPaymentDetail.controller",
        "kyee.quyiyuan.myWallet.inpatientPayment.service",
        "kyee.quyiyuan.myWallet.inpatientPaidRecord.controller",
        "kyee.quyiyuan.myWallet.inpatientPaid.service",
        "ngSanitize",
        "kyee.quyiyuan.myWallet.inpatientPaymentQueryController.controller",//程铄闵 删除冗余代码 KYEEAPPC-5641
        "kyee.quyiyuan.myWallet.inpatientPaymentDetail.service"

    ])
    .type("controller")
    .name("MyquyiInpatientPaymentController")
    .params(["$scope","$state","InpatientPaymentService","$ionicHistory","KyeeListenerRegister",
        "KyeeUtilsService","CacheServiceBus","InpatientPaidService","KyeeMessageService","KyeeI18nService",
        "HospitalSelectorService","$compile","$timeout","KyeeViewService","AuthenticationService",
        "$ionicScrollDelegate","InpatientPaymentDetailService"])
    .action(function ($scope,$state,InpatientPaymentService,$ionicHistory,KyeeListenerRegister,
                      KyeeUtilsService,CacheServiceBus,InpatientPaidService,KyeeMessageService,KyeeI18nService,
                      HospitalSelectorService,$compile,$timeout,KyeeViewService,AuthenticationService,
                      $ionicScrollDelegate,InpatientPaymentDetailService) {

        $scope.isEmpty = true;
        $scope.IS_SHOW_BALANCE = true;//住院每日清单是否屏蔽当前账户余额 （默认显示）
        //外部通知跳转进来，显示返回键
        if(InpatientPaymentService.isOutPush){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };
        //有数据时初始化赋值
        var initData = function(success,data,IS_SHOW_BALANCE){
            $scope.isEmpty = true;
            $scope.emptyText = undefined;
            if(success){
                $scope.isEmpty = false;
                $scope.inPaymentData = data;
                //住院每日清单是否屏蔽当前账户余额

                if(IS_SHOW_BALANCE && IS_SHOW_BALANCE == 1){
                    $scope.IS_SHOW_BALANCE = true;
                }else{
                    $scope.IS_SHOW_BALANCE = false;
                }
            }
            else{
                $scope.isEmpty = true;
                $scope.emptyText = data;
            }
        };

        //edit by wangsannv 处理从外部推送和微信推送跳转过来的请求
        if(InpatientPaymentService.isOutPush){
            InpatientPaymentService.messageCenterParams=InpatientPaymentService.inPatientData;
        }else if(InpatientPaymentService.isFromWeiXin){
            InpatientPaymentService.loadData(InpatientPaymentService.messageId,function(result){
                InpatientPaymentService.isFromWeiXin=false;
                InpatientPaymentService.messageCenterParams=JSON.parse(result.URL_DATA);
                InpatientPaymentService.loadMyquyiPayData(function(success,data,IS_SHOW_BALANCE){
                    initData(success,data,IS_SHOW_BALANCE);
                });
            });
        }
        InpatientPaymentService.loadMyquyiPayData(function(success,data,IS_SHOW_BALANCE){
                initData(success,data,IS_SHOW_BALANCE);
        });

        //查看每条费用详情
        $scope.goDetailRecord = function(item){
            InpatientPaymentDetailService.detailItem = item;
            $state.go('inpatient_payment_detail');
        };

        //日期格式转换
        $scope.convertDate = function(v){
            if(v){
                return KyeeUtilsService.DateUtils.formatFromDate(v,'YYYY/MM/DD');
            }
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "myquyi_inpatient_payment",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();        //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        $scope.goBack = function(){
            if(InpatientPaymentService.isOutPush){
                InpatientPaymentService.isOutPush = undefined;
                $state.go("home->MAIN_TAB");
            }else{
                $ionicHistory.goBack();
            }
        };
    })
    .build();