/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月6日15:26:27
 * 创建原因：选择科室服务
 * 修改者： 高玉楼
 * 修改任务：KYEEAPPC-3622
 * 修改原因：科室为空处理
 */
new KyeeModule()
    .group("kyee.quyiyuan.triageSelectDept.service")
    .type("service")
    .name("TriageSelectDeptService")
    .params([
        "CacheServiceBus",
        "KyeeMessageService",
        "HttpServiceBus",
        "KyeeI18nService",
        "DiagnosticResultService"
    ])
    .action(function (CacheServiceBus, KyeeMessageService,HttpServiceBus,KyeeI18nService,DiagnosticResultService) {
        var def = {
            /**
             * 查询同城医院数据
             * @param getData 回调
             * @param diseaseName 疾病名称
             * @param deptId   科室编号
             * @param page  当前页数
             * @param showLoading  是否显示数据加载效果
             */
            loadSameCityDeptData:function(getData,diseaseName,diseaseCode,page,showLoading){
                var hospitalData =  CacheServiceBus.getStorageCache().get('hospitalInfo'),
                    cityCode = hospitalData.cityCode,
                    provinceCode = hospitalData.provinceCode;
                var cUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userType = 0;
                if (cUser != null && cUser != undefined) {
                    userType = cUser.USER_TYPE;
                }

                var juniorIds = "";
                //拼装科室ID
                for(var i=0; i<DiagnosticResultService.juniorIds.length;i++){
                    if(i==DiagnosticResultService.juniorIds.length-1){
                        juniorIds = juniorIds + DiagnosticResultService.juniorIds[i];
                    }else{
                        juniorIds = juniorIds + DiagnosticResultService.juniorIds[i]+'|';
                    }
                }

                HttpServiceBus.connect({
                    url: "/triage/action/DeptClassificActionC.jspx",
                    showLoading:showLoading,
                    params: {
                        juniorCode: juniorIds,
                        provinceCode:provinceCode,
                        cityCode:cityCode,
                        userType:userType,
                        diseaseName:diseaseName,
                        diseaseCode:diseaseCode,
                        op:'getSameCityHospitalDepts',
                        page:page,
                        size:10
                    },
                    //begin by gyl 科室查询加10分钟缓存 KYEEAPPC-4269
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    //end by gyl  KYEEAPPC-4269
                    onSuccess: function (data) {
                        if (data.success) {
                            if (data.data.length == 0) {
                                getData(data.data, 1,true);
                            } else {
                                getData(data.data, 1,false);
                            }
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {

                    }
                })
            },
            /**
             * 查询同城，距离我的位置排序
             * @param getData   回调
             * @param diseaseName   疾病名称
             * @param deptId    科室编号
             * @param longitude 我当前位置的经度
             * @param latitude  我当前位置的维度
             * @param page  当前记录页数
             * @param showLoading   是否显示加载效果
             */
            loadNearlayDeptData:function(getData,diseaseName,diseaseCode,deptId,longitude,latitude,page,showLoading){
                var hospitalData =  CacheServiceBus.getStorageCache().get('hospitalInfo'),
                    cityCode = hospitalData.cityCode,
                    provinceCode = hospitalData.provinceCode;
                var cUser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                var userType = 0;
                if (cUser != null && cUser != undefined) {
                    userType = cUser.USER_TYPE;
                }
                var juniorIds = "";
                //拼装科室ID
                for(var i=0; i<DiagnosticResultService.juniorIds.length;i++){
                    if(i==DiagnosticResultService.juniorIds.length-1){
                        juniorIds = juniorIds + DiagnosticResultService.juniorIds[i];
                    }else{
                        juniorIds = juniorIds + DiagnosticResultService.juniorIds[i]+'|';
                    }
                }
                HttpServiceBus.connect({
                    url: "/triage/action/DeptClassificActionC.jspx",
                    showLoading:false,
                    params: {
                        juniorCode: juniorIds,
                        provinceCode:provinceCode,
                        cityCode:cityCode,
                        userType:userType,
                        diseaseName:diseaseName,
                        diseaseCode:diseaseCode,
                        longitude:longitude,
                        latitude:latitude,
                        sortType:'nearby',
                        op:'getSameCityHospitalDepts',
                        page:page,
                        size:10
                    },
                    //begin by gyl 科室查询加10分钟缓存 KYEEAPPC-4269
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    //end by gyl KYEEAPPC-4269
                    onSuccess: function (data) {
                        if(showLoading)
                        {
                            KyeeMessageService.hideLoading();
                        }
                        if (data.success) {
                            if (data.data.length == 0) {
                                getData(data.data, 1,true);
                            } else {
                                getData(data.data,1,false);
                            }
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {
                        if(showLoading)
                        {
                            KyeeMessageService.hideLoading();
                        }

                    }
                })
            },
            //获取经纬度查询附近医院
            loadNearlyDeptData: function (callBack,diseaseName,diseaseNameCode,deptId,page,showLoadding) {
                if (window.device && window.device.platform == "iOS") {
                    this.localCityByIOS(callBack,diseaseName,diseaseNameCode,deptId,page,showLoadding);
                }
                else {
                    this.localCityByBMap(callBack,diseaseName,diseaseNameCode,deptId,page,showLoadding);
                }
            },

            //通过ios地图插件查询
            localCityByIOS: function (callBack,diseaseName,diseaseNameCode,deptId,page,showLoadding) {

                if(navigator.map&&navigator.map.getLatitudeAndLongtitude) {
                    if(showLoadding)
                    {
                        KyeeMessageService.loading({mask:false});
                    }
                    navigator.map.getCityName(
                        function (cityName) {
                            if(cityName)
                            {
                                if(cityName!=CacheServiceBus.getStorageCache().get('hospitalInfo').cityName)
                                {
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get('triageSelectDept.cantSortByDistance','您选中医院所在的城市与您定位的城市不相同，无法按照距离排序。')
                                    });
                                    KyeeMessageService.hideLoading();
                                    return ;
                                }
                                navigator.map.getLatitudeAndLongtitude(function (retVal) {
                                    if (retVal && retVal.Latitude && retVal.Longtitude) {
                                        def.loadNearlayDeptData(callBack,diseaseName,diseaseNameCode,deptId,retVal.Longtitude,retVal.Latitude,page,showLoadding);
                                    }
                                    else {
                                        KyeeMessageService.hideLoading();
                                        KyeeMessageService.broadcast({
                                            content: KyeeI18nService.get('triageSelectDept.getPositionFail','获取地理位置失败'),
                                            duration:60000
                                        });
                                    }
                                }, function () {
                                    KyeeMessageService.hideLoading();
                                    KyeeMessageService.broadcast({
                                        content: KyeeI18nService.get('triageSelectDept.getPositionFail','获取地理位置失败'),
                                        duration: 3000
                                    });
                                }, []);
                            }
                        }
                    );

                }
            },
            /**
             * 通过内置百度地图定位附近医院
             */
            localCityByBMap: function (callBack,diseaseName,diseaseNameCode,deptId,page,showLoadding) {
                var geolocation = new BMap.Geolocation();
                if(showLoadding)
                {
                    KyeeMessageService.loading({mask : false});
                }
                geolocation.getCurrentPosition(function (r) {

                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {

                        var myGeo = new BMap.Geocoder();

                        myGeo.getLocation(new BMap.Point(r.point.lng, r.point.lat), function (rs) {
                            var cityName = rs.addressComponents.city;
                            if(cityName!=CacheServiceBus.getStorageCache().get('hospitalInfo').cityName)
                            {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get('triageSelectDept.cantSortByDistance','您选中医院所在的城市与您定位的城市不相同，无法按照距离排序。')
                                });
                                KyeeMessageService.hideLoading();
                                return ;
                            }
                            if (r.point.lat == undefined || r.point.lat == null || r.point.lat == '' || r.point.lng == undefined || r.point.lng == null || r.point.lng == '') {
                                KyeeMessageService.hideLoading();
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get('triageSelectDept.getPositionFail','获取地理位置失败'),
                                    duration: 3000
                                });
                            }
                            else {
                                def.loadNearlayDeptData(callBack,diseaseName,diseaseNameCode,deptId,r.point.lng,r.point.lat,page,showLoadding);
                            }
                        });
                    }
                });
            }
        };

        return def;
    })
    .build();