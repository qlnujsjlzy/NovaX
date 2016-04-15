package com.whhercp.jsframe;

import javax.servlet.http.HttpSession;

/**
 * Created by wz on 16/4/8.
 */
public interface ISession extends HttpSession {

    public long getCreationTime();

    public String getId();

    public Object getAttribute(String key);

    public void setAttribute(String name, Object value);
}
