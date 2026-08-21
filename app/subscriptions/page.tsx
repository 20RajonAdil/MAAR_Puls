import { SignedOutGate } from '@/components/ui/signed-out-gate';

export default function SubscriptionsPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-display text-xl font-semibold text-ink">Subscriptions</h1>
      <SignedOutGate
        title="Sign in to see your subscriptions"
        body="MAAR Pulse subscriptions are stored on your account. Importing your real YouTube subscriptions requires a separate YouTube permission grant after sign-in — see Settings for details."
      />
    </div>
  );
}
