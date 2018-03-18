/**
 * Created by Administrator on 2015/6/24.
 * 创建原因:龙岩人民医院微信服务号链接趣医院APP
 */
new KyeeModule()
    .group("kyee.quyiyuan.wxbylongyan.service")
    .require(["kyee.framework.service.messager",
               "kyee.quyiyuan.hospital.hospital_selector.service",
               "kyee.quyiyuan.hospital.service",
               "kyee.quyiyuan.quyiwx.service"])
    .type("service")
    .name("WXByLongYanService")
    .params(["KyeeMessagerService","HospitalSelectorService","HttpServiceBus","HospitalService","QuYiWXService","KyeeViewService","$location","KyeeMessageService","CacheServiceBus"])
    .action(function(KyeeMessagerService,HospitalSelectorService,HttpServiceBus,HospitalService,QuYiWXService,KyeeViewService,$location,KyeeMessageService,CacheServiceBus){
        var def = {

            getWXHospitalInfro:function(urlInfo){
                /**
                 * 增加原因 APP微信公众号跳转医院首页 不走此切换医院
                 */
                if(urlInfo.businessType!=6){
                    this.queryCurrentHospital(urlInfo);
                }
                //根据传递的参数，判断医院选择是否被禁用  是否需要过滤其它医院，0表示过滤，1表示不过滤
                if(urlInfo.hospitalFilterEnable==0){
                    HospitalService.setHospitalSelecterBtnDisabled(true);
                }else{
                    HospitalService.setHospitalSelecterBtnDisabled(false);
                }
            },
            //刷新九宫格页面元素
            updateUI:function(){
                HospitalService.updateUI();
                var cache = CacheServiceBus.getMemoryCache();
                var objParams = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(objParams){
                    var hospitalId = objParams.hospitalID;
                    if("1001"==hospitalId){
                        def.selectHosAfter();
                    }
                }
            },
            //根据传递医院ID，获取医院数据
            queryCurrentHospital : function(urlInfo){
                var me=this;
                HttpServiceBus.connect({
                    url : '/area/action/AreaHospitalActionImplC.jspx',
                    params : {
                        op:'queryHospitalName',
                        USER_TYPE: 0,   //用户类型，默认普通用户
                        individual_Hospital:urlInfo.hospitalID
                    },
                    onSuccess : function(resp){
                        if (resp.success) {
                            var hospitalName = resp.data.rows[0].HOSPITAL_NAME;
                            var hospitalAddress = resp.data.rows[0].MAILING_ADDRESS;
                            var provinceCode = resp.data.rows[0].PROVINCE_CODE;
                            var provinceName = resp.data.rows[0].PROVINCE_NAME;
                            var cityCode = resp.data.rows[0].CITY_CODE;
                            var cityName = resp.data.rows[0].CITY_NAME;
                            var loadingText = '正在加载医院信息...';
                            var hospitalID = resp.data.rows[0].HOSPITAL_ID;
                            var hospital=resp.data.rows[0];
                            //根据传递医院ID，获取医院数据
                            HospitalSelectorService.selectHospital(hospitalID, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName, loadingText, me.updateUI,hospital);

                            setTimeout(function(){
                                def.selectHosAfter();
                            }, 1000);
                        }
                    }
                });
            },
            selectHosAfter:function(){
                var cache = CacheServiceBus.getMemoryCache();
                var urldata = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(urldata && urldata.wx_forward == "appointment"){
                    // 有登陆拦截器的页面不需要重新加载
                    angular.element(document.body).injector().get('$state').go(
                        urldata.wx_forward,
                        {},
                        { reload: true });
                }

                var isCloseHospital=CacheServiceBus.getMemoryCache().get('CACHE_CONSTANTS.MEMORY_CACHE.IS_CLOSE_HOSPITAL');
                if(isCloseHospital){
                    KyeeMessageService.message({
                        title: "提示",
                        content: "医院正在维护，请稍后重试！",
                        okText: "知道了",
                        onOk: function () {
                            if (navigator.app) {
                                navigator.app.exitApp();//直接退出趣医院
                            }
                        }
                    });
                }else{
                    var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(HospitalService.ctrlScope){
                        HospitalService.ctrlScope.hospitalInfo={
                            name: hospitalInfo != null && hospitalInfo.name != "" ? hospitalInfo.name :  "请选择医院",
                            address: hospitalInfo != null && hospitalInfo.address != "" ? hospitalInfo.address :"点击这里选择一家您要使用的医院",
                            level: hospitalInfo != null && hospitalInfo.level != "" ? hospitalInfo.level : "点击这里选择一家您要使用的医院"
                        };
                    }
                }
            }
        };

        return def;
    })
    .build();