import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to EC2
    const ec2Response = await fetch('http://54.82.191.189:3001/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Determine the content type of the response
    const contentType = ec2Response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
       responseData = await ec2Response.json();
    } else {
       // If it's HTML/text, read it as text so it doesn't crash the JSON parser
       const textData = await ec2Response.text();
       throw new Error(`EC2 returned non-JSON response: ${textData.substring(0, 100)}...`);
    }

    if (!ec2Response.ok) {
      throw new Error(responseData?.error || `EC2 responded with status: ${ec2Response.status}`);
    }

    return NextResponse.json(responseData);
    
  } catch (error: any) {
    console.error('Proxy withdrawal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to communicate with the relayer node.' }, 
      { status: 500 }
    );
  }
}