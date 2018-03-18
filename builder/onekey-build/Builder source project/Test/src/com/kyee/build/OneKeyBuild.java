package com.kyee.build;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.kyee.build.bean.Build;
import com.kyee.build.process.CopyDirectory;
import com.kyee.build.process.DeleteEmptyDir;
import com.kyee.build.process.DeleteUselessFiles;
import com.kyee.build.util.ReadJson;

public class OneKeyBuild {

	public static void main(String[] args) {
		
		Build build = readConfig();
		
		String sourcePath = build.getSourcePath();
		String destPath = build.getDestinationPath();
        
		// 删除目标目录
		System.out.println("清空目标目录开始");
		deleteDestinationDir(destPath);
		System.out.println("清空目标目录结束");
		
		// 复制源目录
		System.out.println("复制源目录开始");
		copySourceDir(sourcePath, destPath);
		System.out.println("复制源目录结束 ");
		
		// 删除无用文件
		System.out.println("删除无用文件开始");
		deleteUselessFiles(build);
		System.out.println("删除无用文件结束 ");
		
		// 删除空目录
		System.out.println("删除空目录开始");
		deleteEmptyDir(destPath);
		System.out.println("删除空目录结束 ");
		
		// 更新国际化中文语言包文件
		System.out.println("更新国际化语言包文件开始");
		updateI18NZhcnFile(destPath);
		System.out.println("更新国际化语言包文件结束 ");
	}
	
	/**
	 * 删除无用文件
	 * @param build
	 */
	private static void deleteUselessFiles(Build build) {
		DeleteUselessFiles.whiteFiles = build.getFileWhiteList();
		DeleteUselessFiles.whiteDirs = build.getDirectoryWhiteList();
		DeleteUselessFiles.deleteSuffix = build.getDeleteSuffix();
		DeleteUselessFiles.destPath = build.getDestinationPath();
		boolean success = DeleteUselessFiles.deleteDir(new File(build.getDestinationPath()));
        if (success) {
        	System.out.println("删除无用文件成功 ");
		} else {
			System.out.println("删除无用文件失败");
		}
	}

	private static Build readConfig() {
		
		String jsonStr = ReadJson.readFile("build-config.json");
		Build build = ReadJson.fromJson(jsonStr, Build.class);
		
		return build;
	}

	/**
	 * 删除空目录
	 * @param rootPath
	 */
	private static void deleteEmptyDir(String rootPath) {
		
		List<File> list = DeleteEmptyDir.getAllNullDirectorys(new File(rootPath));

		DeleteEmptyDir.removeNullFile(list, rootPath);
		System.out.println("删除空目录成功 ");
	}

	/**
	 * 复制源目录
	 * @param sourcePath
	 * @param destPath
	 */
	private static void copySourceDir(String sourcePath, String destPath) {
		
		try {
			// 创建目标文件夹
			(new File(destPath)).mkdirs();
			// 获取源文件夹当前下的文件或目录
			File[] file = (new File(sourcePath)).listFiles();
			for (int i = 0; i < file.length; i++) {
				if (file[i].isFile()) {
					// 复制文件
					CopyDirectory.copyFile(file[i],
							new File(destPath + File.separator + file[i].getName()));
				}
				if (file[i].isDirectory()) {
					// 复制目录
					String sourceDir = sourcePath + File.separator + file[i].getName();
					String targetDir = destPath + File.separator + file[i].getName();
					CopyDirectory.copyDirectiory(sourceDir, targetDir);
				}
			}
			System.out.println("源目录拷贝成功 ");
		} catch (IOException e) {
			System.out.println("源目录拷贝失败 " + e);
		}
	}

	/**
	 * 删除无用文件
	 * @param path
	 */
	private static void deleteDestinationDir(String path) {
		
		File file = new File(path);
		if (!file.exists()) {
			System.out.println("清空目标目录成功 ");
			return;
		}
		
        boolean success = deleteDir(file);
        if (success) {
        	System.out.println("清空目标目录成功 ");
		} else {
			System.out.println("清空目标目录失败");
		}
	}
	
	/**
     * 递归删除目录下的所有文件及子目录下所有文件
     * @param dir 将要删除的文件目录
     */
    private static boolean deleteDir(File dir) {
    	
        if (dir.isDirectory()) {
            String[] children = dir.list();
            // 递归删除目录中的子目录下
            for (int i=0; i<children.length; i++) {
                boolean success = deleteDir(new File(dir, children[i]));
                if (!success) {
                    return false;
                }
            }
        }
        // 目录此时为空，可以删除
        return dir.delete();
    }
    
    /**
     * 更新国际化中文语言包文件
     * @param path
     */
    private static void updateI18NZhcnFile(String path){
    	
    	String filePath = path + File.separator + "resource" 
    			+ File.separator + "locale" + File.separator + "lang-zh_CN.json";
    	File file = new File(filePath);
    	
		if (!file.exists()) {
			return;
		}
		
		String jsonStr = ReadJson.readFile(filePath);
		Map<String, String> words = ReadJson.fromJson(jsonStr, HashMap.class);
		Map<String, String> newWords = new HashMap<>();
		
		for(String key : words.keySet()){
			if(words.get(key).contains("{{")){
				newWords.put(key, words.get(key));
			}
		}
		
		String data = ReadJson.toJson(newWords);
		ReadJson.writeFile(file, data);
    }
    
}
