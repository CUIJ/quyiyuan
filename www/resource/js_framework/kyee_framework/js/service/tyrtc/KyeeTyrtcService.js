/**
 * Created by licong on 2017/7/19.
 * ÌìÒí²å¼þ
 */
angular
    .module("kyee.framework.service.tyrtc", [])
    .factory("KyeeTyrtcService",  function() {

        return {

            // params = [phoneNum, name, gender, headerUrl]
            login: function(success, error, params) {
                if (device.platform == "Android" && TyRtc != undefined) {
                    TyRtc.login(success, error, params);
                }
            },

            logout: function(success, error) {
                if (device.platform == "Android" && TyRtc != undefined) {
                    TyRtc.logout(success, error, []);
                }
            },

            // params = [toNumber,fromName,fromGender,fromHeaderUrl,toName,toGender,toHeaderUrl ]
            video: function(success, error, params) {
                if (device.platform == "Android" && TyRtc != undefined) {
                    TyRtc.video(success, error, params);
                }
            }

        };
    });