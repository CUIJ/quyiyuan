/**
 * 提供百度地图定位导航功能
 */
angular
    .module("kyee.framework.service.baidumap", [])
    .factory("KyeeBDMapService", function(){
		
        return{

            /**
             * 获取用户所在地理位置的经纬度
             * 成功回调返回参数：location 对象
             *location.latitude   纬度
             *location.longitude  经度
             *location.city       当前城市名称
             *location.cityCode   当前城市编码
             *location.province   当前省份名称
             *location.addr       当前地理位置信息
             */
            getCurrentPosition : function(successCallback, errorCallback){
                if (window.device && device.platform == "Android"){
                    navigator.bdlocation.getCurrentPosition(successCallback, errorCallback);
                }
            },

            /**
             * Android 导航
             * options 起点,终点的纬度，经度: [form.latitude，from.longitude, to.latitude，to.longitude]
             */
            startNavigation : function(successCallback, errorCallback, options){
                if (window.device && device.platform == "Android"){
                    navigator.bdlocation.startNavigation(successCallback, errorCallback, options);
                }
            },

            hasGPSPermission: function(successCallback, errorCallback){
                if (window.device && device.platform == "iOS"){
                    if(navigator.map){
                        navigator.map.checkLocationServicesAuthorizationStatus(successCallback, errorCallback);
                    }
                }
            },

            getCityNameInIOS: function(successCallback, errorCallback){
                if (window.device && device.platform == "iOS"){
                    navigator.map.getCityName(successCallback, errorCallback, []);
                }
            },

            getLatitudeAndLongtitudeInIOS: function(successCallback, errorCallback){
                if (window.device && device.platform == "iOS"){
                    navigator.map.getLatitudeAndLongtitude(successCallback, errorCallback, []);
                }
            },

            getCityCodeInIOS: function(successCallback, errorCallback){
                if (window.device && device.platform == "iOS"){
                    navigator.map.getCityCode(successCallback, errorCallback, []);
                }
            },
            showSurroundingMapIOS: function(successCallback, errorCallback, options){
                if(window.device && device.platform == "iOS" && navigator.map){
                    navigator.map.showSurroundingMap(successCallback, errorCallback, options);
                }else{
                }
            },

            destorySurroundMapIOS:function (successCallback, errorCallback,options) {
                if(window.device && device.platform == "iOS" && navigator.map){
                    navigator.map.destorySurroundMapIOS(successCallback, errorCallback,options);
                }else{
                }
            },
            /**
             * IOS 导航
             * options 终点的纬度，经度: [to.latitude，to.longitude], 起点默认为当前位置
             */
            showMapIOS: function(successCallback, errorCallback, options){
                if(window.device && window.device.platform == "iOS"){
                    navigator.map.showMap(successCallback, errorCallback, options);
                }
            }
        };
    });
