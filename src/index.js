import { PinataSDK } from "pinata";

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Authorization': `Bearer ${env.PINATA_JWT}`,
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const pinata = new PinataSDK({
        pinataJwt: env.PINATA_JWT,
        pinataGateway: env.GATEWAY_URL
      });

      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'no file' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const blob = new Blob([await file.arrayBuffer()]);
      const fileData = new File([blob], file.name, { 
        type: file.type 
      });

      console.log('start upload...');

      const upload = await pinata.upload.public.file(fileData);

    //   const gatewayUrl = await pinata.gateways.public.convert(upload.cid);
    //   console.log('URL:', gatewayUrl);

      return new Response(JSON.stringify({
        success: true,
        cid: upload.cid
        // ,
        // url: gatewayUrl
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      console.error('upload failed:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
  