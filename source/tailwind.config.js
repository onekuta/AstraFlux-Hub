/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#bae0ff',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        cyber: {
          bg: '#0c0f17',
          surface: '#141824',
          card: '#1a1f30',
          border: '#262d42',
          accent: '#22d3ee',
          glow: '#00f2fe',
        }
      },
      fontFamily: {
        // ⚠️ 与 src/index.css 的 --font-sans / --font-mono 保持一致。
        // 此前这里写的是 Inter + PingFang SC + Microsoft YaHei，而 Inter 未内置、
        // PingFang SC 只有 macOS 有 → Windows 上直接掉到微软雅黑，观感差。
        sans: [
          '"Noto Sans SC"',
          '"Source Han Sans SC"',
          '"思源黑体"',
          '"Alibaba PuHuiTi 3.0"',
          '"阿里巴巴普惠体 3.0"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Cascadia Mono"',
          'ui-monospace',
          'Consolas',
          '"Noto Sans SC"',
          '"Microsoft YaHei UI"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        // 标题体：庞门正道标题体（产品型号 / 小标题 / 大标题）
        // ⚠️ 同样与 src/index.css 的 --font-title 保持一致。
        pangmen: [
          '"PangMenZhengDao"',
          '"Noto Sans SC"',
          '"Source Han Sans SC"',
          '"思源黑体"',
          'sans-serif',
        ],
        title: [
          '"PangMenZhengDao"',
          '"Noto Sans SC"',
          '"Source Han Sans SC"',
          '"思源黑体"',
          '"Alibaba PuHuiTi 3.0"',
          '"PingFang SC"',
          '"Microsoft YaHei UI"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      }
    },
  },
  plugins: [],
}
