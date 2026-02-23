'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Loader2, Shield } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/utils';
import type { User } from '@ilovefdl/shared';

const ROLES = ['ADMIN', 'EDITOR', 'VENDOR', 'USER'] as const;

const roleBadge = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    EDITOR: 'bg-blue-100 text-blue-800',
    VENDOR: 'bg-teal-100 text-teal-800',
    USER: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser || authUser.role !== 'ADMIN') {
      router.push('/auth');
      return;
    }

    async function fetchUsers() {
      try {
        const res = await api.getUsers({ limit: 100 });
        setUsers(res.data);
      } catch {
        // Failed
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [authUser, authLoading, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === authUser?.id) {
      alert('You cannot change your own role.');
      return;
    }

    setUpdating(userId);
    try {
      const res = await api.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to update role.');
    } finally {
      setUpdating(null);
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
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-primary">Users & Editors</h1>
          <p className="text-primary/60 mt-1">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {users.length > 0 ? (
          <div className="bg-white rounded-xl border border-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider border-b border-light">
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-light/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-primary">{u.name || 'Unnamed'}</p>
                        <p className="text-xs text-primary/50">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary/60">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {u.id === authUser?.id ? (
                          <span className="text-xs text-primary/40 italic">You</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              disabled={updating === u.id}
                              className="text-sm border border-light rounded-lg px-2 py-1.5 bg-white text-primary focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:opacity-50"
                            >
                              {ROLES.map((role) => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                            {updating === u.id && <Loader2 className="w-4 h-4 animate-spin text-teal" />}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-light p-16 text-center">
            <Users className="w-16 h-16 text-primary/15 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary mb-2">No users</h2>
          </div>
        )}

        <div className="mt-6 bg-white rounded-xl border border-light p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary text-sm">Role Permissions</h3>
              <ul className="mt-2 text-sm text-primary/60 space-y-1">
                <li><span className="font-medium text-purple-700">ADMIN</span> - Full platform access. Manage everything.</li>
                <li><span className="font-medium text-blue-700">EDITOR</span> - Create and edit blog posts/newsletter content.</li>
                <li><span className="font-medium text-teal-700">VENDOR</span> - Manage their own storefront and products.</li>
                <li><span className="font-medium text-gray-700">USER</span> - Browse and shop. Default role for new accounts.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
