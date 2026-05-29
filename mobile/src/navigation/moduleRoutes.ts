import type { ModuleKey } from "@/types/domain";

export type ModuleRoute = {
  key: ModuleKey;
  title: string;
  href: string;
  summary: string;
  primaryState: string;
  nextDetail: string;
  complianceNote?: string;
};

export const moduleRoutes: ModuleRoute[] = [
  {
    key: "briefs",
    title: "今日公司简报",
    href: "/modules/briefs",
    summary: "公司当天重点信息、提醒和跨部门同步。",
    primaryState:
      "先展示今日简报列表骨架，已提供简报列表、详情、搜索和发布状态展示。",
    nextDetail: "持续对齐今日简报列表、详情和弱网重试体验。",
  },
  {
    key: "announcements",
    title: "公司公告墙",
    href: "/modules/announcements",
    summary: "制度通知、行政公告和公司级重要消息。",
    primaryState:
      "先展示公告列表骨架，已提供公告列表、置顶/重要、分类和已发布状态展示。",
    nextDetail: "持续对齐公告详情、附件和权限状态。",
  },
  {
    key: "forum-hot",
    title: "员工论坛热帖",
    href: "/modules/forum-hot",
    summary: "移动端只展示热帖聚合和跳转入口。",
    primaryState: "先展示热帖榜单骨架，不实现完整发帖和评论系统。",
    nextDetail: "接入热帖排序、来源链接和内容安全提示。",
  },
  {
    key: "newcomer",
    title: "新人专区",
    href: "/modules/newcomer",
    summary: "入职资料、常见任务和新人进度。",
    primaryState: "先展示任务和资料入口骨架，后续补充任务完成状态。",
    nextDetail: "持续对齐新人资料、个人任务完成状态和权限状态。",
  },
  {
    key: "finance",
    title: "财经轻资讯",
    href: "/modules/finance",
    summary: "面向员工的信息阅读内容，不作为投资决策依据。",
    primaryState: "先展示资讯列表骨架和合规免责声明。",
    nextDetail: "持续对齐资讯列表、详情页和醒目的非投资建议边界。",
    complianceNote:
      "财经轻资讯不构成投资建议，不提供股票推荐，不提供买卖建议。",
  },
  {
    key: "documents",
    title: "文档中心",
    href: "/(tabs)/documents",
    summary: "制度、模板和流程文件。",
    primaryState:
      "已在左上角菜单中提供基础列表、搜索、短期预览和下载降级状态。",
    nextDetail: "后续接入真实原生文件保存/分享能力并做真机验证。",
  },
  {
    key: "training",
    title: "培训中心",
    href: "/(tabs)/training",
    summary: "必修与选修课程、学习进度和完成状态。",
    primaryState: "已在左上角菜单中提供基础课程列表和进度展示。",
    nextDetail: "补充课程详情、进度更新和完成确认。",
  },
];

export const moduleRoutesByKey = moduleRoutes.reduce<
  Record<ModuleKey, ModuleRoute>
>(
  (routes, route) => {
    routes[route.key] = route;
    return routes;
  },
  {} as Record<ModuleKey, ModuleRoute>,
);
