// @ts-check
/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  presets: [require('@sushiswap/ui/tailwind')],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/wagmi/{components,systems}/**/*.tsx',
    '../../packages/ui/{,!(node_modules)/**/}*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      display: ['group-hover'],
      visibility: ['group-hover'],
      keyframes: {
        dash: {
          to: {
            'stroke-dashoffset': '0',
          },
        },
      },
      colors: {
        primary: '#fbfcfd',
        secondary: '#212b44',
        accent: '#7edcbe',
        input: '#f5f5f5',
        disabled: '#959595',
        muted: '#565656',
        "typo-primary": '#1c365e',
      }
    },
  },
}

module.exports = tailwindConfig
