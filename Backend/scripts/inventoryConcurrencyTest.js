import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../Models/Product.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const TEST_PRODUCT_NAME = "__development_inventory_concurrency_test__";

const reserveInventoryAtomically = async (productId, quantity) => {
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId, countInStock: { $gte: quantity } },
    { $inc: { countInStock: -quantity } },
    { new: true },
  );

  return {
    success: Boolean(updatedProduct),
    countInStock: updatedProduct?.countInStock ?? null,
  };
};

const runScenario = async (productId, startingStock, quantities, expectedSuccesses, expectedFinalStock) => {
  await Product.updateOne({ _id: productId }, { $set: { countInStock: startingStock } });

  const results = await Promise.all(
    quantities.map((quantity) => reserveInventoryAtomically(productId, quantity)),
  );
  const productAfter = await Product.findById(productId).select("countInStock");
  const successfulReservations = results.filter((result) => result.success).length;

  console.log(JSON.stringify({ quantities, results, finalCountInStock: productAfter?.countInStock }, null, 2));

  if (successfulReservations !== expectedSuccesses) {
    throw new Error(`Expected ${expectedSuccesses} successful reservations, got ${successfulReservations}`);
  }
  if (productAfter?.countInStock !== expectedFinalStock) {
    throw new Error(`Expected final stock ${expectedFinalStock}, got ${productAfter?.countInStock}`);
  }
  if ((productAfter?.countInStock ?? -1) < 0) {
    throw new Error("Inventory became negative");
  }
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URL);

  let testProduct = await Product.findOne({ name: TEST_PRODUCT_NAME });
  const originalProduct = testProduct ? testProduct.toObject() : null;

  if (!testProduct) {
    testProduct = await Product.create({
      name: TEST_PRODUCT_NAME,
      description: "Development-only concurrency test product",
      price: 1,
      category: "Apparel",
      targetGroup: "Men",
      subCategory: "Test",
      image: "development-only",
      countInStock: 1,
    });
  }

  try {
    console.log("Scenario 1: stock 1, quantities 1 and 1");
    await runScenario(testProduct._id, 1, [1, 1], 1, 0);

    console.log("Scenario 2: stock 5, quantities 3 and 3");
    await runScenario(testProduct._id, 5, [3, 3], 1, 2);

    console.log("Scenario 3: stock 5, quantities 2 and 3");
    await runScenario(testProduct._id, 5, [2, 3], 2, 0);

    console.log("Inventory concurrency test passed.");
  } finally {
    if (originalProduct) {
      await Product.replaceOne({ _id: testProduct._id }, originalProduct);
    } else {
      await Product.deleteOne({ _id: testProduct._id });
    }
    await mongoose.disconnect();
  }
};

main().catch(async (error) => {
  console.error(`Inventory concurrency test failed: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
