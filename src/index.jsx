import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import { startKeepAlive } from './utils/keepAlive';

// Start keep-alive to prevent Supabase project pause
startKeepAlive();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
