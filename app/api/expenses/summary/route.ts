// app/api/expenses/summary/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from "@/app/generated/prisma/client";
import { getAuthUserId } from '@/app/lib/auth';

const prisma = new PrismaClient();

// GET /api/expenses/summary - Get expense summary
export async function GET(request: Request) {
  const userId = getAuthUserId(request as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get total spending by category
    const byCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { authorId: userId },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Get category details
    const categories = await prisma.category.findMany({
      where: { id: { in: byCategory.map((item: any) => item.categoryId) } },
    });

    const categoryTotals = byCategory.map((item: any) => ({
      categoryId: item.categoryId,
      category: categories.find((c: any) => c.id === item.categoryId)?.name || 'Unknown',
      total: item._sum.amount || 0,
    }));

    // Get monthly breakdown
    const monthlyBreakdown = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "date") as month,
        SUM(amount) as total
      FROM "Expense"
      WHERE "authorId" = ${userId}
      GROUP BY DATE_TRUNC('month', "date")
      ORDER BY month DESC
    `;

    return NextResponse.json({
      byCategory: categoryTotals,
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}