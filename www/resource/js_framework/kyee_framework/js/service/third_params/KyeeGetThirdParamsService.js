/**
 * 产品名称 KYMH
 * 创建用户: 邵鹏辉
 * 日期: 2015/6/5
 * 时间: 11:05
 * 创建原因：获取第三方参数
 * 修改原因：
 * 修改时间：
 */
angular
    .module("kyee.framework.service.third_params", [])
    .factory("KyeeGetThirdParamsService",  function() {

        return {

            getParams : function(success, error) {

                if (navigator.getparams != undefined) {

                    return navigator.getparams.getParams(success, error);
                }

                return null;
            }
        };
    });
