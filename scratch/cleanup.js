import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'apps/staff/public/notification.mp3');
if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('Deleted notification.mp3');
} else {
    console.log('File not found');
}
