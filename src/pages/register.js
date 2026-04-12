import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

/**
 * 基本情報入力画面
 * - 会員コード入力 → API照合 → 事業者名を自動表示
 * - 教室名 / 氏名 / メールアドレス を入力
 * - バリデーション後、sessionStorage に保存して動画画面へ遷移
 */
export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    memberCode: '',
    classroomName: '',
    fullName: '',
    email: '',
  });
  const [companyName, setCompanyName] = useState('');
  // codeStatus: 'idle' | 'checking' | 'ok' | 'error'
  const [codeStatus, setCodeStatus] = useState('idle');
  const [errors, setErrors] = useState({});

  // ========== 会員コード照合（入力欄フォーカスアウト時） ==========
  const handleCodeLookup = async () => {
    const code = form.memberCode.trim();
    if (!code) return;

    setCodeStatus('checking');
    setCompanyName('');

    try {
      const res = await fetch('/api/lookup-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.found) {
        setCompanyName(data.name);
        setCodeStatus('ok');
        setErrors((prev) => ({ ...prev, memberCode: null }));
      } else {
        setCodeStatus('error');
        setErrors((prev) => ({
          ...prev,
          memberCode: '会員コードが見つかりません。正確に入力されているかご確認ください。',
        }));
      }
    } catch {
      setCodeStatus('error');
      setErrors((prev) => ({
        ...prev,
        memberCode: 'コードの照合中にエラーが発生しました。しばらくしてから再度お試しください。',
      }));
    }
  };

  // ========== バリデーション ==========
  const validate = () => {
    const errs = {};
    if (!form.memberCode.trim()) {
      errs.memberCode = '会員コードを入力してください。';
    } else if (codeStatus !== 'ok') {
      errs.memberCode = '有効な会員コードを入力・照合してください。';
    }
    if (!form.classroomName.trim()) {
      errs.classroomName = '教室名を入力してください。';
    }
    if (!form.fullName.trim()) {
      errs.fullName = '氏名を入力してください。';
    }
    if (!form.email.trim()) {
      errs.email = 'メールアドレスを入力してください。';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'メールアドレスの形式が正しくありません。';
    }
    return errs;
  };

  // ========== 送信処理 ==========
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // sessionStorage に受講者情報を保存（以降の画面で参照）
    const trainee = {
      memberCode: form.memberCode.trim(),
      companyName,
      classroomName: form.classroomName.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
    };
    sessionStorage.setItem('trainee', JSON.stringify(trainee));
    router.push('/video');
  };

  // ========== 入力欄共通クラス ==========
  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return (
    <Layout title="基本情報入力">
      <div className="max-w-xl mx-auto">
        {/* ステッパー */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-5">
          <span className="font-bold text-blue-900">① 基本情報入力</span>
          <span className="mx-1">›</span>
          <span>② 研修動画</span>
          <span className="mx-1">›</span>
          <span>③ 確認テスト</span>
          <span className="mx-1">›</span>
          <span>④ 修了証</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">基本情報の入力</h1>
        <p className="text-sm text-gray-500 mb-6">
          以下の項目をすべて正確に入力してください。<span className="text-red-500">*</span> は必須です。
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
          noValidate
        >
          {/* ===== 会員コード ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会員コード <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.memberCode}
                onChange={(e) => {
                  setForm({ ...form, memberCode: e.target.value });
                  setCodeStatus('idle');
                  setCompanyName('');
                }}
                onBlur={handleCodeLookup}
                placeholder="例：A001"
                maxLength={20}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.memberCode
                    ? 'border-red-400 bg-red-50'
                    : codeStatus === 'ok'
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              />
              <button
                type="button"
                onClick={handleCodeLookup}
                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors whitespace-nowrap"
              >
                照合
              </button>
            </div>
            {/* 照合ステータス表示 */}
            {codeStatus === 'checking' && (
              <p className="mt-1 text-xs text-gray-500">照合中...</p>
            )}
            {codeStatus === 'ok' && (
              <p className="mt-1 text-xs text-green-600 font-medium">✓ 会員コードを確認しました</p>
            )}
            {errors.memberCode && (
              <p className="mt-1 text-xs text-red-600">{errors.memberCode}</p>
            )}
          </div>

          {/* ===== 事業者名（自動取得・読み取り専用） ===== */}
          {companyName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold mb-0.5">事業者名（会員コードから自動取得）</p>
              <p className="text-sm font-bold text-blue-900">{companyName}</p>
              <p className="text-xs text-blue-500 mt-1">※ 事業者名は入力不要です。自動で記録されます。</p>
            </div>
          )}

          {/* ===== 教室名 ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              教室名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.classroomName}
              onChange={(e) => setForm({ ...form, classroomName: e.target.value })}
              placeholder="例：渋谷校"
              className={inputClass('classroomName')}
            />
            {errors.classroomName && (
              <p className="mt-1 text-xs text-red-600">{errors.classroomName}</p>
            )}
          </div>

          {/* ===== 氏名 ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="例：山田 太郎"
              className={inputClass('fullName')}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* ===== メールアドレス ===== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="例：yamada@example.com"
              className={inputClass('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* ===== 送信ボタン ===== */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-950 hover:bg-blue-900 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              次へ進む（研修動画へ）→
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
