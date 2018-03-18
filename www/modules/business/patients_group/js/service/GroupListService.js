/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/28
 * 创建原因：群组服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.group_list.service")
    .require([
    ])
    .type("service")
    .name("GroupListService")
    .params([
        "$state",
        "KyeeMessageService",
        "HttpServiceBus",
        "CacheServiceBus",
        "KyeeI18nService",
        "HospitalSelectorService",
        "MultipleQueryCityService"
    ])
    .action(function($state,KyeeMessageService,HttpServiceBus,CacheServiceBus,
                     KyeeI18nService,HospitalSelectorService,MultipleQueryCityService){
        var def = {
            memoryCache: CacheServiceBus.getMemoryCache(), //获取存储
            storageCache: CacheServiceBus.getStorageCache(),
            recommendGroupsParams: {}, // 推荐群组的医院科室参数
            groupInfo: {
                groupId: "",//群组ID
                groupName: "", //群组名称
                // groupType: 0,//群组类型
                doctorList: 0, //医生成员列表
                patientList: 0, //患者成员列表
                groupMembers: [], //群成员个数
                isInGroup: 0 // 当前用户是否已加入该群组
            },

            /**
             * 获取用户的群组列表
             * @param userId
             * @param callback
             */
            getGroupListData: function(userId,callback){
                HttpServiceBus.connect({
                    url: 'third:groupmanage/groupListByUser',
                    params:{
                        userId: userId
                    },
                    onSuccess: function (retVal) {
                        if (retVal) {
                            var success = retVal.success;
                            var message = retVal.message;
                            if (success) {
                                callback && callback(retVal.data);
                            }else{
                                KyeeMessageService.broadcast({
                                    content: message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                    duration: 2000
                                });
                            }
                        }
                    }
                });
            },

            /**
             * 配合后台修改：前台新增获取除用户外，其他个人群组列表
             * @param userId
             * @param callback
             * add by wyn 20161121
             */
            getGroupListDataByUserId: function(userId,callback){
                HttpServiceBus.connect({
                    url: 'third:groupmanage/groupListByUserId',
                    params:{
                        userId: userId
                    },
                    onSuccess: function (retVal) {
                        if (retVal) {
                            var success = retVal.success;
                            var message = retVal.message;
                            if (success) {
                                var groupListData = retVal.data;
                                callback && callback(groupListData);
                            } else {
                                KyeeMessageService.broadcast({
                                    content: message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                    duration: 2000
                                });
                            }
                        }
                    }
                });
            },


            /**
             * 搜索群成员
             * @param keywords
             * @returns {Array}
             */
            searchGroupMember: function(keywords){
                var result = {
                    doctorList:[],
                    patientList:[]
                };
                if(def.groupInfo.doctorList.length > 0){
                    for(var i=0,j=def.groupInfo.doctorList.length; i<j; i++){
                        var name = def.groupInfo.doctorList[i].doctorName;
                        if(name && name.indexOf(keywords) >= 0) {
                            var member = angular.copy(def.groupInfo.doctorList[i]);
                            member.doctorName = member.doctorName.replace(new RegExp(keywords,"g"),'<font class="qy-green">'+keywords+'</font>');
                            result.doctorList.push(member);
                        }
                    }
                }
                if(def.groupInfo.patientList.length > 0){
                    for(var i=0 ; i<def.groupInfo.patientList.length; i++){
                        var showFlag = false;
                        var patientItems = def.groupInfo.patientList[i].items;
                        var showPatientItems = [];
                        for(var j=0 ; j<patientItems.length ; j++){
                            var name = patientItems[j].groupPetname;
                            if(name && name.indexOf(keywords) >= 0){
                                showFlag = true;
                                var member = angular.copy(patientItems[j]);
                                member.groupPetname = member.groupPetname.replace(new RegExp(keywords,"g"),'<font class="qy-green">'+keywords+'</font>');
                                showPatientItems.push(member);
                            }
                        }
                        if(showFlag){
                            var patientGroup = {
                                "showText":def.groupInfo.patientList[i].showText,
                                "items":showPatientItems
                            }
                            result.patientList.push(patientGroup);
                        }
                    }
                }
                return result;
            },

            /**
             * 选择医院科室
             */
            selectHospitalDept: function(){
                //如果没选城市，则先选择城市，否则选择医院
                var selected = def.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
                //标识从病友圈群推荐进入
                HospitalSelectorService.isFindGroupByHospital = true; //edited by zhangyi at 20161121 for KYEEAPPC-8731 : 整合isFromPatientsGroup和goToPatientsGroup控制变量到isFindGroupByHospital中
                if(selected){
                    $state.go("hospital_selector");
                } else {
                    MultipleQueryCityService.goState = "hospital_selector";
                    $state.go('multiple_city_list');
                }
            },

            /**
             * 通过医院科室找群组
             * @param params
             * @param callback
             */
            getGroupByHospitalDept: function(params, callback){
                HttpServiceBus.connect({
                    url: "third:groupmanage/queryGroup",
                    params: params,
                    onSuccess: function(data){
                        if(data.success){
                            callback && callback(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            },

            /**
             * 通过地区推荐群组
             * @param params
             * @param callback
             */
            getRecommendGroup: function(params, callback){
                HttpServiceBus.connect({
                    url: "third:/groupmanage/recommendGroup",
                    params: params,
                    onSuccess: function(data){
                        if(data.success){
                            callback(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message || KyeeI18nService.get("commonText.networkErrorMsg", "网络异常，请稍后重试！"),
                                duration: 2000
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();