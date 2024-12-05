
const { Storage } = require('@google-cloud/storage');


const createPublicUrl = (folder, fileName) => {
  return `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${folder}/${fileName}`;
}

const uploadFile = async (folder, files) => {
  // Check if the folder exists, if not create it
  const storage = new Storage({ projectId: 'third-fire-440814-p1', credentials: require('../../google-auth.json') })
  const folderPath = `${folder}/`;
  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const folderFile = bucket.file(folderPath);
  const [folderExists] = await folderFile.exists();
  if (!folderExists) {
    await folderFile.save('', { resumable: false });
  }
  const promises = [];
  for (let i = 0; i < files.length; i++) {
    const { fileName, buffer } = files[i];
    const filePath = `${folder}/${fileName}`;
    const file = bucket.file(filePath);
    promises.push(
      file.save(buffer, {
        resumable: false,
        metadata: {
          contentType: 'auto',
        },
      }),
    );
  }
  await Promise.all(promises);
}


module.exports = {
  uploadFile,
  createPublicUrl
}