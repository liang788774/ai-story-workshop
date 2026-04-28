let nodes = [];
let connections = [];
let selectedNode = null;
let draggingNode = null;
let dragOffset = { x: 0, y: 0 };
let currentEditingNodeId = null;

// 添加剧情节点
function addNode() {
    const nodeId = Date.now().toString();
    const node = {
        id: nodeId,
        title: "新节点",
        content: "在这里输入剧情内容",
        options: ["选项1", "选项2"],
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200
    };
    nodes.push(node);
    renderNodes();
}

// 渲染所有节点
function renderNodes() {
    const canvas = document.getElementById('canvas');
    // 清除现有节点
    document.querySelectorAll('.node').forEach(n => n.remove());
    
    nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = `node ${selectedNode === node.id ? 'selected' : ''}`;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;
        nodeEl.innerHTML = `
            <div class="font-bold text-purple-600 mb-2">${node.title}</div>
            <div class="text-sm text-gray-600 line-clamp-3">${node.content}</div>
            <div class="mt-2 text-xs text-gray-400">${node.options.length}个选项</div>
        `;
        
        // 双击编辑
        nodeEl.addEventListener('dblclick', () => {
            openNodeModal(node.id);
        });
        
        // 拖拽
        nodeEl.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            selectedNode = node.id;
            draggingNode = node.id;
            dragOffset.x = e.clientX - node.x;
            dragOffset.y = e.clientY - node.y;
            renderNodes();
            renderConnections();
        });
        
        canvas.appendChild(nodeEl);
    });
}

// 打开节点编辑弹窗
function openNodeModal(nodeId) {
    currentEditingNodeId = nodeId;
    const node = nodes.find(n => n.id === nodeId);
    document.getElementById('nodeTitle').value = node.title;
    document.getElementById('nodeContent').value = node.content;
    document.getElementById('nodeOptions').value = node.options.join('\n');
    document.getElementById('nodeModal').classList.remove('hidden');
}

// 关闭节点编辑弹窗
function closeNodeModal() {
    document.getElementById('nodeModal').classList.add('hidden');
    currentEditingNodeId = null;
}

// 保存节点
function saveNode() {
    const node = nodes.find(n => n.id === currentEditingNodeId);
    node.title = document.getElementById('nodeTitle').value;
    node.content = document.getElementById('nodeContent').value;
    node.options = document.getElementById('nodeOptions').value.split('\n').filter(o => o.trim() !== '');
    closeNodeModal();
    renderNodes();
}

// AI生成剧情
async function aiGenerate() {
    const prompt = document.getElementById('aiPrompt').value;
    if (!prompt.trim()) {
        alert('请输入你的想法');
        return;
    }
    
    document.getElementById('aiResult').textContent = '正在生成中...';
    
    try {
        // 本地开发时使用模拟数据，部署时使用真实API
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // 本地开发环境：使用模拟数据
            setTimeout(() => {
                const mockResults = [
                    "放学后，小明在教室里发现了一张神秘纸条。纸条上画着学校的简易地图，标记着图书馆的位置，旁边写着：'宝藏就在知识的海洋中'。小明决定一探究竟...",
                    "校园里的樱花树下，小红捡到了一个奇怪的指南针。指南针总是指向图书馆的方向，无论怎么转动都不变。这难道是什么宝藏的指引吗？",
                    "周末的学校异常安静，只有图书馆还亮着灯。你好奇地走进去，发现管理员老师正在整理一本古老的书籍，书中似乎夹着什么闪闪发光的东西...",
                    "今天是开学第一天，你在教室里发现了一个无人认领的笔记本。翻开一看，里面画满了奇怪的符号和地图，最后一页写着：'寻找真相，不要相信任何人'。",
                    "课间休息时，你最好的朋友悄悄告诉你，他昨晚在学校操场上看到了不明飞行物降落。你们决定今晚一起去调查这个神秘事件...",
                    "学校的阁楼一直是个禁地，但今天你因为追一只小猫不小心闯了进去。在满是灰尘的角落里，你发现了一个尘封已久的箱子，上面有你爷爷的名字..."
                ];
                const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
                document.getElementById('aiResult').textContent = randomResult;
            }, 1000);
        } else {
            // 部署环境：调用真实的AI API
            const response = await fetch('/.netlify/functions/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            });
            
            const data = await response.json();
            const result = data.choices[0].message.content;
            document.getElementById('aiResult').textContent = result;
        }
    } catch (error) {
        document.getElementById('aiResult').textContent = '生成失败，请稍后重试';
        console.error('AI生成失败:', error);
    }
}

// 导出故事
function exportStory() {
    const story = {
        title: '我的故事',
        author: 'AI故事工坊',
        nodes: nodes,
        connections: connections,
        startNodeId: nodes.length > 0 ? nodes[0].id : null
    };
    
    const blob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-story.json';
    a.click();
    URL.revokeObjectURL(url);
}

// 预览故事
function previewStory() {
    exportStory();
    alert('故事已导出，请在游戏页导入预览');
    window.open('play.html', '_blank');
}

// 鼠标移动事件
document.addEventListener('mousemove', (e) => {
    if (draggingNode) {
        const node = nodes.find(n => n.id === draggingNode);
        node.x = e.clientX - dragOffset.x;
        node.y = e.clientY - dragOffset.y;
        renderNodes();
        renderConnections();
    }
});

// 鼠标释放事件
document.addEventListener('mouseup', () => {
    draggingNode = null;
});

// ===================== 节点连线功能 =====================
function renderConnections() {
    const svg = document.getElementById('connections');
    svg.innerHTML = '';

    connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const x1 = fromNode.x + 100;
        const y1 = fromNode.y + 50;
        const x2 = toNode.x + 100;
        const y2 = toNode.y + 50;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${(x1+x2)/2} ${y1}, ${x2} ${y2}`);
        path.setAttribute('class', 'connection pointer-events-auto');
        path.setAttribute('data-id', conn.id);
        svg.appendChild(path);
    });
}

// 连接两个节点
function connectNodes(fromId, toId, optionIndex = 0) {
    const conn = {
        id: Date.now().toString(),
        from: fromId,
        to: toId,
        optionIndex: optionIndex
    };
    connections.push(conn);
    renderConnections();
}

// 导入故事
window.importStoryData = function(story) {
    nodes = story.nodes || [];
    connections = story.connections || [];
    renderNodes();
    renderConnections();
};

// 初始化
renderNodes();