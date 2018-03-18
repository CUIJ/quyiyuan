package com.kyee.build.bean;

import java.util.List;

public class Build {
	private String sourcePath;
	private String destinationPath;
	private List<String> deleteSuffix;
	private List<String> directoryWhiteList;
	private List<String> fileWhiteList;

	public String getSourcePath() {
		return this.sourcePath;
	}

	public void setSourcePath(String sourcePath) {
		this.sourcePath = sourcePath;
	}

	public String getDestinationPath() {
		return this.destinationPath;
	}

	public void setDestinationPath(String destinationPath) {
		this.destinationPath = destinationPath;
	}

	public List<String> getDeleteSuffix() {
		return this.deleteSuffix;
	}

	public void setDeleteSuffix(List<String> deleteSuffix) {
		this.deleteSuffix = deleteSuffix;
	}

	public List<String> getDirectoryWhiteList() {
		return this.directoryWhiteList;
	}

	public void setDirectoryWhiteList(List<String> directoryWhiteList) {
		this.directoryWhiteList = directoryWhiteList;
	}

	public List<String> getFileWhiteList() {
		return this.fileWhiteList;
	}

	public void setFileWhiteList(List<String> fileWhiteList) {
		this.fileWhiteList = fileWhiteList;
	}
}