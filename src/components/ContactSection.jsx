import { useState } from 'react';
import { Check, Copy, ExternalLink, Github, Linkedin, Mail } from 'lucide-react';

const CONTACT_OPTIONS = [
  {
    label: 'LinkedIn',
    detail: 'Professional network',
    href: 'https://www.linkedin.com/in/chaudharytushar01/',
    icon: Linkedin,
    accent: 'blue',
  },
  {
    label: 'GitHub',
    detail: 'Projects and source code',
    href: 'https://github.com/TusharChaudhary-tcc',
    icon: Github,
    accent: 'teal',
  },
  {
    label: 'Email',
    detail: 'tusharchaudhary6160@gmail.com',
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=tusharchaudhary6160%40gmail.com&su=Portfolio%20Contact%20-%20Tushar%20Chaudhary&body=Hi%20Tushar%2C%0A%0AI%20visited%20your%20portfolio%20and%20would%20like%20to%20connect%20with%20you.%0A%0ABest%20regards%2C',
    icon: Mail,
    accent: 'amber',
  },
];

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const email = 'tusharchaudhary6160@gmail.com';

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(email);
        } catch {
          // Use the legacy path when browser clipboard permissions are unavailable.
          const textArea = document.createElement('textarea');
          textArea.value = email;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const copiedWithFallback = document.execCommand('copy');
          textArea.remove();
          if (!copiedWithFallback) throw new Error('Clipboard copy was rejected');
        }
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copiedWithFallback = document.execCommand('copy');
        textArea.remove();
        if (!copiedWithFallback) throw new Error('Clipboard copy was rejected');
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('Unable to copy email address.', error);
    }
  };

  return (
    <div className="contact-page animate-fadeIn font-sans">
      <div className="contact-page-header">
        <div>
          <div className="cert-code-label">// OPEN_CHANNEL</div>
          <h2>Let's Connect</h2>
          <p>
            Whether you are hiring, building, or exploring a thoughtful collaboration,
            I would be glad to hear from you.
          </p>
        </div>
        <span className="contact-availability">AVAILABLE FOR A CONVERSATION</span>
      </div>

      <div className="contact-options">
        {CONTACT_OPTIONS.map(({ label, detail, href, icon: Icon, accent }) => {
          const isEmail = label === 'Email';
          const card = (
            <a
              className={`contact-option contact-option-${accent}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Contact via ${label}`}
            >
              <span className="contact-option-icon"><Icon aria-hidden="true" /></span>
              <span className="contact-option-copy">
                <strong>{label}</strong>
                <span>{detail}</span>
              </span>
              <ExternalLink className="contact-option-arrow" aria-hidden="true" />
            </a>
          );

          if (!isEmail) return <div key={label}>{card}</div>;

          return (
            <div className="contact-option-wrapper" key={label}>
              {card}
              <button className="contact-copy-button" type="button" onClick={copyEmail}>
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                <span>{copied ? 'Email copied!' : 'Copy Email'}</span>
              </button>
            </div>
          );
        })}

      </div>

      <div className="contact-note">
        <span className="contact-note-mark">&gt;_</span>
        <p>Choose a channel above to start a conversation.</p>
      </div>
    </div>
  );
}
