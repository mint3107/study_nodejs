import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';

interface IFileServiceUpload {
  file: FileUpload;
}

@Injectable()
export class FilesService {
  async upload({ file: _file }: IFileServiceUpload): Promise<string> {
    console.log(_file);
    console.log('-- file start');
    // 1. 파일을 클라우드 스토리지에 저장하는 로직
    // 1-1) 스토리지 셋팅
    const bucketName = `myproject-storagy`;
    const s3Client = new S3Client({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    // 1-2) 스토리지 업로드
    console.log('--- 파일 진행 업로드 시작 ---');

    const paralleUpload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: `${Date.now() + _file.filename}`,
        Body: _file.createReadStream(),
      },
    });

    paralleUpload.on('httpUploadProgress', (progress) => {
      console.log(progress);
    });

    console.log('--- 파일 진행 처리 완료 ---');

    await paralleUpload.done();

    return '전송 종료';
  }
}
