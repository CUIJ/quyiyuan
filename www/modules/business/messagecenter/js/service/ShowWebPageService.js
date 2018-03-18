/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年8月7日14:26:48
 * 创建原因：显示网页服务层
 * 任务号：KYEEAPPC-2965
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.show_web_page.service")
    .require([])
    .type("service")
    .name("ShowWebPageService")
    .params([])
    .action(function () {

        var def = {
            url: '',
            //页面标题
            title: '',
            buttoText:'',
            jumpRouter:''
        };

        return def;
    })
    .build();
