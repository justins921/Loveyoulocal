'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Package,
  Loader2,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/utils';
import type { Product, Vendor } from '@ilovefdl/shared';

export default function VendorProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    async function fetchProducts() {
      try {
        const vendorsRes = await api.getVendors({ limit: 100 });
        const myVendor = vendorsRes.data.find((v) => v.userId === user!.id);

        if (myVendor) {
          setVendor(myVendor);
          const productsRes = await api.getProducts({ vendorId: myVendor.id, limit: 100 });
          setProducts(productsRes.data);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [user, authLoading, router]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeleting(productId);
    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      alert('Failed to delete product.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-3">No Vendor Profile</h1>
          <p className="text-primary/60 mb-6">
            You need a vendor profile to manage products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-white border-b border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-primary">Your Products</h1>
              <p className="text-primary/60 mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} listed
              </p>
            </div>
            <Link href="/dashboard/products/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length > 0 ? (
          <div className="bg-white rounded-xl border border-light overflow-hidden">
            <div className="divide-y divide-light">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 hover:bg-light/50 transition-colors"
                >
                  {/* Image */}
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-light flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary/20" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary truncate">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium text-teal">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-primary/50">
                        {product.inventory} in stock
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {product.categoryTags?.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {product.categoryTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-0.5 bg-light rounded text-xs text-primary/60"
                          >
                            {tag}
                          </span>
                        ))}
                        {product.categoryTags.length > 3 && (
                          <span className="text-xs text-primary/40">
                            +{product.categoryTags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary/70 bg-light rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-light p-16 text-center">
            <Package className="w-16 h-16 text-primary/15 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">No products yet</h2>
            <p className="text-primary/60 mb-6 max-w-md mx-auto">
              Start adding products to your storefront so customers can discover and buy them.
            </p>
            <Link href="/dashboard/products/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
