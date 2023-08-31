import axios from '@/utils/request.js';
// 权限插件（引入到除登陆页面以外的其他页面）
/*
 * 目标1：访问权限控制
 * 1.1 判断无token则强制转到登录页
 * 1.2 登录成功后，保存token到本地，并跳转到内容列表页面
 */
// 1.1判断token
const token = localStorage.getItem('token');
if (!token) {
    // 注意：跳转的是html而非js，所以路径要按引用该js文件的html的路径来写
    location.href = '../login/index.html';
}

/*
 * 目标2：设置个人信息
 * 2.1 在utils/request.js设置请求拦截器，统一携带token
 * 2.2 请求个人信息并设置到页面
 */
// 2.2 请求个人信息并设置
axios({
    url: '/v1_0/user/profile',
    // 参数Authorization已在request.js的请求拦截器中写好，不必再写
}).then(res => {
    console.log(res);
    const username = res.data.name;
    document.querySelector('.nick-name').innerHTML = username;
});

/**
 * 目标3：退出登录
 * 3.1绑定点击事件
 * 3.2清空本地缓存，跳转到登录页
 */
document.querySelector('.quit').addEventListener('click', function (e) {
    localStorage.clear();
    location.href = '../login/index.html';
});
