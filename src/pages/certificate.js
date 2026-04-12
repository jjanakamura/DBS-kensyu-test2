import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

/**
 * 修了証画面
 * - 合格者のみアクセス可（sessionStorage チェック）
 * - 修了証を画面表示
 * - 印刷（PDF保存）ボタン
 *
 * 修了証記載内容：
 * - 氏名 / 事業者名 / 教室名 / 研修名 / 修了日 / 修了番号
 * - 発行者：公益社団法人全国学習塾協会
 */
export default function CertificatePage() {
  const router = useRouter();
  const [trainee, setTrainee] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const storedTrainee = sessionStorage.getItem('trainee');
    const storedResult = sessionStorage.getItem('result');

    if (!storedTrainee || !storedResult) {
      router.replace('/register');
      return;
    }

    const parsedResult = JSON.parse(storedResult);
    if (!parsedResult.passed) {
      router.replace('/result');
      return;
    }

    setTrainee(JSON.parse(storedTrainee));
    setResult(parsedResult);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!trainee || !result) return null;

  const { completionDate, certNumber } = result;

  return (
    <Layout title="修了証">
      {/* 印刷時はボタン等を非表示にするため、no-print クラスを活用 */}
      <div className="max-w-2xl mx-auto">
        {/* ステッパー（印刷時非表示） */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-5 no-print">
          <span className="text-green-600 font-medium">① 基本情報 ✓</span>
          <span className="mx-1">›</span>
          <span className="text-green-600 font-medium">② 動画視聴 ✓</span>
          <span className="mx-1">›</span>
          <span className="text-green-600 font-medium">③ 確認テスト ✓</span>
          <span className="mx-1">›</span>
          <span className="font-bold text-blue-900">④ 修了証 ✓</span>
        </div>

        {/* 案内テキスト（印刷時非表示） */}
        <div className="no-print mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">修了証</h1>
          <p className="text-sm text-gray-500">
            以下の修了証を印刷またはPDFとして保存してください。
          </p>
        </div>

        {/* ========== 修了証本体（印刷対象） ========== */}
        <div
          id="certificate-print"
          className="bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden mb-6"
          style={{ fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif' }}
        >
          {/* 上部装飾ライン */}
          <div className="h-3 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900" />

          <div className="px-12 py-10">
            {/* タイトル */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-widest mb-1">修 了 証</h2>
              <p className="text-sm text-gray-500 tracking-widest">CERTIFICATE OF COMPLETION</p>
            </div>

            {/* 氏名 */}
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700 mb-1">{trainee.companyName}</p>
              <p className="text-sm text-gray-500 mb-2">{trainee.classroomName}</p>
              <div className="inline-block border-b-2 border-gray-900 pb-1 px-8">
                <p className="text-3xl font-bold text-gray-900 tracking-wide">{trainee.fullName}</p>
              </div>
              <p className="text-gray-700 mt-1">殿</p>
            </div>

            {/* 本文 */}
            <div className="text-center mb-8 px-4">
              <p className="text-sm text-gray-600 mb-3">研修名</p>
              <p className="text-base font-bold text-gray-900 mb-6 leading-relaxed">
                こども性暴力防止法（日本版DBS）対応研修
              </p>
              <p className="text-sm text-gray-700 leading-loose">
                上記の者は、こども性暴力防止法（日本版DBS）に関する研修を受講し、<br />
                所定の確認テストに合格したことを証します。
              </p>
            </div>

            {/* 修了日・修了番号 */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">修了番号</p>
                <p className="text-sm font-mono text-gray-700">{certNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">修了日</p>
                <p className="text-sm font-bold text-gray-800">{completionDate}</p>
              </div>
            </div>

            {/* 発行者 */}
            <div className="text-center border-t border-gray-200 pt-6">
              <p className="text-base font-bold text-gray-900 tracking-wide">
                公益社団法人全国学習塾協会
              </p>
              <p className="text-xs text-gray-400 mt-1">Japan Tutoring Association</p>
              {/* 印鑑スペース（本番ではロゴ画像に差し替え） */}
              <div className="inline-block mt-3 w-16 h-16 rounded-full border-2 border-red-700 flex items-center justify-center">
                <span className="text-red-700 text-xs font-bold leading-tight text-center">全塾協<br/>之印</span>
              </div>
            </div>
          </div>

          {/* 下部装飾ライン */}
          <div className="h-3 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900" />
        </div>

        {/* ========== ボタン群（印刷時非表示） ========== */}
        <div className="no-print space-y-3">
          <button
            onClick={handlePrint}
            className="w-full bg-blue-950 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🖨</span>
            <span>修了証を印刷・PDFで保存する</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.clear();
              router.push('/');
            }}
            className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            トップへ戻る
          </button>
        </div>

        {/* 印刷ガイド */}
        <div className="no-print mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
          <p className="font-semibold mb-1 text-gray-700">PDFとして保存する場合</p>
          <p>「印刷・PDFで保存する」ボタンを押し、印刷ダイアログで送信先を「PDFに保存」または「Microsoft Print to PDF」に設定してください。</p>
        </div>
      </div>
    </Layout>
  );
}
