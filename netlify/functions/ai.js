export default async (req) => {
  try {
    // 1. 验证请求方法和内容类型
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: '仅支持POST请求' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    if (!body.prompt) {
      return new Response(JSON.stringify({ error: '缺少prompt参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. 验证环境变量
    const API_KEY = Netlify.env.get("DOUBAO_API_KEY");
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: '服务器配置错误：API密钥未设置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 调用豆包API并添加完整错误处理
    const res = await fetch('https://api.doubao.com/v1/chat/completions', {
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
      })
    });

    // 关键：先检查响应状态，再解析内容
    if (!res.ok) {
      // 读取原始错误内容（可能是HTML或JSON）
      const errorText = await res.text();
      console.error(`豆包API错误：状态码${res.status}，响应内容：${errorText}`);
      
      return new Response(JSON.stringify({
        error: 'AI服务暂时不可用',
        details: `API返回状态码${res.status}`,
        debug: process.env.NODE_ENV === 'development' ? errorText : undefined
      }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. 正常返回结果
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // 捕获所有未预期的异常
    console.error('Netlify函数执行错误：', error);
    return new Response(JSON.stringify({
      error: '服务器内部错误',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
