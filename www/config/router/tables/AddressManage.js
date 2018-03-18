/**
 * 产品名称 KYMH
 * 创建用户: 张明
 * 日期: 2015/6/29
 * 时间: 13:12
 * 创建原因：地址管理路由
 * 修改原因：
 * 修改时间：
 */
var ADDRESS_MANAGE_TABLE={
    "address_manage":{
        url:"/address_manage",
        cache:false,
        views:{
            "main_view":{
                templateUrl:"modules/business/address_manage/index.html",
                controller:"AddressManageController"
            }

        }
    },
    "add_address":{
        url:"/add_address",
        views:{
            "main_view":{
                templateUrl:"modules/business/address_manage/views/add_address.html",
                controller:"AddAddressController"
            }

        }
    },
    "edit_address":{
        url:"/edit_address",
            views:{
            "main_view":{
                templateUrl:"modules/business/address_manage/views/edit_address.html",
                controller:"EditAddressController"
            }

        }
}



};