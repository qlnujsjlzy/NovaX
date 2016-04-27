package com.whhercp.jsframe;


import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.File;
import java.io.FileOutputStream;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.time.DateUtils;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.RegionUtil;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFDataFormat;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.whhercp.common.Application;
import com.whhercp.lang.exception.AppException;
import com.whhercp.lang.util.StringUtil;

public class ExportExcelForPOI {

    private String getFileName(String title){
        String fileName = "";
        if(title==null || title.equals("")){
            fileName = new SimpleDateFormat("yyyyMMddHHmmss")
                    .format(new Date())
                    + "_"
                    + String.valueOf(Math.random()).substring(2) + ".xlsx";
        }else{
            fileName = title+"_"+new SimpleDateFormat("yyyyMMddHHmmss")
                    .format(new Date())
                    + "_"
                    + String.valueOf(Math.random()).substring(2) + ".xlsx";
        }
        return fileName;
    }

    int currentRow =-1;
    public String exportExecl(String filePath, List<ExportExcelPara> para, String title){
        try {
            XSSFWorkbook wb = new XSSFWorkbook();//创建Excel工作簿对象

            for ( int i=0;i<para.size();i++){
                String sheetName=para.get(i).getSheetName();
                List<ColHeadView> colHeadViews=para.get(i).getColHeadViews();
                List data=para.get(i).getData();
                if(sheetName==null || sheetName.equals("")){
                    sheetName="sheet"+i;
                }
                XSSFSheet sheet = wb.createSheet(sheetName);
                sheet.setDefaultColumnWidth(10);

                setExcelHeader(wb,sheet, colHeadViews, title);

                List<ColHeadView> newColHeadViews = new ArrayList<ColHeadView>();
                getColumns(colHeadViews,newColHeadViews);
                if(data!=null){
                    setBody(wb,sheet, data, newColHeadViews);
                }
            }

            String fileName=getFileName(title);
            if (filePath == null || filePath.trim().equals("")) {
                filePath = Application.getExportTempDir();
                File dir = new File(filePath);
                if(!dir.exists()){
                    dir.mkdirs();
                }
            }
            String fileFullName=filePath+File.separator+fileName;
            FileOutputStream os = new FileOutputStream(fileFullName);
            wb.write(os);
            os.close();
            return fileName;
        } catch (Exception e) {
            throw new AppException(e);
        }
    }

    private void setExcelHeader(XSSFWorkbook wb,XSSFSheet sheet,
                                List<ColHeadView> colHeadViews, String title){
        // 创建单元格样式
        XSSFCellStyle style = wb.createCellStyle();
        style.setAlignment(XSSFCellStyle.ALIGN_CENTER);
        style.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
        // 自动换行
        style.setWrapText(false);
        // 设置边框
        style.setBorderBottom(XSSFCellStyle.BORDER_THIN);
        style.setBottomBorderColor(IndexedColors.BLACK.getIndex());

        style.setBorderLeft(XSSFCellStyle.BORDER_THIN);
        style.setLeftBorderColor(IndexedColors.GREEN.getIndex());

        style.setBorderRight(XSSFCellStyle.BORDER_THIN);
        style.setRightBorderColor(IndexedColors.BLACK.getIndex());

        style.setBorderTop(XSSFCellStyle.BORDER_THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());





        // sheet.
        // ------------------写标题------------------------------///
        if(title!=null && !title.equals("")){
            currentRow++;
            //设置字体
            XSSFFont font = wb.createFont();
            font.setFontHeightInPoints((short)14);
            font.setBoldweight(Font.BOLDWEIGHT_BOLD);
            style.setFont(font);

            //创建行
            XSSFRow row = sheet.createRow(currentRow);

            //创建单元格
            XSSFCell cell = row.createCell(0);
            //合并单元格
            CellRangeAddress region = new CellRangeAddress(currentRow,currentRow,0,getColumnCount(colHeadViews) - 1);
            sheet.addMergedRegion(region);

            //设置单元格内容
            cell.setCellStyle(style);
            cell.setCellValue(title);
            RegionUtil.setBorderBottom(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
            RegionUtil.setBorderLeft(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
            RegionUtil.setBorderRight(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
            RegionUtil.setBorderTop(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
        }
        // ------------------写标题结束------------------------------///

        // ------------------写抬头开始-----------------------------//
        currentRow++;
        //重写抬头，支持交叉表格式
        int colIndex = 0;
        int level=getLevelCount(colHeadViews);

        //设置字体
        XSSFFont font = wb.createFont();
        font.setBoldweight(Font.BOLDWEIGHT_BOLD);
        font.setFontHeightInPoints((short)10);
        style.setFont(font);

        //创建行
        XSSFRow row = sheet.createRow(currentRow);
        for (int i = 0; i < colHeadViews.size(); i++) {
            ColHeadView colHeadView = colHeadViews.get(i);
            int newColIndex = writeColHeadView(colHeadView,wb,sheet,row,style,colIndex,level);
            colIndex = newColIndex;
        }
        currentRow = currentRow +level -1;
    }

    private void setBody(XSSFWorkbook wb,XSSFSheet sheet, List data,
                         List<ColHeadView> colHeadViews) {
        currentRow++;

        for (int i = 0; i < data.size(); i++) {
            Object rowData = data.get(i);
            Map rowMap = class2Map(rowData);
            rowMap.put("sequence_oid", i+1);
            //创建行
            XSSFRow row = sheet.createRow(currentRow);
            for (int t = 0; t < colHeadViews.size(); t++) {
                ColHeadView colHeadView = colHeadViews.get(t);
                String colname = colHeadView.getColName();
                Object colValue = null;
                colValue = rowMap.get(colname);

                String cellType = "CELL_TYPE_STRING";
                if(colHeadView.getColType()!=null){
                    String colType = colHeadView.getColType();
                    if (colType == null || colType.trim().equals("")) {
                        colType = "CELL_TYPE_FORMULA";
                    }
                    cellType = getCellType(colType);
                }else{
                    if (colValue == null) {
                        colValue = colHeadView.getFormula();
                        if (colValue != null) {
                            String colType = colHeadView.getColType();
                            if (colType == null || colType.trim().equals("")) {
                                colType = "CELL_TYPE_FORMULA";
                            }
                            cellType = getCellType(colType);
                        } else {
                            cellType = getCellType(String.class.getName());
                        }

                    } else {
                        cellType = getCellType(colValue.getClass().getName());
                    }

                }

                Format format = colHeadView.getFormat();
                setCellValue(wb,sheet, row, t, cellType, colValue, format);
            }
            currentRow++;
        }
    }

    private XSSFCellStyle numStyle ;
    private XSSFCellStyle dateStyle ;
    private XSSFCellStyle stringStyle ;

    private  XSSFCellStyle getStyle(XSSFWorkbook wb){
        XSSFCellStyle style = wb.createCellStyle();
        style.setAlignment(XSSFCellStyle.ALIGN_LEFT);
        style.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
        //设置字体
        XSSFFont font = wb.createFont();
        font.setFontHeightInPoints((short)10);
        style.setFont(font);
        // 自动换行
        style.setWrapText(false);
        // 设置边框
        style.setBorderBottom(XSSFCellStyle.BORDER_THIN);
        style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderLeft(XSSFCellStyle.BORDER_THIN);
        style.setLeftBorderColor(IndexedColors.GREEN.getIndex());
        style.setBorderRight(XSSFCellStyle.BORDER_THIN);
        style.setRightBorderColor(IndexedColors.BLACK.getIndex());
        style.setBorderTop(XSSFCellStyle.BORDER_THIN);
        style.setTopBorderColor(IndexedColors.BLACK.getIndex());
        return style;
    }


    private  XSSFCellStyle getStringStyle(XSSFWorkbook wb){
        if(stringStyle!=null){
            return stringStyle;
        }

        stringStyle = getStyle(wb);
        return stringStyle;

    }

    private  XSSFCellStyle getNumStyle(XSSFWorkbook wb){
        if(numStyle!=null){
            return numStyle;
        }

        numStyle = getStyle(wb);
        numStyle.setAlignment(XSSFCellStyle.ALIGN_RIGHT);
        return numStyle;

    }

    private  XSSFCellStyle getDateStyle(XSSFWorkbook wb){
        if(dateStyle!=null){
            return dateStyle;
        }

        XSSFDataFormat df= wb.createDataFormat();
        dateStyle = getStyle(wb);
        dateStyle.setDataFormat(df.getFormat("yyyy-MM-dd"));
        return dateStyle;
    }

    private void setCellValue(XSSFWorkbook wb,XSSFSheet sheet,XSSFRow row , int colIndex,
                              String cellType, Object value, Format format) {
        //创建单元格
        XSSFCell cell = row.createCell(colIndex);
        //设置单元格内容

        if (cellType.equals("CELL_TYPE_STRING")) {
            if (value instanceof Date) {
                // 创建单元格样式
                Date temp= DateUtils.addHours((Date)value, 8);
                cell.setCellStyle(getDateStyle(wb));
                cell.setCellValue(temp);
                return;
            } else {
                if (value == null){
                    cell.setCellStyle(getStringStyle(wb));
                    return;
                }
                if(!((String)value).startsWith("0") || ((String)value).startsWith("0.")){
                    int maxLength=10;
                    if(((String)value).indexOf(".")>=0 ){
                        maxLength++;
                    }

                    if((((String)value).length()<=maxLength)  ){
                        if(((String)value).matches("0|[1-9]\\d*")){ //整数
                            cell.setCellStyle(getNumStyle(wb));
                            cell.setCellValue(Double.valueOf((String)value).doubleValue());
                            return;
                        }else if(((String)value).matches("^(\\d*\\.)?\\d+$")|| ((String)value).matches("^-(\\d*\\.)?\\d+$")){ //浮点数
                            cell.setCellStyle(getNumStyle(wb));
                            cell.setCellValue(Double.valueOf((String)value).doubleValue());
                            return;
                        }
                    }
                }else if(((String)value).equals("0")){
                    cell.setCellStyle(getNumStyle(wb));
                    cell.setCellValue(Double.valueOf((String)value).doubleValue());
                    return ;
                }
                cell.setCellStyle(getStringStyle(wb));
                cell.setCellValue(((String) value).trim());
                return;
            }

        } else if (cellType.equals("CELL_TYPE_NUMERIC")  || cellType.equals("CELL_TYPE_INTEGER")) {
            cell.setCellStyle(getNumStyle(wb));
            if (value instanceof Integer) {
                cell.setCellValue((Integer) value);
                return;
            } else if (value instanceof Short) {
                cell.setCellValue((Short) value);
                return;
            } else if (value instanceof Double) {
                if (format != null) {
                    value = Double.valueOf(format.format((Double) value));
                }
                cell.setCellValue((Double) value);
                return;
            } else if (value instanceof Float) {
                if (format != null) {
                    value = Float.valueOf(format.format((Float) value));
                }
                cell.setCellValue((Float) value);
                return;
            } else if (value instanceof BigDecimal) {
                if (format != null) {
                    value =new BigDecimal(format.format((BigDecimal)value));
                }
                cell.setCellValue(((BigDecimal)value).doubleValue());
                return;
            } else if (value instanceof Long) {
                cell.setCellValue((Long) value);
                return;
            }
        } else if (cellType.equals("CELL_TYPE_FORMULA")) {
//			Formula f = new Formula(colIndex,rowIndex, StringUtil.replace(
//					value.toString(), "#row#", (rowIndex+1) + ""), wcf_body);
//			sheet.addCell(f);
            return;
        } else if (cellType.equals("CELL_TYPE_BOOLEAN")) {
            cell.setCellValue((Boolean) value);
            return;
        }

        cell.setCellStyle(getStringStyle(wb));
    }
    private Map class2Map(Object object) {
        if (object instanceof Map)
            return (Map) object;
        try {
            Class beanClass = object.getClass();
            BeanInfo beanInfo = Introspector.getBeanInfo(beanClass);
            PropertyDescriptor[] descriptors = beanInfo
                    .getPropertyDescriptors();
            Map map = new HashMap();
            for (int i = 0; i < descriptors.length; i++) {
                String key = descriptors[i].getName();
                Method method = beanClass.getMethod(
                        "get" + StringUtil.capitalize(key), new Class[0]);
                Object value = method.invoke(object, new Object[0]);
                map.put(key, value);
            }
            return map;
        } catch (Exception e) {
            throw new AppException(e);
        }
    }

    private String getCellType(String celType) {
        if (celType.equals(String.class.getName()))
            return "CELL_TYPE_STRING";
        if (celType.equals(Date.class.getName()))
            return "CELL_TYPE_STRING";

        if (celType.equals(Integer.class.getName())) {
            return "CELL_TYPE_INTEGER";
        }
        if (celType.equals(Short.class.getName())) {
            return "CELL_TYPE_INTEGER";
        }
        if (celType.equals(Double.class.getName())) {
            return "CELL_TYPE_NUMERIC";
        }
        if (celType.equals(Float.class.getName())) {
            return "CELL_TYPE_NUMERIC";
        }
        if (celType.equals(BigDecimal.class.getName())) {
            return "CELL_TYPE_NUMERIC";
        }
        if (celType.equals(Long.class.getName())) {
            return "CELL_TYPE_INTEGER";
        }

        if (celType.equals(Boolean.class.getName())) {
            return "CELL_TYPE_BOOLEAN";
        }

        if (celType.equals("CELL_TYPE_FORMULA")) {
            return "CELL_TYPE_FORMULA";
        }
        return "CELL_TYPE_STRING";
    }

    private int getColumnCount(List<ColHeadView> colHeadViews){
        int count = 0;
        for(int i=0; i<colHeadViews.size(); i++){
            count +=colHeadViews.get(i).getCellNum();
        }
        return count;
    }

    private int getLevelCount(List<ColHeadView> colHeadViews){
        int level = 1;
        for(int i=0; i<colHeadViews.size(); i++){
            if(level<colHeadViews.get(i).getLevel()){
                level=colHeadViews.get(i).getLevel();
            }
        }
        return level;
    }
//	private int temp(){

    //	}
    //写抬头列
    private int writeColHeadView(ColHeadView colHeadView,XSSFWorkbook wb, XSSFSheet sheet,XSSFRow row, XSSFCellStyle style, int colIndex,int rowNum){
        try{
            int rowIndex = row.getRowNum();
            if(colHeadView.getChildren()!=null){
                //创建单元格
                XSSFCell cell = row.createCell(colIndex);
                //合并单元格
                CellRangeAddress region = new CellRangeAddress(rowIndex, rowIndex,colIndex, colIndex+colHeadView.getCellNum()-1);
                sheet.addMergedRegion(region);

                //设置单元格内容
                cell.setCellStyle(style);
                cell.setCellValue(colHeadView.getColText());
                RegionUtil.setBorderBottom(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
                RegionUtil.setBorderLeft(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
                RegionUtil.setBorderRight(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
                RegionUtil.setBorderTop(XSSFCellStyle.BORDER_THIN,region, sheet, wb);

                //
                //创建行
                XSSFRow tempRow = sheet.getRow(rowIndex+1);
                if(tempRow == null){
                    tempRow = sheet.createRow(rowIndex+1);
                }
                for(int i=0; i<colHeadView.getChildren().length; i++){
                    colIndex = writeColHeadView(colHeadView.getChildren()[i],wb,sheet,tempRow,style,colIndex,rowNum-1);
                }
            }else{
                //合并单元格
                CellRangeAddress region = new CellRangeAddress(rowIndex, rowIndex+rowNum-1,colIndex, colIndex);
                sheet.addMergedRegion(region);
                if (colHeadView.getColWidth() != 0) {
//					sheet.setColumnView(colIndex, colHeadView.getColWidth());
                }
                //
                //创建单元格
                XSSFCell cell = row.createCell(colIndex);
                //设置单元格内容
                cell.setCellStyle(style);
                cell.setCellValue(colHeadView.getColText());
                RegionUtil.setBorderBottom(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
                RegionUtil.setBorderLeft(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
                RegionUtil.setBorderRight(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
                RegionUtil.setBorderTop(XSSFCellStyle.BORDER_THIN,region, sheet, wb);
                colIndex++;
            }
            //
            return colIndex;
        }catch(Exception ex){
            throw new AppException(ex);
        }
    }

    private void getColumns(List<ColHeadView> colHeadViews, List<ColHeadView> newColHeadViews){
        for(int i=0; i<colHeadViews.size(); i++){
            getColumnsFromGroupedColumn(colHeadViews.get(i),newColHeadViews);
        }
    }

    private void getColumnsFromGroupedColumn(ColHeadView colHeadView, List<ColHeadView> newColHeadViews){
        if(colHeadView.getChildren()==null){
            newColHeadViews.add(colHeadView);
        }else{
            for(int i=0; i<colHeadView.getChildren().length; i++){
                getColumnsFromGroupedColumn(colHeadView.getChildren()[i],newColHeadViews);
            }
        }
    }
}
