import { useEffect, useMemo, useState } from 'react';
import { ContentCard } from '../components/ContentCard';
import { FocusCard } from '../components/FocusCard';
import { LoadingScene } from '../components/LoadingScene';
import { Panel } from '../components/Panel';
import { StatePanel } from '../components/StatePanel';
import { getContent, getHome } from '../services/portal';
import type { ContentItem, HomePayload, SectionKey } from '../types/portal';

const sections: Array<[SectionKey | 'home', string, string]> = [
  ['home', '首页', 'PM'],
  ['briefs', '今日公司简报', 'BR'],
  ['announcements', '公司公告墙', 'AN'],
  ['forum', '员工论坛热帖', 'FO'],
  ['newcomer', '新人专区', 'NW'],
  ['finance', '财经轻资讯', 'FN'],
  ['documents', '文档中心', 'DC'],
  ['training', '培训中心', 'TR']
];

type ThemeMode = 'light' | 'dark';

const moduleDescriptions: Record<SectionKey, string> = {
  briefs: '今日重点、提醒和团队节奏',
  announcements: '公司通知、值班和空间安排',
  forum: '热门讨论、经验分享和协作线索',
  newcomer: '新人资料、入职路径和常见问题',
  finance: '轻阅读和金融知识，不构成投资建议',
  documents: '制度、模板和常用资料下载',
  training: '课程进度、学习任务和能力补给'
};

const moduleCodes: Record<SectionKey, string> = {
  briefs: 'QUEST',
  announcements: 'NOTICE',
  forum: 'HOT',
  newcomer: 'START',
  finance: 'KNOW',
  documents: 'DOC',
  training: 'TRAIN'
};

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';

  const savedTheme = window.localStorage.getItem('projectm-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function PortalPage() {
  const [active, setActive] = useState<SectionKey | 'home'>('home');
  const [home, setHome] = useState<HomePayload | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [title, setTitle] = useState('首页');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('projectm-theme', theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    if (active === 'home') {
      getHome()
        .then((payload) => {
          if (cancelled) return;
          setHome(payload);
          setTitle('首页');
          setContent(payload.latest);
        })
        .catch((err: Error) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    } else {
      getContent(active)
        .then((payload) => {
          if (cancelled) return;
          setTitle(payload.label);
          setContent(payload.items);
        })
        .catch((err: Error) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }

    return () => {
      cancelled = true;
    };
  }, [active, reloadKey]);

  const labels = useMemo(() => new Map(home?.sections.map((section) => [section.section, section.label])), [home]);

  const selectSection = (key: SectionKey | 'home') => {
    setActive(key);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`shell ${menuCollapsed ? 'menu-collapsed' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
      <button
        className={`menu-fab ${mobileMenuOpen ? 'open' : ''}`}
        type="button"
        aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>
      <button className="menu-backdrop" type="button" aria-label="关闭菜单遮罩" onClick={() => setMobileMenuOpen(false)} />

      <aside className="side">
        <div className="side-head">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <img src="/cbcx-logo.svg" alt="" />
            </span>
            <div>
              <h1>CBCX ProjectM</h1>
              <p>Company Portal RPG</p>
            </div>
          </div>
          <button
            className="side-toggle"
            type="button"
            aria-label={menuCollapsed ? '展开菜单' : '收起菜单'}
            aria-expanded={!menuCollapsed}
            onClick={() => setMenuCollapsed((isCollapsed) => !isCollapsed)}
          >
            <span className="toggle-glyph" aria-hidden="true">{menuCollapsed ? '》' : '‹'}</span>
          </button>
        </div>
        <nav className="nav" aria-label="ProjectM modules">
          {sections.map(([key, label, icon]) => (
            <button
              key={key}
              className={active === key ? 'active' : ''}
              type="button"
              title={label}
              aria-current={active === key ? 'page' : undefined}
              onClick={() => selectSection(key)}
            >
              <span className="nav-icon" aria-hidden="true">{icon}</span>
              <span className="nav-label">{label}</span>
              <small className="nav-count">{key === 'home' ? '' : home?.sections.find((section) => section.section === key)?.count}</small>
            </button>
          ))}
        </nav>
        <button className="admin-entry" type="button">
          <span className="admin-lock" aria-hidden="true" />
          <span>
            <strong>管理控制台</strong>
            <small>super_user only</small>
          </span>
          <em>LOCK</em>
        </button>
      </aside>

      <main>
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">PROJECTM / EMPLOYEE DASHBOARD</span>
            <h2>{active === 'home' ? '今日公司简报' : title}</h2>
            <p>{active === 'home' ? '7 个栏目像任务面板一样集中呈现，优先查看今日简报，再处理公告、热帖、文档与培训。' : '查看已发布内容，并保持与团队信息同步。'}</p>
          </div>
          <div className="hero-actions">
            <div className={`status ${loading ? 'busy' : ''} ${error ? 'offline' : ''}`} aria-label={error ? 'Cloud connection failed' : 'Cloud connection online'}>
              <span aria-hidden="true" />
              <strong>{error ? 'Offline' : 'Cloud'}</strong>
            </div>
            <button
              type="button"
              className="theme-toggle"
              aria-label={theme === 'dark' ? '切换到白天模式' : '切换到黑夜模式'}
              onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
            >
              <span className="theme-glyph" aria-hidden="true" />
            </button>
            <button type="button" className="primary-action" disabled={loading} onClick={() => setReloadKey((key) => key + 1)}>SYNC DATA</button>
          </div>
        </section>

        {error && <StatePanel tone="error" text={error} />}
        {loading && <LoadingScene />}

        {!loading && !error && active === 'home' && home && (
          <>
            <section className="focus-grid">
              <FocusCard label="今日公司简报" item={home.sections.find((section) => section.section === 'briefs')?.items[0]} primary />
              <FocusCard label="重要公告" item={home.sections.find((section) => section.section === 'announcements')?.items[0]} />
              <FocusCard label="员工论坛热帖" item={home.sections.find((section) => section.section === 'forum')?.items[0]} />
            </section>
            <Panel title="7 个栏目">
              <div className="module-grid">
                {home.sections.map((section) => (
                  <article className={`card compact summary-card section-${section.section}`} key={section.section}>
                    <header>
                      <span className="section-label">{moduleCodes[section.section]}</span>
                      <span className="badge">{section.count}</span>
                    </header>
                    <h4>{section.label}</h4>
                    <p>{moduleDescriptions[section.section]}</p>
                    <div className="module-preview">{section.items.map((item) => item.title).join(' / ') || '暂无内容'}</div>
                    {section.section === 'finance' && <strong className="finance-note">非投资建议</strong>}
                  </article>
                ))}
              </div>
            </Panel>
            <Panel title="置顶内容">
              <div className="pinned-grid">
                {home.pinned.length ? home.pinned.map((item) => <ContentCard key={item.id} item={item} label={labels.get(item.section)} />) : <StatePanel text="暂无置顶内容" />}
              </div>
            </Panel>
          </>
        )}

        {!loading && !error && (
          <Panel title={active === 'home' ? '最新内容' : `${title} · ${content.length} 条`}>
            <div className="content-grid">
              {content.length ? content.map((item) => <ContentCard key={item.id} item={item} label={labels.get(item.section)} />) : <StatePanel text="暂无已发布内容" />}
            </div>
          </Panel>
        )}
      </main>
    </div>
  );
}
