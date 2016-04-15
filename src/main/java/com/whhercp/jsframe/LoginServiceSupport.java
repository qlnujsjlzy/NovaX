package com.whhercp.jsframe;


import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.whhercp.appbase.BaseConfig;
import com.whhercp.appbase.manage.AppLogManager;
import com.whhercp.appbase.manage.ApplicationManager;
import com.whhercp.common.Application;
import com.whhercp.common.springbase.SpringBeanFactory;
import com.whhercp.dataobject.ProcessLog;
import com.whhercp.dataobject.security.SecApplication;
import com.whhercp.dataobject.security.SecModule;
import com.whhercp.dataobject.security.SecUser;
import com.whhercp.lang.exception.AppException;
import com.whhercp.lang.util.ClassUtil;
import com.whhercp.lang.util.DateUtils;
import com.whhercp.lang.util.StringUtil;

import com.whhercp.security.service.SecModuleService;
import com.whhercp.security.service.SecUserService;

public class LoginServiceSupport implements ILoginService {



    public void logout(){
        ISession session = SessionFactory.getSession();
        String sessionID = session.getId();
        session.setAttribute(BaseConfig.LOGIN_USER, null);
        ApplicationManager.removeUser(sessionID);
        session.invalidate();
    }

    public SecUser login(SecUser user) throws Exception {
        SecUser user2 = internal_login(user);

        if (user2 != null) {
            ISession session = SessionFactory.getSession();
            String sessionID = session.getId();
            //设置用户
            user2.setSessionId(sessionID);
            user2.setLoginTime(new Date());
            String loginip = RequestFactory.getRequest().getRemoteAddr();
            user2.setLoginIp(loginip);

            session.setAttribute(BaseConfig.LOGIN_USER, user2);

            //add online user
            ApplicationManager.addUser(sessionID, user2);
            //add session to list
        }
        return user2;
    }

    protected SecUser internal_login(SecUser user) throws Exception {
        ProcessLog log = new ProcessLog();
        try {
            //if online users are enough
//			if(ApplicationManager.isOverMaxOnlineUsers()){
//				throw new AppException("在线用户数已经饱和，请稍后登陆!");
//			}
            log.setClassName(ClassUtil.getClassName(LoginServiceSupport.class));
            log.setMethodName("login");
            log.setMethodDesc("用户登录");
            log.setStartTime(DateUtils.simpleFormat(new Date()));
            log.setUserID(user.getUserId());

            String loginip = RequestFactory.getRequest().getRemoteAddr();
            log.setUserIP(loginip);

            SecUserService service = (SecUserService) SpringBeanFactory.getBean("secUserService");
            user.setLoginIp(loginip);
            user = service.login(user, Application.APP_NAME);
            return user;
        } catch (Exception e) {
            log.setSuccess(false);
            log.setErrMsg(e.getMessage());
            throw e;
        } finally {
            AppLogManager.writeLog(log);
        }
    }

    public SecUser getLoginUser() {
        return (SecUser) SessionFactory.getSession().getAttribute(BaseConfig.LOGIN_USER);
    }


    public List<SecApplication> getUserApps() {
        SecUser user = getLoginUser();
        SecApplicationService service = (SecApplicationService) SpringBeanFactory.getBean("secApplicationService");
        return service.getAppsByUserId(user.getUserId());
    }


    public SecApplication getAppByAppCode(String appCode) {
        SecApplicationService service = (SecApplicationService) SpringBeanFactory.getBean("secApplicationService");
        return service.getAppByAppCode(appCode);
    }

    public List<SecApplication> getUserAppRoles(String appCode) {
        if (StringUtil.isEmpty(appCode)) {
            appCode = Application.APP_NAME;
        }
        return null;
    }

    public Map<String, List<SecModule>> getUserAppMenus() {
        String appCode = null;
        if (StringUtil.isEmpty(appCode)) {
            appCode = Application.APP_NAME;
        }
        SecModuleService moduleService = (SecModuleService) SpringBeanFactory.getBean("secModuleService");
        SecUser user = getLoginUser();
        Map<String, List<SecModule>> result = new HashMap<String, List<SecModule>>();
        List<SecModule> mainMenus = moduleService.getUserModuleByUser(user, appCode);
        //List<SecModule> userMenus = moduleService.getUserFavModules(user, appCode);
        result.put("main", mainMenus);
        //result.put("user", userMenus);
        return result;
    }

    public void loginOut(Map<String, Object> map) {
        SecModuleService moduleService = (SecModuleService) SpringBeanFactory.getBean("secModuleService");
        if (moduleService != null && map != null) {
            moduleService.insertFavModules((List) map.get("menus"));
        }
        String sessionID = SessionFactory.getSession().getId();
        //glog.debug("sessionID: " + sessionID + " loginOut at " + new Date());

        //移除用户信息
        SessionFactory.getSession().removeAttribute(BaseConfig.LOGIN_USER);
        ApplicationManager.removeUser(sessionID);
    }
    public void loginOut( ) {

        String sessionID = SessionFactory.getSession().getId();
        //glog.debug("sessionID: " + sessionID + " loginOut at " + new Date());

        //移除用户信息
        SessionFactory.getSession().removeAttribute(BaseConfig.LOGIN_USER);
        ApplicationManager.removeUser(sessionID);
    }

    /**
     * {"newPwd":,"user_id":,"oldPwd":}
     */
    public void changePwd(Map user) throws Exception {
        SecUserService service = (SecUserService) SpringBeanFactory.getBean("secUserService");
        service.changePwd(user);
    }

}
