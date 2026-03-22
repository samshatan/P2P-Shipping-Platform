import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function migrateNextToReact() {
  walkDir(srcDir, (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Replace next/link
    content = content.replace(/import\s+Link\s+from\s+["']next\/link["'];?/g, 'import { Link } from "react-router-dom";');
    
    // 2. Replace next/image
    content = content.replace(/import\s+Image\s+from\s+["']next\/image["'];?/g, '');
    content = content.replace(/<Image(.*?)src=(.*?)(?:\/?>|>.*?<\/Image>)/gs, (match, p1, p2) => {
       // Convert <Image src="..." alt="..." width={...} /> to <img src="..." alt="..." />
       // naive approach
       return `<img${p1}src=${p2} />`;
    });

    // 3. Replace next/navigation hooks
    content = content.replace(/import\s+\{\s*useParams(?:,\s*useRouter)?\s*\}\s+from\s+["']next\/navigation["'];?/g, 
        'import { useParams, useNavigate } from "react-router-dom";');
    content = content.replace(/import\s+\{\s*useRouter(?:,\s*useParams)?\s*\}\s+from\s+["']next\/navigation["'];?/g, 
        'import { useNavigate, useParams } from "react-router-dom";');

    // 4. Transform useRouter() to useNavigate() calls
    content = content.replace(/const\s+router\s*=\s*useRouter\(\);/g, 'const navigate = useNavigate();');
    content = content.replace(/router\.push\((.*?)\)/g, 'navigate($1)');

    // 5. Remove "use client";
    content = content.replace(/["']use client["'];?\s*/g, '');

    // 6. Delete layout specific Metadata
    content = content.replace(/import\s+type\s+\{\s*Metadata\s*\}\s+from\s+["']next["'];?/g, '');
    content = content.replace(/export\s+const\s+metadata:\s*Metadata\s*=\s*\{[\s\S]*?\};/g, '');

    // 7. Change <Link href="..."> to <Link to="...">
    content = content.replace(/<Link([^>]+)href=/g, '<Link$1to=');

    // Remove window.location.href re-routes typically built in
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Migrated: ${filePath}`);
    }
  });
}

migrateNextToReact();
