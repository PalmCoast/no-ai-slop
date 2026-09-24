import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Buzz from "./pages/Buzz";
import Rankings from "./pages/Rankings";
import Build from "./pages/Build";
import Consult from "./pages/Consult";
import Concierge from "./pages/Concierge";
import NotFound from "./pages/NotFound";

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
        <Route path="/hive" element={<Navigate to="/rankings" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
