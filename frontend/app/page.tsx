"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function UserDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", payment: "" });
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/api/products/").then(res => setProducts(res.data));
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const found = prev.find(item => item.product.id === product.id);
      if (found) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const order = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      address: customer.address,
      payment_details: customer.payment,
      products: cart.map(item => item.product.id),
      total_price: cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0),
    };
    await axios.post("http://localhost:8000/api/orders/", order);
    setOrderSuccess(true);
    setCart([]);
    setShowCheckout(false);
    setCustomer({ name: "", email: "", phone: "", address: "", payment: "" });
    setTimeout(() => setOrderSuccess(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-red-900 tracking-tight flex items-center gap-2">
        <span role="img" aria-label="butcher">🥩</span> Welcome to the Butchery!
      </h1>
      {orderSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-900 p-4 rounded-lg mb-6 shadow transition-all animate-fade-in">
          <span className="font-semibold">Order placed successfully!</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Products</h2>
          <ul className="space-y-6">
            {products.map(product => (
              <li key={product.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-md hover:shadow-lg transition-shadow">
                {product.image && <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm" />}
                <div className="flex-1 w-full">
                  <div className="font-bold text-xl text-red-900 mb-1">{product.name}</div>
                  <div className="text-gray-600 mb-2">{product.description}</div>
                  <div className="text-red-800 font-semibold text-lg mb-1">${product.price}</div>
                  <div className="text-sm text-gray-500 mb-2">Stock: {product.quantity}</div>
                  <button
                    className="bg-gradient-to-r from-red-700 to-red-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-red-800 hover:to-red-600 transition disabled:opacity-50"
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Cart</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            {cart.length === 0 ? (
              <div className="text-gray-400 text-center">Your cart is empty.</div>
            ) : (
              <ul className="space-y-4 mb-6">
                {cart.map(item => (
                  <li key={item.product.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <span className="font-medium">{item.product.name} x {item.quantity}</span>
                    <span className="text-red-900 font-semibold">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                    <button className="text-red-600 ml-2 hover:underline" onClick={() => removeFromCart(item.product.id)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="font-bold text-lg mb-6 text-right">Total: ${cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0).toFixed(2)}</div>
            <button
              className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white px-6 py-3 rounded-full font-bold shadow hover:from-green-800 hover:to-green-600 transition disabled:opacity-50 mb-2"
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
            >
              Checkout
            </button>
            {showCheckout && (
              <form className="mt-6 space-y-3 animate-fade-in" onSubmit={handleCheckout}>
                <input required className="w-full border p-3 rounded-lg" placeholder="Name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                <input required className="w-full border p-3 rounded-lg" placeholder="Email" type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} />
                <input className="w-full border p-3 rounded-lg" placeholder="Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                <textarea required className="w-full border p-3 rounded-lg" placeholder="Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
                <input required className="w-full border p-3 rounded-lg" placeholder="Payment Details (simulated)" value={customer.payment} onChange={e => setCustomer({ ...customer, payment: e.target.value })} />
                <button className="bg-gradient-to-r from-red-700 to-red-500 text-white px-6 py-3 rounded-full font-bold w-full shadow hover:from-red-800 hover:to-red-600 transition" type="submit">Place Order</button>
                <button className="w-full mt-2 text-gray-500 underline" type="button" onClick={() => setShowCheckout(false)}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
