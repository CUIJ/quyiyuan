/**
 * 产品名称：quyiyuan
 * 创建者：dangliming
 * 创建时间： 2016年11月11日10:42:37
 * 创建原因：病友圈服务器升级页面
 */

new KyeeModule()
    .group("Kyee.quyiyuan.patients_group.upgrade.controller")
    .type("controller")
    .require([])
    .name("upgradeController")
    .params([
      "$scope",
      "$state",
      "$sce",
      "CacheServiceBus",
      "KyeeEnv",
      "KyeeListenerRegister"
    ])
    .action(function($scope, $state, $sce, CacheServiceBus, KyeeEnv, KyeeListenerRegister){

        $scope.goHome = function(){
          $state.go("home->MAIN_TAB");
        };
        //监听物理键返回
        KyeeListenerRegister.regist({
          focus: "patient_group_upgrade",
          when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
          action: function (params) {
            params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
            $scope.goHome();
          }
        });
        $scope.imgUrl = $sce.trustAsResourceUrl(CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.PATIENTS_GROUP_UPGRADE_URL));
    })
    .build();