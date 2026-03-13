import fs from 'fs';
import path from 'path';

// Path to content storage file
const contentFilePath = path.join(process.cwd(), 'data', 'content.json');

// Ensure data directory exists
const ensureDataDir = () => {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(contentFilePath)) {
        fs.writeFileSync(contentFilePath, JSON.stringify([]));
    }
};

// Read all content
const readContent = () => {
    ensureDataDir();
    const data = fs.readFileSync(contentFilePath, 'utf8');
    return JSON.parse(data);
};

// Write content
const writeContent = (content) => {
    ensureDataDir();
    fs.writeFileSync(contentFilePath, JSON.stringify(content, null, 2));
};

export default function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const content = readContent();
                res.status(200).json({
                    success: true,
                    data: content
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
            break;

        case 'POST':
            try {
                const { title, content, author, tags } = req.body;

                if (!title || !content) {
                    return res.status(400).json({
                        success: false,
                        message: 'Title and content are required'
                    });
                }

                const contents = readContent();

                const newContent = {
                    id: Date.now().toString(),
                    title,
                    content,
                    author: author || 'Anonymous',
                    tags: tags || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                };

                contents.push(newContent);
                writeContent(contents);

                res.status(201).json({
                    success: true,
                    data: newContent
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
            break;

        case 'PUT':
            try {
                const { id, title, content, author, tags } = req.body;

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID is required'
                    });
                }

                const contents = readContent();
                const index = contents.findIndex(item => item.id === id);

                if (index === -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Content not found'
                    });
                }

                contents[index] = {
                    ...contents[index],
                    title: title || contents[index].title,
                    content: content || contents[index].content,
                    author: author || contents[index].author,
                    tags: tags || contents[index].tags,
                    updatedAt: new Date().toISOString(),
                    version: (contents[index].version || 0) + 1
                };

                writeContent(contents);

                res.status(200).json({
                    success: true,
                    data: contents[index]
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID is required'
                    });
                }

                const contents = readContent();
                const filteredContents = contents.filter(item => item.id !== id);

                if (contents.length === filteredContents.length) {
                    return res.status(404).json({
                        success: false,
                        message: 'Content not found'
                    });
                }

                writeContent(filteredContents);

                res.status(200).json({
                    success: true,
                    message: 'Content deleted successfully'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
            break;

        default:
            res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
            break;
    }
}