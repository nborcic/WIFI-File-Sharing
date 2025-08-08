import fs from 'fs';
import path from 'path';
import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const SHARED_DIR = path.resolve('./shared');

// Ensure the shared directory exists
if (!fs.existsSync(SHARED_DIR)) {
    fs.mkdirSync(SHARED_DIR);
}

// unified GET handler: supports optional ?download=<filename>
export async function GET({ url, request }) {
    const download = url.searchParams.get('download');
    if (download) {
        // sanitize relative path to prevent traversal
        const normalized = path.normalize(download).replace(/^([.][.][/\\])+/g, '');
        const filePath = path.join(SHARED_DIR, normalized);
        if (!fs.existsSync(filePath)) {
            throw error(404, 'File not found');
        }
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            return json({ error: 'Cannot download a directory' }, { status: 400 });
        }
        // Support HTTP Range requests for Android Download Manager and media players
        const range = request.headers.get('range');
        const totalSize = stat.size;
        const baseHeaders = {
            'Content-Type': 'application/octet-stream',
            'Accept-Ranges': 'bytes',
            'Content-Disposition': `attachment; filename="${path.basename(normalized)}"`
        };

        if (range) {
            const match = /bytes=(\d+)-(\d+)?/.exec(range);
            if (match) {
                const start = Number(match[1]);
                const end = match[2] ? Number(match[2]) : totalSize - 1;
                if (start >= totalSize || end >= totalSize || start > end) {
                    return new Response(null, {
                        status: 416,
                        headers: {
                            ...baseHeaders,
                            'Content-Range': `bytes */${totalSize}`
                        }
                    });
                }
                const chunkSize = end - start + 1;
                const stream = fs.createReadStream(filePath, { start, end });
                return new Response(stream, {
                    status: 206,
                    headers: {
                        ...baseHeaders,
                        'Content-Length': String(chunkSize),
                        'Content-Range': `bytes ${start}-${end}/${totalSize}`
                    }
                });
            }
        }
        const fileStream = fs.createReadStream(filePath);
        return new Response(fileStream, {
            headers: {
                ...baseHeaders,
                'Content-Length': String(totalSize)
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