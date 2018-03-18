/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医患互动选择医生页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.doctorSelect.service")
    .type("service")
    .name("DoctorSelectService")
    .params(["HttpServiceBus", "CacheServiceBus"])
    .action(function(HttpServiceBus, CacheServiceBus){

        var def = {
            /**
             * 查询可互动的医生记录
             */
            queryDoctorList : function(onSuccess){
                var me = this;
                HttpServiceBus.connect({
                    url : "/patientwords/action/PatientWordsActionC.jspx",
                    params : {
                        op: "querydoctorbyregeist",
                        hospitalId: CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
                        userId: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                        userVsId: CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID
                    },
                    onSuccess : function (resp) {

                        if(!resp.success){
                            onSuccess([]);
                            return;
                        }

                        if(!resp.data.rows){
                            return;
                        }
                        var data = me.makePicPath(resp.data.rows);
                        onSuccess(data);
                    }
                });
            },
            /**
             * 重新转换图片路径
             * @param data
             * @returns {*}
             */
            makePicPath: function (data) {
                for(var index = 0; index < data.length; index++){
                    if(data[index].DOCTOR_PIC_PATH){
                        if(data[index].DOCTOR_PIC_PATH.substring(0,7) != 'http://'){
                            data[index].DOCTOR_PIC_PATH = AppConfig.SERVER_URL + data[index].DOCTOR_PIC_PATH;
                        }
                    } else {
                        //data[index].DOCTOR_PIC_PATH = "/resource/images/icons/headh.png";
                        data[index].DOCTOR_PIC_PATH = "/resource/images/base/head_default_man.jpg";
                    }
                }
                return data;
            }
        };
        return def;
    })
    .build();
