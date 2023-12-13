import { Storage } from '@google-cloud/storage';

export default class GoogleService {

    storage: Storage
    bucket: any

    constructor() {
       this.storage = new Storage({
            keyFilename: 'service-account.json'
        });

        this.bucket = this.storage.bucket('simple_sns_profile_image');
    }
    
    async uploadFile(uuid: string, file: any): Promise<void> {
        console.log("uploadFile " + uuid)
        const blob = this.bucket.file(uuid + '.png');
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                cacheControl: 'no-store'
            }
        });

        return new Promise<void>((resolve, reject) => {
            blobStream.on('error', (err: any) => {
                reject(err);
            });

            blobStream.on('finish', () => {
                resolve();
            });

            blobStream.end(file.buffer);
        });
    }

    async removeFile(uuid: string) {
        const blob = this.bucket.file(uuid + '.png');
        await blob.delete();
    }

    async setUpDefaultProfileImage(uuid: string) {
        const blob = this.bucket.file('user.png');
        const newBlob = this.bucket.file(uuid + '.png');
        await blob.copy(newBlob);
    }
}