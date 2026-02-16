/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: 'class',
  prefix: "",
  // เพิ่ม safelist เพื่อให้ Tailwind รวม dynamic classes เข้ามาใน CSS bundle
  safelist: [
    // Pattern-based safelist สำหรับสีทั้งหมดที่อาจใช้แบบ dynamic
    {
      pattern: /^(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
      variants: ['hover', 'focus', 'active', 'dark', 'dark:hover']
    },
    
    // Gradient และ utility classes ที่อาจใช้
    {
      pattern: /^(from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/
    },
    // Border และ ring utilities
    {
      pattern: /^border-(l|r|t|b)-2$/
    },
    {
      pattern: /^border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\/\d+$/
    },
    // สำหรับ opacity variants
    {
      pattern: /^(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\/\d+$/
    },
    
    // Classes ที่ใช้ใน ColorContext โดยเฉพาะ
    'text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 
    'text-pink-600', 'text-red-600', 'text-yellow-600', 'text-slate-600', 'text-gray-600',
    'hover:bg-blue-600', 'hover:bg-green-600', 'hover:bg-purple-600', 'hover:bg-orange-600',
    'hover:bg-pink-600', 'hover:bg-red-600', 'hover:bg-yellow-600', 'hover:bg-slate-600', 'hover:bg-gray-600',
    'hover:text-blue-600', 'hover:text-green-600', 'hover:text-purple-600', 'hover:text-orange-600',
    'hover:text-pink-600', 'hover:text-red-600', 'hover:text-yellow-600', 'hover:text-slate-600', 'hover:text-gray-600',
    // Background variants
    'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50', 'bg-pink-50', 'bg-red-50', 'bg-yellow-50', 'bg-slate-50', 'bg-gray-50',
    'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600', 'bg-red-600', 'bg-yellow-600', 'bg-slate-600', 'bg-gray-600',
    'bg-blue-950', 'bg-green-950', 'bg-purple-950', 'bg-orange-950', 'bg-pink-950', 'bg-red-950', 'bg-yellow-950', 'bg-slate-950', 'bg-gray-950',
    // Border และ ring
    'border-blue-500', 'border-green-500', 'border-purple-500', 'border-orange-500', 'border-pink-500', 'border-red-500', 'border-yellow-500', 'border-slate-500', 'border-gray-500',
    'ring-blue-500', 'ring-green-500', 'ring-purple-500', 'ring-orange-500', 'ring-pink-500', 'ring-red-500', 'ring-yellow-500', 'ring-slate-500', 'ring-gray-500',
    // สำหรับ opacity variants ที่ใช้ใน Sidebar
    'from-blue-500/20', 'to-blue-500/15', 'border-blue-500/40',
    'from-green-500/20', 'to-green-500/15', 'border-green-500/40',
    'from-purple-500/20', 'to-purple-500/15', 'border-purple-500/40',
    'from-orange-500/20', 'to-orange-500/15', 'border-orange-500/40',
    'from-pink-500/20', 'to-pink-500/15', 'border-pink-500/40',
    'from-red-500/20', 'to-red-500/15', 'border-red-500/40',
    'from-yellow-500/20', 'to-yellow-500/15', 'border-yellow-500/40',
    'from-slate-500/20', 'to-slate-500/15', 'border-slate-500/40',
    'from-gray-500/20', 'to-gray-500/15', 'border-gray-500/40',
  ],
  theme: {
    container: {
      center: true,
      padding: "15px",
      screens: {
        sm: '640px',
        md: '768px',
        lg: '960px',
        xl: '1200px',
      },
    },
    fontFamily:{
      primary: "var(--font-jetbrainsMono)",

    },
    extend: {
      colors:{
        primary: "#1c1c22",
        accent:{
          DEFAULT: "#00ff99",
          hover: "00e187",
        }
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}