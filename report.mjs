export const reportFields=[
 ['prediction','予想','操作を一つ変えると、白い析出物の見え方はどう変わると予想しますか。'],
 ['predictionReason','予想の根拠','どんな知識・経験から、その予想を立てましたか。'],
 ['conditions','実験条件と変更点','試料、量、混合の強さ、注ぐ速さを記録。比較では何だけを変え、何をそろえましたか。'],
 ['observations','観察した事実','液の色・境界・白い物質の位置と形を記録。説明や推測と分けて書きましょう。'],
 ['comparison','比較の結果','標準条件と変更条件／試料なしでは、何が同じで何が違いましたか。実際に比較できなかった場合も明記。'],
 ['grindingReason','すりつぶす理由','組織や細胞と、抽出液の働きに関連付けて説明しましょう。'],
 ['detergentReason','洗剤の役割','細胞のどの構造に、どのように働くと考えられますか。'],
 ['saltReason','食塩の役割','DNAが集まりやすくなることと関連付けて説明しましょう。'],
 ['ethanolReason','エタノールの役割','DNAの溶けやすさと、観察された変化を関連付けましょう。'],
 ['identity','白い物質の由来と判断の限界','ブロッコリー由来と考える根拠は何ですか。純粋なDNAと断定できますか。対照実験や追加検証も考えましょう。'],
 ['reflection','考察・結論','予想と結果は一致しましたか。観察した事実を根拠に説明してください。'],
 ['revision','振り返り・次の検証','考えが変わった点、改善する操作、次に確かめたい条件とその理由を具体的に書きましょう。']
];
export function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function reportHTML(answers,records,current){const esc=escapeHTML;return `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DNA抽出 実験レポート</title><style>body{max-width:850px;margin:30px auto;padding:0 24px;font:14px/1.8 sans-serif;color:#223e32}h1{font-size:25px}h2{font-size:17px;margin-top:25px;border-bottom:1px solid #bacabd}p,pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}section{break-inside:avoid}small{color:#65786b}button{padding:10px 20px}@media print{button{display:none}body{margin:0;font-size:11pt}h2{break-after:avoid}}</style><button onclick="window.print()">印刷・PDFに保存</button><h1>DNA抽出 実験レポート</h1><small>教育用モデルの観察記録。実際の実験収量を再現したデータではありません。氏名等はアプリでは取得しません。提出者はClassroomの提出情報で確認してください。</small>${reportFields.map(([id,label])=>`<section><h2>${esc(label)}</h2><p>${esc(answers[id]||'（未入力）')}</p></section>`).join('')}<h2>書き出し時の実験台</h2><pre>${esc(current)}</pre><h2>保存した実験記録・操作履歴</h2>${records.map(r=>`<section><h3>${esc(r.title)}</h3><pre>${esc(r.summary)}</pre><details open><summary>操作履歴</summary><pre>${esc((r.events||[]).join('\n'))}</pre></details></section>`).join('')||'<p>（記録なし）</p>'}<p><small>操作完了数や入力文字数で自動採点する機能はありません。教員が記述内容と根拠を確認して評価します。</small></p></html>`;}
