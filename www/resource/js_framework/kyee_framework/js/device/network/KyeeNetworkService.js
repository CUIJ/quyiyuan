/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/27
 * 时间: 10:54
 * 创建原因：网络相关的服务
 * 修改原因：
 * 修改时间：
 */
angular
    .module("kyee.framework.device.network", [])
    .factory("KyeeNetworkService",  function() {

        return {
            /**
             *获取网络状态，实时监测网络连接
             *
             * @param success
             * @param error
             */
            getInfo:function(success, error) {

                if (navigator.connection != undefined) {

                    navigator.connection.getInfo(success, error);
                }
            },
            /**
             *获取网络连接状态
             *
             * @returns {boolean}
             */
            isNetConnected:function(){

                var isConnected = false;

                if (navigator.connection != undefined
                    && navigator.connection.type !== "none"
                    && navigator.connection.type !== "unknown") {

                    isConnected = true;
                }

                return isConnected;
            },
            /**
             *
             * 获取网络类型
             * @returns {string}
             *
             *  Connection.UNKNOWN
             *  Connection.ETHERNET
             *  Connection.WIFI
             *  Connection.CELL_2G
             *  Connection.CELL_3G
             *  Connection.CELL_4G
             *  Connection.CELL
             *  Connection.NONE
             */
            getNetType:function() {

                var netType = "none";

                if (navigator.connection != undefined) {

                    netType = navigator.connection.type;
                }

                return netType;
            }
        };
    });