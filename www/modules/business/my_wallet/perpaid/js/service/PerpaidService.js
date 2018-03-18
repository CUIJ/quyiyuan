/**
 * 产品名称：quyiyuan.
 * 创建用户：吴伟刚
 * 日期：2015年12月9日13:55:04
 * 创建原因：住院预交页面优化
 * 任务号：KYEEAPPC-4454
 * 修改者：程铄闵
 * 修改时间：2015年12月15日18:39:55
 * 修改原因：住院预缴优化
 * 任务号：KYEEAPPTEST-3181
 * 修改者：程铄闵
 * 修改时间：2016年6月8日16:09:11
 * 修改原因：住院预缴优化
 * 任务号：KYEEAPPC-6601
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.perpaid.service")
    .require([])
    .type("service")
    .name("PerpaidService")
    .params(["HttpServiceBus", "CacheServiceBus","KyeeMessageService","$ionicHistory"])
    .action(function(HttpServiceBus,CacheServiceBus,KyeeMessageService,$ionicHistory){

        var def = {
            permissionData:{},//权限数据
            //isCurrentViewEmpty:false,//当前页的路由是否为空
            //isFirstGoInfoView:false,//第一次进入模块跳转至perpaid_pay_info
            //infoChangeHospital:false,//切换医院后跳转标记
            isFromQRCode:false, //从扫描专属二维码页面来

            //获取权限
            loadPermission : function(callBack){
                HttpServiceBus.connect({
                    url: "/inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "queryPreChargePermission"
                    },
                    onSuccess: function (data) {
                        //data = {"success":true,"message":"查询成功","resultCode":"0000000","data":{"HOSPITAL_NAME":"汐漫星空","INP_NO":"290104","PERMISSION":"1","BOTTOM_TIP":"* 本预付服务免费，实际费用由医院直接收取","HOSPITAL_TIP":"您要预缴住院费的医院：","QUERY_TYPE":"1","SHOW_INPUT_VIEW":"0"}};
                        //data = {"success":true,"message":"查询成功","resultCode":"0000000","data":{"HOSPITAL_NAME":"汐漫星空","INP_NO":"290104","PERMISSION":"1","BOTTOM_TIP":"* 本预付服务免费，实际费用由医院直接收取","HOSPITAL_TIP":"您要预缴住院费的医院：","QUERY_TYPE":"0","SHOW_INPUT_VIEW":"0"}};
                        //data = {"success":true,"message":"查询成功","resultCode":"0000000","data":{"HOSPITAL_NAME":"汐漫星空","INP_NO":"290104","PERMISSION":"1","BOTTOM_TIP":"* 本预付服务免费，实际费用由医院直接收取","HOSPITAL_TIP":"您要预缴住院费的医院：","QUERY_TYPE":"0","SHOW_INPUT_VIEW":"1"}};
                        if(data.success){
                            var rec = data.data;
                            def.permissionData = rec;
                            //未开通
                            if(rec.PERMISSION == '0'){
                                callBack('perpaid');
                            }
                            else{
                                //非中间态
                                if(rec.SHOW_INPUT_VIEW != 1){
                                    callBack('perpaid');
                                }
                                else{
                                    def.isFirstGoInfoView = true;
                                    callBack('perpaid_pay_info');
                                }
                            }
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content:data.message
                            });
                        }
                    }
                });
            },

            //获取初始数据
            loadData : function(callBack,hospitalId) {
                HttpServiceBus.connect({
                    url: "/PreCharge/action/PreChargeActionC.jspx",
                    params: {
                        op: "getHospitalQueryType",
                        hospitalID:hospitalId
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            callBack(data.data);
                        }
                        else{
                            callBack(data.message);
                        }
                    }
                });
            },

            //获取医院图标
            getHospitalLogo: function(id){
                var hospitalList = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.HOSPITAL_LIST);
                var logo;
                if(hospitalList){
                    for(var i=0;i<hospitalList.length;i++){
                        if(hospitalList[i].HOSPITAL_ID == id){
                            logo = hospitalList[i].LOGO_PHOTO;
                            break;
                        }
                    }
                }
                return logo;
            },

            //转换身份证号隐藏
            convertIdNo : function(v){
                if (v) {
                    return (v.replace(/(.{3}).*(.{4})/, "$1********$2"));
                }
                else{
                    return v;
                }
            },

            //切换医院or就诊者发请求更新数据
            changePatientOrHospital:function(getData){
                HttpServiceBus.connect({
                    url: "/inHospitalPat/action/InHosPatientFeeActionC.jspx",
                    params: {
                        op: "queryPreChargePermission",
                        SWITCH:1
                    },
                    onSuccess: function (data) {
                        if(data.success){
                            var rec = data.data;
                            def.permissionData = rec;
                            getData(true);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content:data.message
                            });
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();

