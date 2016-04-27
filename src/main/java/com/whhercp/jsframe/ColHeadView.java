package com.whhercp.jsframe;

import java.text.Format;

public class ColHeadView {

    public static final String CELL_TYPE_FORMULA="CELL_TYPE_FORMULA";

    private String colName;

    private String colText;

    private int colWidth;

    private String colFontName;

    private String formula;

    private Format format;

    private String colType;

    private ColHeadView[] children;

    private int startX;	//起始列

    private int mergeX;	//合并列

    public int getStartX() {
        return startX;
    }

    public void setStartX(int startX) {
        this.startX = startX;
    }

    public int getMergeX() {
        return mergeX;
    }

    public void setMergeX(int mergeX) {
        this.mergeX = mergeX;
    }

    public ColHeadView[] getChildren(){
        return children;
    }

    public void setChildren(ColHeadView[] children){
        this.children = children;
    }

    public String getColName() {
        return colName;
    }

    public void setColName(String colName) {
        this.colName = colName;
    }

    public String getColText() {
        return colText;
    }

    public void setColText(String colText) {
        this.colText = colText;
    }


    public int getColWidth() {
        return colWidth;
    }

    public void setColWidth(int colWidth) {
        this.colWidth = colWidth;
    }

    public String getColFontName() {
        return colFontName;
    }

    public void setColFontName(String colFontName) {
        this.colFontName = colFontName;
    }

    public String getFormula() {
        return formula;
    }

    public void setFormula(String formula) {
        this.formula = formula;
    }

    public String getColType() {
        return colType;
    }

    public void setColType(String colType) {
        this.colType = colType;
    }

    public Format getFormat() {
        return format;
    }

    public void setFormat(Format format) {
        this.format = format;
    }

    public int getLevel(){
        int level=1;
        if(children!=null){
            for(int i=0;i<children.length;i++){
                if(level<(children[i].getLevel()+1)){
                    level=(children[i].getLevel()+1);
                }
            }
        }
        return level;
    }

    public int getCellNum(){
        int num=0;
        if(children!=null){
            for(int i=0;i<children.length;i++){
                num+=children[i].getCellNum();
            }
        }else{
            return 1;
        }
        return num;
    }

}
