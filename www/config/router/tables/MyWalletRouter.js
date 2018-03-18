/**
 * 产品名称 KYMH
 * 创建用户: 姚斌
 * 日期: 2015年8月23日23:36:07
 * 创建原因：我的钱包路由配置
 */
var MY_WALLET_TABLE={
    //"my_wallet->MAIN_TAB":{  //程铄闵 删除冗余代码 KYEEAPPC-5641
    //    url:"/my_wallet->MAIN_TAB",
    //    views:{
    //        "main_view":{
    //            templateUrl:"modules/business/my_wallet/main/index.html",
    //            controller: "MyWalletController"
    //        }
    //    }
    //},
    //添加优惠券
    "coupons":{
        url:"/coupons",
        views:{
            "main_view":{
                templateUrl:"modules/business/my_wallet/coupons/index.html",
                controller: "CouponsController"
            }
        }
    },
    //优惠券
    "couponsRecord":{
        url:"/couponsRecord",
        views:{
            "main_view":{
                templateUrl:"modules/business/my_wallet/coupons/views/coupon_record.html",
                controller: "CouponsRecordController"
            }
        }
    },
    "rebateBankAdd":{
        url:"/rebateBankAdd",
        views:{
            "main_view":{
                templateUrl:"modules/business/my_wallet/my_bank_card/index.html",
                controller: "RebateBankAddController"
            }
        }
    },
    "editBankCardMsg":{
        url:"/editBankCardMsg",
        views:{
            "main_view":{
                templateUrl:"modules/business/my_wallet/my_bank_card/views/add_bank_card.html",
                controller: "EditBankCardMsgController"
            }
        }
    },
    //发卡行选择列表
    "bank_list":{
        url: "/bank_list",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/my_bank_card/views/bank_list.html",
                controller : "BankListController"
            }
        }
    },
    "rebateBank":{
        url: "/rebateBank",
        cache: false, //禁掉页面缓存
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/my_bank_card/views/apply_cash_confirm.html",
                controller:"RebateBankController"
            }
        }
    },
    "rebateBankBranch":{
        url: "/rebateBankBranch",
        views: {
            "main_view": {
                templateUrl: "modules/business/my_wallet/my_bank_card/views/rebate_bank_branch.html",
                controller:"RebateBankBranchController"
            }
        }
    },
    "apply_cash":{
        url:"/apply_cash",
        views:{
            "main_view":{
                templateUrl:"modules/business/my_wallet/apply_cash/index.html",
                controller: "ApplyCashController"
            }
        }
    },
    "register_free":{
        url:"/register_free",
        views:{
            "main_view":{
                templateUrl:"modules/business/my_wallet/register_free/index.html",
                controller: "RegisterFreeController"
            }
        }
    },
    "phone_fee_charging":{
        url: "/phone_fee_charging",
        views:{
            "main_view" : {
                templateUrl: "modules/business/my_wallet/apply_cash/views/phone_fee_charging.html",
                controller : "PhoneFeeRechargeController"
            }
        }
    }

};