// 测试历史记录删除和记录功能
// 在浏览器控制台中运行此脚本

async function testHistoryDeletion() {
  console.log('=== 开始测试历史记录删除功能 ===');
  
  // 测试URL
  const testUrl = 'https://www.baidu.com';
  
  try {
    // 1. 检查当前历史记录设置
    console.log('1. 检查历史记录设置...');
    const settings = await chrome.storage.local.get(['historySettings']);
    console.log('历史记录设置:', settings.historySettings);
    
    // 2. 检查当前历史记录
    console.log('2. 检查当前历史记录...');
    const currentRecords = await chrome.storage.local.get(['historyRecords']);
    console.log('当前历史记录数量:', currentRecords.historyRecords?.length || 0);
    console.log('当前历史记录:', currentRecords.historyRecords);
    
    // 3. 模拟删除操作
    console.log('3. 模拟删除操作...');
    
    // 获取页面标题
    let pageTitle = '';
    try {
      const tabs = await chrome.tabs.query({ url: testUrl });
      if (tabs && tabs.length > 0) {
        pageTitle = tabs[0].title || '';
        console.log('页面标题:', pageTitle);
      }
    } catch (error) {
      console.log('无法获取页面标题:', error.message);
    }
    
    // 提取域名
    let domain = '';
    try {
      const urlObj = new URL(testUrl);
      domain = urlObj.hostname;
      console.log('域名:', domain);
    } catch (error) {
      console.log('无法提取域名:', error.message);
    }
    
    // 4. 调用background script的删除函数
    console.log('4. 调用background script删除函数...');
    const response = await chrome.runtime.sendMessage({ 
      action: 'executeDeletion' 
    });
    console.log('删除响应:', response);
    
    // 5. 检查删除后的历史记录
    console.log('5. 检查删除后的历史记录...');
    setTimeout(async () => {
      const newRecords = await chrome.storage.local.get(['historyRecords']);
      console.log('删除后历史记录数量:', newRecords.historyRecords?.length || 0);
      console.log('删除后历史记录:', newRecords.historyRecords);
      
      if (newRecords.historyRecords && newRecords.historyRecords.length > 0) {
        console.log('✅ 历史记录删除成功！');
      } else {
        console.log('❌ 历史记录删除失败！');
      }
    }, 2000);
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
testHistoryDeletion();
