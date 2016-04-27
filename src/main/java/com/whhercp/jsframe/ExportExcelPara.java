package com.whhercp.jsframe;

import java.util.List;

/**
 * Created by wz on 16/4/27.
 */
public class ExportExcelPara {

    private List data;
    private List<ColHeadView> colHeadViews;
    private String sheetName;

    public List getData() {
        return data;
    }
    public void setData(List data) {
        this.data = data;
    }
    public List<ColHeadView> getColHeadViews() {
        return colHeadViews;
    }
    public void setColHeadViews(List<ColHeadView> colHeadViews) {
        this.colHeadViews = colHeadViews;
    }
    public String getSheetName() {
        return sheetName;
    }
    public void setSheetName(String sheetName) {
        this.sheetName = sheetName;
    }

}
