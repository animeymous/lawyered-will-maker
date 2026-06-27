import mongoose from 'mongoose';

// Asset Schema
const AssetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Asset name is required'],
    trim: true,
  },
  type: { 
    type: String, 
    enum: ['property', 'bank_account', 'jewelry', 'vehicle', 'cash', 'other'],
    required: [true, 'Asset type is required'],
  },
  description: { 
    type: String,
    trim: true,
  },
  value: { 
    type: Number,
    min: 0,
  },
});

// Beneficiary Schema
const BeneficiarySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Beneficiary name is required'],
    trim: true,
  },
  relationship: { 
    type: String, 
    required: [true, 'Relationship is required'],
    trim: true,
  },
  age: { 
    type: Number,
    min: 0,
  },
  isMinor: { 
    type: Boolean, 
    default: false,
  },
  shares: [{
    assetId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Asset',
      default: null,
    },
    percentage: { 
      type: Number, 
      required: [true, 'Percentage is required'],
      min: 0, 
      max: 100,
    },
  }],
});

// Witness Schema
const WitnessSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Witness name is required'],
    trim: true,
  },
  address: { 
    type: String,
    trim: true,
  },
  isBeneficiary: { 
    type: Boolean, 
    default: false,
  },
});

// Conversation Schema
const ConversationSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['user', 'assistant'],
    required: true,
  },
  content: { 
    type: String, 
    required: true,
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
  },
});

// Validation Issue Schema
const ValidationIssueSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['error', 'warning'],
    required: true,
  },
  message: { 
    type: String, 
    required: true,
  },
  field: { 
    type: String,
  },
});

// Main Will Schema
const WillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  
  // Testator (person making the will)
  testator: {
    fullName: { 
      type: String,
      trim: true,
    },
    age: { 
      type: Number,
      min: 0,
    },
    address: { 
      type: String,
      trim: true,
    },
    isSoundMind: { 
      type: Boolean, 
      default: true,
    },
  },
  
  // Revocation
  revocation: {
    statement: { 
      type: String, 
      default: 'I hereby revoke all previous wills and testamentary dispositions made by me.',
    },
  },
  
  // Assets
  assets: [AssetSchema],
  
  // Beneficiaries
  beneficiaries: [BeneficiarySchema],
  
  // Executor
  executor: {
    name: { 
      type: String,
      trim: true,
    },
    relationship: { 
      type: String,
      trim: true,
    },
    address: { 
      type: String,
      trim: true,
    },
  },
  
  // Guardian (optional - only if children under 18)
  guardian: {
    name: { 
      type: String,
      trim: true,
    },
    relationship: { 
      type: String,
      trim: true,
    },
    address: { 
      type: String,
      trim: true,
    },
  },
  
  // Witnesses
  witnesses: [WitnessSchema],
  
  // Signature
  signature: {
    date: { 
      type: Date,
    },
    place: { 
      type: String,
      trim: true,
    },
    testatorSigned: { 
      type: Boolean, 
      default: false,
    },
    witnessesSigned: { 
      type: Boolean, 
      default: false,
    },
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'ready_for_review', 'completed'],
    default: 'draft',
  },
  
  // Conversation history (for AI context)
  conversation: [ConversationSchema],
  
  // Track what's complete vs missing
  completion: {
    testatorComplete: { 
      type: Boolean, 
      default: false,
    },
    assetsComplete: { 
      type: Boolean, 
      default: false,
    },
    beneficiariesComplete: { 
      type: Boolean, 
      default: false,
    },
    executorComplete: { 
      type: Boolean, 
      default: false,
    },
    guardianComplete: { 
      type: Boolean, 
      default: false,
    },
    witnessesComplete: { 
      type: Boolean, 
      default: false,
    },
    signatureComplete: { 
      type: Boolean, 
      default: false,
    },
  },
  
  // Validation issues
  validationIssues: [ValidationIssueSchema],
  
  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now,
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
  },
  completedAt: { 
    type: Date,
  },
});

// ✅ Modern way - using async/await (no next() needed)
WillSchema.pre('save', async function() {
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  
  // If status is changing to 'completed', set completedAt
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
});

// ✅ Indexes for efficient queries
WillSchema.index({ userId: 1, status: 1 });
WillSchema.index({ userId: 1, updatedAt: -1 });
WillSchema.index({ 'testator.fullName': 1 });

export default mongoose.models.Will || mongoose.model('Will', WillSchema);