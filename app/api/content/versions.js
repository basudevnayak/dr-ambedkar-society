import fs from 'fs';
import path from 'path';

const versionsFilePath = path.join(process.cwd(), 'data', 'versions.json');

const ensureVersionsDir = () => {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(versionsFilePath)) {
        fs.writeFileSync(versionsFilePath, JSON.stringify({}));
    }
};

const readVersions = () => {
    ensureVersionsDir();
    const data = fs.readFileSync(versionsFilePath, 'utf8');
    return JSON.parse(data);
};

const writeVersions = (versions) => {
    ensureVersionsDir();
    fs.writeFileSync(versionsFilePath, JSON.stringify(versions, null, 2));
};

export default function handler(req, res) {
    const { method } = req;
    const { contentId } = req.query;

    switch (method) {
        case 'GET':
            try {
                const versions = readVersions();
                if (contentId) {
                    res.status(200).json({
                        success: true,
                        data: versions[contentId] || []
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        data: versions
                    });
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
            break;

        case 'POST':
            try {
                const { contentId, version } = req.body;

                if (!contentId || !version) {
                    return res.status(400).json({
                        success: false,
                        message: 'ContentId and version are required'
                    });
                }

                const versions = readVersions();

                if (!versions[contentId]) {
                    versions[contentId] = [];
                }

                versions[contentId].push({
                    ...version,
                    versionId: Date.now().toString(),
                    savedAt: new Date().toISOString()
                });

                // Keep only last 10 versions
                if (versions[contentId].length > 10) {
                    versions[contentId] = versions[contentId].slice(-10);
                }

                writeVersions(versions);

                res.status(201).json({
                    success: true,
                    data: versions[contentId]
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
    }
}