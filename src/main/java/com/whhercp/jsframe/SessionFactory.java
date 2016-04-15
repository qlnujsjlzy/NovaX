package com.whhercp.jsframe;

/**
 * Created by wz on 16/4/8.
 */
public class SessionFactory {

    private static ISession session = new SpringHttpSession();

    public static ISession getSession(){
        return session;
    }
}