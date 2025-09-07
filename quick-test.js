/**
 * 快速测试脚本 - 测试 History Records 和 Security 页面
 * 在浏览器控制台中运行此脚本
 */

console.log('🔧 开始快速测试 History Records 和 Security 页面...');

// 测试函数
function quickTest() {
  console.log('=== 快速测试开始 ===');
  
  try {
    // 1. 检查页面是否加载完成
    if (document.readyState !== 'complete') {
      console.log('⚠️ 页面未完全加载，等待...');
      window.addEventListener('load', quickTest);
      return;
    }
    
    // 2. 检查关键元素
    const elements = {
      'currentTime': document.getElementById('currentTime'),
      'pageLoaded': document.getElementById('pageLoaded'),
      'securityCurrentTime': document.getElementById('securityCurrentTime'),
      'securityPageLoaded': document.getElementById('securityPageLoaded'),
      'featuresCurrentTime': document.getElementById('featuresCurrentTime'),
      'featuresPageLoaded': document.getElementById('featuresPageLoaded')
    };
    
    console.log('检查关键元素:');
    Object.entries(elements).forEach(([name, element]) => {
      if (element) {
        console.log(`✅ ${name}: 找到`);
      } else {
        console.log(`❌ ${name}: 未找到`);
      }
    });
    
    // 3. 检查内容部分
    const sections = {
      'history': document.getElementById('history'),
      'security': document.getElementById('security'),
      'features': document.getElementById('features')
    };
    
    console.log('检查内容部分:');
    Object.entries(sections).forEach(([name, section]) => {
      if (section) {
        console.log(`✅ ${name} section: 找到`);
        console.log(`   - display: ${section.style.display}`);
        console.log(`   - classes: ${section.className}`);
        console.log(`   - visible: ${section.offsetParent !== null}`);
      } else {
        console.log(`❌ ${name} section: 未找到`);
      }
    });
    
    // 4. 测试导航功能
    console.log('测试导航功能...');
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`找到 ${navItems.length} 个导航项`);
    
    // 5. 强制显示所有内容进行测试
    console.log('强制显示所有内容进行测试...');
    Object.values(sections).forEach(section => {
      if (section) {
        section.style.display = 'block';
        section.classList.add('active');
      }
    });
    
    // 6. 更新测试信息
    if (typeof updateTestInfo === 'function') {
      console.log('更新测试信息...');
      updateTestInfo();
    } else {
      console.log('⚠️ updateTestInfo 函数不存在');
    }
    
    console.log('=== 快速测试完成 ===');
    
    // 显示测试结果
    const visibleSections = Object.entries(sections).filter(([name, section]) => 
      section && section.offsetParent !== null
    );
    
    if (visibleSections.length > 0) {
      console.log('✅ 可见的内容部分:', visibleSections.map(([name]) => name));
    } else {
      console.log('❌ 没有可见的内容部分');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 测试特定页面
function testHistoryPage() {
  console.log('测试 History Records 页面...');
  
  const historySection = document.getElementById('history');
  if (historySection) {
    historySection.style.display = 'block';
    historySection.classList.add('active');
    
    // 隐藏其他部分
    document.querySelectorAll('.content-section').forEach(section => {
      if (section.id !== 'history') {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    });
    
    console.log('✅ History Records 页面已显示');
  } else {
    console.log('❌ History Records 页面未找到');
  }
}

function testSecurityPage() {
  console.log('测试 Security 页面...');
  
  const securitySection = document.getElementById('security');
  if (securitySection) {
    securitySection.style.display = 'block';
    securitySection.classList.add('active');
    
    // 隐藏其他部分
    document.querySelectorAll('.content-section').forEach(section => {
      if (section.id !== 'security') {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    });
    
    console.log('✅ Security 页面已显示');
  } else {
    console.log('❌ Security 页面未找到');
  }
}

function testFeaturesPage() {
  console.log('测试 Advanced Features 页面...');
  
  const featuresSection = document.getElementById('features');
  if (featuresSection) {
    featuresSection.style.display = 'block';
    featuresSection.classList.add('active');
    
    // 隐藏其他部分
    document.querySelectorAll('.content-section').forEach(section => {
      if (section.id !== 'features') {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    });
    
    console.log('✅ Advanced Features 页面已显示');
  } else {
    console.log('❌ Advanced Features 页面未找到');
  }
}

// 导出函数
window.quickTest = quickTest;
window.testHistoryPage = testHistoryPage;
window.testSecurityPage = testSecurityPage;
window.testFeaturesPage = testFeaturesPage;

console.log('快速测试脚本已加载，可以使用:');
console.log('- quickTest() - 完整测试');
console.log('- testHistoryPage() - 测试 History Records 页面');
console.log('- testSecurityPage() - 测试 Security 页面');
console.log('- testFeaturesPage() - 测试 Advanced Features 页面');

// 自动运行测试
quickTest();
