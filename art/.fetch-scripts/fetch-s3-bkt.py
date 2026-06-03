#!/usr/local/bin/python3

import os
import boto3
from botocore.exceptions import NoCredentialsError

session = boto3.Session(profile_name="default")
s3 = session.client('s3')

def download_s3_prefix(bucket_name, prefix, local_dir):
    try:
        if not os.path.exists(local_dir):
            os.makedirs(local_dir)

        # Pass the subfolder path as Prefix
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix=prefix)

        for page in pages:
            if 'Contents' not in page:
                continue
                
            for obj in page['Contents']:
                # Skip directory markers ending in trailing slashes
                if obj['Key'].endswith('/'):
                    continue
                    
                local_file_path = os.path.join(local_dir, obj['Key'])
                local_dir_path = os.path.dirname(local_file_path)
                
                if not os.path.exists(local_dir_path):
                    os.makedirs(local_dir_path)
                
                print(f"Downloading {obj['Key']} to {local_file_path}")
                s3.download_file(bucket_name, obj['Key'], local_file_path)

    except NoCredentialsError:
        print("Credentials not found. Please configure your AWS credentials.")
    except Exception as e:
        print(f"Error: {e}")

# Correct Usage: Bucket name separated from subfolder prefixes
bucket = 'art.nlm'
#folders = ['aa', 'madhuram', 'meera', 'sevalane', 'uninstalled', 'varaveena']
#folders = ['madhuram', 'meera', 'sevalane', 'uninstalled', 'varaveena']
folders = ['meera']

for folder in folders:
    download_s3_prefix(bucket, folder, './')
