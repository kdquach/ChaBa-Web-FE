import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// Styles: variables first, then Tailwind base, then project overrides
import "./styles/variables.css";
import "./index.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components/sidebar.css";
import "./styles/components/cards.css";
import "./styles/components/chart.css";
import "./styles/components/table.css";
import "./styles/components/buttons.css";
import "./styles/components/forms.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Lấy Google Client ID từ environment variable
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
