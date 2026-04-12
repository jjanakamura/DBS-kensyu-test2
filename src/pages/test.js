import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

/**
 * 確認テスト画面
 * - 全問出題（A案：問題バンクからのランダム抽出なし）
 * - 設問順シャッフル
 * - 選択肢順シャッフル
 * - 自動採点
 * - 80%以上で合格
 */

/**
 * Fisher-Yates シャッフル
 * @param {Array} arr
 * @returns {Array} 新しいシャッフル済み配列
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 問題と選択肢をシャッフルして準備
 * - 選択肢をシャッフルしつつ、正解の選択肢テキストで正答インデックスを再計算
 */
function prepareQuestions(questions) {
  // 設問順シャッフル
  return shuffle(questions).map((q) => {
    const correctText = q.options[q.correctIndex];
    const shuffledOptions = shuffle(q.options);
    const shuffledCorrectIndex = shuffledOptions.indexOf(correctText);
    return {
      ...q,
      shuffledOptions,
      shuffledCorrectIndex,
    };
  });
}

export default function TestPage({ questions }) {
  const router = useRouter();
  const [trainee, setTrainee] = useState(null);
  const [prepared, setPrepared] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 受講者情報チェック
    const stored = sessionStorage.getItem('trainee');
    if (!stored) {
      router.replace('/register');
      return;
    }
    setTrainee(JSON.parse(stored));

    // 問題をシャッフルして準備（クライアントサイドで毎回ランダム化）
    setPrepared(prepareQuestions(questions));
  }, []);

  // ========== 採点・送信 ==========
  const handleSubmit = async () => {
    // 未回答チェック
    const unanswered = prepared.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert(`まだ回答していない問題が ${unanswered.length} 問あります。全問回答してから送信してください。`);
      return;
    }

    setSubmitting(true);

    // 採点
    const totalQuestions = prepared.length;
    let correctCount = 0;
    const answerDetails = prepared.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.shuffledCorrectIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        questionText: q.text,
        selectedText: q.shuffledOptions[selected],
        correctText: q.shuffledOptions[q.shuffledCorrectIndex],
        isCorrect,
      };
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 80;

    // 修了日・修了番号（合格時のみ意味を持つ）
    const today = new Date();
    const completionDate = today.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const certNumber = `JTA-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const traineeData = JSON.parse(sessionStorage.getItem('trainee'));

    // 受講記録を API に送信
    try {
      await fetch('/api/submit-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...traineeData,
          score,
          correctCount,
          totalQuestions,
          passed,
          completionDate: passed ? completionDate : null,
          certNumber: passed ? certNumber : null,
          answers: answerDetails,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      // API エラーでも採点結果画面へは遷移させる（記録は失敗）
      console.error('記録の保存に失敗しました:', e);
    }

    // 結果を sessionStorage に保存して結果画面へ
    sessionStorage.setItem(
      'result',
      JSON.stringify({
        score,
        correctCount,
        totalQuestions,
        passed,
        completionDate: passed ? completionDate : null,
        certNumber: passed ? certNumber : null,
        answerDetails,
      })
    );

    router.push('/result');
  };

  if (!trainee || prepared.length === 0) return null;

  const answeredCount = Object.keys(answers).length;
  const totalCount = prepared.length;

  return (
    <Layout title="確認テスト">
      <div className="max-w-2xl mx-auto">
        {/* ステッパー */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-5">
          <span className="text-green-600 font-medium">① 基本情報 ✓</span>
          <span className="mx-1">›</span>
          <span className="text-green-600 font-medium">② 動画視聴 ✓</span>
          <span className="mx-1">›</span>
          <span className="font-bold text-blue-900">③ 確認テスト</span>
          <span className="mx-1">›</span>
          <span>④ 修了証</span>
        </div>

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">確認テスト</h1>
          <span className="text-sm text-gray-500">
            回答済み：{answeredCount} / {totalCount} 問
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          全問を回答してから「採点する」ボタンを押してください。合格基準は <strong>80%以上</strong> です。
        </p>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-xs text-blue-800">
          ※ 問題・選択肢の順番は毎回ランダムに変わります。落ち着いて読んで回答してください。
        </div>

        {/* ========== 問題一覧 ========== */}
        <div className="space-y-6 mb-8">
          {prepared.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              {/* 問題番号・テキスト */}
              <div className="flex gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-950 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.text}</p>
              </div>

              {/* 動画確認マーク */}
              {q.requiresVideo && (
                <div className="mb-3 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1 w-fit">
                  ▶ 動画の内容を思い出しながら回答してください
                </div>
              )}

              {/* 選択肢 */}
              <div className="space-y-2">
                {q.shuffledOptions.map((option, optIdx) => {
                  const isSelected = answers[q.id] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={optIdx}
                        checked={isSelected}
                        onChange={() => setAnswers({ ...answers, [q.id]: optIdx })}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-800 leading-relaxed">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 進捗バー */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>回答進捗</span>
            <span>{answeredCount} / {totalCount} 問</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-900 h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* 採点ボタン */}
        <button
          onClick={handleSubmit}
          disabled={submitting || answeredCount < totalCount}
          className="w-full bg-blue-950 hover:bg-blue-900 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {submitting
            ? '採点中...'
            : answeredCount < totalCount
            ? `残り ${totalCount - answeredCount} 問を回答してください`
            : '採点する →'}
        </button>
      </div>
    </Layout>
  );
}

// 問題データをサーバーサイドで読み込み（ビルド時ではなくリクエスト時に取得）
export async function getServerSideProps() {
  const path = require('path');
  const fs = require('fs');

  const filePath = path.join(process.cwd(), 'data', 'questions.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const questions = JSON.parse(raw);

  return {
    props: { questions },
  };
}
