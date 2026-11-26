const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const rules={};
new Function('exports', ts.transpileModule(fs.readFileSync('lib/promo-frequency.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(rules);
test('promo repeats after a full hour, including across midnight',()=>{
 const shown=Date.parse('2026-11-24T15:45:00Z');
 assert.equal(rules.isWithinPromoHour(shown,shown),true);
 assert.equal(rules.isWithinPromoHour(shown,shown+3599999),true);
 assert.equal(rules.isWithinPromoHour(shown,shown+3600000),false);
 assert.equal(rules.isWithinPromoHour(shown,shown+7200000),false);
 assert.equal(rules.isWithinPromoHour(shown,shown-1000),true);
});
test('new promos and old daily markers do not suppress hourly display',()=>{
 for(const old of [undefined,null,'2026-11-24',NaN]) assert.equal(rules.isWithinPromoHour(old,Date.now()),false);
});
