import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="w-min max-w-md">
      <div className="flex items-center bg-zinc-800 rounded-full px-4 py-2">
        <Search className="w-4 h-4 text-gray-300 mr-2" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-transparent text-[#FFFFFF] placeholder-gray-400 text-sm outline-none"
        />
      </div>
    </div>
  );
};

export default SearchBar;
