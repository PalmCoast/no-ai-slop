import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Build from "./pages/Build";
import Door from "./pages/Door";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Publish from "./pages/Publish";
import Shop from "./pages/Shop";
import Thanks from "./pages/Thanks";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/build" element={<Build />} />
        <Route path="/shop/:slug" element={<Shop />} />
        <Route path="/door" element={<Door />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
