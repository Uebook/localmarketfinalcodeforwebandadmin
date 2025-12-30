
import React from 'react';
import { ThemeOption } from '../types';

interface ThemeControllerProps {
  theme: ThemeOption;
}

const ThemeController: React.FC<ThemeControllerProps> = ({ theme }) => {
  // If default, inject the new Orange-Blue theme overrides
  // This maps the existing 'red' utility classes to the new orange/blue brand colors
  if (theme === 'default') {
    return (
      <style>
        {`
          :root {
            --color-primary: #ea580c; /* orange-600 */
            --color-secondary: #2563eb; /* blue-600 */
          }

          /* Primary Orange (#ea580c) overrides Red-600 */
          .bg-red-600, .group:hover .group-hover\\:bg-red-600, .hover\\:bg-red-600:hover { background-color: #ea580c !important; }
          .text-red-600, .group:hover .group-hover\\:text-red-600, .hover\\:text-red-600:hover { color: #ea580c !important; }
          .border-red-600 { border-color: #ea580c !important; }
          .fill-red-600 { fill: #ea580c !important; }
          .stroke-red-600 { stroke: #ea580c !important; }
          
          /* Gradients: Map red-to-orange gradients to Orange-to-Blue */
          .from-red-600 { --tw-gradient-from: #ea580c !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
          .to-orange-600, .to-orange-500 { --tw-gradient-to: #2563eb !important; } /* blue-600 */
          
          /* Secondary/Lighter accents */
          .bg-red-50 { background-color: #fff7ed !important; } /* orange-50 */
          .text-red-700 { color: #c2410c !important; } /* orange-700 */
          .bg-red-100 { background-color: #ffedd5 !important; } /* orange-100 */
          .border-red-100 { border-color: #ffedd5 !important; }
          .border-red-200 { border-color: #fed7aa !important; } /* orange-200 */
          .shadow-red-200 { --tw-shadow-color: #fed7aa !important; }
          .shadow-red-100 { --tw-shadow-color: #ffedd5 !important; }

          /* Button Text Contrast */
          button.bg-red-600 { color: #ffffff !important; }
          
          /* Selection color */
          ::selection {
            background-color: #ffedd5;
            color: #ea580c;
          }
        `}
      </style>
    );
  }

  // Define color palettes for other themes
  const palettes: Record<string, any> = {
    blue: {
      primary600: '#2563eb',
      primary700: '#1d4ed8',
      secondary600: '#0891b2',
      primary50: '#eff6ff',
      primary100: '#dbeafe',
      primary200: '#bfdbfe',
    },
    green: {
      primary600: '#16a34a',
      primary700: '#15803d',
      secondary600: '#0d9488',
      primary50: '#f0fdf4',
      primary100: '#dcfce7',
      primary200: '#bbf7d0',
    },
    purple: {
      primary600: '#9333ea',
      primary700: '#7e22ce',
      secondary600: '#db2777',
      primary50: '#faf5ff',
      primary100: '#f3e8ff',
      primary200: '#e9d5ff',
    },
    dark: {
      primary600: '#1f2937',
      primary700: '#111827',
      secondary600: '#4b5563',
      primary50: '#f3f4f6',
      primary100: '#e5e7eb',
      primary200: '#d1d5db',
    }
  };

  const colors = palettes[theme];
  if (!colors) return null;

  return (
    <style>
      {`
        /* Override bg-red-600 */
        .bg-red-600, .group:hover .group-hover\\:bg-red-600, .hover\\:bg-red-600:hover {
          background-color: ${colors.primary600} !important;
        }
        
        /* Override gradients from-red-600 */
        .from-red-600 {
          --tw-gradient-from: ${colors.primary600} !important;
          --tw-gradient-to: ${colors.secondary600} !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }

        /* Override gradients to-orange-600 */
        .to-orange-600, .to-orange-500 {
          --tw-gradient-to: ${colors.secondary600} !important;
        }

        /* Text Colors */
        .text-red-600, .group:hover .group-hover\\:text-red-600, .hover\\:text-red-600:hover {
          color: ${colors.primary600} !important;
        }
        .text-red-700, .hover\\:text-red-700:hover {
          color: ${colors.primary700} !important;
        }
        .text-red-500 {
           color: ${colors.primary600} !important;
        }
        .text-red-400 {
           color: ${colors.secondary600} !important;
        }
        .text-red-100 {
           color: ${colors.primary100} !important;
        }

        /* Backgrounds Light */
        .bg-red-50, .hover\\:bg-red-50:hover {
          background-color: ${colors.primary50} !important;
        }
        .bg-red-100 {
          background-color: ${colors.primary100} !important;
        }

        /* Borders */
        .border-red-600, .hover\\:border-red-600:hover {
          border-color: ${colors.primary600} !important;
        }
        .border-red-500, .focus-within\\:border-red-500:focus-within {
          border-color: ${colors.primary600} !important;
        }
        .border-red-200, .hover\\:border-red-200:hover {
          border-color: ${colors.primary200} !important;
        }
        .border-red-100 {
          border-color: ${colors.primary100} !important;
        }
        
        /* Rings */
        .focus-within\\:ring-red-500:focus-within, .focus\\:ring-red-500:focus {
           --tw-ring-color: ${colors.primary600} !important;
        }

        /* Fill */
        .fill-red-600 {
          fill: ${colors.primary600} !important;
        }

        /* Shadows */
        .shadow-red-200, .hover\\:shadow-red-200:hover {
          --tw-shadow-color: ${colors.primary200} !important;
          box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
        }
      `}
    </style>
  );
};

export default ThemeController;
