import { Axios, errorHandler } from '../axios';
import { RequestOption } from '@arco-design/web-vue';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export const uploadFile = async (
  option: RequestOption,
  data: { storage: string; expire_days: number },
  onFinish: Function = () => Promise.resolve()
) => {
  const { onProgress, onError, onSuccess, fileItem } = option;
  const file = fileItem.file as File;
  const { name, size, type } = file;
  const content_type = type;

  return new Promise((resolve, reject) => {
    Axios.post('/file/', [
      {
        name,
        size,
        content_type,
        ...data,
      },
    ])
      .then(async res => {
        const uploadData = res.data.upload_data;
        const s3Client = new S3Client({
          region: 'automatic',
          endpoint: uploadData.Buckets[0].s3Endpoint,
          credentials: uploadData.Credentials,
        });

        const multipartUpload = new Upload({
          client: s3Client,
          params: {
            Bucket: uploadData.Buckets[0].s3Bucket,
            Key: uploadData.scopes[0],
            Body: file,
          },
          queueSize: 2,
          partSize: 10 * 1024 * 1024, // 10 MB
        });

        multipartUpload.on('httpUploadProgress', (progress: any) => {
          onProgress(progress.loaded / progress.total);
        });

        try {
          const data = await multipartUpload.done();
          await onFinish(res.data.data[0]);
          onSuccess(data);
          resolve(res.data.data[0]);
        } catch (err) {
          console.error(err);
          onError(err);
          reject(err);
        }
      })
      .catch(errorHandler);
  });
};
