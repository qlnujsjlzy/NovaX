package com.whhercp.demo.grid;

import com.whhercp.jpa.datastore.DataAdapter;
import com.whhercp.lang.exception.AppException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadFactory;

/**
 * Created by wz on 2016/4/4.
 */

@Controller
@RequestMapping("/GridDemoService")
public class GridDemoService {





    @RequestMapping(value = "/throwException" ,method = RequestMethod.GET)
    @ResponseBody
    public Map throwException(){
        System.out.println("throwException ");

        throw  new AppException("抛出测试错误!");
    }



    //http://localhost:8080/webDemo/GridDemoService/getOS.json
    @RequestMapping(value = "/getOS" ,method = RequestMethod.GET)
    @ResponseBody
    public List<Map> getOS(@RequestParam("para") String brand){
        System.out.println("getOS ");

        try{
            Thread.sleep(400);// 模拟网络延迟
        }catch(Exception e){}

        DataAdapter da = new DataAdapter();
        da.setConnect("portal");
        List<Map> list = da.queryForListBySql("select distinct os as key,os as value from js_os order by os");

        return list;
    }


    //http://localhost:8080/webDemo/GridDemoService/getCPU.json
    @RequestMapping(value = "/getCPU" ,method = RequestMethod.GET)
    @ResponseBody
    public List<Map> getCPU(@RequestParam("para") String para){
        System.out.println("getCPU");

        try{
            Thread.sleep(400);// 模拟网络延迟
        }catch(Exception e){}

        DataAdapter da = new DataAdapter();
        da.setConnect("portal");
        List<Map> list = da.queryForListBySql("select distinct *  from js_cpu order by producer");

        return list;
    }



    //http://localhost:8080/webDemo/GridDemoService/getPhone.json
    @RequestMapping(value = "/getPhone" ,method = RequestMethod.GET)
    @ResponseBody
    public List<Map> getPhone(@RequestParam("phonename") String phonename){
        System.out.println("getOS ");


        DataAdapter da = new DataAdapter();
        da.setConnect("portal");
        List<Map> list =null;


        if(phonename==null || phonename.trim().equals("")){
            list= da.queryForListBySql("select * from js_phone   order by phonename ");
        }else{
            list= da.queryForListBySql("select * from js_phone where phonename like '%"+phonename+"%' order by phonename ");
        }


        SimpleDateFormat sdf_date = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat sdf_dateTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        for(Map item : list){
            java.sql.Timestamp time1 =   (java.sql.Timestamp)item.get("producedate");
            item.put("producedate",sdf_date.format(new Date(time1.getTime())) );


            java.sql.Timestamp time2 =   (java.sql.Timestamp)item.get("logtime");
            item.put("logtime",sdf_dateTime.format(new Date(time2.getTime())) );

        }

        return list;
    }



    @RequestMapping(value = "/save" ,method = RequestMethod.POST)
    @ResponseBody
    public Map save(@RequestBody Map data){

        DataAdapter da = new DataAdapter();
        da.setConnect("portal");

        List<Map> insertItems = (List<Map>)data.get("insertItems");
        List<Map> updateItems = (List<Map>)data.get("updateItems");
        List<Map> deleteItems = (List<Map>)data.get("deleteItems");

        for(Map item : insertItems){
            da.insert(
                    "insert into js_phone (phonename,brand,os,osversion,screen,cpu,memory,producedate,logtime,imgurl)"
                    +" values (#phonename#,#brand#,#os#,$osversion$,#screen#,#cpu#,$memory$,'$producedate$','$logtime$',#imgurl#)"
                    ,item);
        }

        for(Map item : updateItems){
            da.update("update js_phone set phonename=#phonename#,brand=#brand#,os=#os#,osversion=$osversion$,screen=#screen#," +
                    "cpu=#cpu#,memory=$memory$,producedate='$producedate$',logtime='$logtime$',imgurl=#imgurl# where id = $id$",item);
        }
        for(Map item : deleteItems){
            da.update("delete from js_phone where id=$id$",item);
        }




        Map res = new HashMap();
        res.put("status","success");
        return res;
    }










    //**************************************************************************************************
    //http://localhost:8080/webDemo/GridDemoService/test.json
    @RequestMapping(value = "/test" ,method = RequestMethod.GET)
    @ResponseBody
    public void test(@RequestParam("username") String username){
        System.out.println("hello "+username);


        DataAdapter da = new DataAdapter();
        da.setConnect("portal");
        List<Map> list = da.queryForListBySql("select * from js_phone");
        for(Map item : list){
            System.out.println(item.get("phonename"));
        }


    }



//    Spring 3.X系列增加了新注解@ResponseBody，@RequestBody
//
//    @RequestBody 将HTTP请求正文转换为适合的HttpMessageConverter对象。
//    @ResponseBody 将内容或对象作为 HTTP 响应正文返回，并调用适合HttpMessageConverter的Adapter转换对象，写入输出流。


//    GET模式下，这里使用了@PathVariable绑定输入参数，非常适合Restful风格。因为隐藏了参数与路径的关系，可以提升网站的安全性，静态化页面，降低恶意攻击风险。
//    POST模式下，使用@RequestBody绑定请求对象，Spring会帮你进行协议转换，将Json、Xml协议转换成你需要的对象。
//    @ResponseBody可以标注任何对象，由Srping完成对象——协议的转换



    // 要实现RequestBody 和 ResponseBody 需要合适的HttpMessageConverter  我们现在要的是json转对象 对象转json 所以 需要json转换器
    // spring用的json转换器是MappingJacksonHttpMessageConverter
    // 要注意的是 请求头里 需要有Content-Type = application/json   accept = text/json
    //http://localhost:8080/webDemo/GridDemoService/test2.json
    //The server refused this request because the request entity is in a format not supported by the requested resource for the requested method
    @RequestMapping(value = "/test2" ,method = RequestMethod.POST)
    @ResponseBody
    public Map test2(@RequestBody Map para){

        System.out.println("hello "+para.get("username"));

        Map res = new HashMap();
        res.put("username","wangzheng");
        return res;
    }


    /**
     *
     * 标准的json key和value都是有双引号的 JS中 用JSON.stringify() 转换出来的json字符串 也是带双引号的  可以放心使用
     *
     */


    @RequestMapping(value = "/test3" ,method = RequestMethod.POST)
    @ResponseBody
    public void test3(HttpServletRequest request, HttpServletResponse response){
        // 直接获取到原始的request  和  response
        // 自己取数据 自己转json  放入response中
    }

    @RequestMapping(value = "/test4" ,method = RequestMethod.POST)
    @ResponseBody
    public void test4(@RequestBody Map para, HttpServletResponse response){
        // 获取json转换后的对象
        // 自己取数据 自己转json  放入response中
    }

}
