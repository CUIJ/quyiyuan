/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息--就诊卡管理--选择就诊卡(原查卡界面)
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card_select.controller")
    .require(["kyee.quyiyuan.frequent_info.patient_card_add.controller"])
    .type("controller")
    .name("PatientCardSelectController")
    .params(["$scope", "$state", "CacheServiceBus",
        "$ionicHistory", "KyeeMessageService", "SelectCardDef",
        "PatientCardService", "CommPatientDetailService", "ReportService",
        "CheckService", "AppointConfirmService", "RegistConfirmService",
        "AppointmentDeptGroupService", "KyeeListenerRegister", "UpdateUserService",
        "KyeeI18nService", "patientRechargeService","$ionicScrollDelegate","PatientCardRechargeService"])
    .action(function ($scope, $state, CacheServiceBus,
                      $ionicHistory, KyeeMessageService, SelectCardDef,
                      PatientCardService, CommPatientDetailService, ReportService,
                      CheckService, AppointConfirmService, RegistConfirmService,
                      AppointmentDeptGroupService, KyeeListenerRegister, UpdateUserService,
                      KyeeI18nService, patientRechargeService,$ionicScrollDelegate,PatientCardRechargeService) {

        $scope.tips = false;
        $scope.patientCards = []; //所有就诊卡

        $scope.hospInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);

        // 初始化要选择的就诊者信息
        PatientCardService.selectUserInfoUsed = PatientCardService.selectUserInfo;
        if (!PatientCardService.selectUserInfoUsed) {
            PatientCardService.selectUserInfoUsed = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
        }
        //PatientCardService.selectUserInfo = undefined;


        var initView = function () {

            //获取选定用户就诊卡列表
            PatientCardService.loadPatientCardsForSelect(function (data) {

                if (data.success) {

                    var cards = data.data;

                    if (cards) {
                        for (var i = 0, size = cards.length; i < size; i++) {
                            if (cards[i].IS_DEFAULT == "1") {
                                $scope.curCardNo = cards[i].CARD_NO;
                                break;
                            }
                        }
                    }

                    // 过滤虚拟卡  KYEEAPPC-4732  张家豪
                    if ($scope.filteringVirtualCard && $scope.filteringVirtualCard.isFilteringVirtual) {
                        $scope.patientCards = [];
                        for (var index = 0; index < cards.length; index++) {
                            var cardType = cards[index].CARD_TYPE;
                            var subCardNO = cards[index].CARD_NO.substring(0, 1);
                            if (!(cardType == "0" && subCardNO == "Q")) {//KYEEAPPTEST-3222 程铄闵 跳转到就诊卡充值
                                $scope.patientCards.push(cards[index]);
                            }
                            if(cards[index].CARD_NO&&cards[index].CARD_NO.length>11){
                                cards[index].CARD_NO_SHOW = angular.copy( cards[index].CARD_NO.substring(0,11)+"...");
                            }else{
                                cards[index].CARD_NO_SHOW = angular.copy( cards[index].CARD_NO);
                            }
                        }
                    } else {
						//卡号过长，省略字符用“...”显示
                        for(var i = 0; i < cards.length;i++){
                            if(cards[i].CARD_NO&&cards[i].CARD_NO.length>11){
                                cards[i].CARD_NO_SHOW = angular.copy( cards[i].CARD_NO.substring(0,11)+"...");
                            }else{
                                cards[i].CARD_NO_SHOW = angular.copy( cards[i].CARD_NO);
                            }
                        }
                        $scope.patientCards = cards;
                    }

                }else {
                    // 若用户就诊卡数目为0，请勿出现“暂未查到卡信息，请稍后重试”  By  张家豪  KYEEAPPC-3837
                    if (data.message != "") {
                        KyeeMessageService.broadcast({content: data.message});
                    }
                }
            });
        };

        //根据选择判断ridio显示样式
        $scope.isSelected = function (cardNo) {
            return $scope.curCardNo == cardNo;
        };
        /**
         * 选择就诊卡
         * @param cardInfo
         */
        $scope.selectCard = function (cardInfo) {

            // 先弹出免责询问
            KyeeMessageService.confirm({
                content: KyeeI18nService.get("patient_card_select.youNeed", "您要选择的就诊卡卡号为：")
                + cardInfo.CARD_NO +
                KyeeI18nService.get("patient_card_select.sureThisCard", "，请确保此卡是有效可用的，继续吗？"),
                onSelect: function (res) {
                    if (res) {
                        selectPatientCard(cardInfo);
                    }
                }
            });

        };


        /**
         * 选择就诊卡逻辑处理
         */
        var selectPatientCard = function (cardInfo) {
            PatientCardService.updateUserDefaultCard(cardInfo.CARD_NO, function (data) {

                //是否由拦截器返回   By  张家豪  KYEEAPPC-4304
                var isFromFiler = SelectCardDef.isFromFiler;
                if (!isFromFiler) {
                    //选择就诊卡如果存在特殊定制则特殊跳转
                    if ($scope.filteringVirtualCard && $scope.filteringVirtualCard.routingAddress) {
                        $state.go($scope.filteringVirtualCard.routingAddress);
                    } else {
                        // 执行回调
                        doCalBack();
                        $ionicHistory.goBack();
                    }
                } else {
                    SelectCardDef.doFinashIfNeed({
                        onBefore: function () {
                            $ionicHistory.currentView($ionicHistory.backView());
                            SelectCardDef.isFromFiler = false;
                        }
                    });
                }
            });
        };

        var clickTips = false;

        $scope.showTips = function () {
            clickTips = true;
            $scope.tips = !$scope.tips;
            $ionicScrollDelegate.$getByHandle("mainScroll").resize();
            $ionicScrollDelegate.scrollBottom();
        };

        $scope.addPatientCard = function () {
            if (clickTips) {
                clickTips = false;
            } else {
                $state.go("patient_card_add");
            }
        };

        //销毁当前窗口
        var doCalBack = function () {

            var backViewName = $ionicHistory.backView().stateName;

            if (backViewName == "update_user") {  //跳转个人信息页面
                UpdateUserService.updateView();
            } else if (backViewName == "comm_patient_detail") {  //跳转就诊者信息页面
                CommPatientDetailService.updateView();
            } else if (backViewName == "report") {  //跳转我的报告单（检查）信息页面

                if (PatientCardService.fromPage == "check") {
                    CheckService.backRefreshData();
                } else if (PatientCardService.fromPage == "inpection") {
                    ReportService.backRefreshData();
                }

            } else if (backViewName == "appoint_confirm") {  //跳转预约确认单页面
                AppointConfirmService.queryClientinfo({
                    IS_ONLINE: AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE
                });
            } else if (backViewName == "regist_confirm") {  //跳转挂号确认单页面
                RegistConfirmService.queryClientinfo({
                    IS_ONLINE: AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE
                });
            }

        };

        KyeeListenerRegister.regist({
            focus: "patient_card_select",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,//离开页面时触发
            action: function (params) {
                SelectCardDef.isFromFiler = false;
                if(params.to != "patient_card_add"){
                    $scope.filteringVirtualCard = {};
                    PatientCardService.filteringVirtualCard = {};
                }
            }
        });

        KyeeListenerRegister.regist({
            focus: "patient_card_select",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,//进入页面时触发
            direction: "both",
            action: function (params) {
                if(PatientCardService.filteringVirtualCard){
                    $scope.filteringVirtualCard = PatientCardService.filteringVirtualCard;
                }else{
                    $scope.filteringVirtualCard = {};
                }
                initView();
            }
        });

        //监听物理返回键 程铄闵 删除代码 KYEEAPPTEST-3469
/*        KyeeListenerRegister.regist({
            focus: "patient_card_select",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });*/
    })
    .build();
