import { useEffect, useState } from 'react';
import { BadgeCheck, ExternalLink, FileText, X } from 'lucide-react';

const CERTIFICATES = [
  {
    id: 'google-gemini',
    fileName: 'Google_Gemini_Certified_Student.pdf',
    title: 'Google Gemini Certified Student',
    issuer: 'Google for Education',
    category: 'Artificial Intelligence',
    asset: '/certificates/Google_Gemini_Certified_Student.pdf',
  },
  {
    id: 'nasscom-eda',
    fileName: 'NASSCOM_Exploratory_Data_Analysis_Gold.pdf',
    title: 'Exploratory Data Analysis - Gold',
    issuer: 'NASSCOM / FutureSkills Prime',
    category: 'Data Analytics',
    achievement: 'Gold Category, 70% and above',
    asset: '/certificates/NASSCOM_Exploratory_Data_Analysis_Gold.pdf',
  },
  {
    id: 'hackerrank-problem-solving',
    fileName: 'HackerRank_Problem_Solving_Basic.pdf',
    title: 'Problem Solving (Basic)',
    issuer: 'HackerRank',
    category: 'Problem Solving',
    asset: '/certificates/HackerRank_Problem_Solving_Basic.pdf',
    verificationUrl: 'https://www.hackerrank.com/profile/tusharchaudhar30',
  },
  {
    id: 'hackerrank-orchestrate',
    fileName: 'HackerRank_Orchestrate_AI_Agent_Challenge.pdf',
    title: 'Orchestrate - AI Agent Challenge',
    issuer: 'HackerRank',
    category: 'AI Development',
    description: 'Participated in the September 2026 edition by building and deploying an AI agent.',
    asset: '/certificates/HackerRank_Orchestrate_AI_Agent_Challenge.pdf',
  },
];

export default function CertificationsExplorer() {
  const [selectedId, setSelectedId] = useState(CERTIFICATES[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const selected = CERTIFICATES.find((certificate) => certificate.id === selectedId) || CERTIFICATES[0];

  useEffect(() => {
    if (!modalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  return (
    <>
      <div className="cert-explorer-shell animate-fadeIn font-sans">
        <aside className="cert-explorer-sidebar" aria-label="Certificate explorer">
          <div className="cert-explorer-heading">
            <span>EXPLORER</span>
            <span className="cert-file-count">{CERTIFICATES.length} files</span>
          </div>
          <div className="cert-folder-label">
            <span aria-hidden="true">▾</span> certificates
          </div>
          <div className="cert-file-list">
            {CERTIFICATES.map((certificate) => (
              <button
                type="button"
                key={certificate.id}
                className={`cert-file-item${selected.id === certificate.id ? ' is-active' : ''}`}
                onClick={() => setSelectedId(certificate.id)}
              >
                <FileText className="cert-file-icon" aria-hidden="true" />
                <span>{certificate.fileName}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="cert-editor" aria-label="Selected certificate">
          <div className="cert-editor-tabs">
            {CERTIFICATES.map((certificate) => (
              <button
                type="button"
                key={certificate.id}
                className={`cert-editor-tab${selected.id === certificate.id ? ' is-active' : ''}`}
                onClick={() => setSelectedId(certificate.id)}
              >
                <FileText aria-hidden="true" />
                <span>{certificate.fileName}</span>
              </button>
            ))}
          </div>

          <div className="cert-editor-content">
            <div className="cert-editor-header">
              <div>
                <div className="cert-code-label">// CERTIFICATION_RECORD</div>
                <h2>{selected.title}</h2>
                <p>{selected.issuer} <span aria-hidden="true">·</span> {selected.category}</p>
              </div>
              <BadgeCheck className="cert-verified-icon" aria-label="Certificate record" />
            </div>

            <div className="cert-preview-frame">
              <iframe
                title={`${selected.title} certificate preview`}
                src={`${selected.asset}#toolbar=0&navpanes=0&view=FitH`}
                className="cert-preview"
              />
            </div>

            <div className="cert-detail-row">
              <div>
                <span className="cert-detail-label">ISSUER</span>
                <strong>{selected.issuer}</strong>
              </div>
              <div>
                <span className="cert-detail-label">CATEGORY</span>
                <strong>{selected.category}</strong>
              </div>
              {selected.achievement && (
                <div>
                  <span className="cert-detail-label">ACHIEVEMENT</span>
                  <strong>{selected.achievement}</strong>
                </div>
              )}
            </div>

            {selected.description && <p className="cert-description">{selected.description}</p>}

            <div className="cert-actions">
              <button type="button" className="cert-primary-action" onClick={() => setModalOpen(true)}>
                View Full Certificate
              </button>
              {selected.verificationUrl && (
                <a
                  className="cert-secondary-action"
                  href={selected.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify on HackerRank <ExternalLink aria-hidden="true" />
                </a>
              )}
              <a className="cert-secondary-action" href={selected.asset} download>
                Download PDF <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="cert-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalOpen(false);
        }}>
          <div className="cert-modal" role="dialog" aria-modal="true" aria-labelledby="certificate-modal-title">
            <div className="cert-modal-header">
              <h2 id="certificate-modal-title">{selected.title}</h2>
              <button type="button" className="cert-modal-close" onClick={() => setModalOpen(false)} aria-label="Close certificate preview">
                <X aria-hidden="true" />
              </button>
            </div>
            <iframe
              title={`${selected.title} full certificate`}
              src={`${selected.asset}#toolbar=1&navpanes=0`}
              className="cert-modal-preview"
            />
          </div>
        </div>
      )}
    </>
  );
}
