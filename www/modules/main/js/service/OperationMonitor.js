/**
 * 用户操作记录委托器
 */
new KyeeModule()
    .group("kyee.quyiyuan.operation_monitor.service")
    .type("service")
    .name("OperationMonitor")
    .params(["$state", "CacheServiceBus", "HttpServiceBus", "KyeeUtilsService"])
    .action(function($state, CacheServiceBus, HttpServiceBus, KyeeUtilsService){

        var def = {

            storageCache : CacheServiceBus.getStorageCache(),
            memoryCache : CacheServiceBus.getMemoryCache(),
            //存储操作记录的缓存名字
            recordsKey : CACHE_CONSTANTS.STORAGE_CACHE.USER_OPERATION_RECORDS,
            //发送阈值，超过阈值向服务器发送记录
            storageMaxLength: 5,

            /**
             * 记录用户的单次点击操作
             * @param elementCode
             * @param pageCode
             * @param immediate 是否立即发送操作记录
             *        保险相关操作需立即发送记录，为true
             */
            record : function(elementCode, pageCode, immediate){

                var me = this;

                setTimeout(
                    function(){

                        //获取记录数据
                        if(!pageCode){
                            pageCode =$state.current.name;
                        }

                        var record = {
                            "PAGE_CODE": pageCode,
                            "ELEMENT_CODE": elementCode,
                            "OPERATE_TIME": KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD HH:mm:ss")
                        };

                        //设置用户标记
                        var userInfo = me.memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                        if(userInfo){
                            record.USER_ID = userInfo.USER_ID;
                        } else {
                            record.UUID = me.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.APP_UUID);
                        }

                        var hospitalInfo = me.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                        if(hospitalInfo) {
                            record.HOSPITAL_ID = hospitalInfo.id;
                        }

                        //保存记录数据
                        var opRecords = me.storageCache.get(me.recordsKey);
                        if(!opRecords){
                            opRecords = [];
                        }
                        opRecords.push(record);

                        //发送记录数据
                        if(immediate || opRecords.length >= me.storageMaxLength){
                            me.storageCache.set(me.recordsKey, []);
                            me._sendOperationRecords(opRecords);
                        } else {
                            me.storageCache.set(me.recordsKey, opRecords);
                        }
                    }, 10
                );

                return false;
            },

            /**
             * 发送操作记录
             * @param opRecords
             */
            _sendOperationRecords : function (opRecords) {
                // 延迟3秒向后台发送操作记录
                setTimeout(
                    function(){
                        HttpServiceBus.connect({
                            type: "POST",
                            url : "/CloudManagement/operation/action/OperationRecordsActionC.jspx?",
                            showLoading: false,
                            params : {
                                op: "monitorRecords",
                                monitorRecords : opRecords
                            }
                        });
                    },
                    3000);
            },

            /**
             * 程序初始化的时候发送上一次剩余的操作记录
             */
            sendOperationRecordsOnStartUp : function () {

                var me = this;
                var opRecords = me.storageCache.get(me.recordsKey);
                if(opRecords && opRecords.length > 0){
                    me.storageCache.set(me.recordsKey, []);
                    me._sendOperationRecords(opRecords);
                }
            }
        };

        return def;
    })
    .build();