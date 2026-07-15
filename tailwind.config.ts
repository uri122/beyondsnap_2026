import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px', // FHD 이상
        '4xl': '2560px', // QHD 이상
        '5xl': '3840px', // 4K 이상
      },
      maxWidth: {
        '8xl': '88rem',   // 1408px
        '9xl': '96rem',   // 1536px
        '10xl': '120rem',  // 1920px
        '11xl': '160rem',  // 2560px
      },
    },
  },
  plugins: [],
}

export default config
