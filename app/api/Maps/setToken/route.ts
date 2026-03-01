import { NextRequest,NextResponse } from "next/server";

export async function GET( token: NextRequest) {
 
    
  try {
    

}
 
catch (error) {
    console.error("Error in setToken route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } 
    return NextResponse.json({ message: 'Token set successfully' }, { status: 200 });
}
