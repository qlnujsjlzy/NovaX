package com.whhercp.jsframe;

import com.alibaba.fastjson.JSON;
import com.whhercp.dataobject.security.SecUser;
import com.whhercp.jpa.datastore.DataAdapter;
import com.whhercp.lang.exception.AppException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by wz on 16/4/21.
 */
@Controller
@RequestMapping("/GridDefService")
public class GridDefService {


    /**
     * 上传一个grid定义
     * @param para
     * @return
     */
    @RequestMapping(value = "/uploadLoadGridDef" ,method = RequestMethod.POST)
    @ResponseBody
    public Map uploadLoadGridDef(@RequestBody Map para){
        System.out.println("uploadLoadGridDef");



        try{

            String globe_option = JSON.toJSONString(para.get("globe_option"));
            String grid_cache_option = JSON.toJSONString(para.get("grid_cache_option"));


            Map sqlPara = new HashMap();
            sqlPara.put("grid_id",para.get("grid_id"));
            sqlPara.put("grid_name",para.get("grid_name"));
            sqlPara.put("globe_option",globe_option);
            sqlPara.put("grid_cache_option",grid_cache_option);
            sqlPara.put("upload_date",new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));


            DataAdapter da = new DataAdapter();
            da.setConnect("portal");


            if(da.queryForListBySql("select grid_id from  js_grid_def where grid_id=#grid_id#",sqlPara).size()>0){
                //就做update
                da.update("update js_grid_def set grid_id=#grid_id#,grid_name=#grid_name#,globe_option=#globe_option#,grid_cache_option=#grid_cache_option#,upload_date='$upload_date$' where grid_id=#grid_id#",sqlPara);
            }else{
                da.insert("insert into js_grid_def (grid_id,grid_name,globe_option,grid_cache_option,upload_date)" +
                        " values (#grid_id#,#grid_name#,#globe_option#,#grid_cache_option#,'$upload_date$')",sqlPara);
            }


        }catch(Exception e){
            throw new AppException("保存出错啦 "+e.getMessage());
        }

        Map res = new HashMap();
        return res;
    }






}
