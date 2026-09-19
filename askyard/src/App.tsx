import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Apps from "./pages/Apps";
import Hunt from "./pages/Hunt";
import Launch from "./pages/Launch";
import Answer from "./pages/Answer";
import Rep from "./pages/Rep";
import Marquee from "./pages/Marquee";
import MarqueeThanks from "./pages/MarqueeThanks";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/hunt" element={<Hunt />} />
        <Route path="/launch" element={<Launch />} />
        <Route path="/rep" element={<Rep />} />
        <Route path="/marquee" element={<Marquee />} />
        <Route path="/marquee/thanks" element={<MarqueeThanks />} />
        <Route path="/q/:slug" element={<Answer />} />
        <Route path="/shop" element={<Navigate to="/apps" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
