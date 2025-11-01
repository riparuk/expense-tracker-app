// app/dashboard/summary/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CategoryTotal {
  categoryId: number;
  category: string;
  total: number;
}

interface MonthlyData {
  month: Date;
  total: number;
}

interface SummaryData {
  byCategory: CategoryTotal[];
  monthlyBreakdown: MonthlyData[];
}

export default function SummaryPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/expenses/summary', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Gagal mengambil data ringkasan');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalSpending = summary?.byCategory.reduce((sum, cat) => sum + cat.total, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              💰 Expense Tracker
            </h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/categories"
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Kategori
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Total Spending Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-lg font-medium mb-2">Total Pengeluaran</h2>
          <p className="text-4xl font-bold">{formatCurrency(totalSpending)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* By Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pengeluaran per Kategori
              </h2>
            </div>
            <div className="p-6">
              {!summary || summary.byCategory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Belum ada data pengeluaran
                </p>
              ) : (
                <div className="space-y-4">
                  {summary.byCategory.map((item) => {
                    const percentage = totalSpending > 0 ? (item.total / totalSpending) * 100 : 0;
                    return (
                      <div key={item.categoryId}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.category}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(item.total)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pengeluaran per Bulan
              </h2>
            </div>
            <div className="p-6">
              {!summary || summary.monthlyBreakdown.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Belum ada data pengeluaran bulanan
                </p>
              ) : (
                <div className="space-y-4">
                  {summary.monthlyBreakdown.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatMonth(item.month)}
                      </span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(parseFloat(item.total))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && summary.byCategory.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Kategori Terbanyak
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary.byCategory[0]?.category || '-'}
              </p>
              <p className="text-sm text-indigo-600 mt-1">
                {formatCurrency(summary.byCategory[0]?.total || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Jumlah Kategori
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary.byCategory.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">kategori aktif</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Rata-rata per Bulan
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(
                  summary.monthlyBreakdown.length > 0
                    ? totalSpending / summary.monthlyBreakdown.length
                    : 0
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                dari {summary.monthlyBreakdown.length} bulan
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}