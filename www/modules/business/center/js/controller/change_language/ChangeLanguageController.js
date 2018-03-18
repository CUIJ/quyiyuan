/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年10月26日17:23:05
 * 创建原因：切换语言页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.changeLanguage.controller")
    .type("controller")
    .name("ChangeLanguageController")
    .params(["$scope", "$state", "CacheServiceBus",
        "KyeeI18nService", "$rootScope", "ChangeLanguageService", "$ionicHistory"
    ])
    .action(function($scope, $state, CacheServiceBus,
                     KyeeI18nService, $rootScope, ChangeLanguageService, $ionicHistory){

        // 当前系统语言类型
        $scope.currentLangType = KyeeI18nService.getCurrLangName();

        // 初始化系统支持的语言类型
        $scope.langData = [];
        $scope.langData.push({
            name:"简体中文",
            langType:"zh_CN"
        });
        $scope.langData.push({
            name:"ئۇيغۇرچە",
            langType:"uyg"
        });

        /**
         * 修改语言类型
         * @param item
         */
        $scope.changeLang = function (item) {
            $scope.currentLangType = item.langType;
        };

        /**
         * 应用选中多语言
         */
        $scope.submit = function () {

            KyeeI18nService.use($scope.currentLangType, $rootScope);

            setTimeout(function(){

                ChangeLanguageService.updateRootScopeLangText();

                $ionicHistory.goBack();

            }, 500);
        }

    })
    .build();