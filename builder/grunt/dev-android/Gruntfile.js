module.exports = function(grunt){

    //配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            domop: {
                src: [
                    '../../../www/resource/js_framework/cordova/cordova.js',
                    '../../../www/resource/js_framework/kyee_framework/js/**/*.js',
                    '../../../www/resource/js_framework/plugins/**/*.js',
                    '../../../www/config/DeploymentConfig.js',
                    '../../../www/config/filter/**/*.js',
                    '../../../www/config/router/**/*.js',
                    '../../../www/config/AppConfig.js',
                    '../../../www/service_bus/**/*.js',
                    '../../../www/filters/**/*.js',
                    '../../../www/modules/**/*.js',
                    '../../../www/modules/**/*.json'
                ],
                dest: '../../../www/build/js/kyee.build.js'
            }
        }
    });

    //载入concat和uglify插件，分别对于合并和压缩
    grunt.loadNpmTasks('grunt-contrib-concat');

    //注册任务
    grunt.registerTask('default', ['concat']);

};