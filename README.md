# NovaX
基于angularJS的Web开发平台  
ng-whh指令控件库 和 Whh-Web开发平台


2016/04/01
构建angularJS指令和模板 实现基于指令创建grid 的代码框架
实现数据源维护

2016/04/02
增加多列下拉模式 增加单列下拉模式

2016/04/03
增加日期控件 和 日期时间控件

2016/04/05
增加gridApi对象 实现 获取选中行 删除选中行 updateItem等功能

2016/04/06
实现change事件捕捉 各种状态下获取insertItems updateItems 和 deleteItems

2016/04/07
增加每列可选是否可编辑功能 schema自动构建
实现基本的输入控制 是否必输 max min控制
实现save功能 基于url自动传入update的数据作为参数

2016/04/08
修复id字段问题 构建schema的过程优化
修复多列下拉抬头和内容不对齐的问题
修复日期控件内英文月份 星期的问题 改为中文

2016/04/13
实现onSelect事件 参数就是选中行的数组
实现勾选框功能 记录勾选 实现勾选框全选功能 
实现onSelect等等事件的注册和注销





<hr>
<h3>Web开发平台 开发日志</h3>

2016/04/07
定制BootStrap Admin模板 实现基本界面

2016/04/08
构建angularJS路由 实现页面header sidebar footer mainContent
等首页view的组成

2016/04/09
优化router 修复了进入子级别路由状态后 父级别个别view内容会消失的问题
修复了siderBar菜单 在进入具体页面后消失的问题

2016/04/10
增加登录功能 连接Whh权限库 实现登录验证
连接whh权限库 取app信息 取菜单信息 role信息
增加菜单加载 构建html静态菜单功能

2016/04/11
完善权限控制 增加路由状态监听,防止用户直接用url跳过登录进入app内部的页面
增加后台异常捕获提醒功能, 增加拦截器捕获response中的异常信息 在APP界面弹窗提示
完善登录功能 把登录界面做成弹窗

2016/04/12
增加登录状态保存功能 login_info对象存入浏览器localStorage 可以刷新后保留登录状态
增加siderBar菜单滚动功能
增加退出登录功能 清空session和浏览器localStorage
增加左侧siderBar 收起和展示的功能

2016/04/13
修复异常信息提醒窗口弹出后 界面css被污染的bug
修复了点击左侧菜单进入userPage后 菜单会重新收起的bug
增加了主题选择功能
优化了代码结构 优化了项目结构
增加blockUI 在Message弹窗后 block界面 屏蔽用户操作

2016/04/13
增加主题更换
增加http请求时屏蔽用户操作的功能
