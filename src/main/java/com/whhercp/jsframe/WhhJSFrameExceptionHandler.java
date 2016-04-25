package com.whhercp.jsframe;

import com.whhercp.lang.exception.AppException;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by wangzheng on 16/4/25.
 */
public class WhhJSFrameExceptionHandler implements HandlerExceptionResolver {
    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {


        if(ex instanceof AppException){

            //返回的内容必须是json  因为在request里面 我就指定了content-type 是json 所以返回只能是json  如果不遵循json格式
            //直接往response里面随便写字符 会导致在ajax请求的异常处理里拿不到内容的
            //现在中文乱码 统一做urlEncoding 还是调整编码?
            //还是调整编码吧
            try {

                //浏览器用utf-8解析
                response.setHeader("Content-type", "application/json;charset=UTF-8");

                //servlet用UTF-8转码
                response.setCharacterEncoding("UTF-8");

                PrintWriter writer = response.getWriter();
                String json = "{\"errorInfo\":\""+ex.getMessage()+"\"}";
                writer.write(json);
                writer.flush();
                return new ModelAndView();

            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return new ModelAndView();
    }
}
