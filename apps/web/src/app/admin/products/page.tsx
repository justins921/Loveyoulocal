'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, ShoppingBag, ArrowLeft, Package, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@ilovefdl/shared';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth');
      return;
    }

    async function fetchProducts() {
      try {
        const res = await api.getProducts({ limit: 100 });
        setProducts(res.data);
      } catch {
        // Failed
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
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

  return (
    <div className="min-h-screen bg-light">
      <div className="bg-white border-b border-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Admin
              </Link>
              <h1 className="text-3xl font-bold text-primary">All Products</h1>
              <p className="text-primary/60 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} across all vendors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length > 0 ? (
          <div className="bg-white rounded-xl border border-light overflow-hidden divide-y divide-light">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-light/50 transition-colors">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-light flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-primary/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary truncate">{product.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-teal">{formatPrice(product.price)}</span>
                    <span className="text-xs text-primary/50">{product.inventory} in stock</span>
                    {product.vendor && (
                      <span className="text-xs text-primary/50">by {product.vendor.businessName}</span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/dashboard/products/${product.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary/70 bg-light rounded-lg hover:bg-primary/10 transition-colors">
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50">
                    {deleting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-light p-16 text-center">
            <ShoppingBag className="w-16 h-16 text-primary/15 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">No products</h2>
            <p className="text-primary/60">Products will appear here once vendors add them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
