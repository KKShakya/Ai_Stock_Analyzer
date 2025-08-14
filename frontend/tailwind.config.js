export default {
  darkMode: "class", // <--- THIS makes Tailwind look for `.dark`
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "red"
      },
    },
  },
  plugins: [],
};
