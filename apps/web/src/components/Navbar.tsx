import logo from "@/assets/logo.svg";

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
            <img src={logo} alt="Logo" />
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Weather Agent
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
