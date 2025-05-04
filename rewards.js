// 常量定义
const REWARDS_STORAGE_KEY = 'yuanbao_rewards';
const POINTS_STORAGE_KEY = 'yuanbao_points';
const HISTORY_STORAGE_KEY = 'yuanbao_history';

// DOM元素
const rewardsListContainer = document.getElementById('rewards-list');
const currentDateElement = document.getElementById('current-date');
const totalPointsElement = document.getElementById('points-value');
const exchangeModal = document.getElementById('exchange-modal');
const closeModalButton = document.querySelector('.close');
const exchangeNameElement = document.getElementById('exchange-name');
const exchangePointsElement = document.getElementById('exchange-points');
const confirmExchangeButton = document.getElementById('confirm-exchange');
const cancelExchangeButton = document.getElementById('cancel-exchange');

// 应用状态
let rewards = [];
let totalPoints = 0;
let selectedReward = null;

// 初始化应用
function initApp() {
    updateDateTime();
    loadRewards();
    loadPoints();
    renderRewards();
    setupEventListeners();
    
    // 每隔一分钟更新时间
    setInterval(updateDateTime, 60000);
}

// 更新日期时间显示
function updateDateTime() {
    const now = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]} ${formatTime(now)}`;
    currentDateElement.textContent = dateStr;
}

// 格式化时间
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 从本地存储加载奖励列表
function loadRewards() {
    const storedRewards = localStorage.getItem(REWARDS_STORAGE_KEY);
    rewards = storedRewards ? JSON.parse(storedRewards) : getDefaultRewards();
}

// 从本地存储加载积分
function loadPoints() {
    const storedPoints = localStorage.getItem(POINTS_STORAGE_KEY);
    totalPoints = storedPoints ? parseInt(storedPoints) : 0;
    totalPointsElement.textContent = totalPoints;
}

// 获取默认奖励列表
function getDefaultRewards() {
    return [
        {
            id: 1,
            name: '元宝专属小零食一份',
            description: '完成任务后犒劳自己，享受小零食',
            points: 10,
            image: 'images/snack.jpg',
            stock: 5
        },
        {
            id: 2,
            name: '元宝专属奶茶一杯',
            description: '放松心情，享受奶茶',
            points: 25,
            image: 'images/milk-tea.jpg',
            stock: 3
        },
        {
            id: 3,
            name: '元宝专属漂亮衣服',
            description: '元宝穿上漂亮衣服，美美哒',
            points: 60,
            image: 'images/beautiful-clothes.jpg',
            stock: 10
        },
        {
            id: 4,
            name: '元宝专属自由指定礼物',
            description: '元宝可以自由指定礼物哦！！！',
            points: 80,
            image: 'images/free-gift.jpg',
            stock: 1
        },
        {
            id: 5,
            name: '面膜一盒',
            description: '元宝专属面膜一盒',
            points: 40,
            image: 'images/mask.jpg',
            stock: 2
        },
        {
            id: 6,
            name: '带你出去玩',
            description: '可以带元宝出去玩哦！！！',
            points: 200,
            image: 'images/play.jpg',
            stock: 1
        },
        {
            id: 7,
            name: '睡觉觉',
            description: '嘿嘿嘿',
            points: 100,
            image: 'images/sleep.jpg',
            stock: 1
        },
        {
            id: 8,
            name: '成功上岸',
            description: '实现所有愿望',
            points: 1000,
            image: 'images/success.jpg',
            stock: 1
        }
    ];
}

// 保存奖励到本地存储
function saveRewards() {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
}

// 保存积分到本地存储
function savePoints() {
    localStorage.setItem(POINTS_STORAGE_KEY, totalPoints.toString());
}

// 添加历史记录
function addHistory(action, rewardName, points) {
    const now = new Date();
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    
    history.push({
        timestamp: now.getTime(),
        date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
        time: formatTime(now),
        action,
        rewardName,
        points
    });
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

// 渲染奖励列表
function renderRewards() {
    // 清空容器
    rewardsListContainer.innerHTML = '';
    
    rewards.forEach(reward => {
        rewardsListContainer.appendChild(createRewardElement(reward));
    });
}

// 创建奖励元素
function createRewardElement(reward) {
    const rewardElement = document.createElement('div');
    rewardElement.className = 'reward-item';
    rewardElement.dataset.id = reward.id;
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'reward-image';
    
    // 显示默认图片或奖励相关图片（如果链接有效）
    const imageSrc = getImageUrl(reward.image);
    const image = document.createElement('img');
    image.src = imageSrc;
    image.alt = reward.name;
    image.onerror = function() {
        this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="5"></circle><line x1="3" y1="3" x2="21" y2="21"></line></svg>';
    };
    imageContainer.appendChild(image);
    
    const nameElement = document.createElement('div');
    nameElement.className = 'reward-name';
    nameElement.textContent = reward.name;
    
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'reward-description';
    descriptionElement.textContent = reward.description;
    
    const pointsElement = document.createElement('div');
    pointsElement.className = 'reward-points';
    pointsElement.textContent = `${reward.points}积分`;
    
    const exchangeButton = document.createElement('button');
    exchangeButton.className = 'exchange-btn';
    exchangeButton.textContent = '立即兑换';
    
    // 检查积分是否足够兑换
    if (totalPoints < reward.points) {
        exchangeButton.disabled = true;
        exchangeButton.textContent = '积分不足';
    }
    
    if (reward.stock !== undefined && reward.stock <= 0) {
        exchangeButton.disabled = true;
        exchangeButton.textContent = '库存不足';
    }
    
    exchangeButton.addEventListener('click', () => {
        openExchangeModal(reward);
    });
    
    // 如果有库存信息则显示
    if (reward.stock !== undefined) {
        const stockBadge = document.createElement('div');
        stockBadge.className = 'stock-badge';
        stockBadge.textContent = `剩余: ${reward.stock}`;
        rewardElement.appendChild(stockBadge);
    }
    
    rewardElement.appendChild(imageContainer);
    rewardElement.appendChild(nameElement);
    rewardElement.appendChild(descriptionElement);
    rewardElement.appendChild(pointsElement);
    rewardElement.appendChild(exchangeButton);
    
    return rewardElement;
}

// 获取图片URL（处理无效链接的情况）
function getImageUrl(imagePath) {
    // 检查路径是否为空
    if (!imagePath) {
        return getDefaultImageSvg();
    }
    
    // 如果imagePath是URL，则直接返回
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // 如果是本地路径，尝试加载
    try {
        // 尝试构建相对路径
        return imagePath;
    } catch (e) {
        console.error('图片加载失败:', imagePath, e);
        return getDefaultImageSvg();
    }
}

// 默认SVG图片
function getDefaultImageSvg() {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="5"></circle></svg>';
}

// 打开兑换确认模态框
function openExchangeModal(reward) {
    selectedReward = reward;
    exchangeNameElement.textContent = reward.name;
    exchangePointsElement.textContent = `${reward.points}积分`;
    exchangeModal.style.display = 'block';
}

// 执行奖励兑换
function exchangeReward() {
    if (!selectedReward) return;
    
    // 检查积分是否足够
    if (totalPoints < selectedReward.points) {
        alert('积分不足，无法兑换！');
        return;
    }
    
    // 检查库存是否充足
    if (selectedReward.stock !== undefined && selectedReward.stock <= 0) {
        alert('库存不足，无法兑换！');
        return;
    }
    
    // 扣除积分
    totalPoints -= selectedReward.points;
    totalPointsElement.textContent = totalPoints;
    
    // 更新库存
    if (selectedReward.stock !== undefined) {
        const rewardIndex = rewards.findIndex(r => r.id === selectedReward.id);
        if (rewardIndex !== -1) {
            rewards[rewardIndex].stock--;
        }
    }
    
    // 添加历史记录
    addHistory('兑换奖励', selectedReward.name, -selectedReward.points);
    
    // 保存更新
    savePoints();
    saveRewards();
    
    // 重新渲染奖励列表
    renderRewards();
    
    // 关闭模态框
    exchangeModal.style.display = 'none';
    
    // 显示兑换成功消息
    alert(`恭喜你成功兑换了【${selectedReward.name}】！`);
    
    // 清除选中的奖励
    selectedReward = null;
}

// 设置事件监听器
function setupEventListeners() {
    // 关闭模态框
    closeModalButton.addEventListener('click', () => {
        exchangeModal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === exchangeModal) {
            exchangeModal.style.display = 'none';
        }
    });
    
    // 确认兑换按钮
    confirmExchangeButton.addEventListener('click', exchangeReward);
    
    // 取消兑换按钮
    cancelExchangeButton.addEventListener('click', () => {
        exchangeModal.style.display = 'none';
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp); 