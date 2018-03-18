/**
 * 产品名称 KYMH
 * 创建用户: 张明
 * 日期: 2015/6/29
 * 时间: 13:12
 * 创建原因：地址管理controller
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.address_manage.controller")
    .require([
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.address_manage.service",
        "kyee.quyiyuan.add_address.controller",
        "kyee.quyiyuan.edit_address.controller"
    ])
    .type("controller")
    .name("AddressManageController")
    .params(["$scope", "$state", "AddressmanageService", "CacheServiceBus", "KyeeMessageService","KyeeI18nService"])
    .action(function ($scope, $state, AddressmanageService, CacheServiceBus, KyeeMessageService,KyeeI18nService) {
        //是否有显示数据标识
        $scope.hasAddressInfoFlag = false;
        var router = AddressmanageService.ROUTER;
        $scope.USER_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
        //初始化 地址管理页面
        $scope.initView = function () {
            AddressmanageService.queryAllAddressData($scope.USER_ID,router, function (data) {
                if (data.length > 0) {
                    $scope.hasAddressInfoFlag = false;
                    $scope.allAddressData = data;
                    for(var i = 0;i < $scope.allAddressData.length;i++){
                        var phoneNum = $scope.allAddressData[i].PHONE_NUMBER;
                        var regPhoneNum = "";
                        for(var j = 0;j < 11;j++){

                            if(j > 2 && j < 7){
                                regPhoneNum += "*";
                            }else{
                                regPhoneNum += phoneNum.charAt(j);
                            }

                        }
                        $scope.allAddressData[i].regPhoneNum = regPhoneNum;
                    }
                    angular.forEach($scope.allAddressData, function (item, index, items) {
                        if (item.CURRENT_ADDRESS == 1) {
                            $scope.isSelItem = item;
                        }
                    });
                } else {
                    $scope.hasAddressInfoFlag = true;
                }

            })

        };
        //删除地址功能
        $scope.delAddressData = function (address_id) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("address_manage.reminder","提示"),
                content: KyeeI18nService.get("address_manage.confirmDelete","您是否确认删除？"),
                onSelect: function (flag) {
                    if (flag) {
                        AddressmanageService.delAddressData(address_id, function (data) {
                            if (data.success) {
                                var newData = [];
                                angular.forEach($scope.allAddressData, function (item, index, items) {
                                    if (item.ADDRESS_ID != address_id) {
                                        newData.push(item);
                                    }
                                });
                                $scope.allAddressData = newData;
                                if (newData.length < 1) {
                                    $scope.hasAddressInfoFlag = true;
                                }
                            }
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        });
                    }
                }
            });
        };
        //选中地址功能
        $scope.selAddress = function (item) {
            if(item.CURRENT_ADDRESS==1){
                return;
            }
            AddressmanageService.selAddress($scope.USER_ID, item.ADDRESS_ID, function (data) {
                if (data.success) {
                    item.CURRENT_ADDRESS = 1;
                    $scope.isSelItem.CURRENT_ADDRESS = 0;
                    $scope.isSelItem = item;
                } else {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 2000
                    });
                }
            });


        };
        //跳转到新增地址页面
        $scope.addNewAddress = function () {
            $state.go("add_address");
        };
        //跳转到编辑地址页面
        $scope.toEditAddress=function(item){
            AddressmanageService.editAddressModel=item;
            $state.go("edit_address");
        };
        //根据选择判断ridio显示样式
        $scope.changeStyle = function (flag) {
            return "1" == flag.toString();
        }

    })
    .build();