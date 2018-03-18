new KyeeModule()
    .group("kyee.quyiyuan.hospital.hospital_detail.service")
    .type("service")
    .name("HospitalDetailService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function(HttpServiceBus, KyeeMessageService){

        var def = {

            /**
             * 加载医院详情
             *
             * @param hospitalId
             * @param advId
             * @param onSuccess
             */
            loadHospitalDetail : function(hospitalId, advId, onSuccess){

                HttpServiceBus.connect({
                    url : "/advertisement/action/AdvappActionC.jspx",
                    params : {
                        hospitalId : hospitalId,
                        ADV_ID : advId,
                        op : "queryAdvInfo"
                    },
                    cache : {
                        by : "TIME",
                        value : 60
                    },
                    onSuccess : function(data){
                        if(data.success){
                            onSuccess(data.data[0]);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    }
                });
            },
            //add by huabo KYEEAPPC-4436 查询医院介绍详情
            loadHospitalIntroduce : function(hospitalId, onSuccess){

                HttpServiceBus.connect({
                    url : "/advertisement/action/AdvappActionC.jspx",
                    params : {
                        hospitalId : hospitalId,
                        op : "queryHospitalIntroduceActionC"
                    },
                    cache : {
                        by : "TIME",
                        value : 60
                    },
                    onSuccess : function(data){
                        onSuccess(data.data);
                    }
                });
            }
        };

        return def;
    })
    .build();