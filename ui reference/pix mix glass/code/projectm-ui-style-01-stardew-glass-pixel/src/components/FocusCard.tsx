import type { ContentItem } from '../types/portal';
import { Meta } from './Meta';

export function FocusCard({ label, item, primary }: { label: string; item?: ContentItem; primary?: boolean }) {
  if (!item) {
    return <article className={`card ${primary ? 'primary' : ''}`}>暂无内容</article>;
  }
  return (
    <article className={`card section-${item.section} ${primary ? 'primary' : ''}`}>
      <header>
        <span className="section-label">{label}</span>
        <span className="badge">{item.category}</span>
      </header>
      <h4>{item.title}</h4>
      <p>{item.summary}</p>
      {item.section === 'finance' && <strong className="finance-note">非投资建议</strong>}
      <Meta values={item.meta} />
    </article>
  );
}
