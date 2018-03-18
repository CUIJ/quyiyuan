/**
 * 产品名称：quyiyuan
 * 创建者：田新
 * 创建时间： 2015/4/30
 * 创建原因：Rsa加密的service
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.login.rsautil.service")
    .require([
    ])
    .type("service")
    .name("RsaUtilService")
    .params([
    ])
    .action(function(){
        var def = {
            key : {},
            //加密
            getRsaResult : function (pwd)
            {
                var maxDigits = 130;
                setMaxDigits(maxDigits);
                //第一个参数为加密指数、第二个参数为解密参数、第三个参数为加密系数
                var e = "10001";
                var n = "93b2b4a59fe63cdc1a65c6e006d2a710de3d8bcfe93cb601f1af2c49946b80dfa1e607195b0ee8969e24544153fc12b84acdfbba53949f0a0d6c6f665dce4c37";
                var key = new RSAKeyPair(e, '', n);
                var result=encryptedString(key, pwd);
                return result;
            },
            //解密
            getRsaDecodeResult : function(pwd){
                var maxDigits = 130;
                setMaxDigits(maxDigits);
                //第一个参数为加密指数、第二个参数为解密参数、第三个参数为加密系数
                var e = "10001";
                var n = "93b2b4a59fe63cdc1a65c6e006d2a710de3d8bcfe93cb601f1af2c49946b80dfa1e607195b0ee8969e24544153fc12b84acdfbba53949f0a0d6c6f665dce4c37";
                var key = new RSAKeyPair(e, '', n);
                var result = decryptedString(key, pwd);
                return result;
            }
        };
        return def;
    })
    .build();
