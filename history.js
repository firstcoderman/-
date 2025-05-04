// 常量定义
const POINTS_STORAGE_KEY = 'yuanbao_points';
const HISTORY_STORAGE_KEY = 'yuanbao_history';

// DOM元素
const currentDateElement = document.getElementById('current-date');
const totalPointsElement = document.getElementById('points-value');
const historyTableBody = document.getElementById('history-table-body');
const paginationContainer = document.getElementById('pagination');
const actionFilterSelect = document.getElementById('action-filter');
const dateFilterSelect = document.getElementById('date-filter');
const clearFilterButton = document.getElementById('clear-filter');
const totalRecordsElement = document.getElementById('total-records');
const completedTasksElement = document.getElementById('completed-tasks');
const exchangedRewardsElement = document.getElementById('exchanged-rewards');
const pointsChangeElement = document.getElementById('points-change');
const clearHistoryButton = document.getElementById('clear-history');

// 应用状态
let totalPoints = 0;
let history = [];
let filteredHistory = [];
let currentPage = 1;
const itemsPerPage = 10;

// 初始化应用
function initApp() {
    updateDateTime();
    loadPoints();
    loadHistory();
    applyFilters();
    updateHistoryStats();
    renderHistoryTable();
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
    history = storedHistory ? JSON.parse(storedHistory) : getDefaultHistory();
}

// 获取默认历史记录（用于测试）
function getDefaultHistory() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);
    
    return [
        {
            timestamp: now.getTime(),
            date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
            time: "09:30",
            action: "完成任务",
            taskName: "早上9:00出门",
            points: 5
        },
        {
            timestamp: now.getTime() - 3600000,
            date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
            time: "08:30",
            action: "添加任务",
            taskName: "复习公文写作",
            points: 0
        },
        {
            timestamp: yesterday.getTime(),
            date: `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`,
            time: "16:20",
            action: "完成任务",
            taskName: "完成行测一套题",
            points: 10
        },
        {
            timestamp: yesterday.getTime() - 3600000 * 2,
            date: `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`,
            time: "14:15",
            action: "兑换奖励",
            rewardName: "奶茶一杯",
            points: -30
        },
        {
            timestamp: twoDaysAgo.getTime(),
            date: `${twoDaysAgo.getFullYear()}-${twoDaysAgo.getMonth() + 1}-${twoDaysAgo.getDate()}`,
            time: "21:00",
            action: "完成任务",
            taskName: "申论写作练习",
            points: 15
        }
    ];
}

// 应用筛选条件
function applyFilters() {
    const actionFilter = actionFilterSelect.value;
    const dateFilter = dateFilterSelect.value;
    
    filteredHistory = [...history];
    
    // 应用操作类型筛选
    if (actionFilter !== 'all') {
        filteredHistory = filteredHistory.filter(record => record.action === actionFilter);
    }
    
    // 应用日期筛选
    if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateFilter) {
            case 'today':
                // 今天的记录
                filteredHistory = filteredHistory.filter(record => {
                    const recordDate = new Date(record.timestamp);
                    return recordDate.getDate() === now.getDate() &&
                           recordDate.getMonth() === now.getMonth() &&
                           recordDate.getFullYear() === now.getFullYear();
                });
                break;
            case 'week':
                // 本周的记录（过去7天）
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 6);
                
                filteredHistory = filteredHistory.filter(record => {
                    const recordDate = new Date(record.timestamp);
                    return recordDate >= weekStart;
                });
                break;
            case 'month':
                // 本月的记录
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                
                filteredHistory = filteredHistory.filter(record => {
                    const recordDate = new Date(record.timestamp);
                    return recordDate >= monthStart;
                });
                break;
        }
    }
    
    // 按时间降序排序
    filteredHistory.sort((a, b) => b.timestamp - a.timestamp);
    
    // 重置当前页
    currentPage = 1;
    
    // 更新统计数据
    updateHistoryStats();
}

// 更新历史记录统计数据
function updateHistoryStats() {
    // 更新总记录数
    totalRecordsElement.textContent = filteredHistory.length;
    
    // 任务完成次数
    const completedCount = filteredHistory.filter(record => record.action === '完成任务').length;
    completedTasksElement.textContent = completedCount;
    
    // 奖励兑换次数
    const exchangedCount = filteredHistory.filter(record => record.action === '兑换奖励').length;
    exchangedRewardsElement.textContent = exchangedCount;
    
    // 积分变化
    const pointsChange = filteredHistory.reduce((sum, record) => sum + record.points, 0);
    pointsChangeElement.textContent = pointsChange > 0 ? `+${pointsChange}` : pointsChange;
    pointsChangeElement.style.color = pointsChange >= 0 ? '#4caf50' : '#f44336';
}

// 渲染历史表格
function renderHistoryTable() {
    // 清空表格内容
    historyTableBody.innerHTML = '';
    
    // 如果没有记录
    if (filteredHistory.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 5;
        emptyCell.className = 'empty-records';
        emptyCell.textContent = '暂无符合条件的记录';
        
        emptyRow.appendChild(emptyCell);
        historyTableBody.appendChild(emptyRow);
        
        // 隐藏分页
        paginationContainer.innerHTML = '';
        return;
    }
    
    // 计算分页
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredHistory.length);
    const currentPageData = filteredHistory.slice(startIndex, endIndex);
    
    // 渲染当前页数据
    currentPageData.forEach(record => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = record.date;
        
        const timeCell = document.createElement('td');
        timeCell.textContent = record.time;
        
        const actionCell = document.createElement('td');
        actionCell.textContent = record.action;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = record.taskName || record.rewardName || '-';
        
        const pointsCell = document.createElement('td');
        if (record.points > 0) {
            pointsCell.textContent = `+${record.points}`;
            pointsCell.className = 'points-positive';
        } else if (record.points < 0) {
            pointsCell.textContent = record.points;
            pointsCell.className = 'points-negative';
        } else {
            pointsCell.textContent = '0';
        }
        
        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(actionCell);
        row.appendChild(nameCell);
        row.appendChild(pointsCell);
        
        historyTableBody.appendChild(row);
    });
    
    // 渲染分页控件
    renderPagination();
}

// 渲染分页控件
function renderPagination() {
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    
    if (totalPages <= 1) {
        return;
    }
    
    // 上一页按钮
    const prevButton = document.createElement('div');
    prevButton.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.textContent = '«';
    if (currentPage > 1) {
        prevButton.addEventListener('click', () => {
            currentPage--;
            renderHistoryTable();
        });
    }
    paginationContainer.appendChild(prevButton);
    
    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    
    // 调整起始页码，确保显示足够的页码
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 第一页按钮
    if (startPage > 1) {
        const firstButton = document.createElement('div');
        firstButton.className = 'page-btn';
        firstButton.textContent = '1';
        firstButton.addEventListener('click', () => {
            currentPage = 1;
            renderHistoryTable();
        });
        paginationContainer.appendChild(firstButton);
        
        // 省略号
        if (startPage > 2) {
            const ellipsis = document.createElement('div');
            ellipsis.className = 'page-btn disabled';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('div');
        pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        
        if (i !== currentPage) {
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderHistoryTable();
            });
        }
        
        paginationContainer.appendChild(pageButton);
    }
    
    // 最后页码
    if (endPage < totalPages) {
        // 省略号
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('div');
            ellipsis.className = 'page-btn disabled';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastButton = document.createElement('div');
        lastButton.className = 'page-btn';
        lastButton.textContent = totalPages;
        lastButton.addEventListener('click', () => {
            currentPage = totalPages;
            renderHistoryTable();
        });
        paginationContainer.appendChild(lastButton);
    }
    
    // 下一页按钮
    const nextButton = document.createElement('div');
    nextButton.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.textContent = '»';
    if (currentPage < totalPages) {
        nextButton.addEventListener('click', () => {
            currentPage++;
            renderHistoryTable();
        });
    }
    paginationContainer.appendChild(nextButton);
}

// 清除筛选
function clearFilters() {
    actionFilterSelect.value = 'all';
    dateFilterSelect.value = 'all';
    applyFilters();
    renderHistoryTable();
}

// 清除所有历史记录
function clearHistory() {
    if (confirm('确定要清除所有历史记录吗？此操作不可恢复！')) {
        // 清空历史记录
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
        
        // 清空内存中的历史记录
        history = [];
        
        // 重新应用筛选
        applyFilters();
        
        // 重新渲染历史表格
        renderHistoryTable();
        
        // 更新分页
        renderPagination();
        
        alert('历史记录已清除！');
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 筛选条件变化
    actionFilterSelect.addEventListener('change', () => {
        applyFilters();
        renderHistoryTable();
    });
    
    dateFilterSelect.addEventListener('change', () => {
        applyFilters();
        renderHistoryTable();
    });
    
    // 清除筛选按钮
    clearFilterButton.addEventListener('click', clearFilters);
    
    // 清除历史记录按钮
    clearHistoryButton.addEventListener('click', clearHistory);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp); 