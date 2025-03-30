module.exports = {
  plugins: {
    "postcss-import": {
      path: ["src/styles"],
      addModulesDirectories: ["node_modules"],
    },
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
