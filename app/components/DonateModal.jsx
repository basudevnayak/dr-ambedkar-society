"use client";

import { useState } from "react";

export default function DonateModal({ open, onClose }) {
  const [type, setType] = useState("Individual");
  const [purpose, setPurpose] = useState("General Fund");
  const [amount, setAmount] = useState(500);

  if (!open) return null;

  const loadScript = (src) =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    // const res = await fetch("/api/create-order", {
    //   method: "POST",
    //   body: JSON.stringify({ amount }),
    // });

    // const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: 10,
      currency: "INR",
      name: "Dr. Ambedkar Society",
      description: `${type} - ${purpose}`,
    //   order_id: order.id,

      notes: {
        donation_type: type,
        purpose: purpose,
      },

      handler: function () {
        alert("Thank you for your donation ❤️");
        onClose();
      },

      theme: { color: "#2563eb" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          Donate ❤️
        </h2>

        {/* Donation Type */}
        <label className="text-sm font-medium">Donation Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        >
          <option>Individual</option>
          <option>Corporate</option>
          <option>Organization</option>
        </select>

        {/* Purpose */}
        <label className="text-sm font-medium">Purpose</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        >
          <option>General Fund</option>
          <option>Education Support</option>
          <option>Health Program</option>
          <option>Women Empowerment</option>
          <option>Child Welfare</option>
        </select>

        {/* Amount */}
        <label className="text-sm font-medium">Amount (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
        >
          Donate ₹{amount}
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
