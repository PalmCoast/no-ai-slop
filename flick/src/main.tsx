import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Launch } from "./pages/Launch";
import { Library } from "./pages/Library";
import { Marketing } from "./pages/Marketing";
import { Pricing } from "./pages/Pricing";
import { Record } from "./pages/Record";
import { Thanks } from "./pages/Thanks";
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
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/launch" element={<Launch />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="/v/:id" element={<Watch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
