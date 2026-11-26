/**
 * Painéis didáticos:
 *  - ExplanationPanel: explicação contextual da peça selecionada (doca inferior).
 *  - TourPanel: "Como funciona?" — linha de progresso com 5 etapas.
 *  - ExplorePanel: lista lateral de componentes + desmontar/montar.
 */
import { X, ChevronLeft, ChevronRight, RotateCcw, Play, Pause, Expand, Shrink } from 'lucide-react';
import { PARTS, PART_ORDER, TOUR } from '../data/content';

export function ExplanationPanel({ id, onClose }) {
  if (!id) return null;
  const p = PARTS[id];
  const n = PART_ORDER.indexOf(id) + 1;
  return (
    <div className="explain" key={id} role="region" aria-label={`Explicação: ${p.titulo}`}>
      <span className="explain-num" aria-hidden="true">{String(n).padStart(2, '0')}</span>
      <div>
        <span className="explain-kicker">Componente</span>
        <h2>{p.titulo}</h2>
        <p className="lead">{p.resumo}</p>
        <p>{p.texto}</p>
      </div>
      <button className="icon-btn" onClick={onClose} aria-label="Fechar explicação">
        <X size={18} />
      </button>
    </div>
  );
}

export function TourPanel({ step, setStep, auto, setAuto, onRepeat, stepMs }) {
  const s = TOUR[step];
  const last = TOUR.length - 1;
  return (
    <div className="tour" role="region" aria-label="Como funciona">
      <ol className="timeline" aria-label="Etapas">
        <span className="timeline-fill" style={{ width: `${(step / last) * 80}%` }} aria-hidden="true" />
        {TOUR.map((t, i) => (
          <li key={t.id} style={{ listStyle: 'none' }}>
            <button
              className={`t-node ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}
              onClick={() => setStep(i)}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`Etapa ${i + 1}: ${t.titulo}`}
              style={{ width: '100%' }}
            >
              <span className="t-dot">{i + 1}</span>
              <span className="t-label">{t.curto}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="tour-body">
        <div className="tour-content" key={step} aria-live="polite">
          <span className="tour-kicker">
            <span>
              Etapa {step + 1} de {TOUR.length}
            </span>
            <em>Em destaque: {s.componente}</em>
          </span>
          <h2>{s.titulo}</h2>
          <p>{s.texto}</p>
        </div>
        <div className="tour-actions">
          <button className="btn" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}>
            <ChevronLeft size={16} /> Anterior
          </button>
          <button className="btn square" onClick={() => setAuto(!auto)} aria-pressed={auto} aria-label={auto ? 'Pausar avanço automático' : 'Avanço automático'} title={auto ? 'Pausar avanço automático' : 'Avanço automático'}>
            {auto ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="btn square" onClick={onRepeat} aria-label="Repetir do início" title="Repetir do início">
            <RotateCcw size={16} />
          </button>
          <button className="btn primary" onClick={() => setStep((v) => Math.min(last, v + 1))} disabled={step === last}>
            Próximo <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="tour-timer" aria-hidden="true">{auto && step < last && <i key={step} style={{ '--tour-ms': `${stepMs}ms` }} />}</div>
    </div>
  );
}

export function ExplorePanel({ selected, select, exploded, setExploded }) {
  return (
    <section className="group" aria-label="Explorar estrutura">
      <div className="group-head">
        <span className="group-index">◆</span>
        <h2>Componentes</h2>
        <span className={`state ${exploded ? 'on' : ''}`}>{exploded ? 'Desmontada' : 'Montada'}</span>
      </div>
      <ol className="part-list">
        {PART_ORDER.map((id, i) => (
          <li key={id}>
            <button className={`part-btn ${selected === id ? 'is-sel' : ''}`} onClick={() => select(selected === id ? null : id)} aria-pressed={selected === id}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <b>{PARTS[id].titulo}</b>
                <small>{PARTS[id].resumo}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="explore-actions">
        <button className={`btn ${exploded ? 'is-active' : 'primary'}`} onClick={() => setExploded(true)} disabled={exploded}>
          <Expand size={16} /> Desmontar
        </button>
        <button className="btn" onClick={() => setExploded(false)} disabled={!exploded}>
          <Shrink size={16} /> Montar
        </button>
      </div>
    </section>
  );
}
