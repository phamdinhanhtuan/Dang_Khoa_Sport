const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

async function runCommand(cmd, args) {
    return new Promise((resolve, reject) => {
        const fullCmd = process.platform === 'win32' ? `${cmd}.cmd` : cmd;
        const p = spawn(fullCmd, args, { stdio: 'inherit', env: { ...process.env, MONGO_URI: 'mongodb://127.0.0.1:27017/dang-khoa-sport' } });
        p.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command ${cmd} ${args.join(' ')} failed with code ${code}`));
        });
    });
}

async function start() {
    console.log('----------------------------------------------------');
    console.log('🚀 DANG KHOA SPORT - QUICK START (In-Memory DB)');
    console.log('----------------------------------------------------');

    try {
        console.log('⏳ Starting Local Database (MongoDB 7.0)...');
        // This will download the MongoDB binary if not found (cached in ~/.cache/mongodb-binaries)
        const mongoServer = await MongoMemoryServer.create({
            instance: {
                port: 27017,
                dbName: 'dang-khoa-sport',
                ip: '127.0.0.1'
            },
            binary: {
                version: '7.0.0'
            }
        });

        console.log(`✅ Database is ready at 127.0.0.1:27017`);

        // 1. Seed Categories
        console.log('\n🌱 Step 1/3: Seeding Categories...');
        await runCommand('node', ['seed_categories_fixed.js']);

        // 2. Seed Products
        console.log('\n🌱 Step 2/3: Seeding Products & Admin User...');
        await runCommand('node', ['seed.js']);

        console.log('\n----------------------------------------------------');
        console.log('🔑 ADMIN LOGIN CREDENTIALS:');
        console.log('   URL:   http://localhost:3000/admin/login');
        console.log('   Email: admin@dangkhoasport.com');
        console.log('   Pass:  password123');
        console.log('----------------------------------------------------');

        // 3. Start Application
        console.log('\n📡 Step 3/3: Launching Web Application...');
        const appProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
            stdio: 'inherit',
            env: { ...process.env, MONGO_URI: 'mongodb://127.0.0.1:27017/dang-khoa-sport' }
        });

        process.on('SIGINT', async () => {
            console.log('\n🛑 Cleaning up and exiting...');
            await mongoServer.stop();
            appProcess.kill();
            process.exit();
        });

    } catch (err) {
        console.error('\n❌ ERROR during startup:', err.message);
        process.exit(1);
    }
}

start();
