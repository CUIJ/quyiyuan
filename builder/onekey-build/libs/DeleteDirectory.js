var fs = require('fs');

var readJson = function () {
    var jsonObj = JSON.parse(fs.readFileSync('../build-config.json'));
    return jsonObj;
}

var jsonObj = readJson();

//判断是否是白名单目录
var isWhiteDirectory = function (path) {
    path = path.replace('/', '\\');
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

//递归删除目录
var deleteFolderRecursive = function(path) {
    var files = [];
    if(fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        if(files.length == 0){
            if(!isWhiteDirectory(path)){
                fs.rmdirSync(path);
                //console.log("************delete directory*********" + path);
            }
        } else {
            files.forEach(function(file, index){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                }
            });
        }
    }
};

// 删除目标目录多余目录
deleteFolderRecursive(jsonObj.destinationPath);
