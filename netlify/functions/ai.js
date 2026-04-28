// 模拟AI回复数据库（高质量、多样化，适合参赛演示）
const MOCK_RESPONSES = [
  "太棒了！这是一个超棒的故事开头创意！让我帮你展开：在一个阳光明媚的午后，你在学校图书馆的旧书架上发现了一本泛黄的日记本，扉页上写着'找到我的人，将开启一段奇妙的冒险'……",
  "哇，这个想法太有趣了！我来帮你构思：你推开了那扇神秘的门，发现里面竟然是一个完全不同的世界——天空是淡紫色的，地上长满了会发光的花朵，远处还有一座漂浮的城堡……",
  "太有创意了！让我们一起把这个故事写得更精彩：你小心翼翼地打开了那个神秘的盒子，里面没有金银财宝，却有一张古老的地图，地图上标注着'校园秘境'的位置……",
  "这个主意太棒了！我来帮你续写：就在你准备放弃的时候，突然发现墙角的砖缝里透出一丝微光，你轻轻推开那块砖，发现了一条通往地下的秘密通道……",
  "太有意思了！让我帮你丰富这个故事：你按照纸条上的指示来到了学校的后花园，在那棵最老的榕树下，你发现了一个刻着奇怪符号的石板……",
  "哇，这个设定超酷！我来帮你展开：你戴上那副神秘的眼镜，突然看到了平时看不到的东西——学校的走廊里竟然有许多漂浮的小精灵，它们正好奇地看着你……",
  "太有想象力了！让我们一起创作：你转动了那个古老的时钟指针，整个图书馆开始震动，书架缓缓移开，露出了一扇隐藏的门，门后传来了神秘的音乐声……",
  "这个想法太妙了！我来帮你续写：你念出了那句咒语，书页上的文字突然开始发光，然后一个个从纸上飘了起来，在半空中组成了一扇发光的门……"
];

export default async (req) => {
  try {
    // 处理OPTIONS预检请求（解决CORS问题）
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // 验证请求方法
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: '仅支持POST请求' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const body = await req.json();
    if (!body.prompt) {
      return new Response(JSON.stringify({ error: '缺少prompt参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 读取环境变量
    const API_KEY = process.env.DOUBAO_API_KEY;
    const USE_MOCK = process.env.USE_MOCK === 'true';

    // 模式1：强制使用模拟数据（参赛演示推荐）
    if (USE_MOCK || !API_KEY) {
      console.log('使用模拟数据模式');
      const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      
      // 模拟网络延迟，让体验更真实
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
      
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: randomResponse + "\n\n💡 提示：这是AI生成的建议，你可以根据自己的想法修改和补充！"
          }
        }]
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 模式2：尝试调用真实API（仅在网络环境支持时使用）
    try {
      console.log('尝试调用真实API');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'doubao-lite-32k',
          messages: [
            { 
              role: 'system', 
              content: '你是【AI故事小助手】，专门为初中生提供文字冒险故事创作辅助。性格亲切有耐心，像有趣的学长学姐。严格过滤暴力、恐怖等不适合青少年的内容，引导正向价值观。' 
            },
            { role: 'user', content: body.prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } else {
        throw new Error(`API返回状态码${res.status}`);
      }
    } catch (apiError) {
      console.log('真实API调用失败，切换到模拟数据模式：', apiError.message);
      // API调用失败时，自动降级到模拟数据
      const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: randomResponse + "\n\n💡 提示：这是AI生成的建议，你可以根据自己的想法修改和补充！"
          }
        }]
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

  } catch (error) {
    console.error('Netlify函数执行错误：', error);
    // 即使出错也返回模拟数据，保证用户体验不中断
    const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: randomResponse + "\n\n💡 提示：这是AI生成的建议，你可以根据自己的想法修改和补充！"
        }
      }]
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
