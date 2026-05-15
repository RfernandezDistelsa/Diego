import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tasky: {
          orange: "#FF8C42",
          green: "#4CAF50",
          purple: "#7C3AED",
          "blue-low": "#93C5FD",
          "amber-med": "#FBBF24",
          "red-high": "#F87171",
        },
      },
      keyframes: {
        "celebration-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "task-fade": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0.5", transform: "translateY(-4px)" },
        },
      },
      animation: {
        "celebration-pop": "celebration-pop 0.3s ease-out",
        "task-fade": "task-fade 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
}

export default config
