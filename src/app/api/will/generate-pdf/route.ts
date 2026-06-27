import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
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

    const will = await Will.findOne({
      _id: willId,
      userId: user._id,
    });

    if (!will) {
      return NextResponse.json({ error: 'Will not found' }, { status: 404 });
    }

    // Create PDF
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.text('LAST WILL AND TESTAMENT', 105, y, { align: 'center' });
    y += 20;

    // Testator Details
    doc.setFontSize(14);
    doc.text('1. TESTATOR', 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Name: ${will.testator.fullName || 'Not provided'}`, 20, y);
    y += 8;
    doc.text(`Age: ${will.testator.age || 'Not provided'}`, 20, y);
    y += 8;
    doc.text(`Address: ${will.testator.address || 'Not provided'}`, 20, y);
    y += 8;
    doc.text(`Sound Mind: ${will.testator.isSoundMind ? 'Yes' : 'Not confirmed'}`, 20, y);
    y += 15;

    // Revocation
    doc.text('2. REVOCATION', 20, y);
    y += 10;
    doc.text(will.revocation?.statement || 'I hereby revoke all previous wills.', 20, y);
    y += 15;

    // Assets
    doc.text('3. ASSETS', 20, y);
    y += 10;
    if (will.assets && will.assets.length > 0) {
      will.assets.forEach((asset: any) => {
        doc.text(`- ${asset.name} (${asset.type})`, 25, y);
        y += 7;
        if (asset.description) {
          doc.text(`  ${asset.description}`, 30, y);
          y += 7;
        }
        if (asset.value) {
          doc.text(`  Value: ₹${asset.value.toLocaleString()}`, 30, y);
          y += 7;
        }
      });
    } else {
      doc.text('No assets listed', 25, y);
      y += 7;
    }
    y += 10;

    // Beneficiaries
    doc.text('4. BENEFICIARIES', 20, y);
    y += 10;
    if (will.beneficiaries && will.beneficiaries.length > 0) {
      will.beneficiaries.forEach((beneficiary: any) => {
        doc.text(`- ${beneficiary.name} (${beneficiary.relationship})`, 25, y);
        y += 7;
        if (beneficiary.shares && beneficiary.shares.length > 0) {
          beneficiary.shares.forEach((share: any) => {
            doc.text(`  Share: ${share.percentage}%`, 30, y);
            y += 7;
          });
        }
        if (beneficiary.isMinor) {
          doc.text(`  Minor: Yes`, 30, y);
          y += 7;
        }
      });
    } else {
      doc.text('No beneficiaries listed', 25, y);
      y += 7;
    }
    y += 10;

    // Executor
    doc.text('5. EXECUTOR', 20, y);
    y += 10;
    if (will.executor?.name) {
      doc.text(`Name: ${will.executor.name}`, 25, y);
      y += 7;
      if (will.executor.relationship) {
        doc.text(`Relationship: ${will.executor.relationship}`, 25, y);
        y += 7;
      }
      if (will.executor.address) {
        doc.text(`Address: ${will.executor.address}`, 25, y);
        y += 7;
      }
    } else {
      doc.text('No executor named', 25, y);
      y += 7;
    }
    y += 10;

    // Guardian
    if (will.guardian?.name) {
      doc.text('6. GUARDIAN', 20, y);
      y += 10;
      doc.text(`Name: ${will.guardian.name}`, 25, y);
      y += 7;
      if (will.guardian.relationship) {
        doc.text(`Relationship: ${will.guardian.relationship}`, 25, y);
        y += 7;
      }
      if (will.guardian.address) {
        doc.text(`Address: ${will.guardian.address}`, 25, y);
        y += 7;
      }
      y += 10;
    }

    // Witnesses
    doc.text('7. WITNESSES', 20, y);
    y += 10;
    if (will.witnesses && will.witnesses.length > 0) {
      will.witnesses.forEach((witness: any, index: number) => {
        doc.text(`Witness ${index + 1}: ${witness.name}`, 25, y);
        y += 7;
        if (witness.address) {
          doc.text(`  Address: ${witness.address}`, 30, y);
          y += 7;
        }
      });
    } else {
      doc.text('No witnesses listed', 25, y);
      y += 7;
    }
    y += 10;

    // Signature
    doc.text('8. SIGNATURE', 20, y);
    y += 10;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 25, y);
    y += 7;
    doc.text(`Place: Mumbai`, 25, y);
    y += 15;
    doc.text('_________________________', 25, y);
    y += 5;
    doc.text('Testator Signature', 25, y);
    y += 15;
    doc.text('_________________________', 25, y);
    y += 5;
    doc.text('Witness 1 Signature', 25, y);
    y += 15;
    doc.text('_________________________', 25, y);
    y += 5;
    doc.text('Witness 2 Signature', 25, y);

    // Generate PDF
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=will.pdf',
      },
    });

  } catch (error) {
    console.error('Generate PDF error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}