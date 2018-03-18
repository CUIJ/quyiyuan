/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/26
 * 时间: 19:43
 * 创建原因：框架提供的相机服务类
 * 修改原因：修改判断undefined的方法
 * 修改用户：朱学亮
 * 修改时间：2015/5/9 15:56
 */
angular
    .module("kyee.framework.device.camera", [])
    .factory("KyeeCameraService",  function() {

        return {
            /**
             *
             * @param successCallback
             * @param errorCallback
             * @param options
             *      {
             *      quality 50: value,//Quality of the saved image, expressed as a range of 0-100, where 100 is typically full resolution with no loss from file compression. The default is 50
             *      destinationType:Camera.DestinationType.FILE_URI,
             *                       //Camera.DestinationType = {
             *                       //DATA_URL : 0,      // Return image as base64-encoded string
             *                       //FILE_URI : 1,      // default Return image file URI
             *                       //NATIVE_URI : 2     // Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
             *                       //};
             *      sourceType:Camera.PictureSourceType.CAMERA,
             *                  //Camera.PictureSourceType = {
             *                  //    PHOTOLIBRARY : 0,
             *                  //    CAMERA : 1, // default
             *                  //    SAVEDPHOTOALBUM : 2
             *                  //};
             *
             *      targetWidth:900,//Width in pixels to scale image. Must be used with targetHeight
             *      targetHeight:900,//Height in pixels to scale image. Must be used with targetWidth
             *      encodingType:Camera.EncodingType.JPEG,
             *              //Camera.EncodingType = {
             *              //    JPEG : 0,// Return JPEG encoded image
             *              //    PNG : 1// Return PNG encoded image
             *              //  };
             *      mediaType:Camera.MediaType.PICTURE,//Set the type of media to select from. Only works when PictureSourceType is PHOTOLIBRARY or SAVEDPHOTOALBUM
             *               //Camera.MediaType = {
             *               //        PICTURE: 0,    // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
             *               //        VIDEO: 1,      // allow selection of video only, WILL ALWAYS RETURN FILE_URI
             *               //        ALLMEDIA : 2   // allow selection from all media types
             *               //};
             *      allowEdit:true,//Allow simple editing of image before selection. (Boolean)
             *      correctOrientation:true,//Rotate the image to correct for the orientation of the device during capture. (Boolean)
             *      saveToPhotoAlbum:true,//Save the image to the photo album on the device after capture. (Boolean)
             *      popoverOptions,   //IOS only
             *      cameraDirection:Camera.Direction.BACK// Choose the camera to use (front- or back-facing). The default is BACK
             *              //Camera.Direction = {
             *               //    BACK : 0,      // Use the back-facing camera
             *               //    FRONT : 1      // Use the front-facing camera
             *               //};
             *      }
             *
             */
            getPicture : function(successCallback, errorCallback, options) {

                if (typeof(navigator.camera) != "undefined") {

                    navigator.camera.getPicture(successCallback, errorCallback, options);
                }
            },
            getPictures: function(success, error, option){
                if (device.platform == "Android") {
                    if(navigator.imagePicker != undefined){
                        navigator.imagePicker.getPictures(success, error, option);
                    }
                }else if(device.platform == "iOS"){
                    if(window.imagePicker != undefined){
                        window.imagePicker.getPictures(success, error, option);
                    }
                }
            }
        };
    });