'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Newspaper, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatCategoryName } from '@/lib/utils';
import type { BlogPost } from '@ilovefdl/shared';

export default function AdminPostsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth');
      return;
    }

    async function fetchPosts() {
      try {
        // Fetch all posts (including drafts) for admin
        const res = await api.getPosts({ limit: 100 });
        setPosts(res.data);
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeleting(id);
    try {
      await api.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete post.');
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
              <h1 className="text-3xl font-bold text-primary">Blog Posts</h1>
              <p className="text-primary/60 mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/admin/posts/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> New Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length > 0 ? (
          <div className="bg-white rounded-xl border border-light overflow-hidden divide-y divide-light">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-light/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(post.status)}`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-primary/50">{formatCategoryName(post.category)}</span>
                    <span className="text-xs text-primary/50">{post.publishedAt ? formatDate(post.publishedAt) : 'Not published'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/posts/${post.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary/70 bg-light rounded-lg hover:bg-primary/10 transition-colors">
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50">
                    {deleting === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-light p-16 text-center">
            <Newspaper className="w-16 h-16 text-primary/15 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">No posts yet</h2>
            <p className="text-primary/60 mb-6">Create your first blog post to share news with the community.</p>
            <Link href="/admin/posts/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Create First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
