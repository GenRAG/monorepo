import boto3
import os
from botocore.exceptions import ClientError

# Load config from .env
ENDPOINT = os.getenv("S3_ENDPOINT")
ACCESS_KEY = os.getenv("MINIO_USER")
SECRET_KEY = os.getenv("MINIO_PASSWORD")
BUCKET_NAME = os.getenv("BUCKET_NAME", "genrag-documents")

def get_s3_client():
    """Creates the connection to MinIO"""
    return boto3.client(
        's3',
        endpoint_url=ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY
    )

def ensure_bucket_exists():
    """Checks if our folder exists in MinIO, creates it if not."""
    s3 = get_s3_client()
    try:
        s3.head_bucket(Bucket=BUCKET_NAME)
    except ClientError:
        # If bucket doesn't exist, create it
        try:
            s3.create_bucket(Bucket=BUCKET_NAME)
            print(f"✅ Created bucket: {BUCKET_NAME}")
        except Exception as e:
            print(f"⚠️  Bucket creation warning: {e}")

def upload_file(file_obj, object_name):
    """
    Uploads a file object to MinIO.
    """
    s3 = get_s3_client()
    try:
        s3.upload_fileobj(file_obj, BUCKET_NAME, object_name)
        print(f"✅ Uploaded {object_name} to MinIO")
        return True
    except Exception as e:
        print(f"❌ Upload Failed: {e}")
        return False