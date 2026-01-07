import logo from "../../public/logo.png";

const Navbar = () => {
  return (
    <div className="flex justify-between">
      <img src={logo} alt="Weather Agent Logo" />
      <div>Navbar</div>
      <div>Hello world</div>
    </div>
  );
};

export default Navbar;
