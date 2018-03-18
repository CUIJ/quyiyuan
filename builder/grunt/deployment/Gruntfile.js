module.exports = function(grunt){

    //配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            task1: {
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
                ],
                dest: '../../../www/build/js/kyee.build.all.tmp.js',
                options: {
                    sourceMap: true,
                    sourceMapName: "map/kyee.build.all.js.map"
                }
            },
            task2: {
                src: [
                    '../../../www/resource/js_framework/ionic/js/ionic.bundle.min.js',
                    '../../../www/resource/js_framework/plugins/plugins.min.js',
                    '../../../www/build/js/kyee.build.all.temp.js'
                ],
                dest: '../../../www/build/js/kyee.build.all.min.js'
            },
			task3: {
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
            task4: {
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
                banner: '\n',
				maxLineLen: 0
            },
            task1: {
                src: '../../../www/build/js/kyee.build.all.tmp.js',
                dest: '../../../www/build/js/kyee.build.all.js',
                options: {
                    sourceMap: {
                        includeSources: true
                    },
                    sourceMapIn: "map/kyee.build.all.js.map",
                    sourceMapName: "map/kyee.build.all.js.map"
                }
            },
			task3: {
                src: '../../../www/resource/js_framework/plugins.js',
                dest: '../../../www/resource/js_framework/plugins.min.js'
            },
	        task4: {
                src: '../../../www/build/js/framework/framework.all.js',
                dest: '../../../www/build/js/framework/framework.all.min.js'
            }
        },
        sass: {
            dist: {
                files: {
                    '../../../www/build/scss/base.css': '../../../www/build/scss/base.scss'
                },
                options: {               
                    style: 'compressed'
                }
            }
        }
    });

    //载入concat和uglify插件，分别对于合并和压缩
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass')

    //注册任务
    grunt.registerTask('default', ['concat:task1',  'uglify:task1', 'sass']);
    grunt.registerTask('concatMin', ['concat:task2']);
	grunt.registerTask('plugin', ['concat:task3',  'uglify:task3']);
    grunt.registerTask('framework', ['concat:task4',  'uglify:task4']);

    // 更新 index.html 文件里面对 base.css, kyee.build.all.js的引用，添加版本号参数
    grunt.registerTask('updateIndex', 'rename css and js file in index.html', function(){

        var version = grunt.option('qyversion').split(".");
        var versionCode2 = version[1]>9 ? version[1] : '0'+ version[1]
        var versionCode = version[0] + versionCode2 + version[2];

        var options = {
            encoding: 'utf8'
        };
        var indexFilePath = '../../../www/index.html';
        var buf = grunt.file.read(indexFilePath, options);
        var str = buf.toString();
        
        var jsReg = /\"build\/js\/kyee\.build\.all\.js(\?v=[0-9]{5})?\"/g;
        var cssReg = /\"build\/scss\/base\.css(\?v=[0-9]{5})?\"/g;
        var jsFile = '\"build\/js\/kyee.build.all.js?v=' + versionCode + '\"';
        var cssFile = '\"build\/scss\/base.css?v=' + versionCode  + '\"';
        str = str.replace(jsReg, jsFile);
        str = str.replace(cssReg, cssFile);

        var buf2 = new Buffer(str);
        grunt.file.write(indexFilePath, buf2, options);

        grunt.log.write("task renameRes finish");
    });
	
	grunt.registerTask('setVersion', 'set version in DeploymentConfig.js', function(){
		
        var version = grunt.option('qyversion');

        var options = {
            encoding: 'utf8'
        };
        var filePath = '../../../www/config/DeploymentConfig.js';
		
        var buf = grunt.file.read(filePath, options);
        var str = buf.toString('utf8');
        
        var verReg = /VERSION[:]\s*["][0-9]\.[0-9]{1,2}\.[0-9]{2}["]/g;
        var verStr = 'VERSION: "' + version + '"';
        str = str.replace(verReg, verStr);

        var buf2 = new Buffer(str, 'utf8');
        grunt.file.write(filePath, buf2, options);

        grunt.log.write("task setVersion finish");
	});

};
