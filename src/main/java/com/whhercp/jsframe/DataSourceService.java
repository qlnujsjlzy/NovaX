package com.whhercp.jsframe;

import com.whhercp.common.Application;
import com.whhercp.dataobject.security.SecModule;
import com.whhercp.dataobject.security.SecUser;
import com.whhercp.lang.exception.AppException;
import com.whhercp.lang.security.Encrypter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by wz on 16/4/7.
 */
@Controller
@RequestMapping("/DataSourceService")
public class DataSourceService {

    //http://localhost:8080/whhJsPlatform/FileuploadService/uploadFile.json
    @RequestMapping(value = "/fakeQuery" ,method = RequestMethod.GET)
    @ResponseBody
    public Map fakeQuery(){
        return new HashMap();
    }

}
