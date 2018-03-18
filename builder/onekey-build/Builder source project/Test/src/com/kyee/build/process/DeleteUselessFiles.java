package com.kyee.build.process;

import java.io.File;
import java.util.List;

public class DeleteUselessFiles {
	public static List<String> whiteFiles;
	public static List<String> whiteDirs;
	public static List<String> deleteSuffix;
	public static String destPath;

	public static boolean deleteDir(File dir) {
		String path = dir.getPath();
		boolean skip = false;
		for (String file : whiteFiles) {
			if (path.equals(destPath + file)) {
				skip = true;

				break;
			}
		}

		for (String file : whiteDirs) {
			if (path.equals(destPath + file)) {
				skip = true;
				break;
			}
		}

		if (skip) {
			return true;
		}

		if (dir.isDirectory()) {
			String[] children = dir.list();

			for (int i = 0; i < children.length; i++) {
				boolean success = deleteDir(new File(dir, children[i]));
				if (!success) {
					return false;
				}
			}

		}

		boolean result = true;
		File temp = new File(path);
		if (temp.isFile()) {
			int dot = path.lastIndexOf('.');
			String tempSuffix = "";
			if ((dot > -1) && (dot < path.length() - 1)) {
				tempSuffix = path.substring(dot);
			}
			for (String suffix : deleteSuffix) {
				if (tempSuffix.equals(suffix)) {
					result = dir.delete();
				}
			}
		}

		return result;
	}
}