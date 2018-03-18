/**
 * 产品名称 KYMH
 * 创建用户: 张明
 * 日期: 2015/6/29
 * 时间: 17:11
 * 创建原因：添加地址controller
 * 修改原因：KYEEAPPTEST-2701
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.add_address.controller")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.address_manage.service"
    ])
    .type("controller")
    .name("AddAddressController")
    .params(["$scope", "$state", "AddressmanageService", "CacheServiceBus", "KyeeMessageService","SendAddressService","KyeeI18nService"])
    .action(function ($scope, $state, AddressmanageService, CacheServiceBus, KyeeMessageService,SendAddressService,KyeeI18nService) {
        $scope.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
        $scope.addressModel={
            CURRENT_ADDRESS:0
        };
        $scope.bind = function(params){

            $scope.show = params.show;
        };
        var router = AddressmanageService.ROUTER;
        if(!router){
            router = "center";
        }
        if(router) {
            var storageCache = CacheServiceBus.getStorageCache();
            var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if (hospitalId) {
                SendAddressService.queryAddress(hospitalId,router,function (resultData) {
                    $scope.addressData = resultData;
                });
            }
        };

        var savedValue = {
            "0" : "110000",
            "1" : "110100",
            "2" : "110101"
        };
        $scope.onFinash = function(params){

            savedValue = {
                "0" : params[0].value,
                "1" : params[1].value,
                "2" : params[2].value
            };
            $scope.rs = params[0].text + "（" + params[0].value + "）" + params[1].text + "（" + params[1].value + "）" + params[2].text + "（" + params[2].value + "）"
            $scope.addressModel.PROVINCE_CODE=params[0].value;
            $scope.addressModel.PROVINCE=params[0].text;
            $scope.addressModel.CITY_CODE=params[1].value;
            $scope.addressModel.CITY=params[1].text;
            $scope.addressModel.COUNTY_CODE=params[2].value;
            $scope.addressModel.COUNTY=params[2].text;
            //对港澳台地区进行特殊处理
            if($scope.addressModel.PROVINCE_CODE=='710000' || $scope.addressModel.PROVINCE_CODE=='820000' ||  $scope.addressModel.PROVINCE_CODE=='810000'){
                $scope.addressModel.ADDRESS=$scope.addressModel.PROVINCE;
            }else{
                $scope.addressModel.ADDRESS=$scope.addressModel.PROVINCE+"-"+$scope.addressModel.CITY+"-"+$scope.addressModel.COUNTY;
            }

            return true;

        };

        $scope.go = function(){
           if(router) {
               var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
               if (hospitalId){
                   var a = $scope.addressData.PROVINCE;
                   var b = $scope.addressData.CITY;
                   var c = $scope.addressData.COUNTY;
               }else{
                   //如果缓存中没有医院，则给省市置为null，查地址查全国。KYEEAPPC-4495 wangwan   2015年12月10日12:37:25
                   a = null;
                   b = null;
                   c = null;
               }

               $scope.allow = {
                   province: a,
                   city: b,
                   area: c
               };
           }
            $scope.$apply();
            $scope.show(savedValue);
        };
        //新增地址功能
        $scope.saveAddress=function(){
            var address_model=$scope.addressModel;
            //校验数据begin
            if(address_model.NAME=="" || address_model.NAME==undefined){
                AddressmanageService.InputIsNull('收货人姓名不能为空！');
                return;
            };
            if(address_model.PROVINCE=="" || address_model.PROVINCE==undefined){
                AddressmanageService.InputIsNull('区域选择不能为空！');
                return;
            };
            if(address_model.DETIL_ADDRESS=="" || address_model.DETIL_ADDRESS==undefined){
                AddressmanageService.InputIsNull('详细地址不能为空！');
                return;
            };
              if(!AddressmanageService.validatePhone(address_model.PHONE_NUMBER)){
                  return;
              };
            //校验数据end

            AddressmanageService.saveAddress($scope.USER_ID,address_model,function(data){
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                          if(data.success){
                              $state.go("address_manage");
                          }
            });
        }
        //是否设置为常用地址选择按钮  系列事件begin
        $scope.isYesFalg=false;
        $scope.setYesSelect=function(){
            if($scope.isYesFalg){
                $scope.isYesFalg=false;
                $scope.addressModel.CURRENT_ADDRESS=0;
            }else{
                $scope.isYesFalg=true;
                $scope.addressModel.CURRENT_ADDRESS=1;
            }

        };

        //选择按钮系列事件end
        $scope.name = KyeeI18nService.get("add_address.name","请输入收货人姓名");
        $scope.address = KyeeI18nService.get("add_address.address","");
        $scope.detailAddress = KyeeI18nService.get("add_address.detailAddress","请输入详细地址");
        $scope.phoneNumber = KyeeI18nService.get("add_address.phoneNumber","请输入收货人电话号码");

    })
    .build();