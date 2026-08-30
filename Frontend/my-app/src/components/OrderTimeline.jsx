const steps = [
  "Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const OrderTimeline = ({ status }) => {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center justify-between mt-6">
      {steps.map((step, index) => (
        <div key={step} className="flex-1 text-center">
          <div
            className={`w-6 h-6 mx-auto rounded-full 
            ${index <= currentIndex ? "bg-[#111111]" : "bg-gray-300"}`}
          />
          <p
            className={`text-xs mt-2 
            ${index <= currentIndex ? "text-[#111111]" : "text-gray-400"}`}
          >
            {step}
          </p>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
