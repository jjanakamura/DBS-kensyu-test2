import path from 'path';
import fs from 'fs';

/**
 * 受講記録保存 API
 * POST /api/submit-record
 *
 * リクエスト: 受講者情報 + 採点結果オブジェクト
 * レスポンス: { success: boolean, id: string }
 *
 * data/records.json にファイルベースで追記保存する
 * ⚠ 本番では DB（PostgreSQL 等）への保存に差し替えること
 * ⚠ 高頻度・同時アクセスには対応していない（試作版）
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const record = req.body;

  // 必須フィールドの簡易チェック
  if (!record || !record.memberCode || !record.fullName) {
    return res.status(400).json({ error: '必須フィールドが不足しています。' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'records.json');

    // 既存の記録を読み込む（ファイルが存在しない場合は空配列）
    let records = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      records = JSON.parse(raw || '[]');
    }

    // レコードに自動採番 ID を付与
    const newRecord = {
      id: `REC-${Date.now()}-${String(records.length + 1).padStart(4, '0')}`,
      ...record,
    };

    records.push(newRecord);

    // ファイルに書き戻す
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');

    return res.status(200).json({ success: true, id: newRecord.id });
  } catch (err) {
    console.error('records.json の書き込みエラー:', err);
    return res.status(500).json({ error: '記録の保存に失敗しました。' });
  }
}
