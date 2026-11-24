import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Buzz from "./pages/Buzz";
import Rankings from "./pages/Rankings";
import Build from "./pages/Build";
import Consult from "./pages/Consult";
import Concierge from "./pages/Concierge";
import VsHiring from "./pages/VsHiring";
import Disclosure from "./pages/Disclosure";
import NotFound from "./pages/NotFound";
import Ads from "./pages/Ads";
import AdsThanks from "./pages/AdsThanks";

export default function App() {
  return (
    <Routes>
      <Route path="/ads" element={<Ads />} />
      <Route path="/ads/thanks" element={<AdsThanks />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/buzz" element={<Buzz />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/build" element={<Build />} />
        <Route path="/consult" element={<Consult />} />
        <Route path="/consult/ai-consultant-cost" element={<Navigate to="/consult" replace />} />
        <Route path="/concierge" element={<Concierge />} />
        <Route path="/concierge/vs-hiring" element={<VsHiring />} />
        <Route path="/disclosure" element={<Disclosure />} />
        <Route path="/hive" element={<Navigate to="/rankings" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
