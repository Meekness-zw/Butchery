"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  image?: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", quantity: "", image: null as File | null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Simple admin credentials (in real app, this would be in backend)
  const ADMIN_CREDENTIALS = { username: "admin", password: "butchery123" };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_CREDENTIALS.username && loginForm.password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setLoginError("");
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  const fetchProducts = () => {
    axios.get("https://butchery-1.onrender.com/api/products/").then(res => setProducts(res.data));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity);
      if (form.image) formData.append("image", form.image);
      
      const response = await axios.post("https://butchery-1.onrender.com/api/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ name: "", description: "", price: "", quantity: "", image: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("Product added successfully!");
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      let message = "Error adding product. Please try again.";
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          message = error.response.data;
        } else if (typeof error.response.data === "object") {
          message = Object.values(error.response.data).flat().join(" ");
        }
      }
      setError(message);
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await axios.delete(`https://butchery-1.onrender.com/api/products/${id}/`);
      fetchProducts();
      setSuccess("Product deleted.");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("name", editingProduct.name);
    formData.append("description", editingProduct.description);
    formData.append("price", editingProduct.price);
    formData.append("quantity", editingProduct.quantity.toString());
    
    await axios.put(`https://butchery-1.onrender.com/api/products/${editingProduct.id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    setShowEditModal(false);
    setEditingProduct(null);
    fetchProducts();
    setLoading(false);
    setSuccess("Product updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProduct) return;
    const { name, value } = e.target;
    setEditingProduct({ ...editingProduct, [name]: value });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-red-900 tracking-tight flex items-center justify-center gap-2">
              <span role="img" aria-label="butcher">🔪</span> Admin Login
            </h1>
            <p className="text-gray-600 mt-2">Access the butchery management system</p>
          </div>
          {loginError && (
            <div className="bg-red-100 border border-red-300 text-red-900 p-3 rounded-lg mb-4">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                required
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                required
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-700 to-red-500 text-white px-6 py-3 rounded-full font-bold shadow hover:from-red-800 hover:to-red-600 transition"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo credentials:</p>
            <p>Username: admin</p>
            <p>Password: butchery123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-red-900 to-red-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <span role="img" aria-label="butcher">🔪</span> Admin Dashboard
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-red-900 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-900 p-4 rounded-lg mb-6 shadow animate-fade-in">
            <span className="font-semibold">{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-900 p-4 rounded-lg mb-6 shadow animate-fade-in">
            <span className="font-semibold">{error}</span>
          </div>
        )}
        <form className="bg-white p-6 rounded-2xl shadow-md mb-10 space-y-3 border border-gray-200" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Add New Product</h2>
          <input required className="w-full border p-3 rounded-lg" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <textarea className="w-full border p-3 rounded-lg" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input required className="w-full border p-3 rounded-lg" name="price" placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} />
          <input required className="w-full border p-3 rounded-lg" name="quantity" placeholder="Quantity" type="number" min="0" value={form.quantity} onChange={handleChange} />
          <input ref={fileInputRef} className="w-full border p-3 rounded-lg" name="image" type="file" accept="image/*" onChange={handleFileChange} />
          <button className="bg-gradient-to-r from-red-700 to-red-500 text-white px-6 py-3 rounded-full font-bold w-full shadow hover:from-red-800 hover:to-red-600 transition mt-2" type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>
        </form>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Product List</h2>
        <ul className="space-y-6">
          {products.map(product => (
            <li key={product.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-md hover:shadow-lg transition-shadow">
              {product.image && <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm" />}
              <div className="flex-1 w-full">
                <div className="font-bold text-xl text-red-900 mb-1">{product.name}</div>
                <div className="text-gray-600 mb-2">{product.description}</div>
                <div className="text-red-800 font-semibold text-lg mb-1">${product.price}</div>
                <div className="text-sm text-gray-500 mb-2">Stock: {product.quantity}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:from-blue-800 hover:to-blue-600 transition" 
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button 
                  className="bg-gradient-to-r from-red-700 to-red-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:from-red-800 hover:to-red-600 transition" 
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Product</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input 
                required 
                className="w-full border p-3 rounded-lg" 
                name="name" 
                placeholder="Name" 
                value={editingProduct.name} 
                onChange={handleEditChange} 
              />
              <textarea 
                className="w-full border p-3 rounded-lg" 
                name="description" 
                placeholder="Description" 
                value={editingProduct.description} 
                onChange={handleEditChange} 
              />
              <input 
                required 
                className="w-full border p-3 rounded-lg" 
                name="price" 
                placeholder="Price" 
                type="number" 
                min="0" 
                step="0.01" 
                value={editingProduct.price} 
                onChange={handleEditChange} 
              />
              <input 
                required 
                className="w-full border p-3 rounded-lg" 
                name="quantity" 
                placeholder="Quantity" 
                type="number" 
                min="0" 
                value={editingProduct.quantity} 
                onChange={handleEditChange} 
              />
              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-green-700 to-green-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:from-green-800 hover:to-green-600 transition"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-600 transition"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 