import { Bell, Search, CircleUserRound } from "lucide-react";

function Navbar() {
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-slate-700">
        Transport Management System
      </h2>

      <div className="flex items-center gap-5">

        <Search className="cursor-pointer" />

        <Bell className="cursor-pointer" />

        <div className="flex items-center gap-2">
          <CircleUserRound size={32} />
          <span className="font-medium">Admin</span>
        </div>

      </div>
    </header>
  );
}

export default Navbar;