/**
 * 产品名称：quyiyuan.
 * 创建用户：高玉楼
 * 日期：2015年11月25日10:51:01
 * 创建原因：自动签到服务层
 * 任务号:KYEEAPPC-4067
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.autoSign.service")
    .type("service")
    .name("AppointmentAutoSignService")
    .params(["HttpServiceBus","CacheServiceBus","HospitalService","KyeeUtilsService","KyeeBDMapService","AppointmentRegistDetilService"])
    .action(function (HttpServiceBus,CacheServiceBus,HospitalService,KyeeUtilsService,KyeeBDMapService,AppointmentRegistDetilService) {
        var autoSignService={
            storageCache: CacheServiceBus.getStorageCache(),
            ////自动签到轮循定时器
            //timer:undefined,
            ////自动签到轮循时间，默认是5分钟轮循一次
            //intervalTime:5*60*1000,
            checkUserAndHosiptal:function(hospitalId){
                var memoryCache = CacheServiceBus.getMemoryCache(),
                    userInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                //如果就诊者为空则不能签到
                if(null == userInfo || null == userInfo.USER_VS_ID ||!hospitalId)
                {
                    return false;
                }
                return true;
            },
            /**
             * 获取签到所需的医院参数
             */
            getSignParam:function(hospitalId,onSuccess){
                HospitalService.getParamValueByName(hospitalId, "IS_SIGN,IS_TOHOSPITAL,SIGN_RANGE", function (hospitalPara) {
                    if(null!== hospitalPara.data && '1'===hospitalPara.data.IS_SIGN && '1'===hospitalPara.data.IS_TOHOSPITAL && null!==hospitalPara.data.SIGN_RANGE)
                    {
                        var hospitalLatAndLng = hospitalPara.data.SIGN_RANGE.split('-');
                        if(hospitalLatAndLng.length<2)
                        {
                            return false;
                        }
                        var hosptail1Array = hospitalLatAndLng[0].split(',');
                        var radii = hospitalLatAndLng[1];
                        if(hosptail1Array.length>=2)
                        {
                            onSuccess(hosptail1Array[0],hosptail1Array[1],radii);
                        }

                    }
                });
            },
            getlocation:function(onSuccess){
                //获取IOS中用户所在地理位置的经纬度
                if(window.device && window.device.platform == "iOS"){
                    if(navigator.map&&navigator.map.getLatitudeAndLongtitude)
                    {
                        navigator.map.getLatitudeAndLongtitude(function(retVal){
                            if(retVal&&retVal.Latitude&&retVal.Longtitude)
                            {
                                onSuccess(retVal.Longtitude,retVal.Latitude);
                            }
                        },function(error) {
                            autoSignService.recodeFailSign(2, "未打开定位系统",0,0,0,0);
                        },[]);
                    }
                }
                else if(window.device && window.device.platform == "Android"){
                    KyeeBDMapService.getCurrentPosition(function(retval){
                        if(retval&&retval.latitude&&retval.longitude)
                        {
                            onSuccess(retval.longitude,retval.latitude);
                        }
                    },function(retval) {
                        autoSignService.recodeFailSign(2, "未打开定位系统",0,0,0,0);
                    });
                }
                else {
                    new BMap.Geolocation().getCurrentPosition(function(ralation){
                        onSuccess(ralation.point.lng,ralation.point.lat);
                    });
                }
            },
            sign:function(hospitalId){
                HttpServiceBus.connect({
                    url: "/appoint/action/AppointActionC.jspx",
                    params: {
                        op: "appointSignActionC",
                        HOSPITAL_ID:hospitalId
                    },
                    showLoading: false,
                    onSuccess: function (data) {
                    }
                });
            },
            recodeFailSign :function(failType, failDetail, userLat, userLng, distance, radii) {
                HttpServiceBus.connect({
                    url:"/appoint/action/AppointActionC.jspx",
                    params: {
                        op:"recordAppointSignFailActionC",
                        REG_ID : AppointmentRegistDetilService.RECORD.REG_ID,
                        HOSPITAL_ID : CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                        USER_ID : CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        USER_VS_ID : CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID,
                        FAIL_TYPE : failType,
                        FAIL_DETAIL : failDetail,
                        USER_LAT : userLat,
                        USER_LNG : userLng,
                        DISTANCE : distance,
                        SIGN_RANGE : radii
                    },
                    showLoading: false,
                    onSuccess: function (data) {
                    }
                })
            },
            /**
             * 自动签到
             */
            autoSign:function(hospitalId){
                if(!hospitalId)
                {
                    var hospitalInfo = autoSignService.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(!hospitalInfo){
                        return false;
                    }
                    hospitalId = hospitalInfo.id;
                    //增加医院ID非空判断 KYEEAPPTEST-3189
                    if(!hospitalId){
                        return false;
                    }
                }
                if(autoSignService.checkUserAndHosiptal(hospitalId)){
                    autoSignService.getSignParam(hospitalId,function(lng1,lat1,radii){
                        autoSignService.getlocation(function(userLng,userLat){
                            var distance=autoSignService.getGreatCircleDistance(lat1,lng1,userLat,userLng);
                            if(distance != -1) {
                                if(distance<parseInt(radii)){
                                    autoSignService.sign(hospitalId);
                                } else {
                                    autoSignService.recodeFailSign(3, "不在签到范围内", userLat, userLng,distance, radii);
                                }
                            } else {
                                autoSignService.recodeFailSign(2, "未获取到用户经纬坐标",0,0,0,0);
                            }
                        });
                    });
                }
            },
        //计算两个经纬度之间的距离
        getGreatCircleDistance:function(lat1,lng1,lat2,lng2){
            if((lat2== undefined || lat2 =="" || lat2 == null) || (lng2 == undefined || lng2 =="" || lng2 == null)) {
                return -1;
            }
            //地球半径
            var EARTH_RADIUS = 6378137.0;    //单位M
            var PI = Math.PI;
            var radLat1 = lat1*PI/180.0;
            var radLat2 = lat2*PI/180.0;

            var a = radLat1 - radLat2;
            var b = lng1*PI/180.0 - lng2*PI/180.0;

            var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
            s = s*EARTH_RADIUS;
            s = Math.round(s*10000)/10000.0;

            return s;
        }
        };
        return autoSignService;
    })
    .build();
