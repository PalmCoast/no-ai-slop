import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { Record } from "./pages/Record";
import { Watch } from "./pages/Watch";
import "./styles.css";

function NotFound() {
  return (
    <main>
      <h1>No page here</h1>
      <p>
        <a href="/">Back to Flick</a>
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/record" element={<Record />} />
        <Route path="/library" element={<Library />} />
        <Route path="/v/:id" element={<Watch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
