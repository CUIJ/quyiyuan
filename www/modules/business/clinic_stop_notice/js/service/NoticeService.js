/*
 * 产品名称：quyiyuan
 * 创建人: 田新
 * 创建日期:2015年9月7日10:15:00
 * 创建原因：停诊通知业务逻辑层
 */
new KyeeModule()
    .group("kyee.quyiyuan.notice.service")
    .require([])
    .type("service")
    .name("NoticeService")
    .params([
        "HttpServiceBus"
    ])
    .action(function (HttpServiceBus) {
        var def = {
            getAllNotices : function(type,callBack){
                //start KYEEAPPTEST-3202  医院停诊界面下拉刷新出现两个加载提示框 wangwan
                if(type=='1'){
                    var showLoad =false;
                }else{
                    var showLoad =true;
                }
                //end KYEEAPPTEST-3202  医院停诊界面下拉刷新出现两个加载提示框 wangwan
                HttpServiceBus.connect({
                    url: '/appoint/action/AppointActionC.jspx',
                    params: {
                        op: 'queryStoppingNoticeActionC'
                    },
                    showLoading: showLoad,
                    onSuccess: function (resp) {
                        callBack(resp);
                    }
                });
            }
        };
        return def;
    })
    .build();

