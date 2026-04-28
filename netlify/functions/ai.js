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

    // ✅ 正确的Netlify环境变量读取方式
    const API_KEY = process.env.DOUBAO_API_KEY;
    if (!API_KEY) {
      console.error('错误：DOUBAO_API_KEY环境变量未设置');
      return new Response(JSON.stringify({ error: '服务器配置错误：API密钥未设置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 调用豆包API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completionss', {
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

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`豆包API错误：状态码${res.status}，响应：${errorText}`);
      
      return new Response(JSON.stringify({
        error: 'AI服务暂时不可用',
        details: `API返回状态码${res.status}`
      }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('Netlify函数执行错误：', error);
    return new Response(JSON.stringify({
      error: '服务器内部错误',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
