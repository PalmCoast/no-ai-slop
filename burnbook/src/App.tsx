import { Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell.tsx";
import { BookPage } from "./pages/BookPage.tsx";
import { Home } from "./pages/Home.tsx";
import { MethodPage } from "./pages/MethodPage.tsx";
import { PacketPage } from "./pages/PacketPage.tsx";
import { SalesPage } from "./pages/SalesPage.tsx";
import { ThanksPage } from "./pages/ThanksPage.tsx";

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/packet" element={<PacketPage />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/thanks" element={<ThanksPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Shell>
  );
}
