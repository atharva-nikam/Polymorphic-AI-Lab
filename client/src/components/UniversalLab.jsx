// client/src/components/UniversalLab.jsx
import React, { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';
import { Settings2 } from 'lucide-react';

export default function UniversalLab({ config }) {
  const { title, variables, formula_expression, output_unit } = config;

  // Initialize state dynamically based on props
  const [values, setValues] = useState(() => {
    const defaults = {};
    variables.forEach(v => defaults[v.var_id] = v.default);
    return defaults;
  });

  const [result, setResult] = useState(0);

  // The Math Engine
  useEffect(() => {
    try {
      const res = evaluate(formula_expression, values);
      setResult(res);
    } catch (e) {
      console.error("Math Error", e);
    }
  }, [values, formula_expression]);

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 mt-4 mb-4">
      <div className="bg-slate-900 p-4 flex items-center gap-2">
        <Settings2 className="text-blue-400 w-5 h-5" />
        <h3 className="text-white font-bold">{title}</h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Dynamic Sliders */}
        {variables.map((v) => (
          <div key={v.var_id}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">{v.name}</span>
              <span className="font-mono text-blue-600 bg-blue-50 px-2 rounded">
                {values[v.var_id]} {v.unit}
              </span>
            </div>
            <input
              type="range"
              min={v.min}
              max={v.max}
              step={(v.max - v.min) / 100}
              value={values[v.var_id]}
              onChange={(e) => setValues(prev => ({...prev, [v.var_id]: parseFloat(e.target.value)}))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        ))}

        {/* Result Display */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="text-4xl font-black text-slate-800 tracking-tight">
            {result.toFixed(2)}
            <span className="text-lg text-slate-400 font-medium ml-1">{output_unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
