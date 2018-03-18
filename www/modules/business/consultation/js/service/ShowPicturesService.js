/**
 * 产品名称 quyiyuan
 * 创建用户: 张毅
 * 日期: 2017/04/25
 * 创建原因：图文问诊补充信息页面service
 * 修改原因：
 * 修改用户：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.show_pictures.service")
    .require([])
    .type("service")
    .name("ShowPicturesService")
    .params([])
    .action(function() {
        var def = {
            ACTIVESLIDE:0, //页面初始时展示的图片
            IMGLIST:[] //页面展示的图片list
        };
        return def;
    })
    .build();