/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#000000",
                gold: {
                    400: "#facc15",
                    500: "#eab308",
                    600: "#ca8a04",
                },
                success: "#16a34a",
                warning: "#eab308",
                danger: "#dc2626",
            }
        },
    },
    plugins: [],
}
