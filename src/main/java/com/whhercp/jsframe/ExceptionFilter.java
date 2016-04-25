package com.whhercp.jsframe;

import com.whhercp.lang.exception.AppException;

import javax.servlet.*;
import java.io.IOException;

/**
 * Created by wz on 16/4/25.
 */
public class ExceptionFilter implements Filter {
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {


        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        chain.doFilter(request,response);

    }

    public void destroy() {

    }
}
