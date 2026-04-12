import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

/**
 * 合否結果画面
 * - sessionStorage から採点結果を読み込み表示
 * - 合格時：修了証画面へのボタン
 * - 不合格時：再受講案内
 */
export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [trainee, setTrainee] = useState(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('result');
    const storedTrainee = sessionStorage.getItem('trainee');
    if (!storedResult || !storedTrainee) {
      router.replace('/register');
      return;
    }
    setResult(JSON.parse(storedResult));
    setTrainee(JSON.parse(storedTrainee));
  }, []);

  if (!result || !trainee) return null;

  const { score, correctCount, totalQuestions, passed, answerDetails } = result;

  return (
    <Layout title={passed ? '合格' : '不合格'}>
      <div className="max-w-2xl mx-auto">
        {/* ステッパー */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-5">
          <span className="text-green-600 font-medium">① 基本情報 ✓</span>
          <span className="mx-1">›</span>
          <span className="text-green-600 font-medium">② 動画視聴 ✓</span>
          <span className="mx-1">›</span>
          <span className="text-green-600 font-medium">③ 確認テスト ✓</span>
          <span className="mx-1">›</span>
          <span className={passed ? 'font-bold text-blue-900' : 'text-gray-400'}>④ 修了証</span>
        </div>

        {/* ========== 合否バナー ========== */}
        {passed ? (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 mb-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h1 className="text-2xl font-bold text-green-800 mb-1">合格</h1>
            <p className="text-green-700 text-sm">
              おめでとうございます！確認テストに合格しました。
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6 text-center">
            <div className="text-4xl mb-2">📋</div>
            <h1 className="text-2xl font-bold text-red-800 mb-1">不合格</h1>
            <p className="text-red-700 text-sm">
              合格基準（80%以上）に届きませんでした。研修動画を再度確認の上、再受講してください。
            </p>
          </div>
        )}

        {/* ========== スコアカード ========== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">採点結果</h2>

          {/* スコア表示 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">正答数</p>
              <p className="text-2xl font-bold text-gray-900">
                {correctCount} <span className="text-base font-normal text-gray-400">/ {totalQuestions}</span>
              </p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">得点率</p>
              <p className={`text-2xl font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
                {score}<span className="text-base font-normal">%</span>
              </p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 mb-1">合格基準</p>
              <p className="text-2xl font-bold text-gray-400">80%</p>
            </div>
          </div>

          {/* 点数バー */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-400'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span className="text-gray-600 font-medium">合格ライン 80%</span>
            <span>100%</span>
          </div>
        </div>

        {/* ========== 解答レビュー ========== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">解答の確認</h2>
          <div className="space-y-4">
            {answerDetails.map((detail, idx) => (
              <div
                key={detail.questionId}
                className={`rounded-lg border p-4 ${
                  detail.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className={`text-sm font-bold flex-shrink-0 ${detail.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {detail.isCorrect ? '○' : '✗'}
                  </span>
                  <p className="text-xs font-medium text-gray-700 leading-relaxed">
                    問 {idx + 1}：{detail.questionText}
                  </p>
                </div>
                {!detail.isCorrect && (
                  <div className="mt-2 ml-5 space-y-1">
                    <p className="text-xs text-red-700">
                      あなたの回答：<span className="line-through">{detail.selectedText}</span>
                    </p>
                    <p className="text-xs text-green-700 font-medium">
                      正解：{detail.correctText}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========== アクションボタン ========== */}
        {passed ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push('/certificate')}
              className="w-full bg-blue-950 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              修了証を確認する →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-4">
              <p className="font-semibold mb-1">再受講について</p>
              <p>研修動画を再度ご視聴いただき、内容を十分に理解した上で再度テストをお受けください。</p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('result');
                router.push('/video');
              }}
              className="w-full bg-blue-950 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              動画に戻って再受講する
            </button>
            <button
              onClick={() => {
                sessionStorage.clear();
                router.push('/');
              }}
              className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              最初から受講し直す
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
