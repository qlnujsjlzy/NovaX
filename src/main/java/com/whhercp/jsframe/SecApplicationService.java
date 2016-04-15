package com.whhercp.jsframe;

import com.whhercp.dataobject.security.SecApplication;

import java.util.List;

/**
 * Created by wz on 16/4/8.
 */
public interface SecApplicationService {

    public List<SecApplication> getAppsByUserId(String userid);


    public SecApplication getAppByAppCode(String appCode);
}
