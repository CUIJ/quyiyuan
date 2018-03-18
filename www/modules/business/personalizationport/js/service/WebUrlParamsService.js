/**
 * 产品名称 KYMH
 * 创建用户: 邵鹏辉
 * 日期: 2015/6/8
 * 时间: 11:42
 * 创建原因：第三方以URL带参的形式访问
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.weburlparams.service")
    .require([
        "kyee.framework.service.message",
        "kyee.quyiyuan.service_bus.cache",
        "kyee.quyiyuan.service_bus.http",
        "kyee.quyiyuan.wxbylongyan.service",
        "kyee.quyiyuan.quyiwx.service",
        "kyee.quyiyuan.homefor114.service",
        "kyee.quyiyuan.boZhouLogin.service",
        "kyee.quyiyuan.wxpubliccode.service"
    ])
    .type("service")
    .name("WebUrlParamsService")
    .params([
        "$timeout",
        "$state",
        "KyeeMessageService",
        "CacheServiceBus",
        "HttpServiceBus",
        "WXByLongYanService",
        "QuYiWXService",
        "HomeFor114Service",
        "BoZhouLoginService",
        "WXPublicCodeService",
        "$location",
        "KyeeUtilsService"
    ])
    .action(function($timeout,$state,KyeeMessageService,CacheServiceBus,HttpServiceBus,WXByLongYanService,QuYiWXService,HomeFor114Service,BoZhouLoginService,WXPublicCodeService,$location,KyeeUtilsService){

        var def = {
            dealWithUrlParams:function(urlInfo){
                this.setCacheValue(urlInfo);
                var cache = CacheServiceBus.getMemoryCache();
                var urldata = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                var title = "趣医院";
                if(urldata&&urldata.boZhouAppQuickEvaluated&&urldata.boZhouAppQuickEvaluated=="triageMain"){
                    urlInfo=urldata;
                }

                if(!this.isNullObj(urlInfo)){
                    if (urlInfo.userSource == "2") {
                        DeploymentConfig.BRANCH_VER_CODE="02";
                        title = "福建12320掌上医院";
                    }else if(urlInfo.userSource == "3"){
                        title = "亳州市预约挂号平台";
                        if(urlInfo.PublicServiceType=="070000" && ($location.$$path=="/my_health_archive"||$location.$$path=="/triageMain")){
                            DeploymentConfig.BRANCH_VER_CODE = "03";
                            if($location.$$path=="/my_health_archive"){
                                urlInfo.state = "my_health_archive";
                            }
                            if($location.$$path=="/triageMain"){
                                urlInfo.state = "triageMain";
                            }

                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, urlInfo);
                            setTimeout(function(){//兼容我家亳州IOS传参
                                javascript:window.myObject.getUserData('323047ed5a964789b29f66ffdcb9c9b2');
                            }, 500);
                        }
                    }else if(urlInfo.PublicServiceType == "020064" && urlInfo.hospitalID == "5560001"){
                        title = "安庆市第一人民医院";
                    }
                }

                if(urldata && urldata.hospitalID!=undefined && urldata.hospitalID!=''){
                    var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(hospitalInfo && hospitalInfo.id==urldata.hospitalID && hospitalInfo.name!=undefined && hospitalInfo.name!=''){
                        title = hospitalInfo.name;
                    }else if(urldata.PublicServiceType == "020064" && urldata.hospitalID == "5560001"){
                        title = "安庆市第一人民医院";
                    }
                }

                if(urldata && urldata.userSource=="3" && urldata.PublicServiceType=="070000" && urldata.isYsbzWx!=1){
                    if(urldata.isYsbzWx != 1){
                        title = "亳州市医疗服务满意度评价";
                        if(urldata.noLoginAndPatient == "1" && $location.$$path == "/sms_quick_evaluate"){
                            DeploymentConfig.BRANCH_VER_CODE = "03";
                        }
                    }else{
                        title = "亳州市预约挂号平台";
                    }
                }

                document.title = title;
                document.getElementsByName("apple-mobile-web-app-title")[0].content = title;

                def.getWxCode();
            },

            //获取微信公众号参数wx_code  程铄闵
            getWxCode :function(){
                var url = $location.$$absUrl;
                if(url.indexOf("code") == -1){
                    return;
                }
                var headParams = url.substring(url.indexOf("?") + 1, url.indexOf("#"));
                var headData = KyeeUtilsService.parseUrlParams(headParams);
                var lastParams = url.substring(url.lastIndexOf("?") + 1);
                var lastData = KyeeUtilsService.parseUrlParams(lastParams);
                if(lastData && headData && headData.code){
                    if(lastData.PublicServiceType == "020478"){//养生亳州公众号
                        var params = {
                            code:headData.code
                        };
                    }else{
                        if(lastData.hospitalID){
                            var params = {
                                hospitalId:lastData.hospitalID,
                                code:headData.code
                            };
                        }
                    }
                    WXPublicCodeService.getWxOpenId(params);//获取微信公众号参数wx_code 程铄闵 KYEEAPPC-5231
                }

            },

            //判断是否为空对象
            isNullObj: function (obj) {
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        return false;
                    }
                }
                return true;
            },

            //根据分支版本号 赋值USER_SOURCE
            setCacheValue:function(urlInfo){
                CacheServiceBus.getMemoryCache().set('CACHE_CONSTANTS.MEMORY_CACHE.IS_CLOSE_HOSPITAL',false);
                var cache = CacheServiceBus.getMemoryCache();
                var storageCache = CacheServiceBus.getStorageCache();
                var obj = {};

                switch(AppConfig.BRANCH_VERSION){
                    case "01"://114家
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "1");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, "1");
                        break;
                    case "02"://福建12320
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "2");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"040000");
                        break;
                    case "03"://我家亳州
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "3");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"070000");
                        break;
                    case "04"://健康河北
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "4");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"040003");
                        break;
                    case "05"://乐健康
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "5");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"010002");
                        break;
                    case "09"://健康崇州
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "9");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"010003");
                        break;
                    case "10"://健康淄博
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "10");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"040004");
                        break;
                    case "11"://华为小猫当家
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "11");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"010006");
                        break;
                    case "12"://洛阳掌上医院
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "12");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"040005");
                        break;
                    case "22"://聊城市中心医院
                        obj.hospitalFilterEnable="0";
                        obj.hospitalID="6350001";
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "22");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"040006");
                        WXByLongYanService.getWXHospitalInfro(obj);
                        break;
                    case "50"://济宁市第一人民医院
                        obj.hospitalFilterEnable="0";
                        obj.hospitalID="1245";
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, "040002");
                        WXByLongYanService.getWXHospitalInfro(obj);
                        break;
                    case "51"://上海市精神卫生中心(精神科)
                        obj.hospitalFilterEnable="0";
                        obj.hospitalID="210006";
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, "010004");
                        WXByLongYanService.getWXHospitalInfro(obj);
                        break;
                    case "52"://上海市精神卫生中心(心理咨询)
                        obj.hospitalFilterEnable="0";
                        obj.hospitalID="210009";
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, "010005");
                        WXByLongYanService.getWXHospitalInfro(obj);
                        break;
                    case "53"://郑州大学第二附属医院
                        obj.hospitalFilterEnable="0";
                        obj.hospitalID="3710007";
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, "040007");
                        WXByLongYanService.getWXHospitalInfro(obj);
                        break;
                    case "54"://健康马鞍山
                        var storageCityInfo = {
                            PROVINCE_NAME: '安徽',
                            PROVINCE_CODE: '340000',
                            CITY_NAME: '马鞍山市',
                            CITY_CODE: '340500'
                        };
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "4001");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"040009");
                        storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO, storageCityInfo);
                        break;
                    default:
                        //cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "0");
                }

                if(!this.isNullObj(urlInfo)){
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, urlInfo);
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_OPEN_ID, urlInfo.openid);
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE, urlInfo.PublicServiceType);
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, urlInfo.userSource);
                    if(urlInfo.hospitalID!=undefined && urlInfo.hospitalID!=''){//龙岩等微信
                        WXByLongYanService.getWXHospitalInfro(urlInfo);
                    }
                    else if(urlInfo.userSource=="1"){ //114家微信
                        HomeFor114Service.Form114ToRegisterOrLogin(urlInfo.mobile,urlInfo.userid,urlInfo.email,urlInfo['114home'],urlInfo['114homepwd'],urlInfo.PublicServiceType,urlInfo.openid);
                    }
                    else if(urlInfo.client == "PvXziipGPxtrEOQzj5KI9qemNNPK8EQW" && urlInfo.credentials == "QWE4TY8IOPdfghjjlsdfghjklXCVB"){
                        DeploymentConfig.BRANCH_VER_CODE="03";
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE, "3");
                        cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE,"070000");
                        BoZhouLoginService.receiveBoZhouParams(urlInfo);
                    }
                }
            }
        };
        return def;
    })
    .build();
/**
 * 我家亳州-健康档案对接
 * setUserData 暴漏出来我家亳州APP调用
 * @param message  我家亳州返回的加密用户信息
 */
function setUserData(message){
    var cache = angular.element(document.body).injector().get('CacheServiceBus').getMemoryCache();
    var urlInfo= cache.get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
    angular.element(document.body).injector().get('HttpServiceBus').connect({
        url : "/healthAR/action/HealthARAction.jspx",
        params : {
            op : "DesCryptActionC",
            DESC_RESULT:message,
            KEY:"WJBZ#%&1"
        },
        showLoading : false,
        onSuccess : function(data){
            if(data.success){
                var obj=eval("("+data.data+")");
                if(obj["isLogin"]){
                    if(obj["userName"]==""||obj["iDCardNumber"]==""){
                        angular.element(document.body).injector().get('KyeeMessageService').message({
                            title:'提示',
                            content: '请返回完善姓名和身份证号!'
                        });
                    }
                    urlInfo.phoneNumber=obj["phoneNumber"];
                    urlInfo.idCard=obj["iDCardNumber"];
                    urlInfo.name=obj["userName"];
                    var userNo = obj["objectid"];
                    if(userNo == "" || userNo == undefined || userNo == null || userNo == NULL || userNo == 'NULL' || userNo == 'null'){
                        userNo = obj["objectId"];
                    }
                    urlInfo.objectid=userNo;
                   // urlInfo.objectid=obj["objectid"];
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, urlInfo);
                    var url = angular.element(document.body).injector().get('$location').$$absUrl;
                    var headParams = url.substring(url.indexOf("?") + 1, url.indexOf("#"));
                    var urlParamData = angular.element(document.body).injector().get('KyeeUtilsService').parseUrlParams(headParams);
                    angular.element(document.body).injector().get('BoZhouLoginService').receiveBoZhouParams(urlInfo);
                    if(urlParamData && urlParamData.boZhouAppQuickEvaluated == "triageMain"){
                        //angular.element(document.body).injector().get('$state').go("doctor_info",{}, { reload: true });
                        return;
                    }else{
                        angular.element(document.body).injector().get('$state').go("my_health_archive",{}, { reload: true });
                    }
                }else{
                    var url = angular.element(document.body).injector().get('$location').$$absUrl;
                    var headParams = url.substring(url.indexOf("?") + 1, url.indexOf("#"));
                    var urlParamData = angular.element(document.body).injector().get('KyeeUtilsService').parseUrlParams(headParams);
                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, urlInfo);
                    if(urlParamData && urlParamData.boZhouAppQuickEvaluated != "triageMain"){
                        javascript:window.myObject.login();
                    }
                }
            }else{
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, urlInfo);
                angular.element(document.body).injector().get('KyeeMessageService').message({
                    title:'提示',
                    content: '解密失败!'
                });
            }
        }
    });

}
