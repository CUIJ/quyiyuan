module.exports = function(grunt){

    //配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            task1: {
                src: [
                   '../../../www/resource/js_framework/plugins/addtohomescreen/**/*.js',
                   '../../../www/resource/js_framework/plugins/moment/**/*.js',
                   '../../../www/resource/js_framework/plugins/security/**/*.js',
                   '../../../www/resource/js_framework/plugins/underscore/**/*.js',
		           '../../../www/resource/js_framework/plugins/weixin/*.js',
                   '../../../www/resource/js_framework/plugins/angular-translate/angular-translate.min.js',
                   '../../../www/resource/js_framework/plugins/angular-translate/angular-translate-loader-static-files.min.js'
                ],
                dest: '../../../www/resource/js_framework/plugins.js'
            },
            task2: {
                src: [
                    '../../../www/resource/js_framework/ionic/js/ionic.bundle.min.js',
                    '../../../www/resource/js_framework/plugins.min.js',
                    '../../../www/resource/js_framework/patch/angular-ios9-uiwebview.patch.js'
                ],
                dest: '../../../www/build/js/framework/framework.all.js'
            }
        },
        uglify: {
            options: {
                banner: ''
            },
            task1: {
                src: '../../../www/resource/js_framework/plugins.js',
                dest: '../../../www/resource/js_framework/plugins.min.js'
            },
	        task2: {
                src: '../../../www/build/js/framework/framework.all.js',
                dest: '../../../www/build/js/framework/framework.all.min.js'
            }
        }
    });

    //载入concat和uglify插件，分别对于合并和压缩
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //注册任务
    grunt.registerTask('default', ['concat:task1',  'uglify:task1']);
    grunt.registerTask('concatMin', ['concat:task2',  'uglify:task2']);

};