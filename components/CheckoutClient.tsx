"use client";
import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

interface Product {
  _id: string;
  name: string;
  price: number;
  category?: string;
  active?: boolean;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  lineTotal: number;
}

interface Receipt {
  saleNumber: string;
  total: number;
  saleItems: SaleItem[];
}

export function CheckoutClient({ initialProducts }: { initialProducts: Product[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<"cash"|"card"|"ewallet">("cash");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Stripe State
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };

  const clearCart = () => setCart({});

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const p = initialProducts.find(x => String(x._id) === id)!;
    return { product: p, quantity: qty, lineTotal: p.price * qty };
  });

  const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  async function handleCheckout() {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError(null);

    // If Card, fetch a PaymentIntent secret from our server
    if (method === "card") {
      try {
        const intentRes = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        });
        const intentData = await intentRes.json();
        
        if (!intentRes.ok) throw new Error(intentData.error || "Failed to initialize payment");
        
        setClientSecret(intentData.clientSecret);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
      return; // Stop here. The <StripePaymentForm> will take over.
    }

    // If Cash/E-Wallet, process directly
    await processSale();
  }

  async function processSale(paymentIntentId?: string) {
    setLoading(true);
    setError(null);

    const payload = {
      items: cartItems.map(i => ({ productId: String(i.product._id), quantity: i.quantity })),
      paymentMethod: method,
      paymentIntentId, // Only sent if Stripe handled it
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setReceipt(data);
      setCart({});
      setClientSecret(null);
    } else {
      setError(data.error || "Checkout failed");
    }
    setLoading(false);
  }

  if (receipt) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="text-6xl text-green-500">✓</div>
        <h1 className="text-3xl font-bold">Payment Successful</h1>
        <div className="card w-full max-w-md text-center space-y-4 font-mono text-sm">
          <p>Sale: {receipt.saleNumber}</p>
          <p className="text-2xl font-bold text-black">₱{receipt.total.toFixed(2)}</p>
          <p>Method: {method.toUpperCase()}</p>
          <div className="border-t border-dashed border-gray-300 pt-4 space-y-2">
            {receipt.saleItems.map((si: SaleItem) => (
              <div key={si.productId} className="flex justify-between">
                <span>{si.quantity}x {si.productName}</span>
                <span>₱{si.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setReceipt(null)} className="btn">
          Next Order
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[1fr_350px] gap-6 h-[calc(100vh-8rem)]">
      {/* Product Grid */}
      <div className="space-y-4 overflow-y-auto pr-2">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {initialProducts.map((p) => (
            <button
              key={p._id}
              onClick={() => addToCart(String(p._id))}
              className="card text-left hover:border-(--brand) transition-colors active:scale-95 flex flex-col justify-between h-32"
            >
              <div className="font-semibold">{p.name}</div>
              <div className="text-(--muted) text-sm">₱{p.price.toFixed(2)}</div>
            </button>
          ))}
          {initialProducts.length === 0 && (
            <p className="col-span-full text-center text-(--muted) py-12">No products found. Add some in the Products page.</p>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="card bg-white h-full flex flex-col p-0 overflow-hidden relative">
        <div className="p-4 bg-gray-50 border-b border-(--border) flex justify-between items-center">
          <h2 className="font-semibold text-lg">Cart</h2>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear</button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <p className="text-center text-(--muted) text-sm mt-10">Cart is empty.</p>
          ) : cartItems.map(({ product, quantity }) => (
            <div key={String(product._id)} className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{product.name}</div>
                <div className="text-(--muted)">₱{product.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => removeFromCart(String(product._id))} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200">-</button>
                <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                <button onClick={() => addToCart(String(product._id))} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-(--border) space-y-4 bg-gray-50">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-3 gap-2 ">
              {["cash", "card", "ewallet"].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMethod(m as "cash" | "card" | "ewallet");
                    setClientSecret(null); // Reset Stripe if changing method
                  }}
                  // FIXED: Changed active state from bg-(--brand) to bg-orange-600
                  className={`py-2 cursor-pointer rounded text-sm font-medium capitalize border transition-colors ${
                    method === m 
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            onClick={handleCheckout} 
            disabled={cartItems.length === 0 || loading || !!clientSecret}
            // FIXED: Matched the main button color to the active tab color
            className="w-full py-3 text-lg text-white font-semibold bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : method === "card" ? "Continue to Card" : "Pay Now"}
          </button>
        </div>

        {/* Stripe Payment Overlay */}
        {clientSecret && (
          <div className="absolute inset-0 bg-white z-10 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Card Details</h3>
              <button onClick={() => setClientSecret(null)} className="text-sm text-gray-500 hover:underline">Cancel</button>
            </div>
            <div className="flex-1">
              <StripePaymentForm 
                onSuccess={(id) => processSale(id)} 
                onError={(msg) => setError(msg)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inner component for Stripe Elements
function StripePaymentForm({ onSuccess, onError }: { onSuccess: (id: string) => void, onError: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    onError("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required", // Prevents full page reload for simple cards
    });

    if (error) {
      onError(error.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col justify-end">
      <PaymentElement />
      <button type="submit" disabled={!stripe || isProcessing} className="w-full py-3 mt-4 text-white bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {isProcessing ? "Processing..." : "Confirm Payment"}
      </button>
    </form>
  );
}