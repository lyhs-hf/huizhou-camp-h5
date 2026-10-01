import { createRoot } from "react-dom/client";
import { JourneyProvider } from "./app/JourneyContext";
import { App } from "./app/App";
import "./styles/global.css";
createRoot(document.getElementById("root")!).render(
  <JourneyProvider>
    <App />
  </JourneyProvider>,
);
