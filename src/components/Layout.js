import Head from 'next/head';

/**
 * 共通レイアウト
 * ヘッダー・フッターを含む全ページ共通の枠組み
 */
export default function Layout({ children, title = '研修システム' }) {
  return (
    <>
      <Head>
        <title>{title} | 公益社団法人全国学習塾協会</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* ========== ヘッダー ========== */}
        <header className="bg-blue-950 text-white shadow-md no-print">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* ロゴマーク（仮） */}
            <div className="w-9 h-9 bg-white rounded flex items-center justify-center flex-shrink-0">
              <span className="text-blue-950 font-black text-xs leading-none">JTA</span>
            </div>
            <div>
              <p className="text-xs text-blue-300 leading-tight">公益社団法人全国学習塾協会</p>
              <p className="text-sm font-semibold leading-tight">
                日本版DBS対応研修システム
              </p>
            </div>
          </div>
        </header>

        {/* ========== メインコンテンツ ========== */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        {/* ========== フッター ========== */}
        <footer className="border-t border-gray-200 bg-white mt-12 no-print">
          <div className="max-w-4xl mx-auto px-4 py-5 text-center">
            <p className="text-sm text-gray-500">公益社団法人全国学習塾協会</p>
            <p className="text-xs text-gray-400 mt-1">
              ※ このシステムは試作・検証版です。本番運用前に十分なテストを行ってください。
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
