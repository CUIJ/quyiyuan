@echo off
echo 执行grunt编译命令开始
set current_dir=%~dp0
pushd %current_dir%  
cd ..
cd grunt\deployment

call build.bat  1>nul 

echo 执行grunt编译命令完成

echo 执行sass编译命令开始
cd ..
set current_dir=%~dp0
pushd %current_dir%  
cd ..
cd scss
call build.bat 1>nul 
echo 执行sass编译命令完成


