import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Apps from "./pages/Apps";
import Book from "./pages/Book";
import Desk from "./pages/Desk";
import Double from "./pages/Double";
import Line from "./pages/Line";
import Notes from "./pages/Notes";
import Stand from "./pages/Stand";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Desk />} />
        <Route path="line" element={<Line />} />
        <Route path="book" element={<Book />} />
        <Route path="notes" element={<Notes />} />
        <Route path="double" element={<Double />} />
        <Route path="apps" element={<Apps />} />
        <Route path="stand" element={<Stand />} />
      </Route>
    </Routes>
  );
}
