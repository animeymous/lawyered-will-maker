import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Will from '@/models/Will';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { willId } = await request.json();

    if (!willId) {
      return NextResponse.json(
        { error: 'willId is required' },
        { status: 400 }
      );
    }

    const will = await Will.findOne({
      _id: willId,
      userId: user._id,
    });

    if (!will) {
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check 1: At least 2 witnesses
    if (!will.witnesses || will.witnesses.length < 2) {
      issues.push('At least 2 witnesses are required');
    }

    // Check 2: Executor named
    if (!will.executor?.name) {
      issues.push('An executor must be named');
    }

    // Check 3: Guardian needed if minors exist
    const hasMinor = will.beneficiaries?.some((b: any) => b.isMinor === true);
    if (hasMinor && !will.guardian?.name) {
      issues.push('A guardian must be named because there are minor beneficiaries');
    }

    // Check 4: Shares add up to 100% for each beneficiary
    will.beneficiaries?.forEach((beneficiary: any) => {
      if (beneficiary.shares && beneficiary.shares.length > 0) {
        const total = beneficiary.shares.reduce((sum: number, s: any) => sum + s.percentage, 0);
        if (total !== 100) {
          issues.push(`Shares for ${beneficiary.name} must add up to 100% (currently ${total}%)`);
        }
      }
    });

    // Warning: Witness is also a beneficiary
    will.witnesses?.forEach((witness: any) => {
      const isBeneficiary = will.beneficiaries?.some((b: any) => b.name === witness.name);
      if (isBeneficiary) {
        warnings.push(`Witness ${witness.name} is also a beneficiary - this is allowed but not ideal`);
      }
    });

    // Check 5: Testator details complete
    if (!will.testator?.fullName || !will.testator?.age || !will.testator?.address) {
      issues.push('Testator details (full name, age, address) are incomplete');
    }

    // Check 6: At least one asset
    if (!will.assets || will.assets.length === 0) {
      issues.push('At least one asset must be listed');
    }

    // Check 7: At least one beneficiary
    if (!will.beneficiaries || will.beneficiaries.length === 0) {
      issues.push('At least one beneficiary must be named');
    }

    // Save validation issues to will
    will.validationIssues = [
      ...issues.map(msg => ({ type: 'error' as const, message: msg, field: undefined })),
      ...warnings.map(msg => ({ type: 'warning' as const, message: msg, field: undefined })),
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
      isComplete: issues.length === 0,
      issues,
      warnings,
      status: will.status,
      totalIssues: issues.length,
      totalWarnings: warnings.length,
    });

  } catch (error) {
    console.error('Validate will error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}