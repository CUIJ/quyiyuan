/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息--就诊卡管理
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.patient_card.controller")
    .require(["kyee.quyiyuan.frequent_info.patient_card_add.controller",
        "kyee.quyiyuan.frequent_info.patient_card_edit.controller",
        "kyee.quyiyuan.frequent_info.patient_card_select.controller",
        "kyee.quyiyuan.frequent_info.patient_card.service"])
    .type("controller")
    .name("PatientCardController")
    .params([
        "$scope",
        "$state",
        "$ionicHistory",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "PatientCardService",
        "KyeeI18nService",
        "KyeeMessageService",
        "$ionicScrollDelegate"])
    .action(function ($scope,
                      $state,
                      $ionicHistory,
                      KyeeListenerRegister,
                      CacheServiceBus,
                      PatientCardService,
                      KyeeI18nService,
                      KyeeMessageService,
                      $ionicScrollDelegate) {

        $scope.tips = false;
        $scope.tipIsShow = false;
        $scope.cards = [];

        $scope.noCard = undefined;

        $scope.addCardDescription = KyeeI18nService.get("patient_card.preTips","就诊卡是医院存储您就诊卡资料的磁性卡，是您与医院挂号，付款等交互的唯一实体凭据（某些地区可由医保卡代替），由于医疗的特殊和保密性需要，")
        +KyeeI18nService.get("patient_card.afterTips","每家医院的就诊卡不通用。为保证您的挂号等操作的顺利进行，请正确填选您正在使用的就诊卡。没有就诊卡的患者，请到您就诊的医院凭个人身份证办理就诊卡。");

        var cache = CacheServiceBus.getMemoryCache();
        //默认卡片url
        var defaultCardUrl = "resource/images/center/default_card.png";
        $scope.showInfo = {
            CARD_URL : defaultCardUrl
        };
        KyeeListenerRegister.regist({
            focus: "patient_card",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params){

                $scope.cards = [];
                $scope.noCard = undefined;
                if(params&&params.from=="center->MAIN_TAB"){
                    PatientCardService.isFromAddCard="0";
                }else{
                    PatientCardService.isFromAddCard="1";
                }
                // 获要查询就诊卡的uservsid
                if (PatientCardService.fromSource == "patientCardSelect") {
                    var userVsId = PatientCardService.selectUserInfoUsed.USER_VS_ID;

                } else {

                    if (PatientCardService.selectUserInfoUsed) {
                        //如果selectUserInfoUsed有值，将其置为当前就诊者的值，因为在就诊者页面进入时必须重置此值，而在编辑就诊者时，用的是此值发请求
                        if (PatientCardService.selectUserInfoUsed.USER_VS_ID) {
                            PatientCardService.selectUserInfoUsed.USER_VS_ID = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                        }
                    }
                    //因为是从常用信息进入的此页面，所以用的是当前就诊者的值
                    var userVsId = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                }

                //获取当前患者全部就诊卡信息
                loadCloudPatientCard(userVsId);
            }
        });

        //跳转到编辑就诊卡页面
        $scope.editCard = function (card) {
            //1：有效；2：正在处理; 3:验证失败
            if (card.CARD_TYPE == '-100') {
                return;
            }

            PatientCardService.editCard = card;

            $state.go("patient_card_edit");
        };

        //点击“知道了”删除
        $scope.deleteCard = function (card) {
            var flag = "";
            if((card.CARD_STATUS == '2') && (card.CARD_TYPE == '-100')){
                flag = "true";
            }else{
                flag = "false";
            }
            PatientCardService.deleteCard(card.SYS_PATIENT_ID, flag, function (data) {
                if (data.success) {
                    $scope.cards.pop(card);
                    PatientCardService.showMessage(data.message);
                }
                else {
                    PatientCardService.showMessage(data.message);
                }
            });
        };

        $scope.cartShowTips=function(){
                $scope.tipIsShow=  !$scope.tipIsShow;
        };
        //添加就诊卡说明
        /**
         * 任务单：KYEEAPPC-8337
         * 作者：杨旭平
         * 描述：修改添加就诊卡时的消息显示方式，改成弹出框形式
         */
        $scope.showTips = function () {
           /*$ionicScrollDelegate.$getByHandle("mainScrolls").resize()
            $ionicScrollDelegate.scrollBottom();
            return $scope.tips = !$scope.tips;*/
            var tips=$scope.addCardDescription;
            KyeeMessageService.message({
                title: KyeeI18nService.get('commonText.warmTipMsg', '温馨提示', null),
                okText: KyeeI18nService.get("commonText.iknowMsg", "确定"),
                content: KyeeI18nService.get('patient_card_select.addNewCardTalk',tips, null)
            });
        };

        //医院字段的颜色根据卡状态设置  修改人付添 卡逻辑分析 任务号：KYEEAPPC-4648
        $scope.colorStyle = function (cardType, cardStat) {
            //1：有效；2：正在处理; 3:验证失败
            var ret = "qy-grey6";
            var style = "";

            if (cardType == '-100') {   // 不输入卡号模式  只返回卡状态0或2    卡状态 0 ：处理中 2 :失败
                if (cardStat == 0) {
                    //正在处理: 橙色叹号
                    ret = "qy-orange";
                } else if (cardStat == 2) {
                    //验证失败: 红色
                    ret = "qy-red" + " " +"noHaveInputspan";
                }
            } else {
                if (cardStat == 2) {  // 输入卡号模式     返回1 2 3 状态  1：有效
                    //正在处理: 橙色叹号
                    ret = "qy-orange";
                } else if (cardStat == 3) {  //验证失败: 红色
                    ret = "qy-red";
                }
            }
            if(cardType != '-100'){
                style = "";
            }else{
                style = "";
            }
            re = ret+" "+style;
            return re;
        };
        //跳转到编辑就诊卡页面  修改人付添 卡逻辑分析 任务号：KYEEAPPC-4648
        $scope.iconStyle = function (cardType, cardStat) {

            var ret = "";
            if (cardType == '-100' && cardStat == 2) {// 不输入卡号模式 验证失败
                ret = "qy-red";
            }
            return ret;
        };

        // 设置医院名字后面显示的文字
        $scope.getStatText = function (cardType, cardStat) {
            //1：有效；2：正在处理; 3:验证失败
            var ret = "";
            if (cardType != '-100') {
                if (cardStat == 2) {
                    ret = KyeeI18nService.get("patient_card.inCalibration", "验证中");
                } else if (cardStat == 3) {
                    ret = KyeeI18nService.get("patient_card.checkFailure", "验证失败");
                }
            } else {
                if (cardStat == 0) {
                    ret = KyeeI18nService.get("patient_card.Validation","验证中");
                }
            }

            return ret;
        };

        //将身份证号变成星号形式
        $scope.hideCardNum = function (cardNum) {
            if (cardNum == null || cardNum == undefined || cardNum == '') {
                return cardNum;
            }
            else {
                var str = cardNum.toString();

                return str;
            }
        };
        $scope.goToAddCard = function(){
            //从预约挂号确认页面进入  KYEEAPPC-9191  yangmingsi
            if(PatientCardService.fromSource == "fromAppoint"){
                PatientCardService.fromAppoint = true;
                PatientCardService.fromPatientCard = true;
            }
            $state.go("patient_card_add");
        }

        /**
         * 返回事件
         */
        $scope.goBack = function () {
        if(PatientCardService.IsfromIndex_hosp=='1'){
            PatientCardService.IsfromIndex_hosp = undefined; //清空变量
            PatientCardService.filteringVirtualCard = {}; //清空变量
            $ionicHistory.goBack(-2);
        }else if (PatientCardService.fromSource == "patientCardSelect") {
            PatientCardService.fromSource = undefined; //清空变量
            PatientCardService.filteringVirtualCard = {}; //清空变量
            $state.go("home->MAIN_TAB");
            //从预约挂号确认页面进入，返回到预约挂号确认页   KYEEAPPC-9191  yangmingsi
        }else if(PatientCardService.fromSource == "fromAppoint"){
            PatientCardService.fromSource = undefined; //清空变量
            PatientCardService.filteringVirtualCard = {}; //清空变量
            PatientCardService.fromAppoint = true;
            //$state.go("appoint_confirm");
            $ionicHistory.goBack(-2);
        } else{
            $ionicHistory.goBack(-1);
        }
        };
        $scope.onScrollComplete = function(){
            $scope.$broadcast('kyee.slideboxImageBegin');
        }

        $scope.onDragDown = function(){
            $scope.$broadcast('kyee.slideboxImageStop');
        }

        $scope.doRefresh = function () {
            var userVsId = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            PatientCardService.refreshTerminalData(userVsId,function(data){

            })

            loadCloudPatientCard(userVsId);
            $scope.$broadcast('scroll.refreshComplete');
        };

        /**
         * 监听物理返回键
         */
        KyeeListenerRegister.regist({
            focus: "patient_card",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        var loadCloudPatientCard=function(userVsId){
            PatientCardService.loadPatientCards(userVsId, function (data) {
                if (data != undefined && data.length > 0) {
                    var hospitalList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                    var hospitalId = undefined;
                    var hospitalurl = undefined;
                    if(hospitalList && hospitalList.length>0){
                        for(var i = 0;i < hospitalList.length; i++){
                            hospitalId = hospitalList[i].HOSPITAL_ID;
                            hospitalurl = hospitalList[i].LOGO_PHOTO;
                            for(var l = 0; l < data.length; l++){
                                if(data[l].HOSPITAL_ID == hospitalId){
                                    data[l].LOGO_PHOTO = hospitalurl;
                                }
                            }
                        }
                    }
                    if (data && data.length) {
                        for (var index = 0; index < data.length; index++) {
                            if (data[index].HOSPITAL_NAME && data[index].HOSPITAL_NAME.length > 13) {
                                data[index].hospitalNameShow = angular.copy(data[index].HOSPITAL_NAME.substring(0,13)+"...");
                            } else {
                                data[index].hospitalNameShow = angular.copy(data[index].HOSPITAL_NAME);
                            }
                        }
                    }
                    $scope.noCard = false;
                    $scope.cards = data;
                } else {
                    $scope.noCard = true;
                }
            })
        };

        //一倍大小图片
        $scope.oneSizeShow = function(){
            $scope.imgWidth=1*230;
            $scope.greenIndex=1;
            if($scope.greenIndex==1){
                $scope.topM='0 auto 0 0';
            }
        };
        $scope.twoSizeShow = function(){
            $scope.imgWidth=0.5*230;
            $scope.greenIndex=2;
            if($scope.greenIndex==2){
                $scope.topM='25% auto 25% 57.5px';
            }
        };
        //0.25倍大小图片
        $scope.threeSizeShow = function(){
            $scope.imgWidth=0.25*230;
            $scope.greenIndex=3;
            if($scope.greenIndex==3){
                $scope.topM='40% auto 40% 86px';
            }
        };
        $scope.openToCode = function(card){
            $scope.patient = card;
            $scope.imgWidth=1*230;
            $scope.greenIndex=1;
            $scope.topM = '0 auto 0 0';
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/frequent_info/views/patient_card/show_qrcode.html",
                tapBgToClose:true,
                scope: $scope
            });
        }

    })
    .build();
