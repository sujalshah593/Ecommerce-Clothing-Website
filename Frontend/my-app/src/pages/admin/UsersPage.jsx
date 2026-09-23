import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { Search, MoreVertical, Mail, Calendar, LogIn } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(data.users || []);
      } catch (err) {
        console.error("Users fetch error:", err);
      }
    };

    fetchUsers();
  }, []);


  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && user.isVerified) ||
      (statusFilter === "Inactive" && !user.isVerified);

    return matchesSearch && matchesStatus;
  });

  const activeUsers = users.filter((u) => u.isVerified).length;
  const inactiveUsers = users.length - activeUsers;

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-serif mb-3 text-[#111111] text1">Customer Directory</h1>
          <p className="text-[#6B7280] text">
            View and manage all registered users
          </p>
        </div>

        <div className="grid grid-cols-1 text md:grid-cols-3 gap-6 mb-12">
          <div className="border rounded p-6">
            <p className="text-[10px] font-bold text1  uppercase tracking-[0.2em] text-[#6B7280] mb-3">
              Total Users
            </p>
            <p className="text-4xl text1 font-serif text-[#111111]">{users.length}</p>
          </div>

          <div className="border rounded p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280] mb-3">
              Active Users
            </p>
            <p className="text-4xl text1 font-serif text-green-600">
              {activeUsers}
            </p>
          </div>

          <div className="border rounded p-6">
            <p className="text-[10px] font-bold  uppercase tracking-[0.2em] text-[#6B7280] mb-3">
              Inactive Users
            </p>
            <p className="text-4xl font-serif text1 text-[#B76E4D]">
              {inactiveUsers}
            </p>
          </div>
        </div>

        <div className="border rounded p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 text-[#111111] text py-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#E35336]"
              />
            </div>

            <div className="flex gap-2">
              {["All", "Active", "Inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 text py-3 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    statusFilter === status
                      ? "bg-[#111111] text-[#FFFFFF]"
                      : "border hover:bg-[#EAEAEA]/20 text-[#111111]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text1 text-[#111111] text-left text-[10px] font-bold uppercase tracking-[0.2em]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text1 text-[#111111] text-[10px] font-bold uppercase tracking-[0.2em]">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text1 text-[#111111] uppercase tracking-[0.2em]">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text1 text-[#111111] uppercase tracking-[0.2em]">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text1 text-[#111111] uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text1 text-[#111111] uppercase tracking-[0.2em]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-6 text text-[#111111] py-4 font-medium">
                      {user.name || "No Name"}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#111111]">
                      <div className="flex text items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#111111]">
                      <div className="flex text items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 ext text-[#111111] font-medium">
                      {user.totalOrders || 0}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold text uppercase px-3 py-1 rounded ${
                          user.isVerified
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-[#111111]"
                        }`}
                      >
                        {user.isVerified ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="text-[#6B7280] hover:text-[#111111]">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="px-6 py-12 text-center text-[#6B7280]">
              No users found.
            </div>
          )}
        </div>

        <div className="mt-6 text text-sm text-[#6B7280]">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
