import React from 'react';

export interface AuctionSetup {
    created_by_name: string | null;
    created_at: string | null;
    start_time: string | null;
    end_time: string | null;
    num_rounds: number | null;
    round_duration_minutes: number | null;
    participant_scope?: string;
    min_decrement_type: string;
    min_decrement_percent: number;
    min_decrement_absolute: number;
    baseline_value: number | null;
}

export interface AuctionParticipant {
    vendor_id: number;
    vendor_name: string;
    status: string;
    eliminated_round: number | null;
    rank: number | null;
    has_bid: boolean;
    current_price: number | null;
}

export interface NonParticipant {
    vendor_id: number;
    vendor_name: string;
    reason: string;
}

export interface ProductAuction {
    rfq_product_id: number;
    product_variant_id: number | null;
    variant: number | null;
    product_name: string | null;
    current: {
        setup: AuctionSetup;
        phase: 'upcoming' | 'running' | 'ended' | null;
        current_round: number | null;
        lowest: number | null;
        participants: AuctionParticipant[];
        not_participating?: NonParticipant[];
    } | null;
    past_runs: {
        outcome: string;
        archived_at: string | null;
        archived_by_name: string | null;
        setup: AuctionSetup;
        participants: AuctionParticipant[];
    }[];
}

export interface AuctionProductRef {
    product_id: number;
    variant: number;
    product_name: string;
}

const inr = (n: number | null | undefined) =>
    n == null ? '---' : '₹' + Number(n).toLocaleString('en-IN');

const when = (iso: string | null | undefined) =>
    iso
        ? new Date(iso).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })
        : '---';

const SCOPE: Record<string, string> = {
    all: 'All vendors who quoted',
    tech_approved: 'Technically approved vendors only',
};

const PHASE: Record<string, { label: string; badge: string }> = {
    upcoming: { label: 'Upcoming', badge: 'badge-info' },
    running: { label: 'Live', badge: 'badge-success' },
    ended: { label: 'Ended', badge: 'badge-secondary' },
};

const OUTCOME: Record<string, string> = {
    cancelled: 'Cancelled',
    superseded: 'Rescheduled',
    ended: 'Ended',
};

// Why an invited vendor is not in the auction.
const REASON_BADGE: Record<string, string> = {
    'Regretted': 'badge-danger',
    'No quote': 'badge-secondary',
    'Quoted after the auction started': 'badge-info',
    'Not technically approved': 'badge-warning',
};

const decrement = (s: AuctionSetup) =>
    s.min_decrement_type === 'absolute' ? inr(s.min_decrement_absolute) : `${s.min_decrement_percent || 0}%`;

const variantText = (variant: number | null | undefined) => (variant && variant > 0 ? ` - Variant ${variant}` : '');

/** How the buyer set the auction up, as label / value pairs. */
const SetupGrid: React.FC<{ setup: AuctionSetup; extra?: [string, React.ReactNode][] }> = ({ setup, extra = [] }) => {
    const rows: [string, React.ReactNode][] = [
        ['Created By', setup.created_by_name || '---'],
        ['Created On', when(setup.created_at)],
        ['Starts', when(setup.start_time)],
        ['Ends', when(setup.end_time)],
        ['Rounds', setup.num_rounds ? `${setup.num_rounds} × ${setup.round_duration_minutes} min` : '---'],
        ['Open To', SCOPE[setup.participant_scope || 'all'] || SCOPE.all],
        ['Min Decrement', decrement(setup)],
        ['Baseline', inr(setup.baseline_value)],
        ...extra,
    ];
    return (
        <div className="border rounded-2 p-2 mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px 16px' }}>
            {rows.map(([label, value]) => (
                <div key={label}>
                    <strong>{label} : </strong>
                    <span className="fw-medium text-muted px-1">{value}</span>
                </div>
            ))}
        </div>
    );
};

const ParticipantsTable: React.FC<{ participants: AuctionParticipant[] }> = ({ participants }) =>
    participants.length === 0 ? (
        <p className="text-muted mb-0">No participants — no vendor qualified to bid.</p>
    ) : (
        <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
                <thead className="thead-light">
                    <tr>
                        <th>S.No</th>
                        <th>Vendor</th>
                        <th>Status</th>
                        <th>Rank</th>
                        <th>Current Bid</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map((p, i) => (
                        <tr key={p.vendor_id}>
                            <td>{i + 1}</td>
                            <td>{p.vendor_name}</td>
                            <td>
                                {p.status === 'active'
                                    ? <span className="badge badge-success">In auction</span>
                                    : <span className="badge badge-danger">Removed · round {p.eliminated_round}</span>}
                            </td>
                            <td>{p.rank != null ? `L${p.rank}` : '---'}</td>
                            <td>{p.has_bid ? inr(p.current_price) : <span className="text-muted">No bid yet</span>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

const NonParticipantsTable: React.FC<{ vendors: NonParticipant[] }> = ({ vendors }) => (
    <div className="table-responsive">
        <table className="table table-bordered table-sm mb-0">
            <thead className="thead-light">
                <tr>
                    <th>S.No</th>
                    <th>Vendor</th>
                    <th>Reason</th>
                </tr>
            </thead>
            <tbody>
                {vendors.map((v, i) => (
                    <tr key={v.vendor_id}>
                        <td>{i + 1}</td>
                        <td>{v.vendor_name}</td>
                        <td><span className={`badge ${REASON_BADGE[v.reason] || 'badge-light'}`}>{v.reason}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/**
 * The RFQ's reverse auctions, product by product: the scheduled auction's setup,
 * its participants and the invited vendors who are not in it (with why), or "not
 * scheduled"; then any earlier runs (cancelled or rescheduled) with who closed
 * them and who took part.
 */
const RfqAuctions: React.FC<{ products: AuctionProductRef[]; auctions: ProductAuction[] | null; error?: boolean }> = ({
    products,
    auctions,
    error,
}) => {
    if (error) return <p className="text-center text-danger">Could not load the reverse auction details.</p>;
    if (!auctions) return <p className="text-center text-muted">Loading reverse auction details…</p>;

    const key = (productId: number | null | undefined, variant: number | null | undefined) => `${productId}-${variant ?? 0}`;
    const byProduct = new Map(auctions.map((a) => [key(a.product_variant_id, a.variant), a]));
    // Every product on the RFQ, plus any auction whose product is not in the vendor data.
    const listed = products.map((p) => ({ name: `${p.product_name}${variantText(p.variant)}`, auction: byProduct.get(key(p.product_id, p.variant)) }));
    const seen = new Set(products.map((p) => key(p.product_id, p.variant)));
    auctions
        .filter((a) => !seen.has(key(a.product_variant_id, a.variant)))
        .forEach((a) => listed.push({ name: `${a.product_name || `Product #${a.rfq_product_id}`}${variantText(a.variant)}`, auction: a }));

    return (
        <div className="overflow-y-auto" style={{ maxHeight: '100vh' }}>
            {auctions.length === 0 && (
                <div className="alert alert-light border">No reverse auction has been scheduled on this RFQ.</div>
            )}
            {listed.map(({ name, auction }) => {
                const current = auction?.current;
                const phase = current?.phase ? PHASE[current.phase] : null;
                return (
                    <div key={name} className="mb-4">
                        <div className="border rounded-2 p-3 mb-2 bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{name}</h5>
                            {phase
                                ? <span className={`badge ${phase.badge}`}>{phase.label}</span>
                                : <span className="badge badge-secondary">Not scheduled</span>}
                        </div>

                        {current ? (
                            <>
                                <SetupGrid
                                    setup={current.setup}
                                    extra={[
                                        ...(current.phase === 'running' ? [['Current Round', `${current.current_round} of ${current.setup.num_rounds}`] as [string, React.ReactNode]] : []),
                                        ['Lowest Bid', inr(current.lowest)],
                                    ]}
                                />
                                <h6 className="mt-3">Participants ({current.participants.length})</h6>
                                <ParticipantsTable participants={current.participants} />
                                {/* Invited to the product but not in the auction, and why. */}
                                {current.not_participating && current.not_participating.length > 0 && (
                                    <>
                                        <h6 className="mt-3">Not Participating ({current.not_participating.length})</h6>
                                        <NonParticipantsTable vendors={current.not_participating} />
                                    </>
                                )}
                            </>
                        ) : (
                            <p className="text-muted mb-2">No reverse auction scheduled for this product.</p>
                        )}

                        {auction && auction.past_runs.length > 0 && (
                            <>
                                <h6 className="mt-3">Previous Runs ({auction.past_runs.length})</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm mb-0">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Outcome</th>
                                                <th>Window</th>
                                                <th>Open To</th>
                                                <th>Baseline</th>
                                                <th>Created By</th>
                                                <th>Closed By</th>
                                                <th>Participants</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auction.past_runs.map((run, i) => (
                                                <tr key={i}>
                                                    <td>{OUTCOME[run.outcome] || run.outcome}</td>
                                                    <td>{when(run.setup.start_time)} – {when(run.setup.end_time)}</td>
                                                    <td>{SCOPE[run.setup.participant_scope || 'all'] || SCOPE.all}</td>
                                                    <td>{inr(run.setup.baseline_value)}</td>
                                                    <td>{run.setup.created_by_name || '---'}</td>
                                                    <td>{run.archived_by_name || '---'}{run.archived_at ? ` · ${when(run.archived_at)}` : ''}</td>
                                                    <td>{run.participants.length ? run.participants.map((p) => p.vendor_name).join(', ') : 'None'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default RfqAuctions;
