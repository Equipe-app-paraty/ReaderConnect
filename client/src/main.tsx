import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Google Fonts
const googleFontsLink = document.createElement('link');
googleFontsLink.rel = 'stylesheet';
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@300;400;500;600;700&display=swap';
document.head.appendChild(googleFontsLink);

// Add Remix Icons
const remixIconsLink = document.createElement('link');
remixIconsLink.rel = 'stylesheet';
remixIconsLink.href = 'https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css';
document.head.appendChild(remixIconsLink);

// Set title
document.title = "BookNook - Your Digital Reading Companion";

createRoot(document.getElementById("root")!).render(<App />);
