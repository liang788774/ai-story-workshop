// 通用工具函数
function importStory() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const story = JSON.parse(event.target.result);
            if (window.importStoryData) {
                window.importStoryData(story);
            }
            alert('故事导入成功！');
        } catch (err) {
            alert('导入失败：文件格式错误');
            console.error(err);
        }
    };
    reader.readAsText(file);
});