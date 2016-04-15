package com.whhercp.jsframe;

/**
 * Created by wz on 16/4/8.
 */
import javax.servlet.http.HttpServletRequest;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class RequestFactory {

    public static HttpServletRequest httpRequest = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();


    public static HttpServletRequest getRequest(){
        return httpRequest;
    }
}