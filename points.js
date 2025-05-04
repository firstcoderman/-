// 常量定义
const POINTS_STORAGE_KEY = 'yuanbao_points';
const HISTORY_STORAGE_KEY = 'yuanbao_history';
const ACTIVITIES_STORAGE_KEY = 'yuanbao_activities';

// DOM元素
const currentDateElement = document.getElementById('current-date');
const totalPointsElement = document.getElementById('points-value');
const currentPointsElement = document.getElementById('current-points');
const totalEarnedElement = document.getElementById('total-earned');
const totalSpentElement = document.getElementById('total-spent');
const recentActivitiesList = document.getElementById('recent-activities-list');
const periodButtons = document.querySelectorAll('.period-btn');
const pointsChart = document.getElementById('points-chart');
const resetPointsButton = document.getElementById('reset-points');
const clearActivitiesButton = document.getElementById('clear-activities');

// 应用状态
let totalPoints = 0;
let history = [];
let chart = null;
let currentPeriod = 'week';

// 初始化应用
function initApp() {
    updateDateTime();
    loadPoints();
    loadHistory();
    updatePointsOverview();
    renderRecentActivities();
    setupChartData(currentPeriod);
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

// 从本地存储加载积分
function loadPoints() {
    const storedPoints = localStorage.getItem(POINTS_STORAGE_KEY);
    totalPoints = storedPoints ? parseInt(storedPoints) : 0;
    totalPointsElement.textContent = totalPoints;
}

// 从本地存储加载历史记录
function loadHistory() {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    history = storedHistory ? JSON.parse(storedHistory) : [];
}

// 更新积分概览数据
function updatePointsOverview() {
    // 设置当前积分
    currentPointsElement.textContent = totalPoints;
    
    // 计算累计获得的积分
    const totalEarned = history.reduce((sum, record) => {
        return record.points > 0 ? sum + record.points : sum;
    }, 0);
    totalEarnedElement.textContent = totalEarned;
    
    // 计算累计消费的积分
    const totalSpent = history.reduce((sum, record) => {
        return record.points < 0 ? sum + Math.abs(record.points) : sum;
    }, 0);
    totalSpentElement.textContent = totalSpent;
}

// 渲染最近活动列表
function renderRecentActivities() {
    // 清空容器
    recentActivitiesList.innerHTML = '';
    
    // 获取最近的10条记录
    const recentActivities = [...history]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    
    if (recentActivities.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '暂无活动记录';
        recentActivitiesList.appendChild(emptyMessage);
        return;
    }
    
    // 渲染每条活动记录
    recentActivities.forEach(activity => {
        const activityItem = createActivityElement(activity);
        recentActivitiesList.appendChild(activityItem);
    });
}

// 创建活动元素
function createActivityElement(activity) {
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    
    const detailsElement = document.createElement('div');
    detailsElement.className = 'activity-details';
    
    const nameElement = document.createElement('div');
    nameElement.className = 'activity-name';
    nameElement.textContent = `${activity.action}: ${activity.taskName || activity.rewardName}`;
    
    const timeElement = document.createElement('div');
    timeElement.className = 'activity-time';
    timeElement.textContent = `${activity.date} ${activity.time}`;
    
    detailsElement.appendChild(nameElement);
    detailsElement.appendChild(timeElement);
    
    const pointsElement = document.createElement('div');
    pointsElement.className = `activity-points ${activity.points >= 0 ? 'points-positive' : 'points-negative'}`;
    pointsElement.textContent = activity.points >= 0 ? `+${activity.points}` : `${activity.points}`;
    
    activityElement.appendChild(detailsElement);
    activityElement.appendChild(pointsElement);
    
    return activityElement;
}

// 设置图表数据
function setupChartData(period) {
    // 清除旧图表
    if (chart) {
        chart.destroy();
    }
    
    const { labels, data } = getChartData(period);
    
    // 创建新图表
    chart = new Chart(pointsChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '积分余额',
                data: data,
                backgroundColor: 'rgba(30, 58, 138, 0.1)',
                borderColor: '#1E3A8A',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 获取图表数据
function getChartData(period) {
    const now = new Date();
    let labels = [];
    let pointsData = [];
    
    // 根据不同时间段生成标签和数据
    switch (period) {
        case 'week':
            // 获取本周数据
            labels = getWeekdayLabels(now);
            pointsData = getWeeklyData(now);
            break;
        case 'month':
            // 获取本月数据
            labels = getMonthLabels(now);
            pointsData = getMonthlyData(now);
            break;
        case 'year':
            // 获取年度数据
            labels = getYearLabels(now);
            pointsData = getYearlyData(now);
            break;
    }
    
    return { labels, data: pointsData };
}

// 获取周标签
function getWeekdayLabels(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = date.getDay();
    const result = [];
    
    for (let i = 0; i < 7; i++) {
        result.push(weekdays[(today - 6 + i + 7) % 7]);
    }
    
    return result;
}

// 获取周数据
function getWeeklyData(date) {
    const today = date.getDay();
    const result = Array(7).fill(0);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - (today === 0 ? 6 : today - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // 模拟数据
    let runningTotal = totalPoints;
    
    // 从最后一天开始回推
    for (let i = 6; i >= 0; i--) {
        result[i] = runningTotal;
        
        // 获取当天的历史记录并计算积分变化
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        
        const dayRecords = history.filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate.getDate() === dayDate.getDate() &&
                   recordDate.getMonth() === dayDate.getMonth() &&
                   recordDate.getFullYear() === dayDate.getFullYear();
        });
        
        const dayChange = dayRecords.reduce((sum, record) => sum + record.points, 0);
        
        // 向前一天减去当天变化
        if (i > 0) {
            runningTotal -= dayChange;
            
            // 确保不会出现负值
            if (runningTotal < 0) runningTotal = 0;
        }
    }
    
    return result;
}

// 获取月标签
function getMonthLabels(date) {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);
}

// 获取月数据
function getMonthlyData(date) {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const result = Array(daysInMonth).fill(0);
    
    // 生成模拟数据
    const dayIncrements = [5, 10, 15, 0, -30, 20, 0, 5, 10, 0, -20, 15, 0, 0, 10, 5, 0, -5, 15, 0, 10, 0, 5, 0, 0, 10, 15, 0, -10, 5, 0];
    
    let currentTotal = 0;
    
    for (let i = 0; i < daysInMonth; i++) {
        currentTotal += dayIncrements[i] || 0;
        result[i] = Math.max(0, currentTotal);
    }
    
    // 最后一天为当前总积分
    result[daysInMonth - 1] = totalPoints;
    
    return result;
}

// 获取年标签
function getYearLabels() {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return months;
}

// 获取年数据
function getYearlyData() {
    // 生成模拟数据
    return [5, 15, 30, 50, 65, 95, 110, 130, 150, 180, 200, totalPoints];
}

// 重置积分
function resetPoints() {
    if (confirm('确定要重置所有积分吗？这将清空您的积分记录！')) {
        // 重置积分
        totalPoints = 0;
        totalPointsElement.textContent = totalPoints;
        
        // 更新积分概览
        document.getElementById('current-points').textContent = totalPoints;
        document.getElementById('total-earned').textContent = '0';
        document.getElementById('total-spent').textContent = '0';
        
        // 保存到本地存储
        savePoints();
        
        // 添加历史记录
        addHistory('重置积分', '重置所有积分', 0);
        
        // 更新图表
        updateChart(currentPeriod);
        
        // 更新最近活动
        loadRecentActivities();
        
        alert('积分已重置！');
    }
}

// 清除最近活动
function clearActivities() {
    if (confirm('确定要清空最近活动记录吗？这将删除显示的活动历史！')) {
        // 获取最近活动
        const recentActivities = JSON.parse(localStorage.getItem(ACTIVITIES_STORAGE_KEY) || '[]');
        
        // 清空最近活动
        localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify([]));
        
        // 重新加载活动列表
        loadRecentActivities();
        
        alert('最近活动已清空！');
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 时间周期切换按钮
    periodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按钮的active类
            periodButtons.forEach(btn => btn.classList.remove('active'));
            
            // 为当前按钮添加active类
            button.classList.add('active');
            
            // 更新图表数据
            const period = button.dataset.period;
            currentPeriod = period;
            setupChartData(period);
        });
    });
    
    // 重置积分按钮
    resetPointsButton.addEventListener('click', resetPoints);
    
    // 清除活动记录按钮
    clearActivitiesButton.addEventListener('click', clearActivities);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp); 
 