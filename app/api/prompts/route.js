import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

// GET /api/prompts - List custom prompts for user
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user';
    const category = searchParams.get('category');
    
    const where = { userId };
    if (category && category !== 'all') {
      where.category = category;
    }
    
    const prompts = await prisma.customPrompt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create new custom prompt
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId = 'demo-user',
      name,
      description,
      prompt,
      category,
      isDefault = false,
    } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { error: 'Name and prompt are required' },
        { status: 400 }
      );
    }

    const customPrompt = await prisma.customPrompt.create({
      data: {
        userId,
        name,
        description,
        prompt,
        category,
        isDefault,
      },
    });

    return NextResponse.json({ prompt: customPrompt }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
