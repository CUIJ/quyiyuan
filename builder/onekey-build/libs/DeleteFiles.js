var fs = require('fs');

var readJson = function () {
    var jsonObj = JSON.parse(fs.readFileSync('../build-config.json'));
    return jsonObj;
}

var jsonObj = readJson();

String.prototype.replaceAll = function(s1,s2){
    return this.replace(new RegExp(s1,"gm"),s2);
}

//判断是否是白名单目录
var isWhiteDirectory = function (path) {
    path = path.replaceAll('/', '\\');
    var result = false;
    var directoryWhiteList = jsonObj.directoryWhiteList;
    for(var index = 0; index < directoryWhiteList.length; index ++) {

        if((jsonObj.destinationPath + directoryWhiteList[index]) == path){
            //console.log(jsonObj.destinationPath + directoryWhiteList[index] +"---------"+ path);
            result = true;
            break;
        }
    }

    return result;
}

//判断是否是白名单文件
var isWhiteFile = function (path) {
    path = path.replaceAll('/', '\\');
    var result = false;
    var fileWhiteList = jsonObj.fileWhiteList;
    for(var index = 0; index < fileWhiteList.length; index ++) {
        //console.log(jsonObj.destinationPath + fileWhiteList[index] +"++++++++++"+ path);
        if((jsonObj.destinationPath + fileWhiteList[index]) == path){
            //console.log(jsonObj.destinationPath + fileWhiteList[index] +"++++++++++"+ path);
            result = true;
            break;
        }
    }

    return result;
}

//递归删除目录
var deleteFolderRecursive = function(path) {
    var files = [];
    if(fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        var deleteCount = 0;
        files.forEach(function(file, index){
            var curPath = path + "/" + file;
            if(!isWhiteDirectory(curPath)  && !isWhiteFile(curPath)){
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else {
                    for(var index = 0; index < jsonObj.deleteSuffix.length; index ++) {
                        var reg = new RegExp(jsonObj.deleteSuffix[index] + "$");
                        if(reg.test(file)){
                            fs.unlinkSync(curPath);
                            //console.log("+++++++delete file+++++" + curPath);
                            deleteCount ++ ;

                            break;
                        }
                    }
                }
            }
        });

        if(deleteCount == files.length){
            fs.rmdirSync(path);
            //console.log("************delete directory*********" + path);
        }
    }
};

// 删除目录空目录
deleteFolderRecursive(jsonObj.destinationPath);
