package com.whhercp.jsframe;

import java.util.List;
import java.util.Map;

import com.whhercp.dataobject.security.SecApplication;
import com.whhercp.dataobject.security.SecModule;
import com.whhercp.dataobject.security.SecUser;

public interface ILoginService {
    /**
     * 用户登录
     * @param user
     * @return
     * @throws Exception
     */
    public SecUser login(SecUser user)throws Exception;

    /**
     * 用户注销
     * @param map
     */
    public void loginOut(Map<String, Object> map);

    /**
     * 修改密码
     * @param user
     * @throws Exception
     */
    public void changePwd(Map user)throws Exception;

    /**
     * 获取用户可访问的APP列表
     * @return
     */
    public List<SecApplication> getUserApps();

    /**
     * 获取用户对应APP下的角色列表
     * @return
     */
    public List<SecApplication> getUserAppRoles(String appCode);
    /**
     * 获取用户对应APP下的菜单列表
     * @return {main:用户菜单,user:个性菜单}
     */
    public Map<String, List<SecModule>> getUserAppMenus();


    /**
     * 通过应用程序代码，获取应用程序信息
     */
    public SecApplication getAppByAppCode(String app_code) ;

}
