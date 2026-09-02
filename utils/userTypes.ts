/**
 * Company-side user types, as Buyer Management names them.
 *
 * Shared because the label map used to be copy-pasted into the list page and
 * the update page — which is how Approver, Estimator and Senior Estimator came
 * to be missing from both. One list, so a new role is added once.
 *
 * Keep in step with ADMIN_BUYER_USER_TYPES in the backend
 * (workwise-backend/app/util/constants.js), which decides who the API returns.
 */
export const BUYER_USER_TYPES: Array<{ value: number; label: string }> = [
  { value: 2, label: "Procurement" },
  { value: 7, label: "Company Admin" },
  { value: 8, label: "Top Management" },
  { value: 9, label: "Engineering Account" },
  { value: 10, label: "Finance Account" },
  { value: 11, label: "Approver" },
  { value: 12, label: "Estimator" },
  { value: 13, label: "Senior Estimator" },
];

const LABELS: Record<number, string> = BUYER_USER_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {}
);

/** Falls back to `Type N` so an unmapped role is still legible, not blank. */
export const getUserTypeLabel = (userType: number | undefined | null): string =>
  (userType != null && LABELS[userType]) || `Type ${userType}`;

// Subscription filters, matching SUBSCRIPTION_CYCLE_MONTHS and the
// active/expired/none cases the buyer-list query returns.
export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: "active", label: "Active subscription" },
  { value: "expired", label: "Expired subscription" },
  { value: "none", label: "No subscription" },
];

export const SUBSCRIPTION_CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];
