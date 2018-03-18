/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：支行页面服务层
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.rebateBankBranch.service")
    .require([
        "kyee.quyiyuan.service_bus.http",
        "kyee.quyiyuan.rebate.editBankCardMsg.service",
        "kyee.framework.service.message"
    ])
    .type("service")
    .name("RebateBankBranchService")
    .params(["HttpServiceBus","$state","EditBankCardMsgService","KyeeMessageService","KyeeI18nService"])
    .action(function(HttpServiceBus,$state,EditBankCardMsgService,KyeeMessageService,KyeeI18nService){

        var def = {

            pagedata:{
                bankCode:'',
                cityCode:'',
                BANK_UNION_CODE:'',
                BANK_BRANCH_NAME:''
            },

            initView:function(initViewCallbackFunc){
                var me = this;
                var pagedata = EditBankCardMsgService.getPagedata();
                this.pagedata.bankCode = pagedata.bankCode;
                this.pagedata.cityCode = pagedata.cityCode;
                HttpServiceBus.connect({
                   url:'freeRgtPay/action/freeRgtPayActionC.jspx',
                   params: {
                       BANK_CODE:me.pagedata.bankCode,
                       BANK_CITY_CODE:me.pagedata.cityCode,
                       op:'getBankBranchinfo'
                   },
                   onSuccess: function (result) {
                       //zwh
                       if (result.success) {
                           initViewCallbackFunc(result.data);
                       }else{
                           KyeeMessageService.message({
                               title: KyeeI18nService.get('commonText.sysTipsMsg','系统提示',null),
                               content: result.message
                           });
                       }
                       //if (records.success) {
                           //if(records.data.length>0){
                           //}else{
                               //showPrompts.showNoDataPrompt('目前没有该支行信息');
                           //}
                       //}else{
                       //    if(records.message != null && records != undefined){
                       //        KyeeMessageService.message({
                       //            title:'系统提示',
                       //            content:records.message
                       //        });
                       //    }
                       //}
                   }
               });
            },
            onBranchListTap:function(record){
                this.pagedata.BANK_UNION_CODE = record.BANK_UNION_CODE;
                this.pagedata.BANK_BRANCH_NAME = record.BANK_BRANCH_NAME;
                EditBankCardMsgService.revertView(this.pagedata);
                //还原pagedata
                this.pagedata = {
                    bankCode:'',
                    cityCode:'',
                    BANK_UNION_CODE:'',
                    BANK_BRANCH_NAME:''
                };
                $state.go('editBankCardMsg');
            }
        };
        return def;
    })
    .build();
