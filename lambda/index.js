const AWS = require('aws-sdk');
const bedrock = new AWS.BedrockRuntime({ region: 'eu-north-1' });

exports.handler = async (event) => {
  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  try {
    if (!event.body) throw new Error('No message provided');
    const body = JSON.parse(event.body);
    if (!body.message) throw new Error('Message field missing');

    console.log('Received message:', body.message);

    // Call Bedrock
    const response = await bedrock.invokeModel({
      modelId: 'eu.anthropic.claude-sonnet-4-20250514-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: body.message
          }
        ]
      }),
      contentType: 'application/json',
      accept: 'application/json'
    }).promise();

    const result = JSON.parse(response.body);
    console.log('Bedrock response:', result);

    // Ensure response has content
    const reply = result.content && result.content[0] && result.content[0].text
      ? result.content[0].text
      : 'No response from Bedrock';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      },
      body: JSON.stringify({ error: 'Failed to process message: ' + error.message })
    };
  }
};