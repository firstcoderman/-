// 任务和积分的本地存储键
const TASKS_STORAGE_KEY = 'yuanbao_tasks';
const POINTS_STORAGE_KEY = 'yuanbao_points';
const HISTORY_STORAGE_KEY = 'yuanbao_history';
const PRESET_TASKS_KEY = 'yuanbao_preset_tasks';

// 应用状态
let tasks = [];
let presetTasks = [];
let totalPoints = 0;

// DOM元素
const pendingTasksContainer = document.getElementById('pending-tasks');
const completedTasksContainer = document.getElementById('completed-tasks');
const totalPointsElement = document.getElementById('points-value');
const currentDateElement = document.getElementById('current-date');
const addTaskButton = document.getElementById('add-task');
const resetTasksButton = document.getElementById('reset-tasks');
const addTaskModal = document.getElementById('add-task-modal');
const closeModalButton = document.querySelector('.close');
const taskForm = document.getElementById('task-form');
const taskGroupHeaders = document.querySelectorAll('.group-header');
const taskSelectElement = document.getElementById('task-select');
const customTaskButton = document.getElementById('custom-task-btn');
const addSelectedTaskButton = document.getElementById('add-selected-task');

// 初始化应用
function initApp() {
    updateDateTime();
    loadTasks();
    loadPresetTasks();
    loadPoints();
    renderTasks();
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

// 从本地存储加载任务
function loadTasks() {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    tasks = storedTasks ? JSON.parse(storedTasks) : getDefaultTasks();
}

// 从本地存储加载预设任务
function loadPresetTasks() {
    const storedPresetTasks = localStorage.getItem(PRESET_TASKS_KEY);
    presetTasks = storedPresetTasks ? JSON.parse(storedPresetTasks) : getDefaultTasks();
    
    // 初始化预设任务下拉菜单
    populateTaskSelect();
}

// 填充预设任务下拉菜单
function populateTaskSelect() {
    // 清空旧选项
    taskSelectElement.innerHTML = '<option value="">-- 选择一个预设任务 --</option>';
    
    // 添加预设任务选项
    presetTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = `${task.name} (${task.points}积分) - ${task.category}`;
        taskSelectElement.appendChild(option);
    });
}

// 从本地存储加载积分
function loadPoints() {
    const storedPoints = localStorage.getItem(POINTS_STORAGE_KEY);
    totalPoints = storedPoints ? parseInt(storedPoints) : 0; // 默认0积分
    totalPointsElement.textContent = totalPoints;
}

// 获取默认任务列表
function getDefaultTasks() {
    return [
        {
            id: 1,
            name: '早上8:00起床床',
            description: '美好的一天开始啦',
            points: 2,
            status: 'pending',
            category: '作息'
        },
        {
            id: 2,
            name: '晚上11:00睡觉觉',
            description: '元宝今天真的很棒',
            points: 2,
            status: 'pending',
            category: '作息'
        },
        {
            id: 3,
            name: '摸鱼',
            description: '小宝宝坚持才是胜利哦',
            points: -4,
            status: 'pending',
            category: '偷懒'
        },
        {
            id: 4,
            name: '做资料',
            description: '做资料的小宝宝最美了',
            points: 3,
            status: 'pending',
            category: '学习'
        },
        {
            id: 5,
            name: '做数量',
            description: '明明做数量的小宝宝才最美',
            points: 3,
            status: 'pending',
            category: '学习'
        },
        {
            id: 6,
            name: '做判断推理',
            description: '那当然是做判断推理的小宝宝最棒啦',
            points: 3,
            status: 'pending',
            category: '学习'
        },
        {
            id: 7,
            name: '背政治理论',
            description: '胡说,明明是背政治理论的小宝宝最棒啦',
            points: 3,
            status: 'pending',
            category: '学习'
        },
        {
            id: 8,
            name: '常识',
            description: '元宝宝的常识非常厉害',
            points: 3,
            status: 'pending',
            category: '学习'
        },
        {
            id: 9,
            name: '言语',
            description: '元宝的言语能力一点都不赖',
            points: 3,
            status: 'pending',
            category: '学习'
        },  
        {
            id: 10,
            name: '申论',
            description: '像元宝宝这样努力学习申论的宝宝那是一定会上岸的',
            points: 5,
            status: 'pending',
            category: '学习'
        },
        {
            id: 11,
            name: '行测套卷',
            description: '元宝宝最棒！！！',
            points: 5,
            status: 'pending',
            category: '学习'
        }
    ];
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// 保存积分到本地存储
function savePoints() {
    localStorage.setItem(POINTS_STORAGE_KEY, totalPoints.toString());
}

// 添加历史记录
function addHistory(action, taskName, points) {
    const now = new Date();
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    
    history.push({
        timestamp: now.getTime(),
        date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
        time: formatTime(now),
        action,
        taskName,
        points
    });
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

// 渲染任务列表
function renderTasks() {
    // 清空容器
    pendingTasksContainer.innerHTML = '';
    completedTasksContainer.innerHTML = '';
    
    // 筛选未完成和已完成的任务
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    // 渲染未完成任务
    pendingTasks.forEach(task => {
        pendingTasksContainer.appendChild(createTaskElement(task));
    });
    
    // 渲染已完成任务
    completedTasks.forEach(task => {
        completedTasksContainer.appendChild(createTaskElement(task));
    });
}

// 创建任务元素
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.id = task.id;
    
    // 任务信息部分
    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';
    
    const taskName = document.createElement('div');
    taskName.className = 'task-name';
    taskName.textContent = task.name;
    
    const taskDescription = document.createElement('div');
    taskDescription.className = 'task-description';
    taskDescription.textContent = task.description;
    
    const taskMeta = document.createElement('div');
    taskMeta.className = 'task-meta';
    
    const taskPoints = document.createElement('span');
    taskPoints.className = 'task-points';
    taskPoints.textContent = `${task.points}积分`;
    
    const taskStatus = document.createElement('span');
    taskStatus.className = `task-status status-${task.status}`;
    taskStatus.textContent = task.status === 'pending' ? '待完成' : '已完成';
    
    taskMeta.appendChild(taskPoints);
    taskMeta.appendChild(taskStatus);
    
    taskInfo.appendChild(taskName);
    taskInfo.appendChild(taskDescription);
    taskInfo.appendChild(taskMeta);
    
    // 任务操作部分
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    if (task.status === 'pending') {
        const completeButton = document.createElement('button');
        completeButton.textContent = '完成';
        completeButton.addEventListener('click', () => completeTask(task.id));
        
        const abandonButton = document.createElement('button');
        abandonButton.textContent = '放弃';
        abandonButton.className = 'abandon';
        abandonButton.addEventListener('click', () => abandonTask(task.id));
        
        taskActions.appendChild(completeButton);
        taskActions.appendChild(abandonButton);
    }
    
    taskElement.appendChild(taskInfo);
    taskElement.appendChild(taskActions);
    
    return taskElement;
}

// 完成任务
function completeTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        
        // 更新任务状态
        task.status = 'completed';
        
        // 增加积分
        totalPoints += task.points;
        totalPointsElement.textContent = totalPoints;
        
        // 添加历史记录
        addHistory('完成任务', task.name, task.points);
        
        // 保存更新
        saveTasks();
        savePoints();
        
        // 重新渲染任务
        renderTasks();
    }
}

// 放弃任务
function abandonTask(taskId) {
    if (confirm('确定要放弃这个任务吗？')) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const task = tasks[taskIndex];
            
            // 添加历史记录
            addHistory('放弃任务', task.name, 0);
            
            // 从数组中移除任务
            tasks.splice(taskIndex, 1);
            
            // 保存更新
            saveTasks();
            
            // 重新渲染任务
            renderTasks();
        }
    }
}

// 添加新任务
function addNewTask(taskData) {
    // 生成新ID
    const newId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
    
    // 创建新任务对象
    const newTask = {
        id: newId,
        name: taskData.name,
        description: taskData.description || '',
        points: taskData.points,
        status: 'pending',
        category: taskData.category
    };
    
    // 添加到任务数组
    tasks.push(newTask);
    
    // 添加历史记录
    addHistory('添加任务', newTask.name, 0);
    
    // 保存并重新渲染
    saveTasks();
    renderTasks();
}

// 添加任务到今日任务
function addTaskToToday(taskId) {
    // 找到选中的预设任务
    const selectedTask = presetTasks.find(task => task.id.toString() === taskId.toString());
    
    if (selectedTask) {
        // 创建一个新任务（复制预设任务，但生成新ID）
        const newTask = {
            ...selectedTask,
            id: Date.now(), // 使用时间戳作为新ID
            status: 'pending'
        };
        
        // 添加到任务列表
        tasks.push(newTask);
        
        // 保存任务列表
        saveTasks();
        
        // 重新渲染任务列表
        renderTasks();
        
        // 记录历史
        addHistory('添加任务', newTask.name, 0);
        
        // 关闭模态框
        closeModal();
    }
}

// 重置任务
function resetTasks() {
    if (confirm('确定要重置所有任务吗？这将删除所有已完成的任务，并将未完成的任务重置为默认状态。')) {
        tasks = getDefaultTasks();
        
        // 添加历史记录
        addHistory('重置任务', '所有任务', 0);
        
        // 保存并重新渲染
        saveTasks();
        renderTasks();
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 打开添加任务模态框
    addTaskButton.addEventListener('click', () => {
        openModal();
    });
    
    // 关闭模态框
    closeModalButton.addEventListener('click', closeModal);
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            closeModal();
        }
    });
    
    // 任务表单提交
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const taskName = document.getElementById('task-name').value;
        const taskDescription = document.getElementById('task-description').value;
        const taskPoints = parseInt(document.getElementById('task-points').value);
        const taskCategory = document.getElementById('task-category').value;
        
        addNewTask({
            name: taskName,
            description: taskDescription,
            points: taskPoints,
            category: taskCategory
        });
        
        // 重置表单并关闭模态框
        taskForm.reset();
        closeModal();
    });
    
    // 重置任务按钮
    resetTasksButton.addEventListener('click', resetTasks);
    
    // 任务组切换
    taskGroupHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const taskItems = header.nextElementSibling;
            const toggleBtn = header.querySelector('.toggle-btn');
            
            if (taskItems.style.display === 'none') {
                taskItems.style.display = 'block';
                toggleBtn.textContent = '▼';
            } else {
                taskItems.style.display = 'none';
                toggleBtn.textContent = '▲';
            }
        });
    });
    
    // 自定义任务按钮点击事件
    customTaskButton.addEventListener('click', () => {
        taskForm.style.display = 'block';
        document.querySelector('.task-selection').style.display = 'none';
        document.querySelector('.form-actions').style.display = 'none';
    });
    
    // 添加选中任务按钮点击事件
    addSelectedTaskButton.addEventListener('click', () => {
        const selectedTaskId = taskSelectElement.value;
        if (selectedTaskId) {
            addTaskToToday(selectedTaskId);
        }
    });
}

// 打开模态框
function openModal() {
    // 重置模态框状态
    taskForm.style.display = 'none';
    document.querySelector('.task-selection').style.display = 'block';
    document.querySelector('.form-actions').style.display = 'block';
    
    // 显示模态框
    addTaskModal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    addTaskModal.style.display = 'none';
    // 重置表单
    taskForm.reset();
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp); 