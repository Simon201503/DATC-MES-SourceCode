# Homepage Mobile Adaptation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复首页在手机端显示不全的问题，并让底部导航、首页概览、统计卡片和内容区在移动端完整可读。

**Architecture:** 通过同时调整 `src/components/Layout.tsx` 与 `src/pages/Dashboard.tsx` 的响应式类名来修复问题，不改动数据逻辑与路由。移动端采用单列优先布局，桌面端保留现有分栏结构，只补充更稳妥的断点与安全区处理。

**Tech Stack:** React, TypeScript, Tailwind CSS, React Router, lucide-react

---

### Task 1: 修复移动端公共布局占位

**Files:**
- Modify: `src/components/Layout.tsx`

**Step 1: 调整主内容底部预留**

- 增加移动端页面容器的底部 padding。
- 保证固定底部导航不会遮挡页面最后一屏内容。

**Step 2: 压缩底部导航密度**

- 减少移动端底部导航高度、单项宽度和文字密度。
- 保留横向滚动能力，避免长标签挤压布局。

**Step 3: 保持桌面端不回退**

- 保持 `lg` 以上侧边栏与主内容结构不变。

### Task 2: 修复首页顶部概览与统计卡

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Step 1: 缩小 Hero 区在手机端的纵向占用**

- 减少标题区和摘要区内边距。
- 让右侧摘要卡在手机端改成单列堆叠。

**Step 2: 优化统计卡断点**

- 极窄屏单列，常见手机宽度两列，桌面端四列。
- 同时压缩移动端卡片间距、内边距和数字字号。

### Task 3: 修复首页下半区流式布局

**Files:**
- Modify: `src/pages/Dashboard.tsx`

**Step 1: 取消移动端抢高度**

- 去掉只适合大屏的 `flex-1 min-h-0` 依赖。
- 让最近记录和基础库概览在移动端自然向下展开。

**Step 2: 仅在大屏保留主次分栏**

- 移动端单列。
- `lg` 以上恢复主列表加侧栏布局。

### Task 4: 验证

**Files:**
- Check: `src/components/Layout.tsx`
- Check: `src/pages/Dashboard.tsx`

**Step 1: 运行编辑器诊断**

Run: 对以上两个文件执行诊断检查  
Expected: 无 TypeScript / JSX 报错

**Step 2: 浏览器验证手机尺寸**

Run: 在本地预览页切换到手机宽度并检查首页  
Expected:
- 无横向溢出
- 底部导航不遮挡内容
- 首页模块完整显示
