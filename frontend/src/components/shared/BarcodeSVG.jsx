// src/components/shared/BarcodeSVG.jsx
import { useMemo } from "react";

// Tabel representasi run-length Code-128 B (modul baris hitam & putih)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

function encodeCode128B(text) {
  const clean = String(text || "").trim();
  if (!clean) return [];

  const symbols = [104]; // Start Code B
  let checksum = 104;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) - 32;
    const val = Math.max(0, Math.min(code, 95));
    symbols.push(val);
    checksum += (i + 1) * val;
  }

  symbols.push(checksum % 103);
  symbols.push(106); // Stop Code

  // Bentuk baris hitam & putih
  const modules = [];
  // Quiet zone awal (10 modul putih)
  for (let q = 0; q < 10; q++) modules.push(0);

  symbols.forEach((sym) => {
    const pattern = CODE128_PATTERNS[sym] || "111111";
    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10);
      const isBar = p % 2 === 0 ? 1 : 0; // Genap = bar hitam, Ganjil = celah putih
      for (let w = 0; w < width; w++) {
        modules.push(isBar);
      }
    }
  });

  // Quiet zone akhir (10 modul putih)
  for (let q = 0; q < 10; q++) modules.push(0);

  return modules;
}

export default function BarcodeSVG({
  value,
  height = 56,
  barWidth = 2,
  showText = true,
  className = "",
}) {
  const modules = useMemo(() => encodeCode128B(value), [value]);
  const totalWidth = modules.length * barWidth;

  if (!value) return null;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2 rounded-lg ${className}`}>
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="block"
      >
        <rect width={totalWidth} height={height} fill="#ffffff" />
        {modules.map((isBar, idx) =>
          isBar === 1 ? (
            <rect
              key={idx}
              x={idx * barWidth}
              y={0}
              width={barWidth}
              height={height}
              fill="#000000"
            />
          ) : null
        )}
      </svg>
      {showText && (
        <span className="font-mono text-[11px] font-bold tracking-widest text-slate-800 mt-1">
          {value}
        </span>
      )}
    </div>
  );
}
