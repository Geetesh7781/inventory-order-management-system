import { useEffect, useState } from "react";
import "./App.css";

const API = "https://inventory-order-management-system-9au4.onrender.com";

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
  });

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [order, setOrder] = useState({
    customer_id: "",
    product_id: "",
    quantity: "",
  });

  const loadData = async () => {
    try {
      const productsRes = await fetch(`${API}/products`);
      const customersRes = await fetch(`${API}/customers`);
      const ordersRes = await fetch(`${API}/orders`);

      const productsData = await productsRes.json();
      const customersData = await customersRes.json();
      const ordersData = await ordersRes.json();

      setProducts(productsData);
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addProduct = async () => {
    if (!product.name || !product.sku || !product.price || !product.stock) {
      alert("Please fill all product fields");
      return;
    }

    try {
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          stock: Number(product.stock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Product not added");
        return;
      }

      alert("Product added successfully");
      setProduct({ name: "", sku: "", price: "", stock: "" });
      await loadData();
    } catch (error) {
      console.error("Add product error:", error);
      alert("Product add failed. Please check backend.");
    }
  };

  const addCustomer = async () => {
    if (!customer.name || !customer.email) {
      alert("Please fill customer name and email");
      return;
    }

    try {
      const res = await fetch(`${API}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Customer not added");
        return;
      }

      alert("Customer added successfully");
      setCustomer({ name: "", email: "", phone: "" });
      await loadData();
    } catch (error) {
      console.error("Add customer error:", error);
      alert("Customer add failed. Please check backend.");
    }
  };

  const createOrder = async () => {
    if (!order.customer_id || !order.product_id || !order.quantity) {
      alert("Please select customer, product and quantity");
      return;
    }

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: Number(order.customer_id),
          product_id: Number(order.product_id),
          quantity: Number(order.quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Order failed");
        return;
      }

      alert("Order created successfully");
      setOrder({ customer_id: "", product_id: "", quantity: "" });
      await loadData();
    } catch (error) {
      console.error("Create order error:", error);
      alert("Order failed. Please check backend.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await fetch(`${API}/products/${id}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Delete failed");
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>Inventory & Order Management System</h1>
        <p>Manage products, customers, orders and inventory tracking.</p>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Add Product</h2>

          <input
            placeholder="Product Name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />

          <input
            placeholder="Unique SKU"
            value={product.sku}
            onChange={(e) => setProduct({ ...product, sku: e.target.value })}
          />

          <input
            type="number"
            placeholder="Price"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />

          <input
            type="number"
            placeholder="Stock"
            value={product.stock}
            onChange={(e) => setProduct({ ...product, stock: e.target.value })}
          />

          <button type="button" onClick={addProduct}>
            Add Product
          </button>
        </div>

        <div className="panel">
          <h2>Add Customer</h2>

          <input
            placeholder="Customer Name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Unique Email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          />

          <input
            placeholder="Phone"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />

          <button type="button" onClick={addCustomer}>
            Add Customer
          </button>
        </div>

        <div className="panel">
          <h2>Create Order</h2>

          <select
            value={order.customer_id}
            onChange={(e) => setOrder({ ...order, customer_id: e.target.value })}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={order.product_id}
            onChange={(e) => setOrder({ ...order, product_id: e.target.value })}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - Stock: {p.stock}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={order.quantity}
            onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
          />

          <button type="button" onClick={createOrder}>
            Create Order
          </button>
        </div>
      </section>

      <section className="tables">
        <div className="tableBox">
          <h2>Products</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tableBox">
          <h2>Customers</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tableBox">
          <h2>Orders</h2>

          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.customer_name}</td>
                  <td>{o.product_name}</td>
                  <td>{o.quantity}</td>
                  <td>₹{o.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;