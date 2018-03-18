/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：md5加密的service
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.md5util.service")
    .require([
    ])
    .type("service")
    .name("Md5UtilService")
    .params(["KyeeUtilsService"])
    .action(function(KyeeUtilsService){
        var def = {
            md5: function (string) {
                return KyeeUtilsService.SecurityUtils.md5(string);
            }
        };
        return def;
    })
    .build();
