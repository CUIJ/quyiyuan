/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月25日16:26:48
 * 创建原因：医生主页服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.home.service")
    .require([])
    .type("service")
    .name("DoctorHomeService")
    .params(["HttpServiceBus", "CacheServiceBus","KyeeI18nService"])
    .action(function(HttpServiceBus, CacheServiceBus,KyeeI18nService){

        var def = {

            /**
             * 查询医生首页菜单列表数据
             */
            queryDoctorMenuList : function(onSuccess){

                var currentHospitalId = CacheServiceBus.getStorageCache().
                    get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

                    HttpServiceBus.connect({
                    url: "/AppModuleManage/action/AppModuleManageActionC.jspx",
                    params: {
                        USER_ROLE: "1",
                        op: "getModuleTOAPP",
                        hospitalID : currentHospitalId
                    },
                    showLoading : false,
                    onSuccess: function (_data) {
                        //模块排序
                        _data.data = _data.data.sort(function(a, b){
                            return a.MODULE_ORDER - b.MODULE_ORDER;
                        });

                        //处理首页菜单列表数据
                        var menuList = [];
                        for(var i in _data.data){

                            var module = _data.data[i];
                            var visible = module.IS_VISIBLE;
                            var moduleMetaData = DOCTOR_DATA.homeMenuListData[module.MODULE_CODE];

                            if(visible == 0){
                                continue;
                            }

                            if(!moduleMetaData){
                                continue;
                            }

                            var name = module.MODULE_NAME;
                            var enable = module.IS_ENABLE;
                            var disableInfo = module.DISABLEINFO;

                            menuList.push({
                                name : KyeeI18nService.get(moduleMetaData.name_key, moduleMetaData.name),
                                description: KyeeI18nService.get(moduleMetaData.description_key, moduleMetaData.description),
                                image_url : moduleMetaData.image_url,
                                href : moduleMetaData.href,
                                enable : enable,
                                disableInfo : disableInfo
                            });
                        }

                        var doctorData = {
                            hospitalId: def.currentHospitalId,
                            data: menuList
                        };
                        //存储首页菜单列表数据
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.DOCTOR_MENUS_DATA, doctorData);

                        onSuccess(menuList);
                    }
                });
            },

            /**
             * 获取医生首页菜单数据
             * @param onSuccess
             */
            getDoctorMenuList: function (onSuccess) {

                var currentHospitalId = CacheServiceBus.getStorageCache().
                    get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

                var menuListData = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA);
                if(menuListData && menuListData.hospitalId == currentHospitalId){
                    onSuccess(menuListData.data);
                } else {
                    this.queryDoctorMenuList(function (data) {
                        onSuccess(data);
                    });
                }
            }
        }

        return def;
    })
    .build();
