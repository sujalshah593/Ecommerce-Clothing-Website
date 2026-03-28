import Order from "../Models/Order.js";
import User from "../Models/User.js";
import Product from "../Models/Product.js";

export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithOrder = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({
          user: user._id,
        });
        return {
          ...user,
          totalOrders: orderCount,
        };
      }),
    );
    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = req.body.status;
  await order.save();

  res.json(order);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.name = req.body.name || product.name;
  product.price = req.body.price || product.price;
  product.category = req.body.category || product.category;
  product.countInStock = req.body.countInStock || product.countInStock;
  product.image = req.body.image || product.image;
  product.description = req.body.description || product.description;

  const updateProduct = await product.save();
  res.json(updateProduct);
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      targetGroup,
      subCategory,
      countInStock,
      image,
      description,
    } = req.body;

    const product = await Product.create({
      name,
      price,
      category,
      targetGroup,
      subCategory,
      countInStock,
      image,
      description,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const pendingDeliveries = await Order.countDocuments({
      isDelivered: false,
    });

    const avgOrderValue = totalOrders
      ? Math.round(totalRevenue / totalOrders)
      : 0;

    const monthlyRevenueAgg = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyAgg = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProductsAgg = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          image: { $first: "$orderItems.image" },
          totalQty: { $sum: "$orderItems.qty" },
          revenue: {
            $sum: {
              $multiply: ["$orderItems.qty", "$orderItems.price"],
            },
          },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
    ]);

    const monthlyOrderData = monthlyAgg.map((m) => ({
      month: `M${m._id}`,
      orders: m.orders,
    }));

    const revenueTrendAgg = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

const months = [
  "", "Jan", "Feb", "Mar", "Apr", "May",
  "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const revenueTrendData = revenueTrendAgg.map((r) => ({
  month: months[r._id],
revenue: Number(r.revenue) + Math.floor(Math.random() * 5000)
  
}));

    

    const targetGroupAgg = await Order.aggregate([
      { $unwind: "$orderItems" },

      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },

      { $unwind: "$productInfo" },

      {
        $group: {
          _id: "$productInfo.targetGroup",
          value: { $sum: "$orderItems.qty" },
        },
      },
    ]);

    const salesByTargetGroup = targetGroupAgg.map((g) => ({
      name: g._id,
      value: g.value,
    }));

    res.json({
      totalRevenue,
      totalProducts,
      totalOrders,
      activeUsers,
      avgOrderValue,
      revenueTrendData,
      monthlyOrderData,
      pendingDeliveries,
      monthlyRevenueAgg,
      salesByTargetGroup,
      topProductsAgg
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Dashboard stats failed" });
  }
};
