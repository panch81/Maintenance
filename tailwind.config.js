/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                workday: {
                    blue: '#005CB9',
                    lightBlue: '#007BF5',
                    darkBlue: '#00448A',
                }
            }
        },
    },
    plugins: [],
}
