const fs = require('fs');
const path = require('path');

const assets = [
    {
        src: "/Users/tuan/.gemini/antigravity/brain/4a65f2ec-64d8-4f01-9171-007c41fcedd5/uploaded_media_0_1769780118646.png",
        dest: "public/img/logo_dk.png"
    },
    {
        src: "/Users/tuan/.gemini/antigravity/brain/4a65f2ec-64d8-4f01-9171-007c41fcedd5/uploaded_media_1_1769785165248.jpg",
        dest: "public/img/store_hero.jpg"
    }
];

const projectRoot = path.join(__dirname, '..');

assets.forEach(asset => {
    const destPath = path.join(projectRoot, asset.dest);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    try {
        if (fs.existsSync(asset.src)) {
            fs.copyFileSync(asset.src, destPath);
            console.log(`✅ Copied ${path.basename(asset.src)} to ${asset.dest}`);
        } else {
            console.warn(`⚠️ Source file not found: ${asset.src}`);
        }
    } catch (err) {
        console.error(`❌ Error copying to ${asset.dest}:`, err.message);
    }
});
