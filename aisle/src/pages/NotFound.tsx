import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container page">
      <h1>This page is not an aisle</h1>
      <p className="lede">
        <Link to="/">Start a spec</Link>, or open <Link to="/shop/brown-wool">Brown Wool</Link> and{" "}
        <Link to="/shop/flange-tube">Flange Tube</Link>.
      </p>
    </div>
  );
}
