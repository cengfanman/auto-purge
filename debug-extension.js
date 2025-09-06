/**
 * 调试脚本 - 检查 AutoPurge 扩展状态
 * 在浏览器控制台中运行此脚本来诊断问题
 */

console.log('=== AutoPurge 扩展调试脚本 ===');

// 检查扩展是否已加载
async function checkExtensionStatus() {
  try {
    // 检查扩展是否响应
    const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
    console.log('✅ 扩展已加载，配置:', response);
    
    // 检查当前标签页状态
    const tabStatus = await chrome.runtime.sendMessage({ action: 'getCurrentTabStatus' });
    console.log('✅ 当前标签页状态:', tabStatus);
    
    // 检查统计数据
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
    console.log('✅ 统计数据:', stats);
    
    // 检查历史记录设置
    const historySettings = await chrome.storage.local.get(['historySettings']);
    console.log('✅ 历史记录设置:', historySettings);
    
    // 检查历史记录
    const historyRecords = await chrome.storage.local.get(['historyRecords']);
    console.log('✅ 历史记录:', historyRecords);
    
    return {
      extensionLoaded: true,
      config: response,
      tabStatus: tabStatus,
      stats: stats,
      historySettings: historySettings,
      historyRecords: historyRecords
    };
    
  } catch (error) {
    console.error('❌ 扩展未加载或无法访问:', error);
    return {
      extensionLoaded: false,
      error: error.message
    };
  }
}

// 检查域名匹配逻辑
function checkDomainMatching(url) {
  console.log('=== 域名匹配检查 ===');
  console.log('检查 URL:', url);
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    console.log('解析后的 hostname:', hostname);
    
    // 预设域名列表
    const presetDomains = [
      "xvideos.com", "pornhub.com", "xnxx.com", "redtube.com", "youporn.com",
      "tube8.com", "spankbang.com", "xhamster.com", "chaturbate.com", "cam4.com",
      "stripchat.com", "bongacams.com", "livejasmin.com", "camsoda.com", "myfreecams.com",
      "onlyfans.com", "fansly.com", "manyvids.com", "clips4sale.com", "iwantclips.com",
      "91porny.com", "google.com", "facebook.com", "youtube.com", "twitter.com",
      "instagram.com", "linkedin.com", "reddit.com", "amazon.com", "netflix.com", "spotify.com"
    ];
    
    console.log('预设域名列表:', presetDomains);
    
    // 检查是否匹配
    for (const domain of presetDomains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        console.log('✅ 匹配到预设域名:', domain);
        return true;
      }
    }
    
    console.log('❌ 未匹配任何预设域名');
    return false;
    
  } catch (error) {
    console.error('❌ URL 解析失败:', error);
    return false;
  }
}

// 测试 91porny.com 的匹配
function test91pornyMatching() {
  console.log('=== 测试 91porny.com 匹配 ===');
  
  const testUrls = [
    'https://91porny.com',
    'https://www.91porny.com',
    'https://91porny.com/',
    'https://91porny.com/some-page'
  ];
  
  testUrls.forEach(url => {
    console.log(`\n测试 URL: ${url}`);
    const isMatched = checkDomainMatching(url);
    console.log(`匹配结果: ${isMatched ? '✅ 匹配' : '❌ 不匹配'}`);
  });
}

// 检查浏览器历史记录
async function checkBrowserHistory() {
  console.log('=== 检查浏览器历史记录 ===');
  
  try {
    // 搜索包含 91porny 的历史记录
    const history = await chrome.history.search({
      text: '91porny',
      maxResults: 10,
      startTime: Date.now() - (24 * 60 * 60 * 1000) // 最近24小时
    });
    
    console.log('找到的历史记录:', history);
    
    if (history.length === 0) {
      console.log('❌ 没有找到包含 91porny 的历史记录');
    } else {
      console.log(`✅ 找到 ${history.length} 条相关历史记录`);
    }
    
    return history;
    
  } catch (error) {
    console.error('❌ 检查历史记录失败:', error);
    return [];
  }
}

// 手动触发历史记录删除测试
async function testHistoryDeletion() {
  console.log('=== 测试历史记录删除 ===');
  
  try {
    const testUrl = 'https://91porny.com';
    
    // 检查历史记录是否存在
    const history = await chrome.history.search({
      text: '91porny',
      maxResults: 1
    });
    
    if (history.length === 0) {
      console.log('❌ 没有找到 91porny.com 的历史记录，无法测试删除');
      return;
    }
    
    console.log('找到历史记录:', history[0]);
    
    // 尝试删除
    await chrome.history.deleteUrl({ url: testUrl });
    console.log('✅ 成功删除历史记录');
    
    // 验证删除
    const afterHistory = await chrome.history.search({
      text: '91porny',
      maxResults: 1
    });
    
    if (afterHistory.length === 0) {
      console.log('✅ 确认历史记录已删除');
    } else {
      console.log('❌ 历史记录删除失败');
    }
    
  } catch (error) {
    console.error('❌ 测试删除失败:', error);
  }
}

// 主调试函数
async function debugAutoPurge() {
  console.log('开始调试 AutoPurge 扩展...\n');
  
  // 1. 检查扩展状态
  const status = await checkExtensionStatus();
  
  if (!status.extensionLoaded) {
    console.log('❌ 扩展未加载，请确保扩展已安装并启用');
    return;
  }
  
  // 2. 测试域名匹配
  test91pornyMatching();
  
  // 3. 检查浏览器历史记录
  await checkBrowserHistory();
  
  // 4. 检查历史记录设置
  if (status.historySettings.historySettings) {
    const settings = status.historySettings.historySettings;
    console.log('历史记录设置:');
    console.log('- 自动记录:', settings.autoRecord);
    console.log('- 最大记录数:', settings.maxRecords);
    console.log('- 保留天数:', settings.retentionDays);
  }
  
  // 5. 检查历史记录
  if (status.historyRecords.historyRecords) {
    const records = status.historyRecords.historyRecords;
    console.log(`历史记录数量: ${records.length}`);
    
    if (records.length > 0) {
      console.log('最近的历史记录:');
      records.slice(0, 5).forEach((record, index) => {
        console.log(`${index + 1}. ${record.url} (${new Date(record.deletedAt).toLocaleString()})`);
      });
    }
  }
  
  console.log('\n=== 调试完成 ===');
}

// 导出函数供手动调用
window.debugAutoPurge = debugAutoPurge;
window.checkExtensionStatus = checkExtensionStatus;
window.test91pornyMatching = test91pornyMatching;
window.checkBrowserHistory = checkBrowserHistory;
window.testHistoryDeletion = testHistoryDeletion;

console.log('调试函数已加载，可以运行:');
console.log('- debugAutoPurge() - 完整调试');
console.log('- checkExtensionStatus() - 检查扩展状态');
console.log('- test91pornyMatching() - 测试域名匹配');
console.log('- checkBrowserHistory() - 检查浏览器历史记录');
console.log('- testHistoryDeletion() - 测试历史记录删除');
