package com.whhercp.jsframe;

import com.whhercp.common.Application;
import com.whhercp.dataobject.security.SecModule;
import com.whhercp.jpa.datastore.DataAdapter;
import com.whhercp.lang.exception.AppException;
import com.whhercp.lang.security.Encrypter;
import com.whhercp.lang.util.StringUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import com.whhercp.dataobject.security.SecUser;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by wz on 16/4/7.
 */
@Controller
@RequestMapping("/loginServcie")
public class LoginService {



    @RequestMapping(value = "/logout" ,method = RequestMethod.POST)
    @ResponseBody
    public Map logout(){

        LoginServiceSupport service = new LoginServiceSupport();
        service.loginOut();

        Map res = new HashMap();
        res.put("loginSuccess",true);

        return res;
    }


    @RequestMapping(value = "/login" ,method = RequestMethod.POST)
    @ResponseBody
    public Map login(@RequestBody Map para){
        System.out.println("login");


        String username = para.get("username").toString();
        String password = para.get("password").toString();

        Map res = new HashMap();
        SecUser user =null;


        try{
            user = login(username,password);
        }catch (Exception e){

            res.put("loginSuccess",false);
            res.put("message",e.getMessage());
            return res;
        }



        if(null==user){
            res.put("loginSuccess",false);
            res.put("message","登录失败");
        }else{




            res.put("loginSuccess",true);
            res.put("message","登录成功");
            res.put("login_user",user);
        }

        return res;
    }



    @RequestMapping(value = "/getUserMenu" ,method = RequestMethod.POST)
    @ResponseBody
    public Map getUserMenu(){
        System.out.println("getUserMenu");

        LoginServiceSupport service = new LoginServiceSupport();
        Map<String, List<SecModule>> menus = service.getUserAppMenus();


        return menus;
    }




    //登录方法
    private SecUser login(String userId, String pwd) throws Exception{

        SecUser user = new SecUser();
        SecUser userFinal = null;
        boolean loginSuccess = false;
        LoginServiceSupport service = new LoginServiceSupport();


        if(Application.FACTORY_MODULE.equals(Application.appModule)){


            user.setUserId(userId);
            try {
                user.setPassword( Encrypter.encrypt(Encrypter.ALGORITHM_MD5, pwd));
            } catch (Throwable e) {
                e.printStackTrace();
            }
            userFinal = service.login(user);//开始进行真正的登录验证  会抛出一些列的异常 需要自己捕获
            loginSuccess = true;
        }
        else if(Application.DEV_MODULE.equals(Application.appModule)){
            if(userId != null && userId.equals(pwd)){
                loginSuccess = true;
            }
            else{
                throw new AppException("密码无效，请重新输入!");
            }
        }
        if(loginSuccess == true){



            return userFinal;
        }

        return null;
    }


//    private Map checkUserExist(String businessId){
//        DataAdapter da = new DataAdapter();
//        String getUserInfoSql = "select * from bpm_user"
//                + " where user_id = '" + businessId + "'";
//        Map user = da.queryForObjectBySql(getUserInfoSql);
//        return user;
//    }


    public void changePwd(String userId, String oldpwd,String newPwd) throws Exception{

        Pattern pattern = Pattern.compile("^(?![a-zA-Z]+$)(?![0-9]+$)[a-zA-Z0-9!@#$%^&*-`=]{8,}");
        Matcher matcher = pattern.matcher(newPwd);
        if(!matcher.find()){
            throw new AppException("密码必须包含字符和数字，长度要8位及8位以上!");
        }


        LoginServiceSupport service = new LoginServiceSupport();
        Map changeMap = new HashMap();
        try {
            changeMap.put("user_id", userId);
            changeMap.put("oldPwd", Encrypter.encrypt(Encrypter.ALGORITHM_MD5, oldpwd));
            changeMap.put("newPwd", Encrypter.encrypt(Encrypter.ALGORITHM_MD5, newPwd));
        } catch (Throwable e) {
            e.printStackTrace();
        }
        service.changePwd(changeMap);
    }
}
