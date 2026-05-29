import type { ContentItem } from '../types/portal';
import { Meta } from './Meta';

export function ContentCard({ item, label }: { item: ContentItem; label?: string }) {
  const action = item.section === 'documents' ? '下载文档' : item.section === 'training' ? '继续学习' : '查看详情';
  return (
    <article className={`card section-${item.section}`}>
      <header>
        <div>
          <span className="section-label">{label || item.category}</span>
          <h4>{item.title}</h4>
        </div>
        <span className="badge">{item.category}</span>
      </header>
      <p>{item.summary}</p>
      {item.section === 'finance' && <strong className="finance-note">非投资建议</strong>}
      <Meta values={[item.publishedAt, ...item.meta]} />
      <div className="actions">
        <button type="button">{action}</button>
      </div>
    </article>
  );
}
