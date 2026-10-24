"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2 } from "react-icons/fi";
import { EditProductModal } from "./EditProductModal";
import { RecipeManager } from "./RecipeManager";

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

export interface InventoryItem {
  _id: string;
  name: string;
  unit: string;
}

export interface Recipe {
  _id: string;
  productId: string;
  itemId: string;
  quantityRequired: number;
}

interface ProductListProps {
  initialProducts: Product[];
  items: InventoryItem[];
  recipes: Recipe[];
  deleteProductAction: (formData: FormData) => void;
}

export function ProductList({ 
  initialProducts, 
  items,
  recipes,
  deleteProductAction 
}: ProductListProps) {
  if (initialProducts.length === 0) {
    return (
      <div className="card text-center py-12 text-[var(--muted)]">
        No products yet. Add your first menu item above.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr className="text-left text-[var(--muted)]">
              <th className="p-4 font-medium">Product Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Recipe</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {initialProducts.map((product) => (
                <motion.tr 
                  key={String(product._id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, backgroundColor: "#fee2e2" }}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">₱{product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <RecipeManager 
                      productId={String(product._id)} 
                      productName={product.name} 
                      items={items} 
                      existingRecipes={recipes.filter((r) => r.productId === String(product._id))}
                    />
                  </td>
                  <td className="p-4 flex justify-end items-center gap-4">
                    <EditProductModal product={product} />
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={String(product._id)} />
                      <button type="submit" className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
                        <FiTrash2 size={18} />
                      </button>
                    </form>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        <AnimatePresence>
          {initialProducts.map((product) => (
            <motion.div
              key={String(product._id)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-4 flex flex-col gap-3 relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span className="font-medium text-[var(--brand)]">₱{product.price.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <EditProductModal product={product} />
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={String(product._id)} />
                    <button type="submit" className="text-red-500 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="mt-2 pt-3 border-t border-[var(--border)]">
                <div className="text-xs text-gray-500 mb-2">Linked Ingredients</div>
                <RecipeManager 
                  productId={String(product._id)} 
                  productName={product.name} 
                  items={items} 
                  existingRecipes={recipes.filter((r) => r.productId === String(product._id))}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}