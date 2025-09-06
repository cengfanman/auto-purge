/**
 * 修复 AutoPurge 选项页面显示问题的脚本
 * 在浏览器控制台中运行此脚本来修复空白页面问题
 */

console.log('🔧 AutoPurge 显示问题修复脚本');

// 修复函数
function fixDisplayIssue() {
  console.log('开始修复显示问题...');
  
  try {
    // 1. 检查页面是否完全加载
    if (document.readyState !== 'complete') {
      console.log('页面未完全加载，等待...');
      window.addEventListener('load', fixDisplayIssue);
      return;
    }
    
    // 2. 强制显示所有内容部分
    const sections = document.querySelectorAll('.content-section');
    console.log(`找到 ${sections.length} 个内容部分`);
    
    sections.forEach((section, index) => {
      console.log(`处理部分 ${index}: ${section.id}`);
      
      // 移除所有 active 类
      section.classList.remove('active');
      
      // 如果是第一个部分（overview），设置为活动
      if (index === 0) {
        section.classList.add('active');
        section.style.display = 'block';
        console.log(`✅ 激活部分: ${section.id}`);
      } else {
        section.style.display = 'none';
      }
    });
    
    // 3. 修复导航菜单
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`找到 ${navItems.length} 个导航项`);
    
    navItems.forEach((item, index) => {
      item.classList.remove('active');
      
      // 如果是第一个导航项，设置为活动
      if (index === 0) {
        item.classList.add('active');
        console.log(`✅ 激活导航项: ${item.dataset.section}`);
      }
    });
    
    // 4. 检查关键元素
    const keyElements = [
      'presetDomainsList', 'customDomainsList', 'historyList',
      'refreshHistoryBtn', 'autoRecordToggle', 'enabledToggle'
    ];
    
    console.log('检查关键元素:');
    keyElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        console.log(`✅ ${id}: 找到`);
      } else {
        console.log(`❌ ${id}: 未找到`);
      }
    });
    
    // 5. 强制刷新历史记录 UI（如果存在）
    if (typeof updateHistoryUI === 'function') {
      console.log('刷新历史记录 UI...');
      updateHistoryUI();
    }
    
    // 6. 强制刷新域名列表（如果存在）
    if (typeof updateDomainLists === 'function') {
      console.log('刷新域名列表...');
      updateDomainLists();
    }
    
    console.log('✅ 显示问题修复完成');
    
    // 显示修复结果
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
      console.log(`当前活动部分: ${activeSection.id}`);
    } else {
      console.log('⚠️ 没有活动的内容部分');
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

// 高级修复函数
function advancedFix() {
  console.log('开始高级修复...');
  
  try {
    // 1. 重新加载页面数据
    if (typeof loadData === 'function') {
      console.log('重新加载数据...');
      loadData().then(() => {
        console.log('数据重新加载完成');
        fixDisplayIssue();
      }).catch(error => {
        console.error('数据重新加载失败:', error);
        fixDisplayIssue();
      });
    } else {
      fixDisplayIssue();
    }
    
  } catch (error) {
    console.error('高级修复失败:', error);
    fixDisplayIssue();
  }
}

// 诊断函数
function diagnoseIssue() {
  console.log('🔍 开始诊断问题...');
  
  const diagnostics = {
    domReady: document.readyState,
    hasContentSections: document.querySelectorAll('.content-section').length,
    hasNavItems: document.querySelectorAll('.nav-item').length,
    activeSection: document.querySelector('.content-section.active')?.id,
    activeNavItem: document.querySelector('.nav-item.active')?.dataset.section,
    hasOptionsJS: typeof window.optionsDebug !== 'undefined',
    hasChromeAPI: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined'
  };
  
  console.log('诊断结果:', diagnostics);
  
  // 检查是否有 JavaScript 错误
  const errors = [];
  if (diagnostics.hasContentSections === 0) {
    errors.push('没有找到内容部分');
  }
  if (diagnostics.hasNavItems === 0) {
    errors.push('没有找到导航项');
  }
  if (!diagnostics.activeSection) {
    errors.push('没有活动的内容部分');
  }
  if (!diagnostics.hasOptionsJS) {
    errors.push('options.js 未正确加载');
  }
  
  if (errors.length > 0) {
    console.log('发现的问题:', errors);
  } else {
    console.log('✅ 未发现明显问题');
  }
  
  return diagnostics;
}

// 导出函数
window.fixDisplayIssue = fixDisplayIssue;
window.advancedFix = advancedFix;
window.diagnoseIssue = diagnoseIssue;

console.log('修复脚本已加载，可以使用:');
console.log('- fixDisplayIssue() - 基本修复');
console.log('- advancedFix() - 高级修复');
console.log('- diagnoseIssue() - 诊断问题');

// 自动运行诊断
diagnoseIssue();

// 如果页面已经加载完成，自动运行修复
if (document.readyState === 'complete') {
  console.log('页面已加载完成，自动运行修复...');
  setTimeout(fixDisplayIssue, 1000);
} else {
  console.log('等待页面加载完成...');
  window.addEventListener('load', () => {
    setTimeout(fixDisplayIssue, 1000);
  });
}
