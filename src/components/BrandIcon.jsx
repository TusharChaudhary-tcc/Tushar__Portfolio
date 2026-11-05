import {
  siCodechef,
  siGeeksforgeeks,
  siGithub,
  siHackerrank,
  siHtml5,
  siJson,
  siLeetcode,
  siReact,
  siTypescript,
} from 'simple-icons';

const ICONS = {
  codechef: siCodechef,
  github: siGithub,
  geeksforgeeks: siGeeksforgeeks,
  hackerrank: siHackerrank,
  html: siHtml5,
  json: siJson,
  leetcode: siLeetcode,
  react: siReact,
  typescript: siTypescript,
};

const COLORS = {
  codechef: '#f97316',
  github: '#f8fafc',
  geeksforgeeks: '#22c55e',
  hackerrank: '#22c55e',
  html: '#f97316',
  json: '#facc15',
  leetcode: '#ffa116',
  react: '#61dafb',
  typescript: '#3178c6',
};

export default function BrandIcon({ name, size = 16, className = '' }) {
  const icon = ICONS[name];

  if (!icon) {
    return (
      <span
        className={`brand-icon-fallback ${className}`}
        style={{ width: size, height: size, color: '#a855f7' }}
        aria-hidden="true"
      >
        Co
      </span>
    );
  }

  return (
    <svg
      className={`brand-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      style={{ color: COLORS[name] }}
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
