import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/analyses - List analyses for a user or document
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const documentId = searchParams.get('documentId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const analyses = await prisma.analysisResult.findMany({
      where: {
        userId,
        ...(documentId && { documentId }),
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            documentType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}

// POST /api/analyses - Save analysis result
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      documentId,
      prompt,
      result,
      modelUsed,
      tokenCount,
      duration,
    } = body;

    if (!userId || !prompt || !result) {
      return NextResponse.json(
        { error: 'userId, prompt, and result are required' },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysisResult.create({
      data: {
        userId,
        documentId: documentId || null,
        prompt,
        result,
        modelUsed,
        tokenCount,
        duration,
      },
    });

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    console.error('Error creating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
}
