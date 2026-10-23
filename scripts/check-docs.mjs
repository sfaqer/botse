#!/usr/bin/env node
import {auditDocumentation} from './docs-markup.mjs';
import {repoRoot} from './i18n-utils.mjs';
const report=await auditDocumentation(repoRoot);
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else {
console.log(`Checked ${report.documents} documents (${report.sourceDocuments} sources), ${report.jsxFiles} TSX files and generated category routes.`);
for(const error of report.errors.slice(0,50))console.error(`${error.file}${error.line?':'+error.line:''} [${error.type}] ${error.detail}`);
if(report.errors.length>50)console.error('Use --json to see every finding.');
}
if(report.errors.length){console.error(`${report.errors.length} markup problems found.`);process.exitCode=1;}
else console.log('Document markup, translation coverage, metadata, links, assets and English mirrors are valid.');
