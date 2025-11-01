// app/api/expenses/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from "@/app/generated/prisma/client";
import { getAuthUserId } from '@/app/lib/auth';

const prisma = new PrismaClient();

// GET /api/expenses - Get paginated expenses for the logged-in user
export async function GET(request: Request) {
  const userId = getAuthUserId(request as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '10', 10)));
    const skip = (page - 1) * pageSize;

    const [total, data] = await Promise.all([
      prisma.expense.count({ where: { authorId: userId } }),
      prisma.expense.findMany({
        where: { authorId: userId },
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data,
      meta: { page, pageSize, total, totalPages },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: Request) {
  const userId = getAuthUserId(request as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, amount, categoryId, date, description } = await request.json();

    // Validate required fields
    if (!title || amount === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Title, amount, and categoryId are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    } catch (error) {
      console.error('Error fetching category:', error);
      return NextResponse.json(
        { error: 'Failed to fetch category', msg: error},
        { status: 500 }
      );
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        description: description || null,
        authorId: userId,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}