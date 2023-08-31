import '@/utils/auth.js';
import axios from '@/utils/request.js';
import './index.css';
/**
 * 目标1：获取文章列表并展示
 * 1.1 准备查询参数对象
 * 1.2获取文章列表数据
 * 1.3展示到指定的标签结构中
 */
// 1.1准备查询参数对象
const queryObj = {
    status: '', // 文章状态（1待审核，2审核通过）空字符串-全部
    channel_id: '', //文章频道
    page: 1, //当前页码
    per_page: 2, // 当前页面的条数
};
//保存文章总条数
let totalCount = 0;
async function setArticalList() {
    // 1.2获取文章
    const res = await axios({
        url: '/v1_0/mp/articles',
        params: queryObj,
    });
    console.log(res);
    // 1.3数据展示
    const myArtStr = res.data.results
        .map(
            item => `<tr>
    <td>
        <img
            src="${item.cover.type === 0 ? 'https://img2.baidu.com/it/u=2640406343,1419332367&fm=253&fmt=auto&app=138&f=JPEG?w=708&h=500' : item.cover.images[0]}"
            alt="" />
    </td>
    <td>${item.title}</td>
    <td>
    ${item.status === 1 ? `<span class="badge text-bg-success">待审核</span>` : `<span class="badge text-bg-primary">审核通过</span>`}
    </td>
    <td>
        <span>${item.pubdate}</span>
    </td>
    <td>
        <span>${item.read_count}</span>
    </td>
    <td>
        <span>${item.comment_count}</span>
    </td>
    <td>
        <span>${item.like_count}</span>
    </td>
    <td data-id=${item.id}>
        <i class="bi bi-pencil-square edit"></i>
        <i class="bi bi-trash3 del"></i>
    </td>
</tr>`
        )
        .join('');
    document.querySelector('.art-list').innerHTML = myArtStr;
    // 3.1保存并设置文章总条数
    totalCount = res.data.total_count;
    document.querySelector('.total-count').innerHTML = `共${totalCount}条`;
}
setArticalList();
/**
 * 目标2：筛选文章列表
 * 2.1设置频道列表数据
 * 2.2监听筛选条件改变，保存查询信息到查询参数对象
 * 2.3点击筛选时，传递查询参数对象到服务器
 * 2.4获取匹配数据，覆盖到页面展示
 */
// 2.1设置频道列表数据
async function setChannelList() {
    const res = await axios({ url: '/v1_0/channels' });
    console.log(res);
    const channelStr = res.data.channels
        .map((item, idx) => {
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
// 2.2监听筛选条件改变，保存查询信息到查询参数对象
// 筛选状态标记数字-change事件-绑定到查询参数对象上
document.querySelectorAll('.form-check-input').forEach(radio => {
    radio.addEventListener('change', function (e) {
        queryObj.status = e.target.value;
    });
});
// 筛选频道id-change
document.querySelector('.form-select').addEventListener('change', function (e) {
    queryObj.channel_id = e.target.value;
});
// 筛选按钮
document.querySelector('.sel-btn').addEventListener('click', function () {
    setArticalList();
});

/**
 * 目标3：分页功能
 * 3.1保存并设置文章总条数
 * 3.2点击下一页，做临界值判断，并切换页码请求新数据
 * 3.3上一页
 */
// 3.2点击下一页
document.querySelector('.next').addEventListener('click', function (e) {
    // 当前页码小于最大页码数
    if (queryObj.page < Math.ceil(totalCount / queryObj.per_page)) {
        queryObj.page++;
        // 页码改变
        document.querySelector('.page-now').innerHTML = `第${queryObj.page}页`;
        setArticalList();
    }
});
// 3.3点击上一页
document.querySelector('.last').addEventListener('click', function (e) {
    // 大于1时才能翻到上一页
    if (queryObj.page > 1) {
        queryObj.page--;
        // 页码改变
        document.querySelector('.page-now').innerHTML = `第${queryObj.page}页`;
        setArticalList();
    }
});
/**
 * 目标4：删除文章
 * 4.1 关联文章id到删除图标
 * 4.2点击删除时，获取文章id
 * 4.3调用删除接口，传递文章id到服务器
 * 4.4重新获取文章列表显示
 * 4.5在删除最后一页最后一条时需要自动向前翻页
 */
document.querySelector('.art-list').addEventListener('click', async function (e) {
    // 判断点击的是删除
    if (e.target.classList.contains('del')) {
        const delId = e.target.parentNode.dataset.id;
        // 4.3删除
        const res = await axios({
            url: `/v1_0/mp/articles/${delId}`,
            method: 'delete',
        });
        // 4.5修改page
        const children = document.querySelector('.art-list').children;
        if (children.length === 1 && queryObj.page !== 1) {
            queryObj.page--;
            document.querySelector('.page-now').innerHTML = `第${queryObj.page}页`;
        }
        // 4.4重新获取文章列表
        setArticalList();
    }
});

// 点击编辑时，获取文章id，跳转到发布文章页面传递文章id
document.querySelector('.art-list').addEventListener('click', function (e) {
    if (e.target.classList.contains('edit')) {
        const artId = e.target.parentNode.dataset.id;
        location.href = `../publish/index.html?id=${artId}`;
    }
});
