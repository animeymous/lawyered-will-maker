import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Will from '@/models/Will';
import { verifyAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      throw new AppError(401, 'Unauthorized');
    }

    await connectToDatabase();
    const { willId } = await request.json();

    const will = await Will.findOne({
      _id: willId,
      userId: user._id,
    });

    if (!will) {
      throw new AppError(404, 'Will not found');
    }

    const issues = [];
    const warnings: string[] = [];

    // Check witnesses
    if (!will.witnesses || will.witnesses.length < 2) {
      issues.push('At least 2 witnesses are required');
    }

    // Check executor
    if (!will.executor?.name) {
      issues.push('An executor must be named');
    }

    // Check guardian for minors
    const hasMinor = will.beneficiaries?.some((b: any) => b.isMinor === true);
    if (hasMinor && !will.guardian?.name) {
      issues.push('A guardian must be named because there are minor beneficiaries');
    }

    // Check shares sum to 100%
    will.beneficiaries?.forEach((beneficiary: any) => {
      if (beneficiary.shares && beneficiary.shares.length > 0) {
        const total = beneficiary.shares.reduce((sum: number, s: any) => sum + s.percentage, 0);
        if (total !== 100) {
          issues.push(`Shares for ${beneficiary.name} must add up to 100% (currently ${total}%)`);
        }
      }
    });

    // Warning: witness is beneficiary
    will.witnesses?.forEach((witness: any) => {
      const isBeneficiary = will.beneficiaries?.some((b: any) => b.name === witness.name);
      if (isBeneficiary) {
        warnings.push(`Witness ${witness.name} is also a beneficiary - this is allowed but not ideal`);
      }
    });

    // Save issues
    will.validationIssues = [
      ...issues.map(msg => ({ type: 'error', message: msg })),
      ...warnings.map(msg => ({ type: 'warning', message: msg })),
    ];

    // Update status based on issues
    if (issues.length === 0) {
      will.status = 'ready_for_review';
    } else {
      will.status = 'draft';
    }

    await will.save();

    return NextResponse.json({
      valid: issues.length === 0,
      issues,
      warnings,
      status: will.status,
    });

  } catch (error) {
    console.error('Validate will error:', error);
    return NextResponse.json(
      { error: error instanceof AppError ? error.message : 'Internal server error' },
      { status: error instanceof AppError ? error.statusCode : 500 }
    );
  }
}