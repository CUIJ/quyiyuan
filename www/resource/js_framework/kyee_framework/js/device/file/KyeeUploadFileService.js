/**
 * 产品名称 KYMH
 * 创建用户: 朱学亮
 * 日期: 2015/5/10
 * 时间: 14:13
 * 创建原因：框架提供的上传文件方法
 * 修改原因：
 * 修改用户：
 * 修改时间：
 */
angular
    .module("kyee.framework.file.upload", [])
    .factory("KyeeUploadFileService",  function() {

        return {
            /**
             * success: 成功回调函数
             * error:   失败回调函数
             * fileURL: 待上传的文件的URL
             * serverURL: 完整服务器路径
             * fileType: 待上传文件类型MimeType
             * params:  附加参数
             * A FileUploadResult object is passed to the success callback of the FileTransfer object's upload() method.
             * Properties:
             * bytesSent:
             * The number of bytes sent to the server as part of the upload. (long)
             * responseCode:
             * The HTTP response code returned by the server. (long)
             * response:
             * The HTTP response returned by the server. (DOMString)
             * headers:
             * The HTTP response headers by the server. (Object) Currently supported on iOS only.
             * IOS不支持的参数responseCode和bytesSent
             */
            uploadFile : function(success, error, fileURL, serverURL, fileType, params) {
                // 配置上传参数
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.mimeType = fileType;
                options.params = params;
                // options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                var imgUrl = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                if (imgUrl.split('?').length > 1) {
                    options.fileName = imgUrl.split('?')[imgUrl.split('?').length-1]+'.'+imgUrl.split('?')[0].split('.')[imgUrl.split('?')[0].split('.').length-1];
                } else {
                    options.fileName = imgUrl;
                }

                // 配置上传函数
                var ft = new FileTransfer();
                ft.upload(fileURL, encodeURI(serverURL), success, error, options);
            }
        };
    });