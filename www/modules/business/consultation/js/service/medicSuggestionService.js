new KyeeModule()
    .group("kyee.quyiyuan.consultation.medicSuggestion.service")
    .require([])
    .type("service")
    .name("medicSuggestionService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {
        var def = {
            consultOrderID:"",
            /*用药频率枚举*/
            frequencyEnum:[
                {code:'always', name :'总是'}, {code:'bid', name :'2次/天'},
                {code:'once', name :'一次'}, {code:'prn', name :'必要时'},
                {code:'q12h', name :'1次/12小时'}, {code:'q15d', name :'15天/次'},
                {code:'q2h', name :'1次/2小时'}, {code:'q30d', name :'30天/次'},
                {code:'q3d', name :'3天/次'}, {code:'q4d', name :'4天/次'},
                {code:'q4h', name :'1次/4小时'}, {code:'q5d', name :'q5d'},
                {code:'q6d', name :'6天/次'}, {code:'q6h', name :'1次/6小时'},
                {code:'q7d', name :'7天/次'},{code:'q8h', name :'1次/8小时'},
                {code:'qd', name :'1次/天'}, {code:'qh', name :'1次/小时'},
                {code:'qid', name :'4次/天'}, {code:'qn', name :'1次/晚'},
                {code:'qod', name :'隔日1次'}, {code:'sos', name :'需要时'},
                {code:'st', name :'马上'}, {code:'tid', name :'3次/天'},
                {code:'tiw', name :'3次/周'}
            ],
            /*
             * 查询用药提醒
             */
            queryMedicSuggestion: function (showLoading,onSuccess, onError) {
                var me = this;
                HttpServiceBus.connect({
                    type: "POST",
                    url: "third:pay_consult/getMedicSuggestion",
                    params: {
                        scConsultId: def.consultOrderID
                    },
                    showLoading:showLoading,
                    onSuccess: function (resp) {
                        if(resp.success){

                            typeof onSuccess === "function" && onSuccess(resp);
                        }else{

                            KyeeMessageService.broadcast({
                                content: resp.message,
                                duration: 2000
                            });
                        }
                    },
                    onError: function (resp) {
                        KyeeMessageService.broadcast({
                            content: resp.message,
                            duration: 2000
                        });
                        typeof onError ==="function" && onError(resp);
                    }
                });
            }
        };
        return def;
    })
    .build();
