var quyiyuanAppBootstrap = new KyeeApp()
    .name("kyee.framework.bootstrap")
    .home(["home->MAIN_TAB", "doctorHome->MAIN_TAB"])
    .homePartners({
        "home->MAIN_TAB" : ["health->MAIN_TAB", "message->MAIN_TAB", "myquyi->MAIN_TAB.medicalGuide", "center->MAIN_TAB"],
        "doctorHome->MAIN_TAB" : ["doctorCenter->MAIN_TAB"]
    })
    .rounter("RouterConfigProvider")
    .require([
        "kyee.framework.directive.operation_monitor",
        "kyee.framework.directive.operation_monitor.service",
		"kyee.framework.service.file",
		"kyee.framework.service.pay",
        "kyee.quyiyuan.bootstrap.service",
        "kyee.quyiyuan.service_bus.http",
        "kyee.quyiyuan.service_bus.cache",
        "kyee.quyiyuan.config",
        "kyee.quyiyuan.filters",
        "kyee.quyiyuan.home.controller",
        "kyee.quyiyuan.home.service",
        "kyee.quyiyuan.hospital.controller",
        "kyee.quyiyuan.queue.select.dept.controller",
        "kyee.quyiyuan.newqueue.select.dept.controller",
        "kyee.quyiyuan.reportmain.controller",
        "kyee.quyiyuan.myquyi.controller",
        "kyee.quyiyuan.login.tabs.controller",
        "kyee.quyiyuan.center.controller",
        "kyee.quyiyuan.messagecenter.messageCenter.controller",
        "kyee.quyiyuan.satisfaction.satisfactionMain.controller",
        "kyee.quyiyuan.interaction.doctorSelect.controller",
        "kyee.quyiyuan.triagePic.controller",
        "kyee.quyiyuan.aboutquyi.controller",
        "kyee.quyiyuan.scheduleDept.controller",
        "kyee.quyiyuan.multiplequery.multiplequerycity.controller",
        "kyee.quyiyuan.hospitalnotice.controller",
        "kyee.quyiyuan.ncms.Main.controller",
        "kyee.quyiyuan.weburlparams.service",
        "kyee.quyiyuan.patient_recharge.controller",
        "kyee.quyiyuan.patient_card_recharge.controller",
        "kyee.quyiyuan.medical.controller",
        "kyee.quyiyuan.card_balance.controller",
        "kyee.quyiyuan.appointment.features_dept.controller",
        "kyee.quyiyuan.price.controller",
        "kyee.quyiyuan.center.changeLanguage.service",
        "kyee.quyiyuan.multiplequery.multiplequerycity.service",
        "kyee.quyiyuan.hospital.hospital_selector.service",
        "kyee.quyiyuan.report_multiple.controller",
        "kyee.quyiyuan.login.controller",
        "kyee.quyiyuan.login.regist.controller",
        "kyee.quyiyuan.login.agreement.controller",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.operation_monitor.service",
        "kyee.quyiyuan.waitingqueue.clinic.controller",
        "kyee.quyiyuan.waitingqueue.dept.controller",
        "kyee.quyiyuan.myWallet.clinicPaymentRevise.controller",
        "kyee.framework.service.third_party_auth",
        "kyee.framework.service.tyrtc",
        "kyee.quyiyuan.report_multiple_hosp.controller",
        "kyee.quyiyuan.telappointment.controller",
        "kyee.quyiyuan.insurancebackapp.controller",
        "kyee.quyiyuan.appointment.regist.rush.controller",
        "kyee.quyiyuan.status_bar_push.service",
        "kyee.quyiyuan.messageSkip.controller",
        "kyee.quyiyuan.qycode.controller",
        "kyee.quyiyuan.doctor.patient.relation.controller",
        "kyee.quyiyuan.health.serve.controller",
        "kyee.quyiyuan.consulation.note.controller",
        "kyee.quyiyuan.interaction.IntelligentGuide.controller",
        'kyee.quyiyuan.my.convenience.networkclinicDL.controller',
        "kyee.quyiyuan.aboutquyi.newFeedback.controller",
        "kyee.quyiyuan.patient_card_records.controller",
        "kyee.quyiyuan.healthCard.controller",
        "kyee.framework.exception"
    ])
    .params(["BootstrapService","CacheServiceBus","StatusBarPushService"])
    .hasSplashscreen(true)
    .i18n({
        path:{
            prefix: "resource/locale/lang-",
            suffix: ".json"
        },
        lang: {
            default : "zh_CN",
            cache : true
        },
        lookAndFeel:{
            "uyg" : "uygLookAndFeel"
        }
    }).listeners({

        onStateChangeStart: function (params) {
            if(!window.device){// 检测是否有弹出窗口，有则关闭
                params.params.KyeeMessageService.beforePopupShownAction();
            }
            var routerName = params.toState.name;
            params.params.BootstrapService.initTabMenu(routerName); //初始化首页tab选项卡显示
            params.params.BootstrapService.initFilter(routerName, params.event, params.filterChainInvoker); //如果该路由已绑定过滤器链，则执行
        },

        onMenubutton: function (params) {
            var state = params.KyeeViewService.isSideMenuOpened(); //如果菜单栏打开，则关闭，反之亦然
            if (!state) {
                if(params.$rootScope.ROLE_CODE != 3){  //医生角色禁用物理选项键 程铄闵 KYEEAPPTEST-3701
                    params.$rootScope.openRightMenu("*"); //使用 * 代表物理返回键
                }
            } else {
                params.KyeeViewService.toggleSideMenu({
                    direction: "RIGHT",
                    status: false
                });
            }
        },

        onInit: function (params) {
            quyiyuanAppBootstrap.exitConfirm = false; //关闭退出提示，默认开启
            params.BootstrapService.prepareAppConfigOnInit(); // 准备App配置
        },

        onFinash: function (params) {
            params.BootstrapService.prepareAppConfigOnFinash(); // 准备App配置（不与后台交互）
            params.BootstrapService.prepareAppData(); // 准备App数据（需要与后台交互）
            params.BootstrapService.prepareRootScope(); // 准备rootScope
        }
    })
    .build();