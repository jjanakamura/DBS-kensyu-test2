import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

/**
 * 研修動画画面
 * - sessionStorage から受講者情報を読み込む
 * - 研修動画（YouTube埋め込みまたはプレースホルダ）を表示
 * - 「次へ進む」ボタンで確認テストへ遷移
 *
 * ※ 本番運用時は、実際の研修動画 URL を NEXT_PUBLIC_VIDEO_URL 環境変数で設定してください
 * ※ 将来的に動画視聴完了の検知（onEnded イベント等）を追加して「次へ」ボタンを制御できます
 */
export default function VideoPage() {
  const router = useRouter();
  const [trainee, setTrainee] = useState(null);
  const [canProceed, setCanProceed] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  // ダミー: 5秒後に「次へ」ボタンを有効化（本番では動画の onEnded に差し替え）
  const UNLOCK_SECONDS = 5;

  useEffect(() => {
    // 受講者情報を sessionStorage から取得
    const stored = sessionStorage.getItem('trainee');
    if (!stored) {
      router.replace('/register');
      return;
    }
    setTrainee(JSON.parse(stored));

    // タイマー（試作用：本番では動画完了で制御）
    const timer = setInterval(() => {
      setWatchedSeconds((prev) => {
        const next = prev + 1;
        if (next >= UNLOCK_SECONDS) {
          setCanProceed(true);
          clearInterval(timer);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!trainee) return null;

  return (
    <Layout title="研修動画">
      <div className="max-w-2xl mx-auto">
        {/* ステッパー */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-5">
          <span className="text-green-600 font-medium">① 基本情報入力 ✓</span>
          <span className="mx-1">›</span>
          <span className="font-bold text-blue-900">② 研修動画</span>
          <span className="mx-1">›</span>
          <span>③ 確認テスト</span>
          <span className="mx-1">›</span>
          <span>④ 修了証</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">研修動画の視聴</h1>
        <p className="text-sm text-gray-500 mb-5">
          以下の研修動画をご視聴ください。視聴後に確認テストへ進みます。
        </p>

        {/* 受講者確認バナー */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-5 text-sm">
          <span className="text-gray-500">受講者：</span>
          <span className="font-medium text-gray-800">
            {trainee.companyName} ／ {trainee.classroomName} ／ {trainee.fullName} 様
          </span>
        </div>

        {/* ========== 動画エリア ========== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* YouTube 埋め込みプレースホルダ */}
          {/* 本番運用時は src を実際の YouTube URL に差し替えてください */}
          {/* 例: src="https://www.youtube.com/embed/実際の動画ID?rel=0" */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white">
              {/* 試作用プレースホルダ */}
              <div className="text-5xl mb-4">▶</div>
              <p className="text-lg font-semibold mb-2">研修動画（試作プレースホルダ）</p>
              <p className="text-sm text-gray-300 text-center px-8 leading-relaxed">
                本番運用時はここに実際の YouTube 動画が表示されます。<br />
                動画 URL は環境変数 <code className="bg-gray-700 px-1 rounded text-xs">NEXT_PUBLIC_VIDEO_URL</code> で設定してください。
              </p>
              <div className="mt-6 px-6 py-2 bg-blue-700 rounded text-sm">
                ※ 試作版：{UNLOCK_SECONDS}秒後に「次へ進む」が有効になります
              </div>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-1">
              こども性暴力防止法（日本版DBS）対応研修
            </h2>
            <p className="text-xs text-gray-500">
              研修時間：約20分 ／ 公益社団法人全国学習塾協会 制作
            </p>
          </div>
        </div>

        {/* 視聴中インジケーター */}
        {!canProceed && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
            動画視聴中... あと {UNLOCK_SECONDS - watchedSeconds} 秒お待ちください
          </div>
        )}

        {/* 視聴後の注意 */}
        {canProceed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 text-sm text-green-800">
            ✓ 動画の確認が完了しました。確認テストへ進んでください。
          </div>
        )}

        {/* 動画内容サマリー（補助） */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">研修内容サマリー</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-900 font-bold flex-shrink-0">●</span>
              日本版DBS（こども性暴力防止法）の目的と概要
            </li>
            <li className="flex gap-2">
              <span className="text-blue-900 font-bold flex-shrink-0">●</span>
              確認申請の対象者（雇用形態を問わない全従事者）
            </li>
            <li className="flex gap-2">
              <span className="text-blue-900 font-bold flex-shrink-0">●</span>
              申請のタイミングと手続きの流れ
            </li>
            <li className="flex gap-2">
              <span className="text-blue-900 font-bold flex-shrink-0">●</span>
              義務不履行の場合の行政措置（改善命令・公表）
            </li>
            <li className="flex gap-2">
              <span className="text-blue-900 font-bold flex-shrink-0">●</span>
              学習塾現場での実務対応ポイント
            </li>
          </ul>
        </div>

        {/* 次へ進むボタン */}
        <button
          onClick={() => router.push('/test')}
          disabled={!canProceed}
          className="w-full bg-blue-950 hover:bg-blue-900 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {canProceed ? '確認テストへ進む →' : `動画確認中（${UNLOCK_SECONDS - watchedSeconds}秒）`}
        </button>
      </div>
    </Layout>
  );
}
