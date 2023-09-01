# 黑马头条-数据管理平台

[toc]

补充：利用 Node.js 配合 Webpack 对 heima-Toutiao 项目软件库进行管理，打包

2023 年 8 月 25 日结束

对 IT 资讯移动网站的数据，进行数据管理

2023 年 8 月 18 日

## 接口文档

[AJAX 和黑马头条-数据管理平台](https://apifox.com/apidoc/shared-1b0dd84f-faa8-435d-b355-5a8a329e34a8)

## 功能

1.登录和权限判断

2.查看文章内容列表（筛选，分页）

3.编辑文章（数据回显）

4.删除文章

5.发布文章（图片上传，富文本编辑器）

## 验证码登录

手机号+验证码，登录流程

1. 用户，输入手机号，点击发送验证码
2. 客户端，携带手机号，调用服务器发送短信验证码接口
3. 服务器，为此手机号生成验证码，记录生成时间，并存在服务器
4. 服务器，携带手机号，验证码调用运营商接口
5. 运营商，通过基站给指定手机号，发送验证码短信（无连接：无需等待返回结果）
6. 运营商，返回给服务器：发送成功
7. 服务器，返回客户端：验证码发送成功
8. 用户，接收验证码并填入到页面
9. 客户端，携带手机号，验证码，调用验证码登录接口
10. 服务器，接收手机号及验证码，与之前第 3 步生成的记录对比判断验证码是否正确，以及是否在有效期内并返回，登录成功/失败的结果
11. 客户端，登陆结果反馈给用户

## Token

概念：访问权限的 `令牌`，本质上是一串 `字符串`

创建：正确登录后，由 `后端`签发并返回

作用：判断是否有 `登陆状态`等，控制访问权限

注意：`前端`只能判断 token `有无`，而 `后端`才能判断 token 的 `有效性`

### token 的使用

目标：只有登陆状态，才可以访问内容页面

步骤：

1. 在 `utils/auth.js`中判断无 token 令牌字符串，则强制跳转到登录页（手动修改地址栏测试）

    ```js
    const token = localStorage.getItem('token');
    // 没有token令牌字符串，则强制跳转登录页
    if (!token) {
        location.href = '../login/index.html';
    }
    ```

2. 在登录成功后，保存 token 令牌字符串到本地，再跳转到首页

## 请求及响应结果-统一处理

### 个人信息设置和 axios 请求拦截器

需求：设置用户昵称

语法：axios 可以在 headers 选项传递请求头参数

```js
axios({
    url:'目标资源地址',
    headers:{
	Authorization:'Bearer ${localStorage.getItem('token')}'
    }
})
```

问题：很多接口，都需要携带 token

解决：在 `请求拦截器`统一设置公共 headers 选项

#### 请求拦截器

[axios 请求拦截器](https://www.axios-http.cn/docs/interceptors)：发起请求前，触发的配置函数，对请求参数进行额外配置

比如每个请求有公共部分和设置时，则可以写到请求拦截器中，在请求发起到服务器之前拦截下来，添加统一配置再发送

```js
axios.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);
```

### axios 响应拦截器和身份验证失败

axios 响应拦截器：响应回到 then/catch 之前，触发的 `拦截函数`，对响应结果 `统一处理`

```js
// 添加响应拦截器
axios.interceptors.response.use(
    function (response) {
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么
        return response;
    },
    function (error) {
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        return Promise.reject(error);
    }
);
```

## 发布文章

### 富文本编辑器

富文本：带样式，多格式的文本，在前端一般使用标签配合内联样式实现

富文本编辑器：用于编写富文本内容的容器

使用 `wangEditor`插件

### 文章封面

文章封面设置

-   准备标签结构和样式
-   选择文件并保存在 FormData
-   单独上传图片并得到图片地址
-   回显并切换 Img 标签展示（隐藏+号上传标签）

1. 标签结构：

```html
<div class="cover">
    <label for="img">封面：</label>
    <label for="img" class="place">+</label>
    <input class="img-file" type="file" name="img" id="img" hidden />
    <img class="rounded" />
</div>
```

由于原生 js 的上传图片/文件的样式不好修改，于是选择使用 `label`扩大可选范围，并将表单隐藏，单独设置 label 的样式

2. 回显图片
   得到图片地址后设置隐藏的 `rounded`图片标签的 src，并且为其添加显示类名 `show`
   图片显示，+号隐藏 `hide`
3. 优化：点击 img 可以重新切换封面
   思路：img 点击-用 js 方式触发文件选择元素 click 事件方法
