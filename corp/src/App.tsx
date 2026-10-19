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
import Switch from "./pages/Switch";
import SwitchOffer from "./pages/SwitchOffer";
import NotFound from "./pages/NotFound";
import { switchOffer } from "../shared/switch";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/buzz" element={<Buzz />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/build" element={<Build />} />
        <Route path="/consult" element={<Consult />} />
        <Route path="/concierge" element={<Concierge />} />
        <Route path="/concierge/vs-hiring" element={<VsHiring />} />
        <Route path="/disclosure" element={<Disclosure />} />
        <Route path="/switch" element={<Switch />} />
        <Route path="/switch/smith-ai" element={<SwitchOffer offer={switchOffer("smith-ai")} />} />
        <Route path="/switch/ruby" element={<SwitchOffer offer={switchOffer("ruby")} />} />
        <Route path="/hive" element={<Navigate to="/rankings" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
