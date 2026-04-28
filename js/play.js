let currentStory = null;
let currentNodeId = null;

// 页面加载时自动读取示例故事
window.onload = async function() {
    try {
        const res = await fetch('data/sample-story.json');
        const story = await res.json();
        loadStoryData(story);
    } catch (e) {
        console.log('未找到示例故事');
    }
};

// 导入故事
function loadStory() {
    document.getElementById('fileInput').click();
}

// 接收导入的故事数据
window.importStoryData = function(story) {
    loadStoryData(story);
};

// 加载故事数据
function loadStoryData(story) {
    currentStory = story;
    currentNodeId = story.startNodeId;
    renderNode();
    document.getElementById('storyTitle').textContent = story.title || '未命名故事';
}

// 渲染当前剧情节点
function renderNode() {
    if (!currentStory || !currentNodeId) return;
    
    const node = currentStory.nodes.find(n => n.id === currentNodeId);
    if (!node) return;
    
    // 显示剧情内容
    document.getElementById('storyContent').textContent = node.content;
    
    // 生成选项按钮
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    node.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 text-left px-4';
        btn.textContent = opt;
        btn.onclick = () => goToNextNode(index);
        container.appendChild(btn);
    });
    
    // 自动存档
    localStorage.setItem('storySave', JSON.stringify({
        story: currentStory,
        currentNodeId: currentNodeId
    }));
}

// 跳转到下一个节点
function goToNextNode(optionIndex) {
    if (!currentStory || !currentNodeId) return;
    
    const conn = currentStory.connections || [];
    const match = conn.find(c => 
        c.from === currentNodeId && c.optionIndex === optionIndex
    );
    
    if (match) {
        currentNodeId = match.to;
        renderNode();
    } else {
        document.getElementById('storyContent').textContent += '\n\n🎉 故事结束啦！感谢游玩！';
        document.getElementById('optionsContainer').innerHTML = '';
    }
}

// 重新开始
function restartStory() {
    if (!currentStory) return;
    currentNodeId = currentStory.startNodeId;
    renderNode();
}

// 读取存档
function loadSave() {
    const save = localStorage.getItem('storySave');
    if (!save) return alert('暂无存档');
    
    const data = JSON.parse(save);
    currentStory = data.story;
    currentNodeId = data.currentNodeId;
    renderNode();
    document.getElementById('storyTitle').textContent = currentStory.title;
}