/**
 * ��Ʒ���� KYMH
 * �����û�: ����
 * ����: 2015/6/29
 * ʱ��: 13:12
 * ����ԭ�򣺵�ַ����·��
 * �޸�ԭ��
 * �޸�ʱ�䣺
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