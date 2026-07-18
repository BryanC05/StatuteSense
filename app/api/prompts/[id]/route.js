import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

// PUT /api/prompts/[id] - Update prompt
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, prompt, category, isDefault } = body;

    const updated = await prisma.customPrompt.update({
      where: { id },
      data: { name, description, prompt, category, isDefault },
    });

    return NextResponse.json({ prompt: updated });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete prompt
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.customPrompt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
