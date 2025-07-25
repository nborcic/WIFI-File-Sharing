import fs from 'fs';
import path from 'path';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const SHARED_DIR = path.resolve('./shared');

// Ensure the shared directory exists
if (!fs.existsSync(SHARED_DIR)) {
    fs.mkdirSync(SHARED_DIR);
}

export async function GET() {
    const files = fs.readdirSync(SHARED_DIR).map((name) => {
        const filePath = path.join(SHARED_DIR, name);
        const stat = fs.statSync(filePath);
        return {
            name,
            isDirectory: stat.isDirectory(),
            size: stat.size,
            mtime: stat.mtime
        };
    });
    return json({ files });
}

export async function POST({ request }) {
    const data = await request.formData();
    const files = data.getAll('files');
    if (!files.length) {
        return json({ error: 'No files uploaded' }, { status: 400 });
    }
    for (const file of files) {
        // file.name contains the relative path if uploaded via webkitdirectory
        const relPath = file.name;
        const destPath = path.join(SHARED_DIR, relPath);
        // Ensure parent directories exist
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(destPath, buffer);
    }
    return json({ success: true });
}

export async function GET({ url }) {
    const download = url.searchParams.get('download');
    if (download) {
        const filePath = path.join(SHARED_DIR, download);
        if (!fs.existsSync(filePath)) {
            throw error(404, 'File not found');
        }
        const fileStream = fs.createReadStream(filePath);
        return new Response(fileStream, {
            headers: {
                'Content-Disposition': `attachment; filename="${download}"`
            }
        });
    }
    const files = fs.readdirSync(SHARED_DIR).map((name) => {
        const filePath = path.join(SHARED_DIR, name);
        const stat = fs.statSync(filePath);
        return {
            name,
            isDirectory: stat.isDirectory(),
            size: stat.size,
            mtime: stat.mtime
        };
    });
    return json({ files });
}

export async function DELETE({ url }) {
    const name = url.searchParams.get('name');
    if (!name) {
        return json({ error: 'No file specified' }, { status: 400 });
    }
    const filePath = path.join(SHARED_DIR, name);
    if (!fs.existsSync(filePath)) {
        return json({ error: 'File not found' }, { status: 404 });
    }
    fs.unlinkSync(filePath);
    return json({ success: true });
} 