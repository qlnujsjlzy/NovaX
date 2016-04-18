package com.whhercp.demo;

import com.whhercp.common.Application;
import com.whhercp.jpa.datastore.DataAdapter;
import com.whhercp.lang.exception.AppException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by wz on 16/4/15.
 */
@Controller
@RequestMapping("/FileuploadService")
public class FileuploadService {




    //http://localhost:8080/whhJsPlatform/FileuploadService/uploadFile.json
    @RequestMapping(value = "/uploadFile" ,method = RequestMethod.POST)
    @ResponseBody
    public Map uploadFile(@RequestParam(value = "file", required = false) MultipartFile file, HttpServletRequest request){
        System.out.println("uploadFile ");

        String name = file.getName();
        String fileName = file.getOriginalFilename();
        byte[] content;
        try{
            content = file.getBytes();
        }catch (Exception e){
            throw new AppException(e.getMessage());
        }

        //拿到了文件名 文件二进制码 可以存到项目目录 也可以存到文件服务器去
        String filePath = request.getServletContext().getRealPath(File.separator);



        BufferedOutputStream bof = null;
        try{

            File localFile= new File(filePath+File.separator+"pages"+File.separator+"demoFileUpload"+File.separator+fileName);
            if(localFile.exists()){
                localFile.delete();
                localFile.createNewFile();
            }

            bof = new BufferedOutputStream(new FileOutputStream(localFile));
            bof.write(content);
        }catch (Exception e){
            throw new AppException(e.getMessage());
        }finally {
            try {
                bof.close();
            } catch (IOException e) {
                throw new AppException(e.getMessage());
            }
        }



        //构建下载链接
        String downloadPath = "http://"+request.getServerName()+":"+request.getServerPort()+"/whhJsPlatform/pages/demoFileUpload/"+fileName;

        // 返回的得是对象 可以转成json的对象
        Map res = new HashMap();
        res.put("downloadPath",downloadPath);
        return res;
    }




}
