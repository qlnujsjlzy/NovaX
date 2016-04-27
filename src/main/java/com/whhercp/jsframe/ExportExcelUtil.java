package com.whhercp.jsframe;

import com.whhercp.common.Application;
import com.whhercp.lang.code.CodeUtils;
import com.whhercp.lang.exception.AppException;
import com.whhercp.lang.json.JSONSerializerUtil;
import com.whhercp.lang.util.StringUtil;
import jxl.*;
import jxl.format.*;
import jxl.format.Format;
import jxl.write.*;
import jxl.write.Alignment;
import jxl.write.Border;
import jxl.write.BorderLineStyle;
import jxl.write.VerticalAlignment;
import jxl.write.biff.RowsExceededException;
import net.sf.json.JSON;
import net.sf.json.JsonConfig;
import org.apache.commons.lang.time.DateUtils;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.File;
import java.io.InputStream;
import java.lang.Boolean;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.text.*;
import java.util.*;




public class ExportExcelUtil {
    private int currentRow=-1;

    /**
     * 导入以tab分格符的txt文件到list
     * @param colHeadViews
     * @return
     * @author 11890
     * @date 2010-11-30 上午08:29:25
     */
    public List importTxt(byte[] inByte, List<ColHeadView> colHeadViews){
        return importTxt(inByte, colHeadViews,LinkedHashMap.class);
    }

    public List importTxt(byte[] inByte,List<ColHeadView> colHeadViews,Class clazz){
        try {
            List list=new ArrayList();
            String file_data = new String(inByte, CodeUtils.getBytesCode(inByte));
            String[] line_data  = file_data.split("\r\n");
            for(int i=0;i<=line_data.length-1;i++){
                Object rowObject=null;
                String[] col_data =  line_data[i].split("\t");
                StringBuffer sb=new StringBuffer("{");
                for(int t=0;t<col_data.length;t++){
                    ColHeadView chead=colHeadViews.get(t);
                    String key=chead.getColName();
                    if(!sb.toString().trim().equals("{")){
                        sb.append(",");
                    }
                    String cellValue=col_data[t];
                    cellValue = cellValue.replace("'", "");
                    cellValue = cellValue.replace("\n", "");

                    String dtype= getCellType(chead.getColType());
                    if (dtype.equals("CELL_TYPE_BOOLEAN")) {
                        sb.append(key+":"+cellValue);
                    }else if (dtype.equals("CELL_TYPE_NUMERIC")) {
                        sb.append(key+":"+cellValue);
                    }else if(dtype.equals("CELL_TYPE_INTEGER")) {
                        sb.append(key+":"+cellValue);
                    }else {
                        sb.append(key+":\""+cellValue+"\"");
                    }
                }
                sb.append("}");
                JsonConfig jsonConfig=new JsonConfig();
                jsonConfig.setRootClass(clazz);

                rowObject= JSONSerializerUtil.toJava(JSONSerializerUtil.toJSON(sb.toString()),jsonConfig);
                list.add(rowObject);
            }
            return list;
        }catch (Exception e) {
            throw new AppException(e);
        }
    }


    public List importExcel(InputStream in, int sheetId, int startRow, List<ColHeadView> colHeadViews){
        return importExcel(in, sheetId, startRow, colHeadViews, LinkedHashMap.class);
    }

    /**
     * @param row
     * @return
     * wuxq 判断行是否为空
     * Apr 1, 2011 2:43:36 PM
     */
    private boolean emptyRow(Cell[] row) {
        if(row==null)
            return true;
        for (Cell cell : row) {
            if(!cell.getType().equals(CellType.EMPTY)){
                return false;
            }
        }
        return true;
    }

    public List importExcel(InputStream in,int sheetId,int startRow,List<ColHeadView> colHeadViews,Class clazz){
        try {
            List list=new ArrayList();
            Workbook wb = Workbook.getWorkbook(in);
            Sheet sheet  =  wb.getSheet(sheetId);
            //该excel表的总行数
            int totalRows = sheet.getRows();
            for(int i=startRow-1;i<=totalRows-1;i++){
                Cell[]  row  =  sheet.getRow(i);
                if(emptyRow(row)){
                    continue;
                }
                Map rowMap =new HashMap();
                for(int colIndex=0;colIndex<colHeadViews.size();colIndex++){
                    if(colIndex>=row.length){
                        break;
                    }
                    ColHeadView chead=colHeadViews.get(colIndex);
                    String key=chead.getColName();
                    Object cellValue=null;
                    Cell cell=row[colIndex];
                    if(cell.getType().equals(CellType.NUMBER) || cell.getType().equals(CellType.NUMBER_FORMULA)){
                        NumberCell nc = (NumberCell) cell;
                        cellValue=nc.getValue();
                    }else if(cell.getType().equals(CellType.BOOLEAN) || cell.getType().equals(CellType.BOOLEAN_FORMULA)){
                        BooleanCell bc = (BooleanCell) cell;
                        cellValue=bc.getValue();
                    }else if(cell.getType().equals(CellType.DATE) || cell.getType().equals(CellType.DATE_FORMULA)){
                        DateCell bc = (DateCell) cell;
                        cellValue=bc.getDate();
                    }else if(cell.getType().equals(CellType.LABEL)) {
                        LabelCell bc = (LabelCell) cell;
                        cellValue= StringUtil.replace(bc.getString(), "\n", "\\\n");
                    }
                    String dtype= getCellType(chead.getColType());

                    if(dtype.equals("CELL_TYPE_INTEGER")) {
                        if(cellValue instanceof Double){
                            cellValue= ((Double)cellValue).intValue();
                        }
                    }if(chead.getColType().equals(Date.class.getName())){
//                		cellValue = cellValue;
                    }else if(dtype.equals("CELL_TYPE_STRING")) {
                        if(cellValue instanceof Double){
                            if(((Double)cellValue).intValue()==(Double)cellValue){
                                cellValue= ""+((Double)cellValue).intValue();
                            }else{
                                cellValue= ""+cellValue;
                            }
                        }else{
                            cellValue= ""+cellValue;
                        }

                    }
                    rowMap.put(key, cellValue);

                }
                Object rowObject=null;
                if(clazz!=null && !Map.class.isAssignableFrom(clazz)){
                    JsonConfig jsonConfig=new JsonConfig();
                    jsonConfig.setRootClass(HashMap.class);
                    JSON json= JSONSerializerUtil.toJSON(rowMap);
                    jsonConfig.setRootClass(clazz);
                    rowObject= JSONSerializerUtil.toJava(json,jsonConfig);
                }else{
                    rowObject =  rowMap;
                }

                list.add(rowObject);
            }
            return list;
        } catch (Exception e) {
            throw new AppException(e);
        }
    }

    /**
     * 根据条件导出excel（可选择导出项）
     */
    public String exportExecl(List data, List<ColHeadView> colHeadViews,
                              String sheetName, String title) {
        return exportExecl(null, data, colHeadViews, sheetName, title);
    }


    /**
     * 根据条件导出excel（可选择导出项）
     */
    public String exportVMutilGridExecl(String filePath,List<ExportExcelPara> para,String title){
        try {
            String fileName=getFileName(title);
            if (filePath == null || filePath.trim().equals("")) {
                filePath = Application.getExportTempDir();
                File dir = new File(filePath);
                if(!dir.exists()){
                    dir.mkdirs();
                }
            }
            String fileFullName=filePath+File.separator+fileName;
            WritableWorkbook wwb = Workbook.createWorkbook(new File(fileFullName));
            currentRow = -1;
            WritableSheet sheet = wwb.createSheet(title, 0);
            sheet.getSettings().setDefaultColumnWidth(10);
            for ( int i=0;i<para.size();i++){
                List<ColHeadView> colHeadViews=para.get(i).getColHeadViews();
                List data=para.get(i).getData();

                setExcelHeader(sheet, colHeadViews, para.get(i).getSheetName());

                List<ColHeadView> newColHeadViews = new ArrayList<ColHeadView>();
                getColumns(colHeadViews,newColHeadViews);
                if(data!=null){
                    setBody(sheet, data, newColHeadViews);
                }
                currentRow +=2;
            }
            wwb.write();
            wwb.close();
            return fileName;
        } catch (Exception e) {
            throw new AppException(e);
        }

    }

    private String getFileName(String title){
        String fileName = "";
        if(title==null || title.equals("")){
            fileName = new SimpleDateFormat("yyyyMMddHHmmss")
                    .format(new Date())
                    + "_"
                    + String.valueOf(Math.random()).substring(2) + ".xls";
        }else{
            fileName = title+"_"+new SimpleDateFormat("yyyyMMddHHmmss")
                    .format(new Date())
                    + "_"
                    + String.valueOf(Math.random()).substring(2) + ".xls";
        }
        return fileName;
    }

    public String exportExecl(String filePath,List<ExportExcelPara> para,String title){
        try {
            String fileName=getFileName(title);
            if (filePath == null || filePath.trim().equals("")) {
                filePath = Application.getExportTempDir();
                File dir = new File(filePath);
                if(!dir.exists()){
                    dir.mkdirs();
                }
            }
            String fileFullName=filePath+File.separator+fileName;
            WritableWorkbook wwb = Workbook.createWorkbook(new File(fileFullName));
            for ( int i=0;i<para.size();i++){
                currentRow = -1;
                String sheetName=para.get(i).getSheetName();
                List<ColHeadView> colHeadViews=para.get(i).getColHeadViews();
                List data=para.get(i).getData();
                if(sheetName==null || sheetName.equals("")){
                    sheetName="sheet"+i;
                }
                WritableSheet sheet = wwb.createSheet(sheetName, i);
                sheet.getSettings().setDefaultColumnWidth(10);

                setExcelHeader(sheet, colHeadViews, title);

                List<ColHeadView> newColHeadViews = new ArrayList<ColHeadView>();
                getColumns(colHeadViews,newColHeadViews);
                if(data!=null){
                    setBody(sheet, data, newColHeadViews);
                }
            }
            wwb.write();
            wwb.close();
            return fileName;
        } catch (Exception e) {
            throw new AppException(e);
        }
    }

    public String exportExecl(String filePath,List data,List<ColHeadView> colHeadViews,String sheetName,String title){
        ExportExcelPara tempPara=new ExportExcelPara();
        tempPara.setColHeadViews(colHeadViews);
        tempPara.setData(data);
        tempPara.setSheetName(sheetName);

        List para=new ArrayList();
        para.add(tempPara);
        if(data!=null && data.size()>50000){ //5万以上用2007
            ExportExcelForPOI exportExcelForPOI = new ExportExcelForPOI();
            return exportExcelForPOI.exportExecl(filePath, para, title);
        }else{
            return exportExecl(filePath, para, title);
        }

    }

    private void setExcelHeader(WritableSheet sheet,
                                List<ColHeadView> colHeadViews, String title)
            throws RowsExceededException, WriteException {

        // sheet.
        // ------------------写标题------------------------------///
        if(title!=null && !title.equals("")){
            currentRow++;
            sheet.mergeCells(0, currentRow, getColumnCount(colHeadViews) - 1, currentRow);
            WritableFont nameFont = new WritableFont(WritableFont.ARIAL, 16,
                    WritableFont.BOLD);
            WritableCellFormat wcf_name = new WritableCellFormat(nameFont);
            wcf_name.setBorder(jxl.format.Border.ALL, jxl.format.BorderLineStyle.MEDIUM); // 线条
            wcf_name.setVerticalAlignment(jxl.format.VerticalAlignment.CENTRE); // 垂直居中
            wcf_name.setAlignment(jxl.format.Alignment.CENTRE);
            wcf_name.setWrap(false); // 是否换行
            sheet.addCell(new Label(0, currentRow, title, wcf_name));
        }
        // ------------------写标题结束------------------------------///

        // ------------------写抬头开始-----------------------------//
        currentRow++;
//		for (int i = 0; i < colHeadViews.size(); i++) {
//			ColHeadView colHeadView = colHeadViews.get(i);
//			//
//			//
//			if (colHeadView.getColWidth() != 0) {
//				sheet.setColumnView(i, colHeadView.getColWidth());
//			}
//			WritableFont BoldFont = new WritableFont(WritableFont.ARIAL, 10,
//					WritableFont.BOLD);
//			WritableCellFormat wcf_title = new WritableCellFormat(BoldFont);
//			wcf_title.setBorder(Border.ALL, BorderLineStyle.MEDIUM); // 线条
//			wcf_title.setVerticalAlignment(VerticalAlignment.CENTRE); // 垂直对齐
//			wcf_title.setAlignment(Alignment.CENTRE); // 水平对齐
//			wcf_title.setWrap(false); // 是否换行
//
//			sheet.addCell(new Label(i,currentRow, colHeadView.getColText(), wcf_title));
//
//		}
        //重写抬头，支持交叉表格式
        int colIndex = 0;
        int rowIndex = currentRow;
        List<Integer> list = new ArrayList();
        int level=getLevelCount(colHeadViews);
        for (int i = 0; i < colHeadViews.size(); i++) {
            ColHeadView colHeadView = colHeadViews.get(i);
            //
            int newColIndex = writeColHeadView(colHeadView,sheet,rowIndex,colIndex,level);
            //colIndex = writeColHeadView(colHeadView,sheet,rowIndex,colIndex);
//			colHeadView.setStartX(colIndex);
//			colHeadView.setMergeX(newColIndex - colIndex);
            colIndex = newColIndex;
        }
//		//合并单元格
//		for (int i = 0; i < colHeadViews.size(); i++) {
//			ColHeadView colHeadView = colHeadViews.get(i);
//			if(colHeadView.getChildren()==null){//merge cells
//				sheet.mergeCells(colHeadView.getStartX(), rowIndex,
//						colHeadView.getStartX()+colHeadView.getMergeX()-1, currentRow);//列、行，列、行
//			}
//		}
//		// ------------------写抬头结束----------------------------///
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

    public static void main(String args[]){
        ColHeadView view = new ColHeadView();
        ColHeadView view11 = new ColHeadView();
        ColHeadView view12 = new ColHeadView();
        //
        ColHeadView view21 = new ColHeadView();
        ColHeadView view22 = new ColHeadView();
        view11.setChildren(new ColHeadView[]{view21,view21});
        view.setChildren(new ColHeadView[]{view11, view12});

        ExportExcelUtil util = new ExportExcelUtil();
//		System.out.println(util.getGroupedWDepth(view,0));
    }

    //写探头列
    private int writeColHeadView(ColHeadView colHeadView, WritableSheet sheet, int rowIndex, int colIndex,int rowNum){
        try{
            if(rowIndex>currentRow)
                currentRow = rowIndex;
            //
            if(colHeadView.getChildren()!=null){
                //
                WritableFont BoldFont = new WritableFont(WritableFont.ARIAL, 10,
                        WritableFont.BOLD);
                WritableCellFormat wcf_title = new WritableCellFormat(BoldFont);
                wcf_title.setBorder(jxl.format.Border.ALL, jxl.format.BorderLineStyle.MEDIUM); // 线条
                wcf_title.setVerticalAlignment(jxl.format.VerticalAlignment.CENTRE); // 垂直对齐
                wcf_title.setAlignment(jxl.format.Alignment.CENTRE); // 水平对齐
                wcf_title.setWrap(false); // 是否换行
                sheet.mergeCells(colIndex, rowIndex , colIndex+colHeadView.getCellNum()-1, rowIndex);

                sheet.addCell(new Label(colIndex,rowIndex, colHeadView.getColText(), wcf_title));
                //
                rowIndex++;
                for(int i=0; i<colHeadView.getChildren().length; i++){
                    colIndex = writeColHeadView(colHeadView.getChildren()[i],sheet,rowIndex,colIndex,rowNum-1);
                }
            }else{
                sheet.mergeCells(colIndex, rowIndex , colIndex, rowIndex+rowNum-1);

                if (colHeadView.getColWidth() != 0) {
                    sheet.setColumnView(colIndex, colHeadView.getColWidth());
                }
                //
                WritableFont BoldFont = new WritableFont(WritableFont.ARIAL, 10,
                        WritableFont.BOLD);
                WritableCellFormat wcf_title = new WritableCellFormat(BoldFont);
                wcf_title.setBorder(jxl.format.Border.ALL, jxl.format.BorderLineStyle.MEDIUM); // 线条
                wcf_title.setVerticalAlignment(jxl.format.VerticalAlignment.CENTRE); // 垂直对齐
                wcf_title.setAlignment(jxl.format.Alignment.CENTRE); // 水平对齐
                wcf_title.setWrap(false); // 是否换行
                sheet.addCell(new Label(colIndex,rowIndex, colHeadView.getColText(), wcf_title));
                colIndex++;
            }
            //
            return colIndex;
        }catch(Exception ex){
            throw new AppException(ex);
        }
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

    private void setBody(WritableSheet sheet, List data,
                         List<ColHeadView> colHeadViews) throws WriteException {
        currentRow++;
        for (int i = 0; i < data.size(); i++) {
            Object rowData = data.get(i);
            Map rowMap = class2Map(rowData);
            rowMap.put("sequence_oid", i+1);
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

                java.text.Format format = colHeadView.getFormat();
                setCellValue(sheet,  currentRow, t, cellType, colValue, format);
            }
            currentRow++;
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

    private void setCellValue(WritableSheet sheet, int rowIndex, int colIndex,
                              String cellType, Object value, java.text.Format format) throws RowsExceededException,
            WriteException {
        WritableFont bodyFont = new WritableFont(WritableFont.ARIAL, 10,
                WritableFont.NO_BOLD);
        WritableCellFormat wcf_body = new WritableCellFormat(bodyFont);
        wcf_body.setBorder(jxl.format.Border.LEFT, jxl.format.BorderLineStyle.THIN); // 线条
        wcf_body.setBorder(jxl.format.Border.RIGHT, jxl.format.BorderLineStyle.THIN); // 线条
//		wcf_body.setBorder(Border.TOP, BorderLineStyle.THIN); // 线条
        wcf_body.setBorder(jxl.format.Border.BOTTOM, jxl.format.BorderLineStyle.THIN); // 线条
        wcf_body.setVerticalAlignment(jxl.format.VerticalAlignment.CENTRE); // 垂直对齐
        wcf_body.setAlignment(jxl.format.Alignment.LEFT); // 水平对齐
        wcf_body.setWrap(false); // 是否换行
        if (cellType.equals("CELL_TYPE_STRING")) {
            if (value instanceof Date) {
                Date temp= DateUtils.addHours((Date)value, 8);
                DateTime cell=new DateTime(colIndex,rowIndex,temp);
//				cell.se
//				cell.setCellFormat(wcf_body);
//				String tempDate=null;
//				if (format == null) {
//					try{
//						format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//						tempDate=format.format((Date) value);
//					}catch (Exception e) {
//						format = new SimpleDateFormat("yyyy-MM-dd");
//						tempDate=format.format((Date) value);
//					}
//
//				}
//				Label l = new Label( colIndex,rowIndex,
//						tempDate, wcf_body);
                sheet.addCell(cell);
                return;
            } else {
                if (value == null)
                    value = "";
                if(!((String)value).startsWith("0") || ((String)value).startsWith("0.")){
                    int maxLength=10;
                    if(((String)value).indexOf(".")>=0 ){
                        maxLength++;
                    }

                    if((((String)value).length()<=maxLength)  ){
                        if(((String)value).matches("0|[1-9]\\d*")){ //整数
//							jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
//									Long.valueOf((String)value).intValue(), wcf_body);
//							sheet.addCell(n);
//							return;
                        }else if(((String)value).matches("^(\\d*\\.)?\\d+$")){ //浮点数
                            jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
                                    Double.valueOf((String)value).doubleValue(), wcf_body);
                            sheet.addCell(n);
                            return;
                        }
                    }
                }

                Label l = new Label(colIndex,rowIndex, ((String) value).trim(),
                        wcf_body);
                sheet.addCell(l);
                return;
            }

        } else if (cellType.equals("CELL_TYPE_NUMERIC")  || cellType.equals("CELL_TYPE_INTEGER")) {
            wcf_body.setAlignment(jxl.format.Alignment.RIGHT); // 水平对齐
            if (value instanceof Integer) {
                jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
                        (Integer) value, wcf_body);
                sheet.addCell(n);
                return;
            } else if (value instanceof Short) {
                jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
                        (Short) value, wcf_body);
                sheet.addCell(n);
                return;
            } else if (value instanceof Double) {
                if (format != null) {
                    value = Double.valueOf(format.format((Double) value));
                }
                jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
                        (Double) value, wcf_body);
                sheet.addCell(n);
                return;
            } else if (value instanceof Float) {
                if (format != null) {
                    value = Float.valueOf(format.format((Float) value));
                }
                jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
                        (Float) value, wcf_body);
                sheet.addCell(n);
                return;
            } else if (value instanceof BigDecimal) {
                if (format != null) {
                    value =new BigDecimal(format.format((BigDecimal)value));
                }
                jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
                        ((BigDecimal)value).doubleValue(), wcf_body);
                sheet.addCell(n);

                return;
            } else if (value instanceof Long) {
                jxl.write.Number n = new jxl.write.Number(colIndex,rowIndex,
                        (Long) value, wcf_body);
                sheet.addCell(n);
                return;
            }
        } else if (cellType.equals("CELL_TYPE_FORMULA")) {
            wcf_body.setAlignment(jxl.format.Alignment.RIGHT); // 水平对齐
            Formula f = new Formula(colIndex,rowIndex, StringUtil.replace(
                    value.toString(), "#row#", (rowIndex+1) + ""), wcf_body);
            sheet.addCell(f);
            return;
        } else if (cellType.equals("CELL_TYPE_BOOLEAN")) {
            jxl.write.Boolean b = new jxl.write.Boolean(colIndex,rowIndex, (Boolean)value, wcf_body);
            sheet.addCell(b);
        }
    }
}
