@echo off
echo 执行自定义命令开始
set current_dir=%~dp0
pushd %current_dir% 
java -jar Builder.jar
echo 执行自定义命令完成