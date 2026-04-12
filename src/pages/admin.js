import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

/**
 * 簡易管理画面
 * - パスワード認証（試作用：平文。本番では適切な認証基盤に差し替えること）
 * - 受講記録の一覧表示
 * - 閲覧専用（編集・削除は未実装）
 *
 * ⚠ 本番運用時の注意：
 *   - このパスワード認証は試作用の簡易実装です
 *   - 本番では NextAuth.js 等の認証ライブラリを使用してください
 */

// 試作用パスワード（本番では環境変数 + proper auth に変更）
const ADMIN_PASSWORD = 'admin2024';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPassed, setFilterPassed] = useState('all'); // 'all' | 'passed' | 'failed'
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [searchText, setSearchText] = useState('');

  // ========== ログイン ==========
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError('');
      fetchRecords();
    } else {
      setPwError('パスワードが正しくありません。');
    }
  };

  // ========== 記録取得 ==========
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-records');
      const data = await res.json();
      setRecords(data.records || []);
    } catch (e) {
      console.error('記録の取得に失敗しました:', e);
    } finally {
      setLoading(false);
    }
  };

  // ========== フィルタ・ソート処理 ==========
  const filteredRecords = records
    .filter((r) => {
      if (filterPassed === 'passed') return r.passed;
      if (filterPassed === 'failed') return !r.passed;
      return true;
    })
    .filter((r) => {
      if (!searchText) return true;
      const text = searchText.toLowerCase();
      return (
        (r.fullName || '').includes(searchText) ||
        (r.companyName || '').toLowerCase().includes(text) ||
        (r.classroomName || '').includes(searchText) ||
        (r.memberCode || '').toLowerCase().includes(text) ||
        (r.email || '').toLowerCase().includes(text)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const passedCount = records.filter((r) => r.passed).length;
  const failedCount = records.filter((r) => !r.passed).length;

  // ========== ログイン前 ==========
  if (!authed) {
    return (
      <Layout title="管理画面">
        <div className="max-w-sm mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">管理画面</h1>
            <p className="text-sm text-gray-500 text-center mb-6">
              管理者パスワードを入力してください
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                <input
                  type="password"
                  value={inputPw}
                  onChange={(e) => setInputPw(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="パスワードを入力"
                  autoFocus
                />
                {pwError && <p className="mt-1 text-xs text-red-600">{pwError}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-950 hover:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                ログイン
              </button>
            </form>
            <p className="mt-4 text-xs text-gray-400 text-center">
              ※ 試作版のパスワード認証です。本番では適切な認証に変更してください。
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ========== 管理画面本体 ==========
  return (
    <Layout title="管理画面">
      <div>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">受講記録 管理画面</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              ※ 閲覧専用（試作版）
            </p>
          </div>
          <button
            onClick={fetchRecords}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
          >
            更新
          </button>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">総受講数</p>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-green-200 p-4 text-center">
            <p className="text-xs text-green-600 mb-1">合格</p>
            <p className="text-2xl font-bold text-green-700">{passedCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-4 text-center">
            <p className="text-xs text-red-500 mb-1">不合格</p>
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
          </div>
        </div>

        {/* フィルター・検索 */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="氏名・会社名・教室名で検索..."
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-1">
            {[
              { val: 'all', label: 'すべて' },
              { val: 'passed', label: '合格のみ' },
              { val: 'failed', label: '不合格のみ' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setFilterPassed(f.val)}
                className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                  filterPassed === f.val
                    ? 'bg-blue-950 text-white border-blue-950'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* テーブル */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">読み込み中...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
            {records.length === 0 ? '受講記録がありません。' : '条件に一致する記録がありません。'}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      { field: 'submittedAt', label: '受講日時' },
                      { field: 'memberCode', label: '会員コード' },
                      { field: 'companyName', label: '事業者名' },
                      { field: 'classroomName', label: '教室名' },
                      { field: 'fullName', label: '氏名' },
                      { field: 'email', label: 'メール' },
                      { field: 'score', label: '得点' },
                      { field: 'passed', label: '合否' },
                      { field: 'completionDate', label: '修了日' },
                    ].map((col) => (
                      <th
                        key={col.field}
                        onClick={() => {
                          if (sortField === col.field) {
                            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField(col.field);
                            setSortDir('desc');
                          }
                        }}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap select-none"
                      >
                        {col.label}
                        {sortField === col.field && (
                          <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {record.submittedAt
                          ? new Date(record.submittedAt).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {record.memberCode || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                        {record.companyName || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                        {record.classroomName || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900 whitespace-nowrap">
                        {record.fullName || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {record.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-center font-semibold">
                        {record.score != null ? `${record.score}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                            record.passed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {record.passed ? '合格' : '不合格'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {record.completionDate || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-right">
              {filteredRecords.length} 件表示（全 {records.length} 件）
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400 text-center">
          ※ このページは試作版です。本番では適切な認証・権限管理を実装してください。
        </p>
      </div>
    </Layout>
  );
}
