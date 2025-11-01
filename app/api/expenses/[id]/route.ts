// app/api/expenses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@/app/generated/prisma/client";
import { getAuthUserId } from '@/app/lib/auth';

const prisma = new PrismaClient();

// GET /api/expenses/[id] - Get a single expense
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getAuthUserId(request as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Check if the expense belongs to the user
    if (expense.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update an expense
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getAuthUserId(request as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const { title, amount, categoryId, date, description } = await request.json();

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    if (existingExpense.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if category exists if categoryId is being updated
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Update the expense
    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(categoryId && { categoryId }),
        ...(date && { date: new Date(date) }),
        ...(description !== undefined && { description: description || null }),
      },
      include: { category: true },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getAuthUserId(request as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Check if expense exists and belongs to user
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    if (expense.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}