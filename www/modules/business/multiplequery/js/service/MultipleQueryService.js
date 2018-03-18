/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月12日20:06:25
 * 创建原因：模糊搜索页面服务
 * 修改人：高玉楼
 * 修改任务：KYEEAPPC-3622
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.multiplequery.service")
    .require([])
    .type("service")
    .name("MultipleQueryService")
    .params(["HttpServiceBus", "KyeeMessageService","KyeeI18nService","$ionicHistory","CacheServiceBus"])
    .action(function(HttpServiceBus, KyeeMessageService,KyeeI18nService,$ionicHistory,CacheServiceBus){

        var def = {
            historyStack:[],
            resultData:{
                hospitalData:[],
                deptData:[],
                doctorData:[],
                diseaseData:[],
                RESULT_TYPE:3
            },
            currentHosData:{
                doctorData:[],
                deptData:[]
            },
            //修改导航站历史，解决从其他页面跳到搜索页面的路由问题  By 杜巍巍
            ChangeRouter:function(curRouter,nextRouter){
                var historyId = $ionicHistory.currentHistoryId();
                var viewHistory = $ionicHistory.viewHistory().histories[historyId].stack;
                //修改ionic导航历史
                for (var i = 0; i < viewHistory.length; i++) {
                    if (viewHistory[i].stateId == curRouter) {
                        viewHistory[i].stateId = nextRouter;
                        viewHistory[i].stateName = nextRouter;
                        break;
                    }
                }
            },

            keyWords:{keyWordsValue: ""},
            /**
             * 查询关注信息接口
             */
            allMetipleInfo:[],
            queryCareInfo : function(userVsId, onSuccess){
                HttpServiceBus.connect({
                    url : "/multipleQuery/action/MultipleQueryActionC.jspx",
                    params : {
                        op: "queryCareInfo",
                        USER_VS_ID: userVsId
                    },
                    onSuccess : function (resp) {
                        if(!resp.data.rows){
                            return;
                        }
                        onSuccess(resp.data.rows);
                    }
                });
            },
            /**
             * 检索信息接口
             */
            queryMultipleInfo : function(userType, cityCode, cityName, keyWords, onSuccess){
                HttpServiceBus.connect({
                    url : "/multipleQuery/action/MultipleQueryActionC.jspx",
                    params : {
                        op: "queryMultipleInfo",
                        CITY_CODE: cityCode,
                        CITY_NAME: cityName,
                        KEY_WORDS: keyWords,
                        USER_TYPE: userType
                    },
                    //KYEEAPPC-4270 为查询添加缓存60秒
                    cache : {
                        by : "TIME",
                        value : 60
                    },
                    onSuccess : function (resp) {
                        if(!resp.success)
                        {
                            KyeeMessageService.message({
                                //主页搜索模块国际化改造  By  杜巍巍    KYEEAPPC-3927
                                title: KyeeI18nService.get("multiple_query.reminder","提示"),
                                content: resp.message
                            });
                        }
                        else{
                            //个性化处理过滤部分医院
                            var memoryCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getMemoryCache();
                            var userSource=memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                            if(userSource == "4001"){
                                var data=resp.data.rows;
                                var array=[];
                                for(var i=0;i<data.length;i++){
                                    if(data[i].CITY_CODE=="340500"){//马鞍山市
                                        array.push(data[i]);
                                    }
                                }
                                onSuccess(def.formatResult(keyWords,array));
                            }else{
                                onSuccess(def.formatResult(keyWords,resp.data.rows));
                            }

                        }
                    }
                });
            },
            /**
             * 格式化搜索结果
             * 任务 ：KYEEAPPC-4309
             * @param keyWords
             * @param data
             * @returns {def.resultData|{hospitalData, deptData, doctorData, diseaseData, RESULT_TYPE}}
             */
            formatResult:function(keyWords,data){
                /**
                 * 所有结果
                 * @type {{hospitalData: Array,     搜索到的医院数据
                 * deptData: Array, 搜索到的科室数据
                 * doctorData: Array,   搜索到的医生数据
                 * disease: Array}} 搜索到的疾病数据
                 */
                def.resultData = {
                    hospitalData:[],
                    deptData:[],
                    doctorData:[],
                    diseaseData:[],
                    RESULT_TYPE:3
                };
                def.currentHosData = {
                    doctorData:[],
                    deptData:[]
                };
                if(data.length)
                {
                    def.resultData.RESULT_TYPE = data[0].RESULT_TYPE;
                }
                var storageCache = CacheServiceBus.getStorageCache();
                var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var currentHosId = "";
                if(hospitalInfo &&　hospitalInfo.id){
                    currentHosId = hospitalInfo.id;
                }

                for(var i=0;i<data.length;i++)
                {
                    var record = data[i];
                    var PARTI_CIPLES_KEYS = record.PARTI_CIPLES_KEYS;

                    switch(record.INFO_TYPE)
                    {
                        //医院数据
                        case '1':
                            record.showText = record.HOSPITAL_NAME;
                            break;
                        case '2':
                            //医生数据
                            record.showText = record.DOCTOR_NAME;
                            break;
                        //科室数据
                        case '3':
                            record.showText = record.DEPT_NAME;
                            break;
                        case '4':
                            record.showText = record.DISEASE_NAME.replace(new RegExp(keyWords,"g"),'<font class="qy-red">'+keyWords+'</font>');

                        default :
                            break;
                    }
                    if(PARTI_CIPLES_KEYS){
                        for(var j = 0; j<PARTI_CIPLES_KEYS.length;j++){
                            var ciplesKeyWord = PARTI_CIPLES_KEYS[j];
                            if("g" != ciplesKeyWord && "$"!= ciplesKeyWord){
                                record.showText =  record.showText.replace(new RegExp(ciplesKeyWord,"g"),'@'+ciplesKeyWord+'$');
                            }
                        }
                        record.showText = record.showText.replace(new RegExp("@","g"),'<font class="qy-red">');
                        record.showText = record.showText.replace(new RegExp("\\$","g"),'</font>');
                    }

                    switch(record.INFO_TYPE)
                    {
                        //医院数据
                        case '1':
                            def.resultData.hospitalData.push(record);
                            break;
                        case '2':
                            //医生数据

                            if(currentHosId && currentHosId != ""){
                               if(record &&　record.HOSPITAL_ID　&&　record.HOSPITAL_ID == currentHosId){
                                     def.currentHosData.doctorData.push(record);
                               }else{
                                   def.resultData.doctorData.push(record);
                               }
                            }else{
                                def.resultData.doctorData.push(record);
                            }
                            break;
                        //科室数据
                        case '3':

                            if(currentHosId && currentHosId != ""){
                                if(record &&　record.HOSPITAL_ID　&&　record.HOSPITAL_ID == currentHosId){
                                    def.currentHosData.deptData.push(record);
                                }else{
                                    def.resultData.deptData.push(record);
                                }
                            }else{
                                def.resultData.deptData.push(record);
                            }
                            break;
                        //疾病数据
                        case '4':
                            def.resultData.diseaseData.push(record);
                            break;
                        default :
                            break;
                    }

                }
                return def.resultData;
            },
            /**
             * 更新热度信息接口
             */
            saveSearchHotInfo : function(infoMappingId, infoType, cityId){
                HttpServiceBus.connect({
                    url : "/multipleQuery/action/MultipleQueryActionC.jspx",
                    showLoading: false,
                    params : {
                        op: "saveSearchHotInfo",
                        INFO_MAPPING_ID: infoMappingId,
                        INFO_TYPE: infoType,
                        CITY_ID: cityId
                    }
                });
            },
            /**
             * 更新热词信息
             * @param keyWord
             */
            saveSearchKeyWord:function(keyWord){
                 HttpServiceBus.connect({
                    url : "/multipleQuery/action/MultipleQueryActionC.jspx",
                    showLoading: false,
                    params : {
                        op: "saveSearchKeyWord",
                        KEY_WORDS: keyWord
                    }
                });
            },

            //统计进入模块次数  By  章剑飞  KYEEAPPC-4536  2015年12月14日15:54:38
            enterSearch : function(){
                HttpServiceBus.connect({
                    url : "/multipleQuery/action/MultipleQueryActionC.jspx",
                    params: {
                        op: "enterSearch"
                    },
                    showLoading: false,
                    onSuccess: function (data) {
                    }
                });
            }
        };

        return def;
    })
    .build();
