import '@/utils/auth.js';
import axios from '@/utils/request.js';
import editor from '@/utils/editor.js';
import { myAlert } from '@/utils/alert.js';
import './index.css';
import serialize from 'form-serialize';
/**
 * 目标1：设置频道下拉菜单
 * 1.1获取频道列表数据
 * 1.2展示到下拉菜单中
 */
// 1.1获取频道
async function setChannelList() {
    const res = await axios({ url: '/v1_0/channels' });
    console.log(res);
    const channelStr = res.data.channels
        .map((item, idx) => {
            // bug:用户编辑文章时，频道选择项不该出现'推荐'一项
            // 由于后端返回数据'推荐'排在第一位，暂时以下标来判断是否跳过，若返回的频道列表顺序不固定则需使用name来匹配
            if (idx === 0) {
                return;
            }
            return `<option value="${item.id}">${item.name}</option>`;
        })
        .join('');
    document.querySelector('.form-select').innerHTML = `<option value="" selected>请选择文章频道</option>` + channelStr;
}
// 网页运行后，默认调用一次
setChannelList();

/**
 * 目标2：文章封面设置
 * 2.1 准备标签结构和样式
 * 2.2 选择文件并保存在FormData
 * 2.3 单独上传图片并得到图片地址
 * 2.4 回显并切换Img标签展示（隐藏+号上传标签）
 */
// 2.2选择文件保存
document.querySelector('.img-file').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append('image', file);
    // 2.3上传图片获取地址
    const res = await axios({
        url: '/v1_0/upload',
        method: 'post',
        data: fd,
    });
    const imgUrl = res.data.url;
    document.querySelector('.rounded').src = imgUrl;
    document.querySelector('.rounded').classList.add('show');
    document.querySelector('.place').classList.add('hide');
});
// 优化：点击img可以重新切换封面
// 思路：img点击-用js方式触发文件选择元素click事件方法
document.querySelector('.rounded').addEventListener('click', function () {
    document.querySelector('.img-file').click();
});

/**
 * 目标3：发布文章保存
 * 3.1基于form-serialize插件收集表单数据对象
 * 3.2基于axios提交到服务器保存
 * 3.3调用Alert警告框反馈结果给用户
 * 3.4重置表单数据并跳转到列表页
 */
// 3.1收集数据
document.querySelector('.send').addEventListener('click', async function (e) {
    if (e.target.innerHTML !== '发布') {
        return;
    }
    const form = document.querySelector('.art-form');
    const data = serialize(form, { hash: true, empty: true });
    // 发布文章时，不需要id属性，可以删除
    delete data.id;
    // 自己收集封面图片地址并保存到data
    data.cover = {
        type: 1, // 封面类型
        images: [document.querySelector('.rounded').src], //封面图片地址
    };
    // 3.2提交数据
    try {
        const res = await axios({
            url: '/v1_0/mp/articles',
            method: 'post',
            data,
        });
        myAlert(true, '发布成功');
        // 3.4表单重置
        form.reset();
        // 封面需要手动重置
        document.querySelector('.rounded').src = '';
        document.querySelector('.rounded').classList.remove('show');
        document.querySelector('.place').classList.remove('hide');
        //富文本编辑器重置
        editor.setHtml('');
        setTimeout(() => {
            location.href = '../content/index.html';
        }, 1500);
    } catch (err) {
        console.dir(err);
        myAlert(false, err.response.data.message);
    }
});
/**
 * 目标4：编辑文章时，回显数据到表单
 * 4.1页面跳转传参（URL查询参数方式）
 * 4.2发布文章页面接收参数判断（共用同一套表单）
 * 4.3修改标题和按钮文字
 * 4.4获取文章详情数据并回显
 */
// 4.2接收参数id
(function () {
    const paramsStr = location.search;
    const params = new URLSearchParams(paramsStr);
    params.forEach(async (value, key) => {
        // 若有id表示编辑文章
        if (key === 'id') {
            // 4.3修改标题和按钮文字
            document.querySelector('.title span').innerHTML = '修改文章';
            document.querySelector('.send').innerHTML = '修改';
            // 4.4获取文章数据回显
            const res = await axios({
                url: `/v1_0/mp/articles/${value}`,
            });
            // 组织仅需的数据对象，为后续遍历回显到页面上做铺垫
            const dataObj = {
                channel_id: res.data.channel_id,
                title: res.data.title,
                rounded: res.data.cover.images[0], //封面图地址
                content: res.data.content,
                id: res.data.id,
            };
            // 遍历数据对象属性，映射到页面元素，快速赋值
            Object.keys(dataObj).forEach(key => {
                if (key === 'rounded') {
                    // 封面设置
                    if (dataObj[key]) {
                        // 有封面
                        document.querySelector('.rounded').src = dataObj[key];
                        document.querySelector('.rounded').classList.add('show');
                        document.querySelector('.place').classList.add('hide');
                    }
                } else if (key === 'content') {
                    // 富文本内容
                    editor.setHtml(dataObj[key]);
                } else {
                    // 用数据对象的属性名，作为标签name属性选择器值来找到匹配的标签
                    document.querySelector(`[name=${key}]`).value = dataObj[key];
                }
            });
        }
    });
})();

/**
 * 目标5：编辑-保存文章
 * 5.1判断按钮文字（判断id是否有内容也可），区分业务（因为发布和修改共用了一套表单）
 * 5.2调用编辑文章接口，保存信息
 * 5.3反馈结果给用户
 */
document.querySelector('.send').addEventListener('click', async function (e) {
    if (e.target.innerHTML !== '修改') {
        return;
    }
    // 修改文章逻辑
    const form = document.querySelector('.art-form');
    const data = serialize(form, { hash: true, empty: true });
    // 5.2保存信息
    try {
        const res = await axios({
            url: `/v1_0/mp/articles/${data.id}`,
            method: 'put',
            data: {
                ...data,
                cover: {
                    type: document.querySelector('.rounded').src ? 1 : 0,
                    images: [document.querySelector('.rounded').src],
                },
            },
        });
        myAlert(true, '修改文章成功');
        // 3.4表单重置
        form.reset();
        // 封面需要手动重置
        document.querySelector('.rounded').src = '';
        document.querySelector('.rounded').classList.remove('show');
        document.querySelector('.place').classList.remove('hide');
        //富文本编辑器重置
        editor.setHtml('');
        setTimeout(() => {
            location.href = '../content/index.html';
        }, 1500);
    } catch (err) {
        myAlert(false, err.response.data.message);
    }
});
