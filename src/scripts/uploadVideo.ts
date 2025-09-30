import { Axios, errorHandler } from '../axios';
import { RequestOption } from '@arco-design/web-vue';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export const uploadVideo = async (
  option: RequestOption,
  onFinish: Function = () => Promise.resolve()
) => {
  const { onProgress, onError, onSuccess, fileItem } = option;
  const file = fileItem.file as File;
  const { name, size, type } = file;
  const content_type = type;

  return new Promise((resolve, reject) => {
    Axios.post('/video/', { name, size, content_type })
      .then(async res => {
        console.log(res.data);
        const uploadData = res.data.data.upload_data;
        const s3Client = new S3Client({
          region: 'automatic',
          endpoint: uploadData.VodUploadInfo.s3Endpoint,
          credentials: uploadData.Credentials,
        });

        const multipartUpload = new Upload({
          client: s3Client,
          params: {
            Bucket: uploadData.VodUploadInfo.s3Bucket,
            Key: uploadData.VodUploadInfo.key,
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
          resolve(res.data.data.data);
        } catch (err) {
          console.error(err);
          onError(err);
          reject(err);
        }
      })
      .catch(errorHandler);
  });
};
