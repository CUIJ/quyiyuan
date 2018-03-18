/**
 * Android平台下文件写入SD卡目录或读取SD卡目录操作
 */
angular
    .module("kyee.framework.service.file", [])
    .factory("KyeeFileService",  function() {

        var def = {
            /**
             * 写入文件
             * @param successCallback
             * @param errorCallback
             * @param options 传入参数 数组类型 【需要写入的数据，目录，文件名】
             */
            writeFile: function (successCallback, errorCallback, options) {

                var data = options[0];
                var directory = options[1];
                var fileName = options[2];

                window.requestFileSystem(
                    LocalFileSystem.PERSISTENT,
                    0,

                    //获取qyrec目录，如果不存在则创建该目录
                    function (fileSystem) {
                        fileSystem.root.getDirectory(directory, {
                                create: true,
                                exclusive: false
                            },

                            //获取qyrec目录下面的stores.txt文件，如果不存在则创建此文件
                            function (newFile) {
                                newFile.getFile(fileName, {
                                        create: true,
                                        exclusive: false
                                    },

                                    //获取FileWriter对象
                                    function (fileEntry) {
                                        fileEntry.createWriter(
                                            //写入数据
                                            function (writer) {
                                                writer.onwrite = successCallback;
                                                writer.onerror = errorCallback;
                                                writer.write(data);
                                            },

                                            errorCallback
                                        );
                                    },
                                    errorCallback
                                );
                            },
                            errorCallback
                        );
                    },
                    errorCallback
                );
            },

            /**
             * 读取文件
             * @param successCallback
             * @param errorCallback
             * @param filePath 传入参数 字符串类型  "目录/文件名"
             */
            readFile: function (successCallback, errorCallback, filePath) {

                window.requestFileSystem(
                    LocalFileSystem.PERSISTENT,
                    0,

                    function (fileSystem) {
                        fileSystem.root.getFile(filePath, {
                                create: true,
                                exclusive: false
                            },

                            function (fileEntry) {
                                fileEntry.file(
                                    //读取数据
                                    function (file) {
                                        var reader = new FileReader();
                                        reader.onloadend = successCallback;
                                        reader.readAsText(file);
                                    },

                                    errorCallback
                                );
                            },
                            errorCallback
                        );
                    },
                    errorCallback
                );
            },

            //获取图片的base64数据
            readImgAsDataURL: function (successCallback, errorCallback, filePath) {
                window.resolveLocalFileSystemURL(
                    filePath,
                    function (fileEntry) {
                        fileEntry.file(
                            function (file) {
                                var reader = new FileReader();
                                reader.onloadend = successCallback;
                                reader.readAsDataURL(file);
                            },
                            errorCallback
                        );
                    },
                    errorCallback
                );
            },


            // 存储批量读取的图片相关数据
            imgData: {
                pathArray: [],  // 要读取数据的图片路径
                dataUriArray: [],  // 存储图片base64和路径的数组 [{"imgData":"","imgPath":""}]
                readError: 0 // 读取失败的图片
            },

            /*
             * 批量读取图片
             * successCallback 成功回调
             * errorCallback 失败回调
             * imgs 图片路径数组
             * */
            readMutilImgs: function(successCallback, errorCallback, imgs){
                // 清缓存数据
                def.imgData = {
                    pathArray: [],
                    dataUriArray: [],
                    readError: 0
                };

                if(imgs && imgs.length > 0){
                    def.imgData.pathArray = imgs;
                    def.readImgFileInOrder(successCallback, errorCallback, 0);
                }
            },

            // 递归调用readImgAsDataURL读取多张图片的base64数据
            readImgFileInOrder: function(successCallback, errorCallback, index){
                def.readImgAsDataURL(
                    function(evt){
                        if(def.imgData.readError == 0){
                            var dataUri = evt.target.result;
                            // dataUri的格式为："data:image/png;base64,XXXXX"   其中XXXXX为图片的base64数据
                            def.imgData.dataUriArray.push(dataUri);
                            index++;
                            if(index < def.imgData.pathArray.length){
                                def.readImgFileInOrder(successCallback, errorCallback, index);
                            }else{
                                successCallback(def.imgData.dataUriArray);
                            }
                        }
                    },
                    function(){
                        // 图片文件读取失败
                        errorCallback(def.imgData.dataUriArray);
                    },
                    def.imgData.pathArray[index]
                );
            }
        };

        return def;
    });
