/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年8月7日14:48:23
 * 创建原因：显示html标签服务层
 * 任务号：KYEEAPPC-2965
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.show_html.service")
    .require([])
    .type("service")
    .name("ShowHtmlService")
    .params([])
    .action(function () {

        var def = {
            messageHtml: '',
            //页面标题
            title: '',
            buttoText:'',
            jumpRouter:''
        };

        return def;
    })
    .build();
