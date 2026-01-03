import dynamic from 'next/dynamic';

const BitcoinInheritanceVault = dynamic(
  () => import('@/components/BitcoinInheritanceVault'),
  { ssr: false }
);

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-medium text-white">
              EternalKey
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-orange-800 text-orange-200 border border-orange-700">
              Bitcoin Vault
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-800 text-blue-200 border border-blue-700">
              Charms Protocol
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">Bitcoin Mainnet</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
          <BitcoinInheritanceVault />
        </div>
      </main>
    </div>
  );
}; 