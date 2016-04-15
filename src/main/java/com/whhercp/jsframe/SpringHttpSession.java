package com.whhercp.jsframe;

import java.util.Enumeration;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionContext;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class SpringHttpSession implements ISession{

    private HttpSession getHttpSession(){
        return ((ServletRequestAttributes) RequestContextHolder
                .getRequestAttributes()).getRequest().getSession();
    }
    
    public Object getAttribute(String name) {
        return getHttpSession().getAttribute(name);
    }

    
    public void setAttribute(String name, Object value) {
        getHttpSession().setAttribute(name, value);
    }


    public long getLastAccessedTime() {
        return getHttpSession().getLastAccessedTime();
    }


    public ServletContext getServletContext() {
        return getHttpSession().getServletContext();
    }


    public void setMaxInactiveInterval(int interval) {
        getHttpSession().setMaxInactiveInterval(interval);
    }


    public int getMaxInactiveInterval() {
        return getHttpSession().getMaxInactiveInterval();
    }


    public HttpSessionContext getSessionContext() {
        return getHttpSession().getSessionContext();
    }


    public Object getValue(String name) {
        return getHttpSession().getValue(name);
    }


    public Enumeration getAttributeNames() {
        return getHttpSession().getAttributeNames();
    }


    public String[] getValueNames() {
        return getHttpSession().getValueNames();
    }


    public void putValue(String name, Object value) {
        getHttpSession().putValue(name, value);
    }


    public void removeAttribute(String name) {
        getHttpSession().removeAttribute(name);

    }


    public void removeValue(String name) {
        getHttpSession().removeValue(name);
    }


    public void invalidate() {
        getHttpSession().invalidate();

    }


    public boolean isNew() {
        return getHttpSession().isNew();
    }


    public long getCreationTime() {
        return getHttpSession().getCreationTime();
    }


    public String getId() {
        return getHttpSession().getId();
    }

}
