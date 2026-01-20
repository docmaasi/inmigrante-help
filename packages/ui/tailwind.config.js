const baseConfig = require("@familycare/tailwind-config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
};
