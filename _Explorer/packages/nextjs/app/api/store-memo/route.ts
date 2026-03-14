import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the incoming body from your frontend
    const body = await request.json();

    // Forward the payload to your EC2 Relayer
    // This is server-to-server, so http:// is perfectly fine here!
    const ec2Response = await fetch('http://54.82.191.189:3001/api/store-memo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!ec2Response.ok) {
      throw new Error(`EC2 responded with status: ${ec2Response.status}`);
    }

    const data = await ec2Response.json();
    
    // Send the successful response back to the frontend
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy routing error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with the relayer node.' }, 
      { status: 500 }
    );
  }
}