import { useState } from 'react';
import { User } from '../../App';
import { Button } from '../shared/button';
import { Card, CardContent } from '../shared/card';
import { updateUser } from '../../services/authStore';
import { saveVendorSubmission, getVendorSubmission } from '../../services/dataStore';
import { CheckCircle2, Clock, XCircle, Upload, FileText, LogOut, AlertCircle } from 'lucide-react';
import appLogo from '../../../assets/app_logo.png';

interface VendorDocumentSubmissionProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

const FOOD_CATEGORIES = ['Food & Beverage'];

const isFoodVendor = (category?: string) =>
  FOOD_CATEGORIES.includes(category ?? '');

export default function VendorDocumentSubmission({ user, onLogout, onUserUpdate }: VendorDocumentSubmissionProps) {
  const isFood = isFoodVendor(user.vendorCategory);
  const existing = getVendorSubmission(user.id);

  const [docs, setDocs] = useState({
    businessLicense:  existing?.documents.businessLicense  ?? false,
    sfaLicense:       existing?.documents.sfaLicense       ?? false,
    personalId:       existing?.documents.personalId       ?? false,
    pastParticipation: existing?.documents.pastParticipation ?? false,
  });
  const [notes,     setNotes]     = useState(existing?.notes ?? '');
  const [submitted, setSubmitted] = useState(false);

  const toggle = (key: keyof typeof docs) =>
    setDocs(prev => ({ ...prev, [key]: !prev[key] }));

  const canSubmit = docs.personalId && (isFood ? docs.sfaLicense : true);

  const handleSubmit = () => {
    saveVendorSubmission({
      vendorId:       user.id,
      vendorName:     user.name,
      vendorEmail:    user.email,
      vendorCategory: user.vendorCategory ?? '',
      submittedAt:    new Date().toISOString(),
      documents:      docs,
      notes,
    });
    const stored = updateUser(user.id, { verificationStatus: 'submitted' });
    if (stored) onUserUpdate({ ...user, verificationStatus: 'submitted' });
    setSubmitted(true);
  };

  const handleResubmit = () => {
    setDocs({ businessLicense: false, sfaLicense: false, personalId: false, pastParticipation: false });
    setNotes('');
    const stored = updateUser(user.id, { verificationStatus: 'pending', verificationRejectionReason: undefined });
    if (stored) onUserUpdate({ ...user, verificationStatus: 'pending', verificationRejectionReason: undefined });
  };

  const status = submitted ? 'submitted' : (user.verificationStatus ?? 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="Bazaario" className="w-10 h-10 object-contain bg-white rounded-full p-1 shadow" />
          <div>
            <p className="text-white font-bold text-lg leading-tight">Bazaario</p>
            <p className="text-white/70 text-xs">Vendor Portal</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-white hover:bg-white/10">
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign Out
        </Button>
      </div>

      <div className="w-full max-w-lg">
        {/* Submitted / Under Review */}
        {status === 'submitted' && (
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Under Review</h2>
              <p className="text-gray-500 mb-6">
                Thank you, <span className="font-medium text-gray-700">{user.name}</span>! Our team will review your
                documents within 1–3 business days. You'll be notified once your account is approved.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">What happens next?</p>
                {[
                  'Our admin team reviews your submitted documents',
                  'You receive an approval or feedback within 1–3 days',
                  'Once approved, full access to the vendor portal is unlocked',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={onLogout} className="w-full">Sign Out</Button>
            </CardContent>
          </Card>
        )}

        {/* Rejected */}
        {status === 'rejected' && !submitted && (
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Application Not Approved</h2>
                  <p className="text-sm text-gray-500">Please review the feedback below and resubmit</p>
                </div>
              </div>
              {user.verificationRejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
                  <p className="font-medium mb-1">Reason from admin:</p>
                  <p>{user.verificationRejectionReason}</p>
                </div>
              )}
              <Button
                onClick={handleResubmit}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                Resubmit Documents
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pending — document submission form */}
        {status === 'pending' && (
          <DocumentForm
            isFood={isFood}
            docs={docs}
            notes={notes}
            canSubmit={canSubmit}
            onToggle={toggle}
            onNotesChange={setNotes}
            onSubmit={handleSubmit}
            vendorName={user.name}
            category={user.vendorCategory}
          />
        )}
      </div>
    </div>
  );
}

interface DocumentFormProps {
  isFood: boolean;
  docs: { businessLicense: boolean; sfaLicense: boolean; personalId: boolean; pastParticipation: boolean };
  notes: string;
  canSubmit: boolean;
  vendorName: string;
  category?: string;
  onToggle: (key: 'businessLicense' | 'sfaLicense' | 'personalId' | 'pastParticipation') => void;
  onNotesChange: (val: string) => void;
  onSubmit: () => void;
}

function DocumentForm({ isFood, docs, notes, canSubmit, vendorName, category, onToggle, onNotesChange, onSubmit }: DocumentFormProps) {
  return (
    <Card className="shadow-2xl border-0">
      <CardContent className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Document Submission</h2>
          <p className="text-gray-500 text-sm">
            Welcome, <span className="font-medium text-gray-700">{vendorName}</span>! Please confirm which documents you are submitting.
            {category && <span className="ml-1 text-orange-600 font-medium">({category})</span>}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <DocCheckbox
            checked={docs.businessLicense}
            onChange={() => onToggle('businessLicense')}
            label="Business License (ACRA / BizFile)"
            description="If your business is registered with ACRA"
            required={false}
          />
          {isFood && (
            <DocCheckbox
              checked={docs.sfaLicense}
              onChange={() => onToggle('sfaLicense')}
              label="SFA Food Stall License"
              description="Required for all food & beverage vendors"
              required
            />
          )}
          <DocCheckbox
            checked={docs.personalId}
            onChange={() => onToggle('personalId')}
            label="Personal Identification (NRIC / Passport)"
            description="A copy of the applicant's valid ID"
            required
          />
          <DocCheckbox
            checked={docs.pastParticipation}
            onChange={() => onToggle('pastParticipation')}
            label="Proof of Past Pasar Malam Participation"
            description="Optional — photos, invoices, or participation letters"
            required={false}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Any additional information for the admin..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {!canSubmit && (
          <div className="flex items-start gap-2 mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Please confirm all required documents before submitting.</span>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-40 text-base font-semibold"
        >
          <Upload className="w-4 h-4 mr-2" />
          Submit for Review
        </Button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Our team will review your application within 1–3 business days.
        </p>
      </CardContent>
    </Card>
  );
}

interface DocCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
  required: boolean;
}

function DocCheckbox({ checked, onChange, label, description, required }: DocCheckboxProps) {
  return (
    <label onClick={onChange} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
      checked ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
        checked ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
      }`}>
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {required && <span className="text-xs text-red-500 font-medium">Required</span>}
          {!required && <span className="text-xs text-gray-400">Optional</span>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
    </label>
  );
}
