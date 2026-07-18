import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/documents/[id] - Retrieve single document
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update document
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, documentType } = body;

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(documentType && { documentType }),
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
