import { useState } from 'react';
import Layout from '../components/Layout';

/**
 * JJA 協会本部 管理画面
 * - 全事業者・全教室・全受講記録を横断閲覧
 * - タブ①受講記録 ②事業者一覧 ③教室一覧 ④会員マスタ（旧）
 */

const ADMIN_PASSWORD = 'admin2024';

function getBaseUrl() {
  return typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [inputPw, setInputPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState('records');

  const [records, setRecords] = useState([]);
  const [operators, setOperators] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // 受講記録フィルタ
  const [filterPassed, setFilterPassed] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');

  // 事業者フィルタ
  const [opSearch, setOpSearch] = useState('');
  const [opFilter, setOpFilter] = useState('all');

  // 教室フィルタ
  const [clsSearch, setClsSearch] = useState('');
  const [clsOpFilter, setClsOpFilter] = useState('');

  // URLコピー
  const [copiedKey, setCopiedKey] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (inputPw !== ADMIN_PASSWORD) { setPwError('パスワードが正しくありません。'); return; }
    setAuthed(true);
    setLoading(true);
    try {
      const [recRes, opRes, clsRes] = await Promise.all([
        fetch('/api/get-records'),
        fetch('/api/get-operators'),
        fetch('/api/get-classrooms'),
      ]);
      const recData = await recRes.json();
      const opData = await opRes.json();
      const clsData = await clsRes.json();
      setRecords(recData.records || []);
      setOperators(opData.operators || []);
      setClassrooms(clsData.classrooms || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [recRes, opRes, clsRes] = await Promise.all([
        fetch('/api/get-records'),
        fetch('/api/get-operators'),
        fetch('/api/get-classrooms'),
      ]);
      setRecords((await recRes.json()).records || []);
      setOperators((await opRes.json()).operators || []);
      setClassrooms((await clsRes.json()).classrooms || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const copyUrl = (key, url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    });
  };

  // ===== 受講記録フィルタ =====
  const filteredRecords = records
    .filter((r) => filterPassed === 'all' ? true : filterPassed === 'passed' ? r.passed : !r.passed)
    .filter((r) => {
      if (!searchText) return true;
      const t = searchText.toLowerCase();
      return (
        (r.fullName || '').includes(searchText) ||
        (r.companyName || '').includes(searchText) ||
        (r.classroomName || '').includes(searchText) ||
        (r.operatorCode || r.memberCode || '').toLowerCase().includes(t) ||
        (r.email || '').toLowerCase().includes(t)
      );
    })
    .sort((a, b) => {
      const av = a[sortField] ?? ''; const bv = b[sortField] ?? '';
      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const SortIcon = ({ field }) => sortField === field ? <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span> : null;

  const passedCount = records.filter((r) => r.passed).length;

  // ===== 事業者フィルタ =====
  const filteredOperators = operators
    .filter((o) => opFilter === 'all' ? true : o.status === opFilter)
    .filter((o) => {
      if (!opSearch) return true;
      const t = opSearch.toLowerCase();
      return (o.operatorCode || '').toLowerCase().includes(t) ||
        (o.companyName || '').includes(opSearch) ||
        (o.contactName || '').includes(opSearch);
    });

  // ===== 教室フィルタ =====
  const filteredClassrooms = classrooms
    .filter((c) => !clsOpFilter || c.operatorCode === clsOpFilter)
    .filter((c) => {
      if (!clsSearch) return true;
      const t = clsSearch.toLowerCase();
      return (c.classroomCode || '').toLowerCase().includes(t) ||
        (c.classroomName || '').includes(clsSearch) ||
        (c.operatorCode || '').toLowerCase().includes(t);
    });

  // ========== ログイン前 ==========
  if (!authed) {
    return (
      <Layout title="JJA管理画面">
        <div className="max-w-sm mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">JJA 協会管理画面</h1>
            <p className="text-sm text-gray-500 text-center mb-6">管理者パスワードを入力してください</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="パスワードを入力" autoFocus />
                {pwError && <p className="mt-1 text-xs text-red-600">{pwError}</p>}
              </div>
              <button type="submit" className="w-full bg-green-800 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                ログイン
              </button>
            </form>
            <p className="mt-4 text-xs text-gray-400 text-center">※ 協会事務局専用</p>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { key: 'records', label: '受講記録', count: records.length },
    { key: 'operators', label: '事業者一覧', count: operators.length },
    { key: 'classrooms', label: '教室一覧', count: classrooms.length },
  ];

  return (
    <Layout title="JJA管理画面">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">JJA 協会管理画面</h1>
            <p className="text-sm text-gray-500 mt-0.5">全事業者・全受講記録を閲覧（試作版）</p>
          </div>
          <button onClick={refresh} disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 border border-gray-300 rounded-lg transition-colors">
            {loading ? '読込中...' : '更新'}
          </button>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: '事業者数', val: operators.filter(o => o.status === 'active').length, sub: `全${operators.length}社`, color: 'green' },
            { label: '教室数', val: classrooms.filter(c => c.status === 'active').length, sub: `全${classrooms.length}室`, color: 'green' },
            { label: '合格者', val: passedCount, sub: `受講${records.length}名`, color: 'green' },
            { label: '不合格', val: records.length - passedCount, sub: `合格率${records.length ? Math.round(passedCount / records.length * 100) : 0}%`, color: 'red' },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-lg border p-3 text-center ${s.color === 'red' ? 'border-red-200' : 'border-green-200'}`}>
              <p className={`text-xs mb-1 ${s.color === 'red' ? 'text-red-500' : 'text-gray-500'}`}>{s.label}</p>
              <p className={`text-2xl font-bold ${s.color === 'red' ? 'text-red-600' : 'text-green-700'}`}>{s.val}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-6 border-b border-green-200">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-green-700 text-green-800 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-green-700 hover:bg-green-50'
              }`}>
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ===== タブ①：受講記録 ===== */}
        {activeTab === 'records' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-white rounded-lg border border-green-200 p-4 text-center"><p className="text-xs text-gray-500 mb-1">総受講数</p><p className="text-2xl font-bold">{records.length}</p></div>
              <div className="bg-white rounded-lg border border-green-300 p-4 text-center"><p className="text-xs text-green-700 mb-1">合格</p><p className="text-2xl font-bold text-green-700">{passedCount}</p></div>
              <div className="bg-white rounded-lg border border-red-200 p-4 text-center"><p className="text-xs text-red-500 mb-1">不合格</p><p className="text-2xl font-bold text-red-600">{records.length - passedCount}</p></div>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
                placeholder="事業者コード・氏名・事業者名・教室名で検索..."
                className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <div className="flex gap-1">
                {[{ val: 'all', label: 'すべて' }, { val: 'passed', label: '合格のみ' }, { val: 'failed', label: '不合格のみ' }].map((f) => (
                  <button key={f.val} onClick={() => setFilterPassed(f.val)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors ${filterPassed === f.val ? 'bg-green-800 text-white border-green-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-green-200">
                {records.length === 0 ? '受講記録がありません。' : '条件に一致する記録がありません。'}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-green-50 border-b border-green-200">
                      <tr>
                        {[
                          { field: 'submittedAt', label: '受講日時' },
                          { field: 'operatorCode', label: '事業者コード' },
                          { field: 'companyName', label: '事業者名' },
                          { field: 'classroomCode', label: '教室コード' },
                          { field: 'classroomName', label: '教室名' },
                          { field: 'fullName', label: '氏名' },
                          { field: 'email', label: 'メール' },
                          { field: 'score', label: '得点' },
                          { field: 'passed', label: '合否' },
                          { field: 'completionDate', label: '修了日' },
                        ].map((col) => (
                          <th key={col.field} onClick={() => handleSort(col.field)}
                            className="px-4 py-3 text-left text-xs font-semibold text-green-900 cursor-pointer hover:text-green-700 whitespace-nowrap select-none">
                            {col.label}<SortIcon field={col.field} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-50">
                      {filteredRecords.map((r, idx) => (
                        <tr key={idx} className="hover:bg-green-50">
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {r.submittedAt ? new Date(r.submittedAt).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.operatorCode || r.memberCode || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">{r.companyName || '—'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.classroomCode || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">{r.classroomName || '—'}</td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-900 whitespace-nowrap">{r.fullName || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{r.email || '—'}</td>
                          <td className="px-4 py-3 text-xs text-center font-semibold">{r.score != null ? `${r.score}%` : '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                              {r.passed ? '合格' : '不合格'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.completionDate || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-green-100 bg-green-50 text-xs text-gray-400 text-right">
                  {filteredRecords.length} 件表示（全 {records.length} 件）
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== タブ②：事業者一覧 ===== */}
        {activeTab === 'operators' && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="text" value={opSearch} onChange={(e) => setOpSearch(e.target.value)}
                placeholder="事業者コード・事業者名・担当者名で検索..."
                className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <div className="flex gap-1">
                {[{ val: 'all', label: 'すべて' }, { val: 'active', label: '有効' }, { val: 'inactive', label: '停止' }].map((f) => (
                  <button key={f.val} onClick={() => setOpFilter(f.val)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors ${opFilter === f.val ? 'bg-green-800 text-white border-green-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-50 border-b border-green-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">事業者コード</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">事業者名</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">担当者名</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">担当者メール</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">教室数</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">受講者数</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">合格者数</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">登録日</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">ステータス</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">事業者管理URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {filteredOperators.map((op, idx) => {
                      const loginUrl = `${getBaseUrl()}/operator/login`;
                      return (
                        <tr key={idx} className={`transition-colors ${op.status === 'inactive' ? 'opacity-50 bg-gray-50' : 'hover:bg-green-50'}`}>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-gray-800">{op.operatorCode}</td>
                          <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">{op.companyName}</td>
                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{op.contactName || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{op.contactEmail || '—'}</td>
                          <td className="px-4 py-3 text-center text-xs text-gray-700">{op.classroomCount ?? 0}</td>
                          <td className="px-4 py-3 text-center text-xs text-gray-700">{op.traineeCount ?? 0}</td>
                          <td className="px-4 py-3 text-center text-xs font-semibold text-green-700">{op.passedCount ?? 0}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{op.registeredAt || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${op.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                              {op.status === 'active' ? '有効' : '停止'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {op.status === 'active' && (
                              <button onClick={() => copyUrl(`op-${op.operatorCode}`, loginUrl)}
                                className={`text-xs px-2 py-1 rounded border transition-colors ${copiedKey === `op-${op.operatorCode}` ? 'bg-green-700 text-white border-green-700' : 'bg-white text-green-700 border-green-400 hover:bg-green-50'}`}>
                                {copiedKey === `op-${op.operatorCode}` ? '✓ コピー済' : 'URLコピー'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-green-100 bg-green-50 text-xs text-gray-400 text-right">
                {filteredOperators.length} 件表示（全 {operators.length} 社）
              </div>
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 space-y-2">
              <p className="font-semibold">⚠️ 事業者追加・編集について</p>
              <p>現在は <code className="bg-amber-100 px-1 rounded">data/operators.json</code> を直接編集してください。停止は <code className="bg-amber-100 px-1 rounded">"status": "inactive"</code> に変更します。</p>
              <p className="font-semibold mt-2">🏢 新規事業者追加時の手順</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700">
                <li><code className="bg-amber-100 px-1 rounded">operators.json</code> に事業者を1行追加（operatorCode・adminPassword等）</li>
                <li><code className="bg-amber-100 px-1 rounded">classrooms.json</code> に本部エントリを追加：<br />
                  <code className="bg-amber-100 px-1 rounded text-xs block mt-1 p-1">{"{"}"classroomCode": "A006-HQ", "operatorCode": "A006", "classroomName": "本部", "isHQ": true, "status": "active", "createdAt": "YYYY-MM-DD"{"}"}</code>
                </li>
                <li>事業者に <code className="bg-amber-100 px-1 rounded">/operator/login</code> のURLとログイン情報を送付</li>
              </ol>
            </div>
          </>
        )}

        {/* ===== タブ③：教室一覧 ===== */}
        {activeTab === 'classrooms' && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="text" value={clsSearch} onChange={(e) => setClsSearch(e.target.value)}
                placeholder="教室コード・教室名で検索..."
                className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <select value={clsOpFilter} onChange={(e) => setClsOpFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">全事業者</option>
                {operators.filter(o => o.status === 'active').map((o) => (
                  <option key={o.operatorCode} value={o.operatorCode}>{o.operatorCode}：{o.companyName}</option>
                ))}
              </select>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-50 border-b border-green-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">教室コード</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">教室名</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">事業者コード</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">事業者名</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">受講者数</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">合格者数</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-900">登録日</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">ステータス</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-900">専用URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {filteredClassrooms.map((cls, idx) => {
                      const op = operators.find(o => o.operatorCode === cls.operatorCode);
                      const url = `${getBaseUrl()}/register?biz=${cls.operatorCode}&cls=${cls.classroomCode}`;
                      return (
                        <tr key={idx} className={`transition-colors ${cls.status === 'inactive' ? 'opacity-50 bg-gray-50' : 'hover:bg-green-50'}`}>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-gray-800">{cls.classroomCode}</td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-900">{cls.classroomName}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{cls.operatorCode}</td>
                          <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">{op?.companyName || '—'}</td>
                          <td className="px-4 py-3 text-center text-xs text-gray-600">{cls.totalTrainees ?? 0}</td>
                          <td className="px-4 py-3 text-center text-xs font-semibold text-green-700">{cls.passedTrainees ?? 0}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{cls.createdAt || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                              {cls.status === 'active' ? '有効' : '停止'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {cls.status === 'active' && (
                              <button onClick={() => copyUrl(`cls-${cls.classroomCode}`, url)}
                                className={`text-xs px-2 py-1 rounded border transition-colors ${copiedKey === `cls-${cls.classroomCode}` ? 'bg-green-700 text-white border-green-700' : 'bg-white text-green-700 border-green-400 hover:bg-green-50'}`}>
                                {copiedKey === `cls-${cls.classroomCode}` ? '✓ コピー済' : 'URLコピー'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-green-100 bg-green-50 text-xs text-gray-400 text-right">
                {filteredClassrooms.length} 件表示（全 {classrooms.length} 室）
              </div>
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-gray-400 text-center">
          ※ 試作版です。本番では適切な認証・権限管理を実装してください。
        </p>
      </div>
    </Layout>
  );
}
