# Login Blue White Restyle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将登录页从深色霓虹风格调整为与首页概览一致的蓝白工作台风格，同时保留现有登录结构与交互。

**Architecture:** 仅修改 `Login.tsx` 的视觉层，不调整登录逻辑、字段顺序、表单提交流程和跳转行为。通过替换背景渐变、卡片材质、输入框配色、按钮样式和文字层级，让登录页与系统首页共享同一套蓝白毛玻璃设计语言。

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react

---

### Task 1: 重做登录页视觉皮肤

**Files:**
- Modify: `src/pages/Login.tsx`

**Step 1: 检查当前登录页结构**

确认保留以下结构：
- 页面背景层
- 居中登录卡片
- 头部图标与标题
- 两个输入框
- 提交按钮
- 错误提示与底部说明

**Step 2: 实现蓝白工作台风格**

在 `src/pages/Login.tsx` 中完成这些改动：
- 把深色背景改成浅灰蓝底 + 蓝紫径向光晕
- 把深色卡片改成白色半透明毛玻璃卡片
- 把输入框改成浅底深字并使用首页同款聚焦高亮
- 把按钮改成首页主色按钮风格
- 把标题、副标题、错误提示改成适配浅底的文字层级

**Step 3: 运行诊断检查**

Run: 对 `src/pages/Login.tsx` 执行编辑器诊断检查
Expected: 无 TypeScript / JSX 报错

**Step 4: 确认热更新**

Run: 检查 Vite 开发服务输出
Expected: 出现 `hmr update /src/pages/Login.tsx`
