@echo off
echo ִ��grunt�������ʼ
set current_dir=%~dp0
pushd %current_dir%  
cd ..
cd grunt\deployment

call build.bat  1>nul 

echo ִ��grunt�����������

echo ִ��sass�������ʼ
cd ..
set current_dir=%~dp0
pushd %current_dir%  
cd ..
cd scss
call build.bat 1>nul 
echo ִ��sass�����������


