/**
 * 名称：quyiyuan
 * 作者: 程志
 * 日期:2015年８月10日
 * 创建原因：个人中心／常用信息(KYEEAPPC-2989)
 * 功能:个人中心--常用信息
 */

new KyeeModule()
    .group("kyee.quyiyuan.frequent_info.controller")
    .require(["kyee.quyiyuan.center.service",
              "kyee.framework.service.message",
              "kyee.framework.service.view",
              "kyee.quyiyuan.center.controller.custom_patient",
              "kyee.quyiyuan.center.controller.role_view",
              "kyee.quyiyuan.center.controller.change_pwd",
              "kyee.quyiyuan.center.controller.update_user",
              "kyee.quyiyuan.center.controller.query_his_card",
              "kyee.quyiyuan.center.controller.add_patient_info",
              "kyee.quyiyuan.center.controller.add_custom_patient",
              "kyee.quyiyuan.center.qr_code.controller",
              "kyee.quyiyuan.login.service",
              "kyee.quyiyuan.home.noticeCenter.service",
              "kyee.quyiyuan.appointment.regist.list.controller",
              "kyee.quyiyuan.center.custom_patient.service",
              "kyee.quyiyuan.address_manage.controller",
              "kyee.quyiyuan.frequent_info.patient_card.controller" ])
    .type("controller")
    .name("FrequentInfoController")
    .params([
        "$scope",
        "$state",
        "CenterService",
        "KyeeMessageService",
        "KyeeViewService",
        "LoginService",
        "CacheServiceBus",
        "NoticeCenterService",
        "CustomPatientService",
        "KyeeI18nService",
        "$ionicHistory"])
    .action(function (
        $scope,
        $state,
        CenterService,
        KyeeMessageService,
        KyeeViewService,
        LoginService,
        CacheServiceBus,
        NoticeCenterService,
        CustomPatientService,
        KyeeI18nService,
        $ionicHistory) {

        var cache = CacheServiceBus.getMemoryCache();

        $scope.userSource = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);

        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };

        // 跳转到银行卡
        $scope.go2BankCards = function () {
            KyeeMessageService.broadcast({content : KyeeI18nService.get("frequent_info.notAvailable","此功能暂不可用")});

        }

        // 跳转到我的二维码
        $scope.go2QrCode = function () {
            $scope.openModal('modules/business/center/views/update_user/qr_code.html');
        }

        $scope.Cancellation = function () {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("update_user.sms","消息"),
                content:KyeeI18nService.get("frequent_info.sureNeedAccount","确认需要注销？") ,
                onSelect: function (select) {
                    if (select) {
                        LoginService.isCancleLogin = "1";//注销登录标记
                        //清除缓存数据记录
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO, undefined);
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, undefined);
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD, undefined);
                        LoginService.logoff();
                        LoginService.logoutRongLian();
                        LoginService.phoneNumberFlag = undefined;
                        //NoticeCenterService.loadNotice();
                        $state.go("login");//模态改路由 付添  KYEEAPPC-3658
                    }
                }
            });
        }


    })
    .build();
