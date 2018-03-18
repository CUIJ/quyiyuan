module.exports = function(grunt){
	
    //配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            domop: {
                src: [
                    '../../../www/resource/js_framework/kyee_framework/js/**/*.js',
				    '../../../www/config/DeploymentConfig.js',
                    '../../../www/config/filter/**/*.js',
                    '../../../www/config/router/**/*.js',
                    '../../../www/config/AppConfig.js',
                    '../../../www/service_bus/**/*.js',
                    '../../../www/filters/**/*.js',
				    '../../../www/modules/**/*.js',
                    '../../../www/modules/**/*.json'
                    // '../../../www/modules/business/patients_group/js/Netease/IMChatting.js',
                    // '../../../www/modules/business/patients_group/js/Netease/IMDispatch.js',
                    // '../../../www/modules/business/patients_group/js/Netease/IMPlugin.js',
                    // '../../../www/modules/business/patients_group/js/Netease/IMUtil.js',
                    // '../../../www/modules/business/patients_group/js/Netease/NeteaseYX.js',
                    // '../../../www/modules/business/patients_group/js/Netease/NIM_Web_NIM_v4.5.0.js'
                ],
                dest: '../../../www/build/js/kyee.build.all.js'
                // dest: '../../../www/build/js/Netease.all.js'
            }
        }
    });
	
    //载入concat和uglify插件，分别对于合并和压缩
    grunt.loadNpmTasks('grunt-contrib-concat');

    //注册任务
    grunt.registerTask('default', ['concat']);

};