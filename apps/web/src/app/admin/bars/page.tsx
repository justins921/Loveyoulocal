'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Beer, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Bar } from '@ilovefdl/shared';

export default function AdminBarsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth');
      return;
    }

    async function fetchBars() {
      try {
        const res = await api.getBars({ limit: 100 });
        setBars(res.data);
      } catch {
        // Failed
      } finally {
        setLoading(false);
      }
    }

    fetchBars();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bar?')) return;
    setDeleting(id);
    try {
      await api.deleteBar(id);
      setBars((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('Failed to delete bar.');
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
              <h1 className="text-3xl font-bold text-primary">Bars & Specials</h1>
              <p className="text-primary/60 mt-1">{bars.length} bar{bars.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/admin/bars/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Add Bar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bars.length > 0 ? (
          <div className="bg-white rounded-xl border border-light overflow-hidden divide-y divide-light">
            {bars.map((bar) => (
              <div key={bar.id} className="flex items-center gap-4 p-4 hover:bg-light/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary truncate">{bar.name}</p>
                  <p className="text-sm text-primary/50 truncate">{bar.address}</p>
                  {bar.phone && <p className="text-xs text-primary/40 mt-0.5">{bar.phone}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/bars/${bar.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary/70 bg-light rounded-lg hover:bg-primary/10 transition-colors">
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(bar.id)} disabled={deleting === bar.id} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50">
                    {deleting === bar.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-light p-16 text-center">
            <Beer className="w-16 h-16 text-primary/15 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">No bars yet</h2>
            <p className="text-primary/60 mb-6">Add bars to the directory for the community.</p>
            <Link href="/admin/bars/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Add First Bar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
