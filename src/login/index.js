/**
 * 目标1：体验 webpack 打包过程
 */
// 1.1 准备项目和源代码
import { checkPhone, checkCode } from '../utils/check.js';
console.log(checkPhone('13911111111'));
console.log(checkCode('1231231'));
// 1.2 准备 webpack 打包的环境
// 1.3 运行自定义命令打包观察效果（npm run 自定义命令）

/**
 * 目标2：修改 webpack 打包入口和出口
 *  2.1 项目根目录，新建 webpack.config.js 配置文件
 *  2.2 导出配置对象，配置入口，出口文件路径
 *  2.3 重新打包观察
 */

/**
 * 目标3：用户登录-长度判断案例
 *  3.1 准备用户登录页面
 *  3.2 编写核心 JS 逻辑代码
 *  3.3 打包并手动复制网页到 dist 下，引入打包后的 js，运行
 */
// 3.2 编写核心 JS 逻辑代码
/* document.querySelector('.btn').addEventListener('click', function () {
    const phone = document.querySelector('.login-form [name=mobile]').value;
    const code = document.querySelector('.login-form [name=code]').value;
    if (!checkPhone(phone)) {
        console.log('手机号长度必须是11位');
        return;
    }
    if (!checkCode(code)) {
        console.log('验证码长度必须是6位');
        return;
    }
    console.log('提交到服务器登录...');
}); */

/**
 * 目标4：使用html-webpack-plugin插件生成html网页文件，并引入打包后的其他资源
 * 4.1下载插件本地软件包
 * 4.2配置webpack.config.js让webpack拥有插件功能
 * 4.3重新打包观察效果
 */

/**
 * 目标5：打包css代码
 * 5.1准备css代码，并引入到js中
 * 5.2下载css-loader和style-loader
 * 5.3配置webpack.config.js让webpack拥有加载器功能
 * 5.4打包看效果
 */
// 5.1引入
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

/**
 * 目标6：优化-提取css代码到单独的css文件中
 * 6.1下载mini-css-extract-plugin插件
 * 6.2配置
 * 6.3打包
 */

/**
 * 目标7：优化-压缩css代码
 * 7.1下载css-minimizer-webpack-plugin插件
 * 7.2配置
 * 7.3打包
 */

/**
 * 目标8：打包less代码
 * 8.1新建less并引入到src/login/index.js
 * 8.2下载less和less-loader
 * 8.3配置
 * 8.4打包
 */
// 8.1引入
import './index.less';

/**
 * 目标9：打包资源模块（图片处理）
 * 9.1创建img标签并动态添加到页面，配置webpack.config.js
 * 9.2打包后观察效果和区别
 */
// 9.1
// 注意：js中引入本地图片资源要用import方式（若是网络图片http地址，字符串可以直接写）
import imgObj from './assets/logo.png';
const theImg = document.createElement('img');
theImg.src = imgObj;
document.querySelector('.login-wrap').appendChild(theImg);

/**
 * 目标10：完成登录功能
 * 10.1使用npm下载axios
 * 10.2准备并修改utils工具包源代码导出实现函数
 * 10.3导入并编写逻辑代码，打包后运行观察效果
 */
// 10.3导入并编写逻辑代码
import myAxios from '../utils/request.js';
import { myAlert } from '../utils/alert.js';
// 将之前的验证代码修改一下，添加封装好的alert警告框
document.querySelector('.btn').addEventListener('click', function () {
    const phone = document.querySelector('.login-form [name=mobile]').value;
    const code = document.querySelector('.login-form [name=code]').value;
    if (!checkPhone(phone)) {
        myAlert(false, '手机号长度必须是11位');
        console.log('手机号长度必须是11位');
        return;
    }
    if (!checkCode(code)) {
        myAlert(false, '验证码长度必须是6位');
        console.log('验证码长度必须是6位');
        return;
    }
    myAxios({
        url: '/v1_0/authorizations',
        method: 'post',
        data: {
            mobile: phone,
            code,
        },
    })
        .then(res => {
            myAlert(true, '登录成功');
            // 添加跳转逻辑及设置token
            localStorage.setItem('token', res.data.token);
            location.href = '../content/index.html';
        })
        .catch(err => {
            myAlert(false, err.response.data.message);
        });
    console.log('提交到服务器登录...');
});

/**
 * 目标11：配置开发服务器环境webpack-dev-server
 * 11.1下载软件包
 * 11.2设置打包的模式为开发模式，配置自定义命令
 * 11.3使用npm run dev来启动开发服务器
 */
// 注意1：webpack-dev-server借助http模块创建8080默认Web服务
// 注意2：默认以public文件夹作为服务器根目录
// 注意3：webpack-dev-server根据配置，打包相关代码在内存中，以output.path的值作为服务器根目录（所以可以自己拼接访问dist目录下的内容）

/**
 * 目标12：打包模式设置
 * development:调试代码，实时加载。热更新（快）
 * production:压缩代码，资源优化，轻量化（小）
 * 设置方式：
 * 1.mode选项配置
 * 2.--mode=命令行设置（优先级高）
 */

/**
 * 目标13：webpack环境下区分两种模式
 * 开发模式：style-loader内嵌css代码在js中，让热替换更快
 * 生产模式：提取css代码，让浏览器缓存和并行下载js和css文件
 * 13.1下载cross-env软件包到当前项目
 * 13.2配置自定义命令，传入参数名和值到process.env对象上（它是Node.js环境变量）
 * 13.3在webpack.config.js调用使用做判断区分
 * 13.4重新打包观察两种模式区别
 */

/**
 * 目标14：前端-注入环境变量
 * 需求：前端项目代码中，开发模式下打印语句生效，生产模式下打印语句失效
 */
if (process.env.NODE_ENV === 'production') {
    console.log = function () {};
}
console.log('打印，开发模式下可用，生产模式下失效');

/**
 * 目标15：source-map调试代码
 * 问题：error和warning代码的位置和源代码对不上，不方便我们调试
 * 解决：启动webpack的source-map资源地图功能
 * 15.1在webpack.config.js中配置devtool选项和值开启功能（注意：只在开发环境下使用）
 * 15.2代码中造成错误，并在开发服务器环境下查看效果
 */
// consolee.warning('123');

/**
 * 目标16：路径解析别名设置
 * 作用：让前端代码引入路径更简单（而且使用绝对路径）
 * 16.1在webpack.config.js中配置resolve.alias选项
 * 16.2在代码中尝试并在开发环境和生产环境测试效果
 */
import yourAxios from '@/utils/request.js';
console.dir(yourAxios);

/**
 * 目标17：第三方库使用CDN加载引入
 * 17.1在html中引入第三方库的CDN地址并用模板语法判断
 * 17.2配置webpack.config.js中externals外部扩展选项（防止某些import的包被打包）
 * 17.3两种模式下打包观察效果
 */

/**
 * 目标18：多页面打包
 * 18.1准备源码放入相应位置，并改用模块化语法导出
 * 18.2下载form-serialize包并导入到核心代码中使用（略过）
 * 18.3配置webpack.config.js多入口和多页面的设置
 * 18.4重新打包观察效果
 */
