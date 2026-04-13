import path from 'path';
import fs from 'fs';

/**
 * 単一受講記録取得 API（修了証再発行用）
 * GET /api/get-record?id=REC-xxxxx
 *
 * 合格レコードのみ返す（passed=true のもの）
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id は必須です。' });

  try {
    const filePath = path.join(process.cwd(), 'data', 'records.json');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: '記録が見つかりません。' });

    const records = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
    const record = records.find((r) => r.id === id);

    if (!record) return res.status(404).json({ error: '記録が見つかりません。' });
    if (!record.passed) return res.status(403).json({ error: '合格記録ではありません。' });

    // answers は除外
    const { answers, ...safe } = record;
    return res.status(200).json({ record: safe });
  } catch (err) {
    console.error('get-record エラー:', err);
    return res.status(500).json({ error: '内部エラーが発生しました。' });
  }
}
