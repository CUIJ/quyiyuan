/**
 * 产品名称 KYMH
 * 创建用户: 张明
 * 日期: 2015/6/29
 * 时间: 17:11
 * 创建原因：编辑地址controller
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.edit_address.controller")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.address_manage.service",
        "kyee.quyiyuan.medicineOrder.service"
    ])
    .type("controller")
    .name("EditAddressController")
    .params(["$scope", "$state", "AddressmanageService", "CacheServiceBus", "KyeeMessageService","MedicineOrderService","$q","SendAddressService","KyeeI18nService"])
    .action(function ($scope, $state, AddressmanageService, CacheServiceBus, KyeeMessageService,MedicineOrderService,$q,SendAddressService,KyeeI18nService) {
        $scope.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
        var model=AddressmanageService.editAddressModel;
        $scope.addressModel={
            ADDRESS_ID:model.ADDRESS_ID,
            PHONE_NUMBER:model.PHONE_NUMBER,
            NAME:model.NAME,
            DETIL_ADDRESS:model.DETIL_ADDRESS,
            PROVINCE_CODE:model.PROVINCE_CODE,
            PROVINCE:model.PROVINCE,
            CITY_CODE:model.CITY_CODE,
            CITY:model.CITY,
            COUNTY_CODE:model.COUNTY_CODE,
            COUNTY:model.COUNTY,
            ADDRESS:(model.PROVINCE_CODE=='710000' || model.PROVINCE_CODE=='820000' || model.PROVINCE_CODE=='810000')?
                model.PROVINCE:(model.PROVINCE+'-'+model.CITY+'-'+model.COUNTY)
        };
        //初始化页面填充值

        //区域选择组件事件绑定  begin
        $scope.bind = function(params){

            $scope.show = params.show;
        };

        var savedValue = {
            "0" : AddressmanageService.editAddressModel.PROVINCE_CODE,
            "1" : AddressmanageService.editAddressModel.CITY_CODE,
            "2" : AddressmanageService.editAddressModel.COUNTY_CODE
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
        //区域选择组件时间绑定  end

        //编辑保存地址功能
        $scope.editSaveAddress=function(){
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

            AddressmanageService.editSaveAddress(address_model,function(data){
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                          if(data.success){
                              if(model.fromSource&&model.fromSource==1){
                                  showDetail(model);
                              }else{
                                  $state.go("address_manage");
                              }
                          }
            });
        };
        //吴伟刚 KYEEAPPC-2995 网络医院之电子订单支付是修改地址提示信息
        var showDetail = function(model){
            var getLogisticsInfoPromise = MedicineOrderService.getLogisticsInfo(model);
            var getLatestOrderInfoPromise = MedicineOrderService.getLatestOrderInfo(model);
            $q.all([getLogisticsInfoPromise, getLatestOrderInfoPromise])
                .then(function(result){
                    var logisticsInfo = result[0];
                    var latestOrderInfo = result[1];
                    latestOrderInfo.logisticsInfo = logisticsInfo;
                    MedicineOrderService.order = latestOrderInfo;
                    model.fromSource = undefined;
                    $state.go("orderDetail");
                });
        };

        $scope.name = KyeeI18nService.get("edit_address.name","请输入收货人姓名");
        $scope.address = KyeeI18nService.get("edit_address.address","");
        $scope.detailAddress = KyeeI18nService.get("edit_address.detailAddress","请输入详细地址");
        $scope.phoneNumber = KyeeI18nService.get("edit_address.phoneNumber","请输入收货人电话号码");


    })
    .build();