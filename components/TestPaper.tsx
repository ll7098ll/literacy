
import React, { useMemo } from 'react';
import { TestSet } from '../types';
import { Download, FileText, CheckCircle2, BarChart, Image as ImageIcon, Target, PieChart, Activity, AlertTriangle } from 'lucide-react';

interface TestPaperProps {
  testSet: TestSet | null;
}

const TestPaper: React.FC<TestPaperProps> = ({ testSet }) => {
  if (!testSet) return null;

  // --- Statistics Calculation ---
  const typeStats = useMemo(() => {
    const stats: Record<string, { sum: number; count: number }> = {};
    
    testSet.passages.forEach(p => {
      p.questions.forEach(q => {
        // Clean type name (e.g., "추론 (숨은 의도)" -> "추론")
        const typeName = q.type.split('(')[0].trim();
        
        // Parse rate (e.g., "35%" -> 35)
        const rateMatch = q.predictedRate?.match(/(\d+)/);
        const rate = rateMatch ? parseInt(rateMatch[1], 10) : 0;
        
        if (rate > 0) {
          if (!stats[typeName]) stats[typeName] = { sum: 0, count: 0 };
          stats[typeName].sum += rate;
          stats[typeName].count += 1;
        }
      });
    });

    return Object.entries(stats)
      .map(([type, { sum, count }]) => ({
        type,
        avgRate: Math.round(sum / count),
        count
      }))
      .sort((a, b) => a.avgRate - b.avgRate); // Sort by difficulty (hardest first)
  }, [testSet]);

  const overallDifficulty = useMemo(() => {
    if (typeStats.length === 0) return 0;
    const totalSum = typeStats.reduce((acc, curr) => acc + (curr.avgRate * curr.count), 0);
    const totalCount = typeStats.reduce((acc, curr) => acc + curr.count, 0);
    return Math.round(totalSum / totalCount);
  }, [typeStats]);

  // --- Helper Functions ---
  const parseContent = (text: string) => {
    return text.replace(/\*\*/g, '');
  };

  const parseQuestionText = (text: string) => {
    const splitRegex = /\n\s*(?:<보 기>|<보기>)\s*(?:\n|$)/;
    const match = text.match(splitRegex);

    if (match && match.index !== undefined) {
      const stem = text.substring(0, match.index).trim();
      const boxContent = text.substring(match.index + match[0].length).trim();
      return { hasBox: true, stem, boxContent };
    }
    return { hasBox: false, stem: text, boxContent: "" };
  };

  const handleDownload = () => {
    if (!testSet) return;

    // Word Export Template mimicking CSAT style
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${testSet.title}</title>
        <style>
          @page { size: A4; margin: 1.5cm 2cm; mso-page-orientation: portrait; }
          body { font-family: 'Batang', 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.6; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
          .header-table td { vertical-align: middle; }
          .exam-year { font-size: 14pt; text-align: left; width: 60%; font-weight: bold; }
          .exam-subject { font-size: 20pt; text-align: center; font-weight: bold; border: 2px solid #000; border-radius: 20px; padding: 5px 20px; display: inline-block; }
          .type-box { border: 1px solid #000; padding: 5px 15px; font-size: 12pt; font-weight: bold; text-align: center; display: inline-block; }
          .passage-text { text-align: justify; line-height: 1.8; margin-bottom: 20px; font-size: 10.5pt; }
          .question-num { font-weight: bold; font-size: 11pt; color: #000; margin-right: 5px; }
          .question-text { font-weight: bold; font-size: 11pt; }
          .options { margin-top: 5px; margin-left: 15px; font-size: 10.5pt; }
          .option-item { margin-bottom: 3px; }
          .circle-num { display: inline-block; border: 1px solid #000; border-radius: 50%; width: 16px; height: 16px; text-align: center; line-height: 14px; font-size: 9pt; margin-right: 5px; }
          .bogi-box { border: 1px solid #000; padding: 10px; margin: 10px 15px; font-size: 9.5pt; text-align: justify; line-height: 1.4; }
          .bogi-title { text-align: center; font-weight: bold; margin-bottom: 5px; font-size: 10pt; letter-spacing: 2px; }
          .explanation-title { font-size: 16pt; font-weight: bold; margin-top: 40px; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .exp-box { border-bottom: 1px dashed #ccc; padding: 10px 0; }
          .exp-q { font-weight: bold; color: #4763C3; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td class="exam-year">${testSet.title}</td>
            <td style="text-align: right;">
               <div class="type-box">홀수형</div>
            </td>
          </tr>
        </table>
        <div style="text-align: center; margin: 10px 0 30px 0;">
           <span class="exam-subject">국어 영역</span>
        </div>
        <div style="border-bottom: 4px solid #000; margin-bottom: 2px;"></div>
        <div style="border-bottom: 1px solid #000; margin-bottom: 30px;"></div>

        ${testSet.passages.map((passage, pIndex) => {
            const startQ = testSet.passages.slice(0, pIndex).reduce((acc, p) => acc + p.questions.length, 0) + 1;
            const endQ = startQ + passage.questions.length - 1;
            const rangeText = endQ > startQ ? `[${startQ}～${endQ}]` : `[${startQ}]`;
            const cleanContent = passage.content.replace(/\*\*/g, '');

            return `
            <div style="margin-bottom: 40px;">
                <p style="font-weight:bold; font-size:11pt; margin-bottom:15px;">
                  ${rangeText} 다음 글을 읽고 물음에 답하시오.
                </p>
                <div class="passage-text">
                  ${cleanContent.split('\n').map(p => `<p style="text-indent: 10pt; margin: 0;">${p}</p>`).join('')}
                </div>

                ${passage.questions.map((q, qIndex) => {
                  const { hasBox, stem, boxContent } = parseQuestionText(q.text);
                  const boxHtml = hasBox ? `
                    <div class="bogi-box">
                      <div class="bogi-title">&lt;보 기&gt;</div>
                      ${boxContent.split('\n').map(line => `<div>${line}</div>`).join('')}
                    </div>
                  ` : '';

                  return `
                  <div style="margin-top: 20px; page-break-inside: avoid;">
                    <span class="question-num">${startQ + qIndex}.</span>
                    <span class="question-text">${stem}</span>
                    ${boxHtml}
                    <div class="options">
                      ${q.options.map((opt, oIndex) => `
                        <div class="option-item">
                           <span class="circle-num">${oIndex + 1}</span> ${opt}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  `;
                }).join('')}
            </div>
            `;
        }).join('')}
        
        <br style="page-break-after: always;" />
        <div class="explanation-title">정답 및 해설</div>
        ${testSet.passages.map((passage, pIndex) => {
             const startQ = testSet.passages.slice(0, pIndex).reduce((acc, p) => acc + p.questions.length, 0) + 1;
             return passage.questions.map((q, qIndex) => `
               <div class="exp-box">
                 <div style="margin-bottom: 5px;">
                   <span class="exp-q">[문제 ${startQ + qIndex}]</span> 정답: <b>${q.answer + 1}번</b>
                   ${q.predictedRate ? `<span style="margin-left:10px; font-size:9pt; color:#666;">(예상 정답률: ${q.predictedRate})</span>` : ''}
                 </div>
                 <div style="font-size: 10pt; color: #444;">${q.explanation}</div>
               </div>
             `).join('');
        }).join('')}
      </body>
      </html>
    `;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${testSet.title.replace(/\s/g, '_')}_수능형.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="relative font-serif animate-fade-in-up">
      
      {/* Action Bar */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 no-print">
        <button
          onClick={handleDownload}
          className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-brand-600 hover:-translate-y-1 transition-all group font-sans border border-white/20 active:scale-95"
        >
          <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
            <Download className="w-5 h-5" />
          </div>
          <span className="pr-1 text-base">Word 파일 다운로드</span>
        </button>
      </div>

      {/* --- New: AI Difficulty Analysis Dashboard --- */}
      {typeStats.length > 0 && (
        <div className="max-w-[24cm] mx-auto mb-10 no-print">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/60 ring-1 ring-slate-100 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl shadow-sm">
                   <Activity className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-xl text-slate-900 tracking-tight">AI 난이도 분석 리포트</h3>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">Predicted Difficulty Analysis</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">전체 예상 정답률</p>
                     <p className={`text-2xl font-black tracking-tight ${
                        overallDifficulty < 40 ? 'text-red-500' : 
                        overallDifficulty < 60 ? 'text-orange-500' : 'text-brand-600'
                     }`}>
                        {overallDifficulty}%
                     </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">변별력 지수</p>
                     <p className="text-sm font-bold text-slate-700">
                        {overallDifficulty < 40 ? '최상 (Killer)' : 
                         overallDifficulty < 60 ? '상 (Hard)' : '중 (Medium)'}
                     </p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               {typeStats.map((stat) => (
                 <div key={stat.type} className="group">
                    <div className="flex justify-between items-end mb-2.5">
                       <span className="font-bold text-slate-700 flex items-center gap-2">
                         {stat.type}
                         <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">{stat.count}문항</span>
                       </span>
                       <span className={`font-black text-sm ${
                          stat.avgRate < 40 ? 'text-red-500' : 
                          stat.avgRate < 60 ? 'text-orange-500' : 'text-brand-600'
                       }`}>
                          {stat.avgRate}%
                       </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:scale-[1.02] ${
                            stat.avgRate < 40 ? 'bg-gradient-to-r from-red-500 to-rose-400' : 
                            stat.avgRate < 60 ? 'bg-gradient-to-r from-orange-400 to-amber-400' : 
                            'bg-gradient-to-r from-brand-500 to-indigo-400'
                          }`} 
                          style={{ width: `${stat.avgRate}%` }}
                       ></div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium text-right">
                       {stat.avgRate < 40 ? '매우 어려움' : stat.avgRate < 70 ? '보통' : '쉬움'}
                    </p>
                 </div>
               ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
               <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
               <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  * 본 데이터는 생성된 문항의 내용을 바탕으로 AI가 예측한 정답률입니다. 실제 학생들의 체감 난이도와는 차이가 있을 수 있습니다.
                  정답률이 낮을수록(붉은색) 변별력이 높은 고난도 킬러 문항임을 의미합니다.
               </p>
            </div>
          </div>
        </div>
      )}

      {/* Realistic Paper Container (CSAT Style) */}
      <div className="max-w-[24cm] mx-auto pb-20">
        <div 
          className="bg-white min-h-[35cm] p-10 md:p-[60px] relative print:shadow-none print:w-full print:max-w-none print:p-0 shadow-2xl shadow-slate-400/20 rounded-sm ring-1 ring-black/5"
          style={{ backgroundImage: 'linear-gradient(to right, #f8fafc 1px, transparent 1px)', backgroundSize: '100% 100%' }} // Subtle texture
        >
          {/* Paper Header */}
          <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-8 font-serif">
             <h1 className="text-xl font-bold tracking-tighter text-black">{testSet.title}</h1>
             <div className="border-[1.5px] border-black px-4 py-1 font-bold text-lg mb-0.5 text-black">홀수형</div>
          </div>
          
          <div className="text-center relative mb-16">
             <span className="text-5xl font-black tracking-[0.2em] relative z-10 bg-white px-8 inline-block text-black font-serif">국어 영역</span>
             <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-black -z-0"></div>
          </div>
          
          {/* Two Column Layout for Passages */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-24">
            {testSet.passages.map((passage, index) => {
               const startQ = testSet.passages.slice(0, index).reduce((acc, p) => acc + p.questions.length, 0) + 1;
               const endQ = startQ + passage.questions.length - 1;
               const rangeText = endQ > startQ ? `[${startQ}～${endQ}]` : `[${startQ}]`;

               return (
                 <div key={passage.id} className="contents-block break-inside-avoid relative">
                    {/* Visual Connector for Sets */}
                    <div className="mb-6">
                        <p className="font-bold text-[1.1rem] text-black">
                          <span className="border-[1.5px] border-black px-1.5 py-0.5 mr-2 text-sm font-sans font-bold bg-white">{rangeText}</span>
                          다음 글을 읽고 물음에 답하시오.
                        </p>
                    </div>

                    <div className="text-justify leading-[1.8] text-[1.05rem] mb-10 font-serif text-slate-900 tracking-tight">
                       {passage.content.split('\n').map((para, i) => (
                         <p key={i} className="indent-4 mb-2">
                           {parseContent(para)}
                         </p>
                       ))}
                    </div>

                    <div className="space-y-12">
                       {passage.questions.map((q, qIdx) => {
                         const { hasBox, stem, boxContent } = parseQuestionText(q.text);
                         const uniqueQId = `${index}_${qIdx}`;
                         return (
                           <div key={uniqueQId} className="relative group/question print:break-inside-avoid">
                              <div className="flex items-start gap-2 mb-3">
                                 <span className="text-lg font-bold text-black font-sans leading-none mt-1">{startQ + qIdx}.</span>
                                 <span className="font-bold text-[1.05rem] leading-snug pt-0.5 text-justify text-black">{stem}</span>
                              </div>
                              
                              {hasBox && (
                                <div className="border border-black p-4 my-4 mx-1 bg-white text-[0.95rem] leading-relaxed text-justify relative">
                                   <div className="text-center font-bold mb-3 text-sm tracking-[0.2em]">&lt;보 기&gt;</div>
                                   {boxContent.split('\n').map((line, i) => {
                                      const isGraph = line.includes('[그래프]') || line.includes('[도표]');
                                      const isImage = line.includes('[그림]') || line.includes('[자료]');
                                      
                                      if (isGraph || isImage) {
                                         return (
                                           <div key={i} className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-sm flex flex-col items-center justify-center text-center gap-2">
                                             <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                               {isGraph ? <BarChart className="w-5 h-5 text-slate-400" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                                             </div>
                                             <p className="text-sm text-slate-700 font-medium leading-relaxed break-keep font-sans">{line}</p>
                                           </div>
                                         );
                                      }
                                      return <p key={i}>{line}</p>;
                                   })}
                                </div>
                              )}

                              <div className="space-y-1.5 pl-3 text-[1rem]">
                                 {q.options.map((opt, oIdx) => (
                                   <div key={oIdx} className="flex items-start gap-2 hover:bg-slate-100/50 cursor-pointer -ml-2 p-1 rounded transition-colors group">
                                      <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-black text-[11px] font-sans mt-[4px] shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                                        {oIdx + 1}
                                      </span>
                                      <span className="text-slate-900">{opt}</span>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
               )
            })}
          </div>

          {/* Footer Mockup */}
          <div className="mt-32 flex justify-center items-center gap-12 font-serif text-sm opacity-40">
             <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-400 font-bold text-xl">1</div>
             <div className="font-bold tracking-widest text-lg">20</div>
          </div>
        </div>

        {/* Answer & Explanation Sheet */}
        <div className="bg-slate-50 min-h-[29.7cm] p-10 md:p-[60px] mt-16 relative shadow-inner rounded-3xl border border-slate-200 print:break-before-page no-print">
            <div className="flex items-center gap-4 mb-10 border-b-2 border-slate-200 pb-6">
               <div className="bg-brand-600 p-2.5 rounded-xl text-white shadow-lg shadow-brand-600/20">
                 <FileText className="w-6 h-6"/>
               </div>
               <h2 className="text-3xl font-black text-slate-800 font-sans tracking-tight">정답 및 해설</h2>
            </div>
            
            <div className="space-y-8">
               {testSet.passages.map((passage, pIdx) => {
                  const startQ = testSet.passages.slice(0, pIdx).reduce((acc, p) => acc + p.questions.length, 0) + 1;
                  return (
                    <div key={pIdx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-500 mb-6 pb-4 border-b border-slate-100 text-sm uppercase tracking-wide flex items-center gap-2">
                         <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">문항 {startQ} ~ {startQ + passage.questions.length - 1}</span>
                         {passage.category}
                       </h3>
                       <div className="space-y-8">
                         {passage.questions.map((q, qIdx) => {
                           const uniqueQId = `${pIdx}_${qIdx}`;
                           return (
                           <div key={uniqueQId}>
                              <div className="flex items-center gap-3 mb-3">
                                 <span className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md font-bold font-sans">문제 {startQ + qIdx}</span>
                                 <span className="flex items-center gap-1.5 text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                                   <CheckCircle2 className="w-4 h-4" />
                                   정답: {q.answer + 1}번
                                 </span>
                                 {q.predictedRate && (
                                   <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                     <Target className="w-3 h-3" />
                                     정답률: {q.predictedRate}
                                   </span>
                                 )}
                              </div>
                              <p className="text-slate-700 text-[0.95rem] leading-relaxed bg-slate-50/50 p-5 rounded-xl border border-slate-100 font-serif">
                                <span className="font-bold text-slate-900 mr-2">[해설]</span>
                                {q.explanation}
                              </p>
                           </div>
                           );
                         })}
                       </div>
                    </div>
                  )
               })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default TestPaper;
