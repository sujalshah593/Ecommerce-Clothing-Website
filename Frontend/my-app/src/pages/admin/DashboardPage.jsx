import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { CartesianGrid } from "recharts";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Truck,
} from "lucide-react";
import TruckLoader from "../../components/TruckLoader.jsx";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const COLORS = {
    Men: "#ef4444",
    Boys: "#3b82f6",
  };
  const chartLightText = {
    fontFamily: '"Zalando Sans Expanded", sans-serif',
    fontWeight: 200,
  };

  const chartBoldText = {
    fontFamily: '"Zalando Sans Expanded", sans-serif',
    fontWeight: "bold",
  };

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <TruckLoader />;

  return (
    <div className="space-y-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-5xl font-bold text-[#111111] text1">Dashboard</h1>
          <p className="text-[#111111] text mt-2">
            Manage your product, driver and seller details
          </p>
        </div>

        <Link to="/admin/add-product">
          <button
            className="bg-purple-600 hover:bg-purple-700 
                       hover:scale-105 transition-all duration-300
                       text-[#FFFFFF] px-6 py-3 text rounded-xl 
                       flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue}`}
            icon={DollarSign}
            color="bg-green-500"
          />

          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="bg-blue-500"
          />

          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={Users}
            color="bg-purple-500"
          />

          <StatCard
            title="Avg Order Value"
            value={`₹${stats.avgOrderValue}`}
            icon={TrendingUp}
            color="bg-orange-500"
          />

          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="bg-indigo-500"
          />

          <StatCard
            title="Pending Deliveries"
            value={stats.pendingDeliveries}
            icon={Truck}
            color="bg-[#111111]"
          />
        </div>
        <div>
          <div className="bg-[#FAFAF8] p-4 sm:p-6 rounded-lg font-serif">
            <h2 className="text-lg mb-6 text1 text">Top Selling Products</h2>

            <div className="overflow-x-auto text">
              <table className="min-w-[500px] text-sm">
                <thead className="border-b">
                  <tr className="text-left text-[#6B7280] uppercase text-xs">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-center">Sold</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProductsAgg.map((product, index) => (
                    <tr key={index} className=" hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md"
                          />
                          <span className="font-medium text-[#111111]">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="text-[#111111] text-center">
                        {product.totalQty}
                      </td>

                      <td className="font-semibold text-center text-green-600">
                        ₹{product.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SALES BY CATEGORY */}
        <div className="bg-[#FAFAF8] text font-serif p-6 rounded-lg w-full">
          <h2 className="text-lg mb-4 text1">Monthly Orders</h2>

          <div className="w-full overflow-x-auto">
            <BarChart
              height={320}
              xAxis={[
                {
                  scaleType: "band",
                  data: stats.monthlyOrderData.map((item) => item.month),
                },
              ]}
              series={[
                {
                  data: stats.monthlyOrderData.map((item) => item.orders),
                  label: "Orders",
                },
              ]}
              sx={{
                "& .MuiChartsAxis-tickLabel": chartLightText,
                "& .MuiChartsLegend-label": chartLightText,
              }}
            />
          </div>
        </div>
        <div className="bg-[#FAFAF8] font-serif  p-6 rounded-lg">
          <h2 className="text-lg text mb-4 text1">Sales by Category</h2>

          <PieChart
            height={300}
            series={[
              {
                data: stats.salesByTargetGroup.map((item, index) => ({
                  id: index,
                  value: item.value,
                  label: item.name,
                })),
                innerRadius: 60,
              },
            ]}
            sx={{
              "& .MuiChartsAxis-tickLabel": chartLightText,
              "& .MuiChartsLegend-label": chartLightText,
            }}
          />
        </div>
      </div>
      <div className="bg-[#FAFAF8] p-6 rounded-lg font-serif">
        <h2 className="text-lg mb-4 text1">Revenue Trend</h2>

        <LineChart
          height={320}
          xAxis={[
            {
              scaleType: "point",
              data: stats.revenueTrendData.map((item) => item.month),
            },
          ]}
          series={[
            {
              data: stats.revenueTrendData.map((item) => item.revenue),
              label: "Revenue",
              curve: "monotoneX",
              color: "#22c55e",
            },
          ]}
          sx={{
            "& .MuiChartsAxis-tickLabel": {
              fontFamily: '"Zalando Sans Expanded", sans-serif',
              fontWeight: 200,
            },
            "& .MuiChartsLegend-label": {
              fontFamily: '"Zalando Sans Expanded", sans-serif',
              fontWeight: 200,
            },
            "& .MuiChartsAxis-label": {
              fontFamily: '"Zalando Sans Expanded", sans-serif',
              fontWeight: "bold",
            },
          }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="relative bg-[#FAFAF8] p-6 rounded-2xl shadow-sm border border-[#EAEAEA]/30 hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[#6B7280] text text-xs uppercase tracking-wider">
          {title}
        </p>
        <h2 className="text-2xl font-bold mt-3 text-[#111111] text">{value}</h2>
      </div>

      <div
        className={`w-12 h-12 flex items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="w-6 h-6 text-[#FFFFFF]" />
      </div>
    </div>
  </div>
);
