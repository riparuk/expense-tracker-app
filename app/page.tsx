import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="w-full max-w-md px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              💰 Expense Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Kelola pengeluaran Anda dengan mudah
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="block w-full py-3 px-4 bg-white hover:bg-gray-50 text-indigo-600 font-medium rounded-lg border-2 border-indigo-600 transition-colors text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Fitur:
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Catat pengeluaran harian
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Kategorisasi pengeluaran
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Laporan ringkasan bulanan
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
