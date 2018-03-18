new KyeeModule()
    .group('kyee.quyiyuan.address_manage.service')
    .type('service')
    .require([])
    .name('AddressmanageService')
    .params(["$state",
              "KyeeMessageService",
              "KyeeViewService",
              "HttpServiceBus"])
    .action(function($state,KyeeMessageService,KyeeViewService,HttpServiceBus){
        var def={
           ROUTER :'',
            editAddressModel:{},
            //查取某个用户下的所有可用地址信息数据
            queryAllAddressData:function(USER_ID,router,onSuccess){
                HttpServiceBus.connect({
                   url:'/receiveAddress/action/userReceiveAddressActionC.jspx',
                    params:{
                        USER_ID:USER_ID,
                        router:router,
                        op: "queryUserReceiveAddressList"
                    },
                    onSuccess:function(data){
                            if(data!=null && data!=undefined){
                                onSuccess(data.data);
                            }
                    }
                });
            },
            //根据userId和addressId获取地址信息
            queryAddressInfoById : function(addressId, onSuccess){
                HttpServiceBus.connect({
                    url : "/receiveAddress/action/userReceiveAddressActionC.jspx",
                    params:{
                        ADDRESS_ID : addressId,
                        op : "queryAddressInfoById"
                    },
                    onSuccess:function(resp){
                        if(resp && resp.success){
                            onSuccess(resp.data);
                        }else{
                            KyeeMessageService.broadcast({
                                content : resp.message
                            });
                        }
                    }
                });
            },
            //删除一条数据
            delAddressData:function(address_id,onSuccess){
                HttpServiceBus.connect({
                 url:'/receiveAddress/action/userReceiveAddressActionC.jspx',
                 params:{
                     ADDRESS_ID:address_id,
                     op:'deleteUserReceiveAddress'
                 },
                    onSuccess:function(data){
                         if(data!=null && data!=undefined){
                             onSuccess(data)
                         }
                    }
                });
            },
            //选中一条数据
            selAddress:function(user_id,address_id,onSuccess){
                 HttpServiceBus.connect({
                     url:'/receiveAddress/action/userReceiveAddressActionC.jspx',
                     showLoading:false,
                     params:{
                         ADDRESS_ID:address_id,
                         USER_ID:user_id,
                         op:'changeUserCurrentReceiveAddress'
                     },
                     onSuccess:function(data){
                         if(data!=null && data!=undefined){
                             onSuccess(data)
                         }
                     }
                 });
            },
            //新增保存一条数据
            saveAddress:function(user_id,address_model,onSuccess){
                HttpServiceBus.connect({
                    url:'/receiveAddress/action/userReceiveAddressActionC.jspx',
                    params:{
                        USER_ID:user_id,
                        ADDRESS_MODEL:address_model,
                        op:'addUserReceiveAddress'
                    },
                    onSuccess:function(data){
                        if(data!=null && data!=undefined){
                            onSuccess(data)
                        }
                    }
                });
        },
            //编辑保存一条数据
            editSaveAddress:function(address_model,onSuccess){
                HttpServiceBus.connect({
                    url:'/receiveAddress/action/userReceiveAddressActionC.jspx',
                    params:{
                        ADDRESS_MODEL:address_model,
                        op:'updateUserReceiveAddress'
                    },
                    onSuccess:function(data){
                        if(data!=null && data!=undefined){
                            onSuccess(data)
                        }
                    }
                });
            },
            //校验是否为空
            InputIsNull : function(content){
                KyeeMessageService.message({
                    title : "提示",
                    content : content,
                    okText : "我知道了"
                });
            },
            //检验手机号
        validatePhone : function(phoneNum){
            //为空则提示并返回
            if(!phoneNum){
                KyeeMessageService.message({
                    title : "提示",
                    content : "手机号不能为空！",
                    okText : "我知道了"
                });
                return false;
            } else if (!this.isMobil(phoneNum)) {
                KyeeMessageService.message({
                    title : "提示",
                    content : "手机号格式有误，请重新输入！",
                    okText : "我知道了"
                });
                return false;
            }
            return true;
        },
        //手机号格式校验
        isMobil: function (phoneNum) {
            var s = phoneNum.trim();
            var patrn = /^(\+86)?1[3|5|4|7|8|9|6]\d{9}$/;
            if (!patrn.test(s)) {
                return false;
            }
            return true;
        }
        }
        return def;
    })
    .build();