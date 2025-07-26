npm install aws-sdk
zip -r lambda.zip .
aws s3 cp lambda.zip s3://react-chat-assistant-bucket/ --region eu-north-1