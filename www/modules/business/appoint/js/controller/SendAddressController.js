/*
 * 产品名称：quyiyuan
 * 创建人: 吴伟刚
 * 创建日期:2015年8月6日13:56:24
 * 创建原因：配送范围的控制
 * 任务号：KYEEAPPC-2919
 */
new KyeeModule()
    .group("kyee.quyiyuan.appoint.sendAddressController.controller")
    .require(["kyee.quyiyuan.send_address.service","kyee.quyiyuan.appointment.doctor_detail.service","kyee.quyiyuan.regist.regist_registConfirm.service"])
    .type("controller")
    .name("SendAddressController")
    .params(["$scope","SendAddressService","KyeeViewService","KyeeListenerRegister","CacheServiceBus","AppointmentDoctorDetailService","RegistConfirmService","KyeeI18nService"])
    .action(function ($scope,SendAddressService,KyeeViewService,KyeeListenerRegister,CacheServiceBus,AppointmentDoctorDetailService,RegistConfirmService,KyeeI18nService) {
        //获取缓存中医院信息
        var storageCache = CacheServiceBus.getStorageCache();
        var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
        SendAddressService.queryAddress(hospitalId,"",function(resultData){
            $scope.addressData = resultData;
            if(resultData&&resultData.length==0){
                $scope.showEmpty = true;
                $scope.emptyText =KyeeI18nService.get("send_address.notEmptyaddress","暂无配送范围！");
            }
        });
        //监听物理返回
        KyeeListenerRegister.once({
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.removeAddressModal();
            }
        });
        //点击大图页面消失
        $scope.removeAddressModal = function(){
            KyeeViewService.removeModal({
                scope : $scope
            });
            KyeeListenerRegister.uninstallOnce(KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK);//离开此页面的时候将一次性事件卸载掉
        };
    })
    .build();