import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/documents - List all documents for current user
export async function GET(request) {
  try {
    // Extract userId from session (TODO: integrate with NextAuth)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user';
    
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        analyses: {
          select: {
            id: true,
            prompt: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create new document
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId = 'demo-user',
      title,
      originalText,
      fileName,
      fileType = 'TXT',
      fileSize,
      documentType = 'Other',
    } = body;

    if (!title || !originalText) {
      return NextResponse.json(
        { error: 'Title and originalText are required' },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        userId,
        title,
        originalText,
        fileName,
        fileType,
        fileSize,
        documentType,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
