// @ts-ignore
import SparkMD5 from 'spark-md5';
import { Axios, errorHandler } from '../axios';
import { RequestOption } from '@arco-design/web-vue';
import { useStore } from '../stores';
import { Message } from '@arco-design/web-vue';
import { formatSize } from './format';

export const fileMd5 = async (file: File) => {
  const blobSlice =
    File.prototype.slice ||
    // @ts-ignore
    File.prototype.mozSlice ||
    // @ts-ignore
    File.prototype.webkitSlice;

  const chunkSize = 1024 * 1024 * 2;
  const chunks = Math.ceil(file.size / chunkSize);
  const spark = new SparkMD5.ArrayBuffer();
  let currentChunk = 0;

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = e => {
      spark.append(e.target?.result);
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };

    fileReader.onerror = () => {
      reject('Error calculating file md5');
    };

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end =
        start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    };

    loadNext();
  });
};

export const beforeUploadCheck = (file: File) => {
  const store = useStore();
  const maxSize = store.quota.image_max_size || 1024 * 1024 * 5;

  if (file.size > maxSize) {
    Message.error(
      `文件大小超过限制(${formatSize(file.size)}/${formatSize(maxSize)})`
    );
    return false;
  }
  return true;
};

export const uploadImage = async (
  option: RequestOption,
  scene: string = 'default'
) => {
  const { onProgress, onError, onSuccess, fileItem } = option;
  const file = fileItem.file as File;
  const { name, size, type } = file;
  let content_type = type;
  if (type === '') {
    const suffix = name.split('.').pop()?.toLowerCase();
    if (suffix === 'heic') {
      content_type = 'image/heic';
    } else if (suffix === 'heif') {
      content_type = 'image/heif';
    } else {
      Message.error('不支持的文件类型');
      return;
    }
  }
  const md5 = await fileMd5(file);

  return new Promise((resolve, reject) => {
    Axios.post('/image/', [
      {
        name,
        size,
        md5,
        content_type,
        scene,
      },
    ])
      .then(res => {
        const image = res.data.data[0].data;
        const upload_data = res.data.data[0].upload_data;
        if (upload_data === null) {
          onSuccess(image);
          resolve(image);
          return;
        }
        const { url, headers } = upload_data;
        delete headers['Content-Length'];
        Axios.put(url, file, {
          headers: headers,
          onUploadProgress(progressEvent) {
            if (progressEvent.total) {
              onProgress(progressEvent.loaded / progressEvent.total);
            }
          },
        })
          .then(_res => {
            onSuccess(image);
            resolve(image);
          })
          .catch(err => {
            errorHandler(err);
            onError(err);
            reject(err);
          });
      })
      .catch(err => {
        errorHandler(err);
        onError(err);
        reject(err);
      });
  });
};
