// app/api/expenses/export/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from "@/app/generated/prisma/client";
import { getAuthUserId } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const userId = getAuthUserId(request as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { authorId: userId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const header = ['Date', 'Title', 'Category', 'Amount', 'Description'];
    const rows = expenses.map((e) => [
      e.date.toISOString(),
      escapeCsv(e.title),
      escapeCsv(e.category?.name || ''),
      e.amount.toString(),
      escapeCsv(e.description || ''),
    ].join(','));

    const csv = [header.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="expenses.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting expenses:', error);
    return NextResponse.json({ error: 'Failed to export expenses' }, { status: 500 });
  }
}

function escapeCsv(value: string) {
  if (value == null) return '';
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
