/**
 * 快速修复 AutoPurge 选项页面显示问题
 * 在浏览器控制台中运行此脚本
 */

console.log('🔧 开始快速修复...');

// 修复函数
function quickFix() {
  console.log('执行快速修复...');
  
  try {
    // 1. 强制显示所有内容部分
    const sections = document.querySelectorAll('.content-section');
    console.log(`找到 ${sections.length} 个内容部分`);
    
    sections.forEach((section, index) => {
      console.log(`处理部分 ${index}: ${section.id}`);
      
      // 移除所有 active 类
      section.classList.remove('active');
      
      // 如果是第一个部分，设置为活动
      if (index === 0) {
        section.classList.add('active');
        section.style.display = 'block';
        console.log(`✅ 激活部分: ${section.id}`);
      } else {
        section.style.display = 'none';
      }
    });
    
    // 2. 修复导航菜单
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
    
    // 3. 重新设置导航点击事件
    navItems.forEach(item => {
      // 移除现有的事件监听器
      item.replaceWith(item.cloneNode(true));
    });
    
    // 重新获取导航项并添加事件监听器
    const newNavItems = document.querySelectorAll('.nav-item');
    newNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('导航点击:', item.dataset.section);
        
        const targetSection = item.dataset.section;
        
        // 更新导航状态
        newNavItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // 显示目标部分
        sections.forEach(section => {
          section.classList.remove('active');
          section.style.display = 'none';
          
          if (section.id === targetSection) {
            section.classList.add('active');
            section.style.display = 'block';
            console.log(`✅ 显示部分: ${section.id}`);
          }
        });
      });
    });
    
    console.log('✅ 快速修复完成');
    
    // 显示当前状态
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
      console.log(`当前活动部分: ${activeSection.id}`);
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

// 立即执行修复
quickFix();

// 导出函数供手动调用
window.quickFix = quickFix;

console.log('快速修复脚本已加载，可以使用 quickFix() 重新运行');
