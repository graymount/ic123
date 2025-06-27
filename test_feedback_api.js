// 测试反馈API的脚本
const axios = require('axios');

const API_BASE_URL = 'https://ic123-backend.wnfng-liu.workers.dev';

async function testFeedbackAPI() {
  console.log('🧪 测试反馈API...');
  
  try {
    // 1. 测试健康检查
    console.log('\n1️⃣ 测试健康检查...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ 健康检查成功:', healthResponse.data);
    
    // 2. 测试获取反馈类型
    console.log('\n2️⃣ 测试获取反馈类型...');
    const typesResponse = await axios.get(`${API_BASE_URL}/api/feedback/types`);
    console.log('✅ 反馈类型获取成功:', typesResponse.data);
    
    // 3. 测试提交反馈
    console.log('\n3️⃣ 测试提交反馈...');
    const feedbackData = {
      type: 'suggestion',
      title: '测试反馈标题',
      content: '这是一个测试反馈的内容，用于验证API是否正常工作。',
      contact_info: 'test@example.com'
    };
    
    const submitResponse = await axios.post(`${API_BASE_URL}/api/feedback`, feedbackData);
    console.log('✅ 反馈提交成功:', submitResponse.data);
    
    console.log('\n🎉 所有API测试通过！');
    
  } catch (error) {
    console.error('\n❌ API测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
      console.error('响应头:', error.response.headers);
    } else if (error.request) {
      console.error('请求失败:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

// 运行测试
testFeedbackAPI();